import { Request, Response } from 'express';
import { pool } from '../config/database'; 
import { HTTP_STATUS } from '../utils/constants';
import { ApiResponse, PaginationQuery } from '../types/api';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { aiService } from '../services/aiService';

interface QueryParams {
  category?: string;
  framework?: string;
  search?: string;
}

interface ComponentRow {
  id: number;
  slug: string | null;
  file_name: string | null;
  is_system: boolean;
  name: string;
  description: string;
  category: string;
  code: string;
  props: string;
  framework: string;
  tags: string[];
  is_public: boolean;
  downloads: number;
  rating: string;
  created_at: Date;
  updated_at: Date;
  creator_id: number;
  creator_name: string;
  creator_email: string;
  creator_avatar: string;
  avg_rating: string;
  rating_count: string;
  preview_html: string | null;
}

// Add this interface for rating row data
interface RatingRow {
  id: number;
  component_id: number;
  user_id: number;
  score: number;
  comment: string | null;
  created_at: Date;
  updated_at: Date;
  user_name: string;
  user_avatar: string | null;
}

export const createComponent = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, category, code, props, framework, tags } = req.body;

  // Generate preview HTML on the backend so the card can render it directly
  const previewHtml = await aiService
    .generateLovablePreviewHTML([{ path: `${name}.tsx`, content: code }])
    .catch(() => null);

  const query = `
    INSERT INTO components (name, description, category, code, props, framework, creator_id, tags, is_public, preview_html)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, $9)
    RETURNING *
  `;

  const values = [
    name,
    description || null,
    category,
    code,
    JSON.stringify(props || []),
    framework,
    req.user?.id,
    tags || [],
    previewHtml
  ];

  const result = await pool.query(query, values);
  const component = result.rows[0];

  // Get creator info
  const creatorQuery = `
    SELECT id, username, email, avatar 
    FROM users 
    WHERE id = $1
  `;
  const creatorResult = await pool.query(creatorQuery, [component.creator_id]);
  
  const componentWithCreator = {
    ...component,
    props: Array.isArray(component.props) ? component.props : (typeof component.props === 'string' ? JSON.parse(component.props || '[]') : (component.props ?? [])),
    creator: creatorResult.rows[0]
  };

  const response: ApiResponse = {
    success: true,
    message: 'Component created successfully',
    data: componentWithCreator
  };

  res.status(HTTP_STATUS.CREATED).json(response);
});

