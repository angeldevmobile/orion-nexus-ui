import { Request, Response } from 'express';
import { pool } from '../config/database';
import { HTTP_STATUS } from '../utils/constants';
import { ApiResponse, PaginationQuery } from '../types/api';
import { CreateProjectRequest, UpdateProjectRequest } from '../types/project';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { emailService } from '../services/emailService';

// Crear proyecto
export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, settings, isPublic }: CreateProjectRequest = req.body;

  const files = [{
    name: 'index.js',
    content: '// Welcome to your new project!',
    type: 'javascript',
    path: '/'
  }];

  const query = `
    INSERT INTO projects (name, description, owner_id, settings, is_public, files)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const values = [
    name,
    description,
    req.user?.id,
    JSON.stringify(settings),
    isPublic || false,
    JSON.stringify(files)
  ];

  const result = await pool.query(query, values);
  const project = result.rows[0];

  // Obtener info del owner
  const ownerQuery = `SELECT id, username, email, avatar, preferences FROM users WHERE id = $1`;
  const ownerResult = await pool.query(ownerQuery, [project.owner_id]);

  const owner = ownerResult.rows[0];
  project.owner = owner;

  // Enviar notificación si el usuario tiene habilitado notifEmail y notifProjects
  const prefs = (owner.preferences ?? {}) as Record<string, unknown>;
  if (prefs.notifEmail !== false && prefs.notifProjects !== false) {
    emailService.sendProjectNotification(
      owner.email,
      owner.username,
      project.name,
      'creado exitosamente'
    ).catch((err: Error) => {
      console.error('Error enviando notificación de proyecto:', err.message);
    });
  }

  const response: ApiResponse = {
    success: true,
    message: 'Project created successfully',
    data: project
  };

  res.status(HTTP_STATUS.CREATED).json(response);
});

// Obtener proyectos con paginación
export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, sort = 'created_at', order = 'desc' }: PaginationQuery = req.query;

  const offset = (Number(page) - 1) * Number(limit);
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  const userId = parseInt(req.user?.id || '0');
  const projectsQuery = `
    SELECT 
      p.*,
      u.username as owner_username,
      u.email as owner_email,
      u.avatar as owner_avatar
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE p.owner_id = $1 OR $1 = ANY(p.collaborators) OR p.is_public = true
    ORDER BY p.${sort} ${sortOrder}
    LIMIT $2 OFFSET $3
  `;
  const countQuery = `
    SELECT COUNT(*) as total
    FROM projects p
    WHERE p.owner_id = $1 OR $1 = ANY(p.collaborators) OR p.is_public = true
  `;

  const [projectsResult, countResult] = await Promise.all([
    pool.query(projectsQuery, [userId, Number(limit), offset]),
    pool.query(countQuery, [userId])
  ]);

  const projects = projectsResult.rows.map(row => ({
    ...row,
    files: JSON.parse(row.files || '[]'),
    settings: JSON.parse(row.settings || '{}'),
    owner: {
      id: row.owner_id,
      username: row.owner_username,
      email: row.owner_email,
      avatar: row.owner_avatar
    }
  }));

  const total = parseInt(countResult.rows[0]?.total || '0');

  const response: ApiResponse = {
    success: true,
    message: 'Projects retrieved successfully',
    data: projects,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Obtener proyecto por ID
export const getProjectById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const projectQuery = `
    SELECT 
      p.*,
      u.username as owner_username,
      u.email as owner_email,
      u.avatar as owner_avatar
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE p.id = $1
  `;
  const result = await pool.query(projectQuery, [id]);
  if (result.rows.length === 0) {
    throw createError('Project not found', HTTP_STATUS.NOT_FOUND);
  }
  const project = result.rows[0];

  // Check access
  const userId = parseInt(req.user?.id || '0');
  const hasAccess =
    project.is_public ||
    project.owner_id === userId ||
    (project.collaborators && project.collaborators.includes(userId));

  if (!hasAccess) {
    throw createError('Access denied', HTTP_STATUS.FORBIDDEN);
  }

  project.files = JSON.parse(project.files || '[]');
  project.settings = JSON.parse(project.settings || '{}');
  project.owner = {
    id: project.owner_id,
    username: project.owner_username,
    email: project.owner_email,
    avatar: project.owner_avatar
  };

  const response: ApiResponse = {
    success: true,
    message: 'Project retrieved successfully',
    data: project
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Actualizar proyecto
export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates: UpdateProjectRequest = req.body;

  const checkQuery = `SELECT owner_id FROM projects WHERE id = $1`;
  const checkResult = await pool.query(checkQuery, [id]);
  if (checkResult.rows.length === 0) {
    throw createError('Project not found', HTTP_STATUS.NOT_FOUND);
  }
  if (checkResult.rows[0].owner_id !== parseInt(req.user?.id || '0')) {
    throw createError('Only project owner can update', HTTP_STATUS.FORBIDDEN);
  }

  const updateFields: string[] = [];
  const updateValues: Array<string | number | boolean | null> = [id];
  let paramIndex = 2;

  if (updates.name !== undefined) {
    updateFields.push(`name = $${paramIndex++}`);
    updateValues.push(updates.name);
  }
  if (updates.description !== undefined) {
    updateFields.push(`description = $${paramIndex++}`);
    updateValues.push(updates.description);
  }
  if (updates.settings !== undefined) {
    updateFields.push(`settings = $${paramIndex++}`);
    updateValues.push(JSON.stringify(updates.settings));
  }
  if (updates.isPublic !== undefined) {
    updateFields.push(`is_public = $${paramIndex++}`);
    updateValues.push(updates.isPublic);
  }
  if (updates.collaborators !== undefined) {
    updateFields.push(`collaborators = $${paramIndex++}`);
    updateValues.push(JSON.stringify(updates.collaborators));
  }

  if (updateFields.length === 0) {
    throw createError('No fields to update', HTTP_STATUS.BAD_REQUEST);
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');

  const updateQuery = `
    UPDATE projects 
    SET ${updateFields.join(', ')}
    WHERE id = $1
    RETURNING *
  `;
  const updateResult = await pool.query(updateQuery, updateValues);

  // Obtener info del owner
  const ownerQuery = `SELECT id, username, email, avatar FROM users WHERE id = $1`;
  const ownerResult = await pool.query(ownerQuery, [updateResult.rows[0].owner_id]);

  const updatedProject = {
    ...updateResult.rows[0],
    files: JSON.parse(updateResult.rows[0].files || '[]'),
    settings: JSON.parse(updateResult.rows[0].settings || '{}'),
    owner: ownerResult.rows[0]
  };

  const response: ApiResponse = {
    success: true,
    message: 'Project updated successfully',
    data: updatedProject
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Eliminar proyecto
export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const checkQuery = `SELECT owner_id FROM projects WHERE id = $1`;
  const checkResult = await pool.query(checkQuery, [id]);
  if (checkResult.rows.length === 0) {
    throw createError('Project not found', HTTP_STATUS.NOT_FOUND);
  }
  if (checkResult.rows[0].owner_id !== parseInt(req.user?.id || '0')) {
    throw createError('Only project owner can delete', HTTP_STATUS.FORBIDDEN);
  }

  await pool.query('DELETE FROM projects WHERE id = $1', [id]);

  const response: ApiResponse = {
    success: true,
    message: 'Project deleted successfully'
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Actualizar archivos del proyecto
export const updateProjectFiles = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { files } = req.body;

  const checkQuery = `SELECT owner_id, collaborators FROM projects WHERE id = $1`;
  const checkResult = await pool.query(checkQuery, [id]);
  if (checkResult.rows.length === 0) {
    throw createError('Project not found', HTTP_STATUS.NOT_FOUND);
  }
  const userId = parseInt(req.user?.id || '0');
  const hasWriteAccess =
    checkResult.rows[0].owner_id === userId ||
    (checkResult.rows[0].collaborators && checkResult.rows[0].collaborators.includes(userId));

  if (!hasWriteAccess) {
    throw createError('Write access denied', HTTP_STATUS.FORBIDDEN);
  }

  const updateQuery = `
    UPDATE projects 
    SET files = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `;
  const updateResult = await pool.query(updateQuery, [id, JSON.stringify(files)]);

  // Obtener info del owner
  const ownerQuery = `SELECT id, username, email, avatar FROM users WHERE id = $1`;
  const ownerResult = await pool.query(ownerQuery, [updateResult.rows[0].owner_id]);

  const updatedProject = {
    ...updateResult.rows[0],
    files: JSON.parse(updateResult.rows[0].files || '[]'),
    settings: JSON.parse(updateResult.rows[0].settings || '{}'),
    owner: ownerResult.rows[0]
  };

  const response: ApiResponse = {
    success: true,
    message: 'Project files updated successfully',
    data: updatedProject
  };

  res.status(HTTP_STATUS.OK).json(response);
});