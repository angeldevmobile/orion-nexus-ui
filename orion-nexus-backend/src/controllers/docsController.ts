import { Request, Response } from 'express';
import { pool } from '../config/database';
import { HTTP_STATUS } from '../utils/constants';
import { ApiResponse, PaginationQuery } from '../types/api';
import { asyncHandler, createError } from '../middleware/errorHandler';

// ─── ARTÍCULOS ───────────────────────────────────────────────────────────────

// Obtener artículos con paginación, búsqueda y filtro por categoría
export const getArticles = asyncHandler(async (req: Request, res: Response) => {
  const {
    page = 1,
    limit = 12,
    sort = 'order_index',
    order = 'asc',
  }: PaginationQuery = req.query;
  const { category, search } = req.query as { category?: string; search?: string };

  const offset = (Number(page) - 1) * Number(limit);
  const sortOrder = order === 'desc' ? 'DESC' : 'ASC';
  const validSortFields = ['order_index', 'created_at', 'title'];
  const sortField = validSortFields.includes(sort as string) ? sort : 'order_index';

  const whereConditions: string[] = ['is_published = true'];
  const queryParams: (string | number)[] = [];
  let paramIndex = 1;

  if (category && category !== 'all') {
    whereConditions.push(`category = $${paramIndex++}`);
    queryParams.push(category);
  }
  if (search) {
    whereConditions.push(
      `(title ILIKE $${paramIndex} OR content ILIKE $${paramIndex} OR excerpt ILIKE $${paramIndex} OR EXISTS (SELECT 1 FROM unnest(tags) tag WHERE tag ILIKE $${paramIndex}))`
    );
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

  const articlesQuery = `
    SELECT id, title, excerpt, category, slug, tags, order_index, created_at, updated_at
    FROM doc_articles
    ${whereClause}
    ORDER BY ${sortField} ${sortOrder}
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  const countQuery = `SELECT COUNT(*) as total FROM doc_articles ${whereClause}`;

  queryParams.push(Number(limit), offset);

  const [articlesResult, countResult] = await Promise.all([
    pool.query(articlesQuery, queryParams),
    pool.query(countQuery, queryParams.slice(0, -2)),
  ]);

  const total = parseInt(countResult.rows[0]?.total || '0');

  const response: ApiResponse = {
    success: true,
    message: 'Articles retrieved successfully',
    data: articlesResult.rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Obtener artículo por slug
export const getArticleBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params;

  const result = await pool.query(
    'SELECT * FROM doc_articles WHERE slug = $1 AND is_published = true',
    [slug]
  );

  if (result.rows.length === 0) {
    throw createError('Article not found', HTTP_STATUS.NOT_FOUND);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Article retrieved successfully',
    data: result.rows[0],
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Obtener conteo de artículos por categoría
export const getCategoryCounts = asyncHandler(async (_req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT category, COUNT(*)::int AS count
    FROM doc_articles
    WHERE is_published = true
    GROUP BY category
  `);

  const response: ApiResponse = {
    success: true,
    message: 'Category counts retrieved successfully',
    data: result.rows,
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Crear artículo (admin)
export const createArticle = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, excerpt, category, slug, tags, order_index } = req.body;

  if (!title || !content || !category || !slug) {
    throw createError('title, content, category and slug are required', HTTP_STATUS.BAD_REQUEST);
  }

  const slugCheck = await pool.query('SELECT id FROM doc_articles WHERE slug = $1', [slug]);
  if (slugCheck.rows.length > 0) {
    throw createError('Slug already exists', HTTP_STATUS.BAD_REQUEST);
  }

  const result = await pool.query(
    `INSERT INTO doc_articles (title, content, excerpt, category, slug, tags, order_index, is_published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, true)
     RETURNING *`,
    [title, content, excerpt || '', category, slug, tags || [], order_index || 0]
  );

  const response: ApiResponse = {
    success: true,
    message: 'Article created successfully',
    data: result.rows[0],
  };

  res.status(HTTP_STATUS.CREATED).json(response);
});

