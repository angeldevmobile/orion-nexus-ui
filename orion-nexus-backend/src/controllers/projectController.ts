import { Request, Response } from 'express';
import { pool } from '../config/database';
import { HTTP_STATUS, PLAN_FEATURES } from '../utils/constants';
import { ApiResponse, PaginationQuery } from '../types/api';
import { CreateProjectRequest, UpdateProjectRequest } from '../types/project';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { emailService } from '../services/emailService';

// PostgreSQL jsonb columns come back as objects already — only parse if it's a string
function parseJson<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value as T;
  try { return JSON.parse(value as string); } catch { return fallback; }
}

// Crear proyecto
export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, settings, isPublic }: CreateProjectRequest = req.body;
  const plan = req.user?.plan ?? 'free';
  const features = PLAN_FEATURES[plan];

  // Verificar límite de proyectos activos (Free: máx 3)
  if (features.maxProjects > 0) {
    const countResult = await pool.query(
      `SELECT COUNT(*) AS total FROM projects WHERE owner_id = $1`,
      [req.user?.id]
    );
    const total = parseInt(countResult.rows[0].total, 10);
    if (total >= features.maxProjects) {
      throw createError(
        `Tu plan ${plan} permite un máximo de ${features.maxProjects} proyectos activos. Actualiza tu plan para crear más.`,
        HTTP_STATUS.FORBIDDEN
      );
    }
  }

  // Verificar si puede hacer el proyecto público (publicar en comunidad)
  if (isPublic && !features.publishCommunity) {
    throw createError(
      'Publicar proyectos en la comunidad requiere el plan Pro o superior.',
      HTTP_STATUS.FORBIDDEN
    );
  }

  // Verificar si puede hacer el proyecto privado con acceso restringido
  if (isPublic === false && !features.privateProjects) {
    throw createError(
      'Los proyectos privados requieren el plan Business o superior.',
      HTTP_STATUS.FORBIDDEN
    );
  }

  const files = [{
    name: 'index.js',
    content: '// Welcome to your new project!',
    type: 'javascript',
    path: '/'
  }];

  const language = settings?.language ?? 'javascript';
  const framework = settings?.framework ?? 'vanilla';

  const query = `
    INSERT INTO projects (name, description, owner_id, settings, is_public, files, language, framework)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const values = [
    name,
    description,
    req.user?.id,
    JSON.stringify(settings),
    isPublic || false,
    JSON.stringify(files),
    language,
    framework,
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

// Obtener proyectos públicos (plantillas y proyectos públicos)
export const getPublicProjects = asyncHandler(async (req: Request, res: Response) => {
  const { limit = 20 } = req.query;

  const projectsQuery = `
    SELECT
      p.*,
      u.username as owner_username,
      u.email as owner_email,
      u.avatar as owner_avatar
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE p.is_public = true
    ORDER BY p.created_at DESC
    LIMIT $1
  `;

  const result = await pool.query(projectsQuery, [Number(limit)]);

  const projects = result.rows.map(row => ({
    ...row,
    files: parseJson(row.files, []),
    settings: parseJson(row.settings, {}),
    owner: {
      id: row.owner_id,
      username: row.owner_username,
      email: row.owner_email,
      avatar: row.owner_avatar
    }
  }));

  const response: ApiResponse = {
    success: true,
    message: 'Public projects retrieved successfully',
    data: projects
  };

  res.status(HTTP_STATUS.OK).json(response);
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
    files: parseJson(row.files, []),
    settings: parseJson(row.settings, {}),
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

  project.files = parseJson(project.files, []);
  project.settings = parseJson(project.settings, {});
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

  // Verificar restricciones de plan al cambiar visibilidad
  if (updates.isPublic !== undefined) {
    const plan = req.user?.plan ?? 'free';
    const features = PLAN_FEATURES[plan];

    if (updates.isPublic === true && !features.publishCommunity) {
      throw createError(
        'Publicar proyectos en la comunidad requiere el plan Pro o superior.',
        HTTP_STATUS.FORBIDDEN
      );
    }
    if (updates.isPublic === false && !features.privateProjects) {
      throw createError(
        'Los proyectos privados requieren el plan Business o superior.',
        HTTP_STATUS.FORBIDDEN
      );
    }
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
    files: parseJson(updateResult.rows[0].files, []),
    settings: parseJson(updateResult.rows[0].settings, {}),
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
    files: parseJson(updateResult.rows[0].files, []),
    settings: parseJson(updateResult.rows[0].settings, {}),
    owner: ownerResult.rows[0]
  };

  const response: ApiResponse = {
    success: true,
    message: 'Project files updated successfully',
    data: updatedProject
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Push proyecto a GitHub
export const pushToGitHub = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = parseInt(req.user?.id || '0');

  // Obtener proyecto + token de GitHub del owner
  const projectResult = await pool.query(
    `SELECT p.*, u.github_access_token, u.username as owner_username
     FROM projects p
     JOIN users u ON p.owner_id = u.id
     WHERE p.id = $1`,
    [id]
  );
  if (projectResult.rows.length === 0) {
    throw createError('Project not found', HTTP_STATUS.NOT_FOUND);
  }
  const project = projectResult.rows[0];

  if (project.owner_id !== userId) {
    throw createError('Access denied', HTTP_STATUS.FORBIDDEN);
  }

  const githubToken = project.github_access_token as string | null;
  if (!githubToken) {
    throw createError(
      'No GitHub account linked. Please log in with GitHub to use this feature.',
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const ghHeaders: Record<string, string> = {
    Authorization: `token ${githubToken}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // 1. Verificar usuario de GitHub
  const meRes = await fetch('https://api.github.com/user', { headers: ghHeaders });
  if (!meRes.ok) {
    throw createError('Failed to fetch GitHub user info. Token may be invalid.', HTTP_STATUS.BAD_REQUEST);
  }
  const ghUser = await meRes.json() as { login: string };

  // 2. Crear repositorio
  const repoName = project.name
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 100) || 'orion-project';

  const createRepoRes = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: ghHeaders,
    body: JSON.stringify({
      name: repoName,
      description: project.description || 'Created with Orion Nexus Studio',
      private: false,
      auto_init: false,
    }),
  });

  if (!createRepoRes.ok) {
    const err = await createRepoRes.json() as { message?: string };
    throw createError(
      `GitHub: ${err.message || 'Could not create repository'}`,
      HTTP_STATUS.BAD_REQUEST
    );
  }
  const repo = await createRepoRes.json() as { full_name: string; html_url: string };

  // 3. Construir README con firma de Orion
  const settings = parseJson(project.settings, {}) as Record<string, unknown>;
  const framework = settings.framework ?? 'vanilla';

  const readmeContent = [
    `# ${project.name}`,
    '',
    project.description ? `> ${project.description}` : '',
    '',
    '## 🚀 About',
    '',
    'This project was created with **[Orion Nexus Studio](https://orion-nexus.dev)** — the AI-powered cloud IDE.',
    '',
    '| Property | Value |',
    '|----------|-------|',
    `| Framework | ${framework} |`,
    `| Author | @${ghUser.login} |`,
    `| Date | ${new Date().toISOString().split('T')[0]} |`,
    '',
    '---',
    '',
    '```',
    '  ██████╗ ██████╗ ██╗ ██████╗ ███╗   ██╗',
    ' ██╔═══██╗██╔══██╗██║██╔═══██╗████╗  ██║',
    ' ██║   ██║██████╔╝██║██║   ██║██╔██╗ ██║',
    ' ██║   ██║██╔══██╗██║██║   ██║██║╚██╗██║',
    ' ╚██████╔╝██║  ██║██║╚██████╔╝██║ ╚████║',
    '  ╚═════╝ ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝',
    '         Nexus Studio — Build Faster.',
    '```',
    '',
    '_Powered by [Orion Nexus Studio](https://orion-nexus.dev)_',
  ].join('\n');

  interface ProjectFile {
    name: string;
    path?: string;
    content?: string;
  }

  const uploadFile = async (filePath: string, content: string) => {
    const encoded = Buffer.from(content).toString('base64');
    const r = await fetch(
      `https://api.github.com/repos/${repo.full_name}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: ghHeaders,
        body: JSON.stringify({ message: `Add ${filePath}`, content: encoded }),
      }
    );
    if (!r.ok) {
      const e = await r.json() as { message?: string };
      console.error(`Failed to upload ${filePath}: ${e.message}`);
    }
  };

  // README primero
  await uploadFile('README.md', readmeContent);

  // Archivos del proyecto
  const projectFiles: ProjectFile[] = parseJson(project.files, []);
  for (const file of projectFiles) {
    if (!file.name || file.content === undefined) continue;
    const cleanPath = file.path && file.path !== '/'
      ? `${file.path.replace(/^\//, '')}/${file.name}`
      : file.name;
    await uploadFile(cleanPath, file.content ?? '');
  }

  const response: ApiResponse = {
    success: true,
    message: 'Project pushed to GitHub successfully',
    data: { repoUrl: repo.html_url, repoName: repo.full_name },
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// @route   POST /api/projects/:id/publish
// @desc    Publish a project as template or community post
// @access  Private
export const publishProject = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { type } = req.body as { type: 'template' | 'community' };
  const userId = parseInt(req.user?.id || '0');

  const checkResult = await pool.query(
    'SELECT id, owner_id, settings FROM projects WHERE id = $1',
    [id]
  );

  if (checkResult.rows.length === 0) {
    throw createError('Project not found', HTTP_STATUS.NOT_FOUND);
  }

  if (checkResult.rows[0].owner_id !== userId && req.user?.role !== 'admin') {
    throw createError('Only the project owner can publish it', HTTP_STATUS.FORBIDDEN);
  }

  const currentSettings = parseJson(checkResult.rows[0].settings, {}) as Record<string, unknown>;

  const updatedSettings = { ...currentSettings, publishType: type };

  const result = await pool.query(
    `UPDATE projects
     SET is_public = true,
         settings  = $1,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [JSON.stringify(updatedSettings), id]
  );

  const response: ApiResponse = {
    success: true,
    message: type === 'template' ? 'Project published as template' : 'Project published to community',
    data: result.rows[0],
  };

  res.status(HTTP_STATUS.OK).json(response);
});