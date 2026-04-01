import { Request, Response } from 'express';
import { pool } from '../config/database';
import { HTTP_STATUS } from '../utils/constants';
import { ApiResponse, PaginationQuery } from '../types/api';
import { asyncHandler, createError } from '../middleware/errorHandler';

// Obtener todos los usuarios con paginación y búsqueda
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 10, search }: PaginationQuery & { search?: string } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let whereClause = '';
  const params: Array<string | number> = [];
  let paramIndex = 1;

  if (search) {
    whereClause = `WHERE username ILIKE $${paramIndex} OR email ILIKE $${paramIndex}`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  const usersQuery = `
    SELECT id, username, email, avatar, role, preferences, created_at, updated_at
    FROM users
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  params.push(Number(limit), offset);

  const countQuery = `
    SELECT COUNT(*) as total
    FROM users
    ${whereClause}
  `;

  const [usersResult, countResult] = await Promise.all([
    pool.query(usersQuery, params),
    pool.query(countQuery, params.slice(0, paramIndex - 1))
  ]);

  const users = usersResult.rows;
  const total = parseInt(countResult.rows[0]?.total || '0');

  const response: ApiResponse = {
    success: true,
    message: 'Users retrieved successfully',
    data: users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Obtener usuario por ID y sus proyectos públicos
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const userQuery = `
    SELECT id, username, email, avatar, role, preferences, created_at, updated_at
    FROM users
    WHERE id = $1
  `;
  const userResult = await pool.query(userQuery, [id]);
  if (userResult.rows.length === 0) {
    throw createError('User not found', HTTP_STATUS.NOT_FOUND);
  }
  const user = userResult.rows[0];

  const projectsQuery = `
    SELECT id, name, description, created_at, tags
    FROM projects
    WHERE owner_id = $1 AND is_public = true
    ORDER BY created_at DESC
  `;
  const projectsResult = await pool.query(projectsQuery, [id]);
  const projects = projectsResult.rows;

  const response: ApiResponse = {
    success: true,
    message: 'User retrieved successfully',
    data: {
      user,
      projects
    }
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Actualizar rol de usuario (solo admin) - CAMBIADO: Request en lugar de RequestWithUser
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;

  if (req.user?.role !== 'admin') {
    throw createError('Admin access required', HTTP_STATUS.FORBIDDEN);
  }

  const updateQuery = `
    UPDATE users
    SET role = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, username, email, avatar, role, preferences, created_at, updated_at
  `;
  const result = await pool.query(updateQuery, [id, role]);
  if (result.rows.length === 0) {
    throw createError('User not found', HTTP_STATUS.NOT_FOUND);
  }
  const user = result.rows[0];

  const response: ApiResponse = {
    success: true,
    message: 'User role updated successfully',
    data: user
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Actualizar suscripción de usuario (solo admin) - CAMBIADO: Request en lugar de RequestWithUser
export const updateUserSubscription = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { subscription } = req.body;

  if (req.user?.role !== 'admin') {
    throw createError('Admin access required', HTTP_STATUS.FORBIDDEN);
  }

  const updateQuery = `
    UPDATE users
    SET preferences = jsonb_set(preferences, '{subscription}', to_jsonb($2::text)), updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING id, username, email, avatar, role, preferences, created_at, updated_at
  `;
  const result = await pool.query(updateQuery, [id, subscription]);
  if (result.rows.length === 0) {
    throw createError('User not found', HTTP_STATUS.NOT_FOUND);
  }
  const user = result.rows[0];

  const response: ApiResponse = {
    success: true,
    message: 'User subscription updated successfully',
    data: user
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Eliminar usuario (solo admin) y sus proyectos - CAMBIADO: Request en lugar de RequestWithUser
export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (req.user?.role !== 'admin') {
    throw createError('Admin access required', HTTP_STATUS.FORBIDDEN);
  }

  const deleteUserQuery = `
    DELETE FROM users
    WHERE id = $1
    RETURNING id
  `;
  const userResult = await pool.query(deleteUserQuery, [id]);
  if (userResult.rows.length === 0) {
    throw createError('User not found', HTTP_STATUS.NOT_FOUND);
  }

  // Eliminar proyectos del usuario
  await pool.query('DELETE FROM projects WHERE owner_id = $1', [id]);

  const response: ApiResponse = {
    success: true,
    message: 'User deleted successfully'
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Obtener estadísticas del usuario - CAMBIADO: Request en lugar de RequestWithUser
export const getUserStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  const projectCountQuery = `
    SELECT COUNT(*) as total FROM projects WHERE owner_id = $1
  `;
  const publicProjectCountQuery = `
    SELECT COUNT(*) as total FROM projects WHERE owner_id = $1 AND is_public = true
  `;

  const [projectCountResult, publicProjectCountResult] = await Promise.all([
    pool.query(projectCountQuery, [userId]),
    pool.query(publicProjectCountQuery, [userId])
  ]);

  const projectCount = parseInt(projectCountResult.rows[0]?.total || '0');
  const publicProjectCount = parseInt(publicProjectCountResult.rows[0]?.total || '0');

  const response: ApiResponse = {
    success: true,
    message: 'User stats retrieved successfully',
    data: {
      totalProjects: projectCount,
      publicProjects: publicProjectCount,
      privateProjects: projectCount - publicProjectCount
    }
  };

  res.status(HTTP_STATUS.OK).json(response);
});