// Actualizar artículo (admin)
export const updateArticle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const check = await pool.query('SELECT id FROM doc_articles WHERE id = $1', [id]);
  if (check.rows.length === 0) {
    throw createError('Article not found', HTTP_STATUS.NOT_FOUND);
  }

  const { title, content, excerpt, category, slug, tags, order_index, is_published } = req.body;
  const fields: string[] = [];
  const values: unknown[] = [id];
  let idx = 2;

  if (title !== undefined) { fields.push(`title = $${idx++}`); values.push(title); }
  if (content !== undefined) { fields.push(`content = $${idx++}`); values.push(content); }
  if (excerpt !== undefined) { fields.push(`excerpt = $${idx++}`); values.push(excerpt); }
  if (category !== undefined) { fields.push(`category = $${idx++}`); values.push(category); }
  if (slug !== undefined) { fields.push(`slug = $${idx++}`); values.push(slug); }
  if (tags !== undefined) { fields.push(`tags = $${idx++}`); values.push(tags); }
  if (order_index !== undefined) { fields.push(`order_index = $${idx++}`); values.push(order_index); }
  if (is_published !== undefined) { fields.push(`is_published = $${idx++}`); values.push(is_published); }

  if (fields.length === 0) {
    throw createError('No fields to update', HTTP_STATUS.BAD_REQUEST);
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');

  const result = await pool.query(
    `UPDATE doc_articles SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
    values
  );

  const response: ApiResponse = {
    success: true,
    message: 'Article updated successfully',
    data: result.rows[0],
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Eliminar artículo (admin)
export const deleteArticle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM doc_articles WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw createError('Article not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Article deleted successfully' });
});

// ─── FAQs ─────────────────────────────────────────────────────────────────────

// Obtener FAQs
export const getFaqs = asyncHandler(async (req: Request, res: Response) => {
  const { category } = req.query as { category?: string };

  const whereConditions = ['is_published = true'];
  const params: (string | number)[] = [];

  if (category && category !== 'all') {
    whereConditions.push(`category = $${params.length + 1}`);
    params.push(category);
  }

  const result = await pool.query(
    `SELECT * FROM doc_faqs WHERE ${whereConditions.join(' AND ')} ORDER BY order_index ASC`,
    params
  );

  const response: ApiResponse = {
    success: true,
    message: 'FAQs retrieved successfully',
    data: result.rows,
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Crear FAQ (admin)
export const createFaq = asyncHandler(async (req: Request, res: Response) => {
  const { question, answer, category, order_index } = req.body;

  if (!question || !answer) {
    throw createError('question and answer are required', HTTP_STATUS.BAD_REQUEST);
  }

  const result = await pool.query(
    `INSERT INTO doc_faqs (question, answer, category, order_index, is_published)
     VALUES ($1, $2, $3, $4, true)
     RETURNING *`,
    [question, answer, category || 'general', order_index || 0]
  );

  const response: ApiResponse = {
    success: true,
    message: 'FAQ created successfully',
    data: result.rows[0],
  };

  res.status(HTTP_STATUS.CREATED).json(response);
});

// Actualizar FAQ (admin)
export const updateFaq = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const check = await pool.query('SELECT id FROM doc_faqs WHERE id = $1', [id]);
  if (check.rows.length === 0) {
    throw createError('FAQ not found', HTTP_STATUS.NOT_FOUND);
  }

  const { question, answer, category, order_index, is_published } = req.body;
  const fields: string[] = [];
  const values: unknown[] = [id];
  let idx = 2;

  if (question !== undefined) { fields.push(`question = $${idx++}`); values.push(question); }
  if (answer !== undefined) { fields.push(`answer = $${idx++}`); values.push(answer); }
  if (category !== undefined) { fields.push(`category = $${idx++}`); values.push(category); }
  if (order_index !== undefined) { fields.push(`order_index = $${idx++}`); values.push(order_index); }
  if (is_published !== undefined) { fields.push(`is_published = $${idx++}`); values.push(is_published); }

  if (fields.length === 0) {
    throw createError('No fields to update', HTTP_STATUS.BAD_REQUEST);
  }

  fields.push('updated_at = CURRENT_TIMESTAMP');

  const result = await pool.query(
    `UPDATE doc_faqs SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
    values
  );

  const response: ApiResponse = {
    success: true,
    message: 'FAQ updated successfully',
    data: result.rows[0],
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Eliminar FAQ (admin)
export const deleteFaq = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query('DELETE FROM doc_faqs WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) {
    throw createError('FAQ not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'FAQ deleted successfully' });
});