export const getComponents = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 12, 
    category, 
    framework, 
    search,
    sort = 'created_at',
    order = 'desc' 
  }: PaginationQuery & QueryParams = req.query;

  const offset = (Number(page) - 1) * Number(limit);
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  const whereConditions = ['c.is_public = true']; 
  const queryParams: (string | number)[] = []; 
  let paramIndex = 1;

  if (category) {
    whereConditions.push(`c.category = $${paramIndex++}`);
    queryParams.push(category);
  }

  if (framework) {
    whereConditions.push(`c.framework = $${paramIndex++}`);
    queryParams.push(framework);
  }

  if (search) {
    whereConditions.push(`(
      c.name ILIKE $${paramIndex} OR 
      c.description ILIKE $${paramIndex} OR 
      EXISTS (SELECT 1 FROM unnest(c.tags) tag WHERE tag ILIKE $${paramIndex})
    )`);
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  // Validate sort field
  const validSortFields = ['created_at', 'updated_at', 'name', 'downloads', 'rating'];
  const sortField = validSortFields.includes(sort as string) ? sort : 'created_at';

  // Get components with ratings
  const componentsQuery = `
    SELECT 
      c.*,
      u.id as creator_id,
      u.username as creator_name,
      u.email as creator_email,
      u.avatar as creator_avatar,
      COALESCE(AVG(r.score), 0) as avg_rating,
      COUNT(r.id) as rating_count
    FROM components c
    LEFT JOIN users u ON c.creator_id = u.id
    LEFT JOIN component_ratings r ON c.id = r.component_id
    ${whereClause}
    GROUP BY c.id, u.id, u.username, u.email, u.avatar
    ORDER BY c.${sortField} ${sortOrder}
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;

  // Get total count
  const countQuery = `
    SELECT COUNT(DISTINCT c.id) as total
    FROM components c
    ${whereClause}
  `;

  queryParams.push(Number(limit), offset);

  const [componentsResult, countResult] = await Promise.all([
    pool.query(componentsQuery, queryParams),
    pool.query(countQuery, queryParams.slice(0, -2))
  ]);

  const components = componentsResult.rows.map((row: ComponentRow) => ({
    id: row.id,
    slug: row.slug,
    file_name: row.file_name,
    is_system: row.is_system,
    name: row.name,
    description: row.description,
    category: row.category,
    code: row.code,
    props: Array.isArray(row.props) ? row.props : (typeof row.props === 'string' ? JSON.parse(row.props || '[]') : (row.props ?? [])),
    framework: row.framework,
    tags: row.tags,
    is_public: row.is_public,
    downloads: row.downloads,
    rating: parseFloat(row.rating || '0'),
    avg_rating: parseFloat(row.avg_rating || '0'),
    rating_count: parseInt(row.rating_count || '0'),
    created_at: row.created_at,
    updated_at: row.updated_at,
    preview_html: row.preview_html ?? null,
    creator: {
      id: row.creator_id,
      username: row.creator_name,
      email: row.creator_email,
      avatar: row.creator_avatar
    }
  }));

  const total = parseInt(countResult.rows[0]?.total || '0');

  const response: ApiResponse = {
    success: true,
    message: 'Components retrieved successfully',
    data: components,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  };

  res.status(HTTP_STATUS.OK).json(response);
});

export const getComponentById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    throw createError('Invalid component ID', HTTP_STATUS.BAD_REQUEST);
  }

  const componentQuery = `
    SELECT 
      c.*,
      u.id as creator_id,
      u.username as creator_name,
      u.email as creator_email,
      u.avatar as creator_avatar,
      COALESCE(AVG(r.score), 0) as avg_rating,
      COUNT(r.id) as rating_count
    FROM components c
    LEFT JOIN users u ON c.creator_id = u.id
    LEFT JOIN component_ratings r ON c.id = r.component_id
    WHERE c.id = $1
    GROUP BY c.id, u.id, u.username, u.email, u.avatar
  `;

  const ratingsQuery = `
    SELECT 
      r.*,
      u.username as user_name,
      u.avatar as user_avatar
    FROM component_ratings r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.component_id = $1
    ORDER BY r.created_at DESC
  `;

  const [componentResult, ratingsResult] = await Promise.all([
    pool.query(componentQuery, [id]),
    pool.query(ratingsQuery, [id])
  ]);

  if (componentResult.rows.length === 0) {
    throw createError('Component not found', HTTP_STATUS.NOT_FOUND);
  }

  const componentRow = componentResult.rows[0] as ComponentRow;
  const component = {
    id: componentRow.id,
    name: componentRow.name,
    description: componentRow.description,
    category: componentRow.category,
    code: componentRow.code,
    props: JSON.parse(componentRow.props || '[]'),
    framework: componentRow.framework,
    tags: componentRow.tags,
    is_public: componentRow.is_public,
    downloads: componentRow.downloads,
    rating: parseFloat(componentRow.rating || '0'),
    avg_rating: parseFloat(componentRow.avg_rating || '0'),
    rating_count: parseInt(componentRow.rating_count || '0'),
    created_at: componentRow.created_at,
    updated_at: componentRow.updated_at,
    creator: {
      id: componentRow.creator_id,
      username: componentRow.creator_name,
      email: componentRow.creator_email,
      avatar: componentRow.creator_avatar
    },
    ratings: ratingsResult.rows.map((rating: RatingRow) => ({ 
      id: rating.id,
      score: rating.score,
      comment: rating.comment,
      created_at: rating.created_at,
      user: {
        id: rating.user_id,
        username: rating.user_name,
        avatar: rating.user_avatar
      }
    }))
  };

  // Increment downloads
  await pool.query(
    'UPDATE components SET downloads = downloads + 1 WHERE id = $1',
    [id]
  );

  const response: ApiResponse = {
    success: true,
    message: 'Component retrieved successfully',
    data: component
  };

  res.status(HTTP_STATUS.OK).json(response);
});

export const updateComponent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    throw createError('Invalid component ID', HTTP_STATUS.BAD_REQUEST);
  }

  // Check if component exists and user is creator
  const checkQuery = `
    SELECT creator_id FROM components WHERE id = $1
  `;
  const checkResult = await pool.query(checkQuery, [id]);

  if (checkResult.rows.length === 0) {
    throw createError('Component not found', HTTP_STATUS.NOT_FOUND);
  }

  if (checkResult.rows[0].creator_id !== parseInt(req.user?.id || '0')) {
    throw createError('Only component creator can update', HTTP_STATUS.FORBIDDEN);
  }

  const { name, description, category, code, props, framework, tags, is_public } = req.body;

  const updateFields: string[] = [];
  const updateValues: (string | number | boolean | string[])[] = [id];
  let paramIndex = 2;

  if (name !== undefined) {
    updateFields.push(`name = $${paramIndex++}`);
    updateValues.push(name);
  }
  if (description !== undefined) {
    updateFields.push(`description = $${paramIndex++}`);
    updateValues.push(description);
  }
  if (category !== undefined) {
    updateFields.push(`category = $${paramIndex++}`);
    updateValues.push(category);
  }
  if (code !== undefined) {
    updateFields.push(`code = $${paramIndex++}`);
    updateValues.push(code);
  }
  if (props !== undefined) {
    updateFields.push(`props = $${paramIndex++}`);
    updateValues.push(JSON.stringify(props));
  }
  if (framework !== undefined) {
    updateFields.push(`framework = $${paramIndex++}`);
    updateValues.push(framework);
  }
  if (tags !== undefined) {
    updateFields.push(`tags = $${paramIndex++}`);
    updateValues.push(tags);
  }
  if (is_public !== undefined) {
    updateFields.push(`is_public = $${paramIndex++}`);
    updateValues.push(is_public);
  }

  if (updateFields.length === 0) {
    throw createError('No fields to update', HTTP_STATUS.BAD_REQUEST);
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');

  const updateQuery = `
    UPDATE components 
    SET ${updateFields.join(', ')}
    WHERE id = $1
    RETURNING *
  `;

  const updateResult = await pool.query(updateQuery, updateValues);

  // Get creator info
  const creatorQuery = `
    SELECT id, username, email, avatar 
    FROM users 
    WHERE id = $1
  `;
  const creatorResult = await pool.query(creatorQuery, [updateResult.rows[0].creator_id]);
  
  const component = {
    ...updateResult.rows[0],
    props: JSON.parse(updateResult.rows[0].props || '[]'),
    creator: creatorResult.rows[0]
  };

  const response: ApiResponse = {
    success: true,
    message: 'Component updated successfully',
    data: component
  };

  res.status(HTTP_STATUS.OK).json(response);
});

export const rateComponent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { score, comment } = req.body;

  if (!id || isNaN(parseInt(id))) {
    throw createError('Invalid component ID', HTTP_STATUS.BAD_REQUEST);
  }

  if (!score || score < 1 || score > 5) {
    throw createError('Score must be between 1 and 5', HTTP_STATUS.BAD_REQUEST);
  }

  // Check if component exists
  const componentCheck = await pool.query('SELECT id FROM components WHERE id = $1', [id]);
  if (componentCheck.rows.length === 0) {
    throw createError('Component not found', HTTP_STATUS.NOT_FOUND);
  }

  const userId = parseInt(req.user?.id || '0');

  // Check if user already rated
  const existingRatingQuery = `
    SELECT id FROM component_ratings 
    WHERE component_id = $1 AND user_id = $2
  `;
  const existingRating = await pool.query(existingRatingQuery, [id, userId]);

  if (existingRating.rows.length > 0) {
    // Update existing rating
    await pool.query(
      `UPDATE component_ratings 
       SET score = $3, comment = $4, updated_at = CURRENT_TIMESTAMP
       WHERE component_id = $1 AND user_id = $2`,
      [id, userId, score, comment]
    );
  } else {
    // Create new rating
    await pool.query(
      `INSERT INTO component_ratings (component_id, user_id, score, comment)
       VALUES ($1, $2, $3, $4)`,
      [id, userId, score, comment]
    );
  }

  // Get updated component with new rating
  const componentQuery = `
    SELECT 
      c.*,
      u.id as creator_id,
      u.username as creator_name,
      u.email as creator_email,
      u.avatar as creator_avatar,
      COALESCE(AVG(r.score), 0) as avg_rating,
      COUNT(r.id) as rating_count
    FROM components c
    LEFT JOIN users u ON c.creator_id = u.id
    LEFT JOIN component_ratings r ON c.id = r.component_id
    WHERE c.id = $1
    GROUP BY c.id, u.id, u.username, u.email, u.avatar
  `;

  const result = await pool.query(componentQuery, [id]);
  const componentRow = result.rows[0] as ComponentRow;

  const component = {
    id: componentRow.id,
    name: componentRow.name,
    description: componentRow.description,
    category: componentRow.category,
    code: componentRow.code,
    props: JSON.parse(componentRow.props || '[]'),
    framework: componentRow.framework,
    tags: componentRow.tags,
    is_public: componentRow.is_public,
    downloads: componentRow.downloads,
    rating: parseFloat(componentRow.rating || '0'),
    avg_rating: parseFloat(componentRow.avg_rating || '0'),
    rating_count: parseInt(componentRow.rating_count || '0'),
    created_at: componentRow.created_at,
    updated_at: componentRow.updated_at,
    creator: {
      id: componentRow.creator_id,
      username: componentRow.creator_name,
      email: componentRow.creator_email,
      avatar: componentRow.creator_avatar
    }
  };

  const response: ApiResponse = {
    success: true,
    message: 'Component rated successfully',
    data: component
  };

  res.status(HTTP_STATUS.OK).json(response);
});

export const deleteComponent = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    throw createError('Invalid component ID', HTTP_STATUS.BAD_REQUEST);
  }

  const checkResult = await pool.query(
    'SELECT creator_id, is_system FROM components WHERE id = $1',
    [id]
  );

  if (checkResult.rows.length === 0) {
    throw createError('Component not found', HTTP_STATUS.NOT_FOUND);
  }

  if (checkResult.rows[0].is_system) {
    throw createError('System components cannot be deleted', HTTP_STATUS.FORBIDDEN);
  }

  if (checkResult.rows[0].creator_id !== parseInt(req.user?.id || '0')) {
    throw createError('Only the component creator can delete it', HTTP_STATUS.FORBIDDEN);
  }

  await pool.query('DELETE FROM components WHERE id = $1', [id]);

  const response: ApiResponse = {
    success: true,
    message: 'Component deleted successfully',
    data: null
  };

  res.status(HTTP_STATUS.OK).json(response);
});