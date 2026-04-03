import { Request, Response } from 'express';
import { pool } from '../config/database';
import { HTTP_STATUS } from '../utils/constants';
import { ApiResponse, PaginationQuery } from '../types/api';
import { asyncHandler, createError } from '../middleware/errorHandler';

// Crear post
export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const { title, content, category, tags, attachments } = req.body;

  const query = `
    INSERT INTO community_posts (title, content, author_id, category, tags, attachments)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const values = [
    title,
    content,
    req.user?.id,
    category,
    tags || [],
    attachments || []
  ];

  const result = await pool.query(query, values);
  const post = result.rows[0];

  // Obtener info del autor
  const authorQuery = `SELECT id, username, email, avatar FROM users WHERE id = $1`;
  const authorResult = await pool.query(authorQuery, [post.author_id]);

  const postWithAuthor = {
    ...post,
    author: authorResult.rows[0]
  };

  const response: ApiResponse = {
    success: true,
    message: 'Post created successfully',
    data: postWithAuthor
  };

  res.status(HTTP_STATUS.CREATED).json(response);
});

// Obtener posts con paginación y búsqueda
export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const { 
    page = 1, 
    limit = 10, 
    category, 
    search,
    sort = 'created_at',
    order = 'desc' 
  }: PaginationQuery & { category?: string; search?: string } = req.query;

  const offset = (Number(page) - 1) * Number(limit);
  const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

  const whereConditions: string[] = [];
  const queryParams: (string | number)[] = [];
  let paramIndex = 1;

  if (category && category !== 'all') {
    whereConditions.push(`p.category = $${paramIndex++}`);
    queryParams.push(category);
  }
  if (search) {
    whereConditions.push(`(
      p.title ILIKE $${paramIndex} OR 
      p.content ILIKE $${paramIndex} OR 
      EXISTS (SELECT 1 FROM unnest(p.tags) tag WHERE tag ILIKE $${paramIndex})
    )`);
    queryParams.push(`%${search}%`);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  const validSortFields = ['created_at', 'updated_at', 'title', 'likes_count', 'comments_count'];
  const sortField = validSortFields.includes(sort as string) ? sort : 'created_at';

  const postsQuery = `
    SELECT 
      p.*,
      u.username as author_username,
      u.email as author_email,
      u.avatar as author_avatar
    FROM community_posts p
    LEFT JOIN users u ON p.author_id = u.id
    ${whereClause}
    ORDER BY p.is_pinned DESC, p.${sortField} ${sortOrder}
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  const countQuery = `
    SELECT COUNT(*) as total
    FROM community_posts p
    ${whereClause}
  `;

  queryParams.push(Number(limit), offset);

  const [postsResult, countResult] = await Promise.all([
    pool.query(postsQuery, queryParams),
    pool.query(countQuery, queryParams.slice(0, -2))
  ]);

  const posts = postsResult.rows.map(row => ({
    id: row.id,
    title: row.title,
    content: row.content,
    author_id: row.author_id,
    category: row.category,
    tags: row.tags,
    attachments: row.attachments,
    is_pinned: row.is_pinned,
    is_resolved: row.is_resolved,
    likes_count: row.likes_count,
    comments_count: row.comments_count,
    created_at: row.created_at,
    updated_at: row.updated_at,
    author: {
      id: row.author_id,
      username: row.author_username,
      email: row.author_email,
      avatar: row.author_avatar
    }
  }));

  const total = parseInt(countResult.rows[0]?.total || '0');

  const response: ApiResponse = {
    success: true,
    message: 'Posts retrieved successfully',
    data: posts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Obtener post por ID
export const getPostById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const postQuery = `
    SELECT 
      p.*,
      u.username as author_username,
      u.email as author_email,
      u.avatar as author_avatar
    FROM community_posts p
    LEFT JOIN users u ON p.author_id = u.id
    WHERE p.id = $1
  `;
  const commentsQuery = `
    SELECT 
      c.*,
      u.username as author_username,
      u.email as author_email,
      u.avatar as author_avatar
    FROM post_comments c
    LEFT JOIN users u ON c.author_id = u.id
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC
  `;
  const likesQuery = `
    SELECT 
      l.*,
      u.username,
      u.email,
      u.avatar
    FROM post_likes l
    LEFT JOIN users u ON l.user_id = u.id
    WHERE l.post_id = $1
  `;

  const [postResult, commentsResult, likesResult] = await Promise.all([
    pool.query(postQuery, [id]),
    pool.query(commentsQuery, [id]),
    pool.query(likesQuery, [id])
  ]);

  if (postResult.rows.length === 0) {
    throw createError('Post not found', HTTP_STATUS.NOT_FOUND);
  }

  const postRow = postResult.rows[0];
  const post = {
    id: postRow.id,
    title: postRow.title,
    content: postRow.content,
    author_id: postRow.author_id,
    category: postRow.category,
    tags: postRow.tags,
    attachments: postRow.attachments,
    is_pinned: postRow.is_pinned,
    is_resolved: postRow.is_resolved,
    likes_count: postRow.likes_count,
    comments_count: postRow.comments_count,
    created_at: postRow.created_at,
    updated_at: postRow.updated_at,
    author: {
      id: postRow.author_id,
      username: postRow.author_username,
      email: postRow.author_email,
      avatar: postRow.author_avatar
    },
    comments: commentsResult.rows.map(comment => ({
      id: comment.id,
      post_id: comment.post_id,
      author_id: comment.author_id,
      content: comment.content,
      created_at: comment.created_at,
      author: {
        id: comment.author_id,
        username: comment.author_username,
        email: comment.author_email,
        avatar: comment.author_avatar
      }
    })),
    likes: likesResult.rows
  };

  const response: ApiResponse = {
    success: true,
    message: 'Post retrieved successfully',
    data: post
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Actualizar post - CAMBIADO: Request en lugar de RequestWithUser
export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const checkQuery = `SELECT author_id FROM community_posts WHERE id = $1`;
  const checkResult = await pool.query(checkQuery, [id]);

  if (checkResult.rows.length === 0) {
    throw createError('Post not found', HTTP_STATUS.NOT_FOUND);
  }
  if (checkResult.rows[0].author_id !== parseInt(req.user?.id || '0') && req.user?.role !== 'admin') {
    throw createError('Only post author or admin can update', HTTP_STATUS.FORBIDDEN);
  }

  const { title, content, category, tags, attachments } = req.body;
  const updateFields: string[] = [];
  const updateValues: (string | string[])[] = [id];
  let paramIndex = 2;

  if (title !== undefined) {
    updateFields.push(`title = $${paramIndex++}`);
    updateValues.push(title);
  }
  if (content !== undefined) {
    updateFields.push(`content = $${paramIndex++}`);
    updateValues.push(content);
  }
  if (category !== undefined) {
    updateFields.push(`category = $${paramIndex++}`);
    updateValues.push(category);
  }
  if (tags !== undefined) {
    updateFields.push(`tags = $${paramIndex++}`);
    updateValues.push(tags);
  }
  if (attachments !== undefined) {
    updateFields.push(`attachments = $${paramIndex++}`);
    updateValues.push(attachments);
  }

  if (updateFields.length === 0) {
    throw createError('No fields to update', HTTP_STATUS.BAD_REQUEST);
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');

  const updateQuery = `
    UPDATE community_posts 
    SET ${updateFields.join(', ')}
    WHERE id = $1
    RETURNING *
  `;

  const updateResult = await pool.query(updateQuery, updateValues);

  // Obtener info del autor
  const authorQuery = `SELECT id, username, email, avatar FROM users WHERE id = $1`;
  const authorResult = await pool.query(authorQuery, [updateResult.rows[0].author_id]);

  const updatedPost = {
    ...updateResult.rows[0],
    author: authorResult.rows[0]
  };

  const response: ApiResponse = {
    success: true,
    message: 'Post updated successfully',
    data: updatedPost
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Eliminar post - CAMBIADO: Request en lugar de RequestWithUser
export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const checkQuery = `SELECT author_id FROM community_posts WHERE id = $1`;
  const checkResult = await pool.query(checkQuery, [id]);

  if (checkResult.rows.length === 0) {
    throw createError('Post not found', HTTP_STATUS.NOT_FOUND);
  }
  if (checkResult.rows[0].author_id !== parseInt(req.user?.id || '0') && req.user?.role !== 'admin') {
    throw createError('Only post author or admin can delete', HTTP_STATUS.FORBIDDEN);
  }

  await pool.query('DELETE FROM community_posts WHERE id = $1', [id]);

  const response: ApiResponse = {
    success: true,
    message: 'Post deleted successfully'
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Like/Unlike post - CAMBIADO: Request en lugar de RequestWithUser
export const likePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = parseInt(req.user?.id || '0');

  const postCheck = await pool.query('SELECT id FROM community_posts WHERE id = $1', [id]);
  if (postCheck.rows.length === 0) {
    throw createError('Post not found', HTTP_STATUS.NOT_FOUND);
  }

  const existingLikeQuery = `
    SELECT id FROM post_likes 
    WHERE post_id = $1 AND user_id = $2 AND type = 'like'
  `;
  const existingLike = await pool.query(existingLikeQuery, [id, userId]);

  let isLiked = false;

  if (existingLike.rows.length > 0) {
    await pool.query(
      `DELETE FROM post_likes 
       WHERE post_id = $1 AND user_id = $2 AND type = 'like'`,
      [id, userId]
    );
    isLiked = false;
  } else {
    await pool.query(
      `INSERT INTO post_likes (post_id, user_id, type)
       VALUES ($1, $2, 'like')`,
      [id, userId]
    );
    isLiked = true;
  }

  const likesCountQuery = `SELECT likes_count FROM community_posts WHERE id = $1`;
  const likesCountResult = await pool.query(likesCountQuery, [id]);

  const response: ApiResponse = {
    success: true,
    message: isLiked ? 'Post liked' : 'Post unliked',
    data: {
      isLiked,
      likesCount: likesCountResult.rows[0]?.likes_count || 0
    }
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Agregar comentario - CAMBIADO: Request en lugar de RequestWithUser
export const addComment = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    throw createError('Comment content is required', HTTP_STATUS.BAD_REQUEST);
  }

  const postCheck = await pool.query('SELECT id FROM community_posts WHERE id = $1', [id]);
  if (postCheck.rows.length === 0) {
    throw createError('Post not found', HTTP_STATUS.NOT_FOUND);
  }

  const userId = parseInt(req.user?.id || '0');

  const commentQuery = `
    INSERT INTO post_comments (post_id, author_id, content)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const commentResult = await pool.query(commentQuery, [id, userId, content.trim()]);
  const comment = commentResult.rows[0];

  const authorQuery = `SELECT id, username, email, avatar FROM users WHERE id = $1`;
  const authorResult = await pool.query(authorQuery, [userId]);

  const commentWithAuthor = {
    ...comment,
    author: authorResult.rows[0]
  };

  const response: ApiResponse = {
    success: true,
    message: 'Comment added successfully',
    data: commentWithAuthor
  };

  res.status(HTTP_STATUS.CREATED).json(response);
});

// Incrementar vistas de un post
export const incrementViews = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await pool.query(
    `UPDATE community_posts SET views_count = COALESCE(views_count, 0) + 1 WHERE id = $1 RETURNING views_count`,
    [id]
  );

  if (result.rows.length === 0) {
    throw createError('Post not found', HTTP_STATUS.NOT_FOUND);
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: { views_count: result.rows[0].views_count }
  });
});

// Marcar como resuelto/no resuelto - CAMBIADO: Request en lugar de RequestWithUser
export const toggleResolved = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const checkQuery = `SELECT author_id, is_resolved FROM community_posts WHERE id = $1`;
  const checkResult = await pool.query(checkQuery, [id]);

  if (checkResult.rows.length === 0) {
    throw createError('Post not found', HTTP_STATUS.NOT_FOUND);
  }
  if (checkResult.rows[0].author_id !== parseInt(req.user?.id || '0') && req.user?.role !== 'admin') {
    throw createError('Only post author or admin can mark as resolved', HTTP_STATUS.FORBIDDEN);
  }

  const newResolvedState = !checkResult.rows[0].is_resolved;

  await pool.query(
    `UPDATE community_posts 
     SET is_resolved = $2, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1`,
    [id, newResolvedState]
  );

  const response: ApiResponse = {
    success: true,
    message: `Post marked as ${newResolvedState ? 'resolved' : 'unresolved'}`,
    data: { isResolved: newResolvedState }
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Leaderboard - top usuarios por likes totales en sus posts
export const getLeaderboard = asyncHandler(async (_req: Request, res: Response) => {
  const result = await pool.query(`
    SELECT
      u.id,
      u.username,
      u.avatar,
      COUNT(DISTINCT p.id)::int        AS posts_count,
      COALESCE(SUM(p.likes_count), 0)::int AS total_likes,
      COALESCE(SUM(p.views_count), 0)::int AS total_views
    FROM users u
    INNER JOIN community_posts p ON p.author_id = u.id
    GROUP BY u.id, u.username, u.avatar
    ORDER BY total_likes DESC, posts_count DESC
    LIMIT 20
  `);

  const response: ApiResponse = {
    success: true,
    message: 'Leaderboard retrieved successfully',
    data: result.rows
  };

  res.status(HTTP_STATUS.OK).json(response);
});