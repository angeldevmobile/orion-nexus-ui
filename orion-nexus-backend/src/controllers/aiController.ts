import { Request, Response } from 'express';
import logger from '../utils/logger';
import { pool } from '../config/database';
import { HTTP_STATUS } from '../utils/constants';
import { ApiResponse } from '../types/api';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { aiService } from '../services/aiService';
import { ChatMessage, ChatContext, ChatSession } from '../types/chatSession';

// Crear sesión de chat
export const createChatSession = asyncHandler(async (req: Request, res: Response) => {
  const { title, context } = req.body;

  if (!req.user?.id) {
    throw createError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
  }

  const query = `
    INSERT INTO chat_sessions (user_id, title, messages, context)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `;
  const values = [
    parseInt(req.user.id),
    title || 'New Chat',
    JSON.stringify([]),
    context ? JSON.stringify(context) : null
  ];

  const result = await pool.query(query, values);
  const chatSession: ChatSession = {
    ...result.rows[0],
    messages: result.rows[0].messages || [],
    context: result.rows[0].context || undefined
  };

  const response: ApiResponse = {
    success: true,
    message: 'Chat session created successfully',
    data: chatSession
  };

  res.status(HTTP_STATUS.CREATED).json(response);
});

// Obtener sesiones de chat activas del usuario
export const getChatSessions = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw createError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
  }

  const query = `
    SELECT * FROM chat_sessions
    WHERE user_id = $1 AND is_active = true
    ORDER BY updated_at DESC
  `;
  const result = await pool.query(query, [parseInt(req.user.id)]);
  
  const chatSessions: ChatSession[] = result.rows.map(row => ({
    ...row,
    messages: row.messages || [],
    context: row.context || undefined
  }));

  const response: ApiResponse = {
    success: true,
    message: 'Chat sessions retrieved successfully',
    data: chatSessions
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Obtener una sesión de chat por ID
export const getChatSession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.user?.id) {
    throw createError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
  }

  const query = `
    SELECT * FROM chat_sessions
    WHERE id = $1 AND user_id = $2
  `;
  const result = await pool.query(query, [id, parseInt(req.user.id)]);
  if (result.rows.length === 0) {
    throw createError('Chat session not found', HTTP_STATUS.NOT_FOUND);
  }
  
  const chatSession: ChatSession = {
    ...result.rows[0],
    messages: result.rows[0].messages || [],
    context: result.rows[0].context || undefined
  };

  const response: ApiResponse = {
    success: true,
    message: 'Chat session retrieved successfully',
    data: chatSession
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// Enviar mensaje y obtener respuesta AI
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { message, context } = req.body;

  if (!req.user?.id) {
    throw createError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
  }

  const selectQuery = `
    SELECT * FROM chat_sessions
    WHERE id = $1 AND user_id = $2
  `;
  const selectResult = await pool.query(selectQuery, [id, parseInt(req.user.id)]);
  if (selectResult.rows.length === 0) {
    throw createError('Chat session not found', HTTP_STATUS.NOT_FOUND);
  }
  
  const chatSession = selectResult.rows[0];

  // Add user message
  const messages: ChatMessage[] = chatSession.messages || [];
  const newUserMessage: ChatMessage = {
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  };
  messages.push(newUserMessage);

  try {
    // Combinar contexto de la sesión con contexto del mensaje
    const combinedContext: ChatContext = {
      ...chatSession.context,
      ...context
    };

    // Get AI response — own queue per user, never blocked by others
    const aiResponse = await aiService.generateResponse(message, {
      chatHistory: messages,
      context: combinedContext,
      userId:   req.user?.id,
      userPlan: req.user?.plan ?? 'free',
    });

    // Add AI response
    const newAiMessage: ChatMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };
    messages.push(newAiMessage);

    // Update session
    const updateQuery = `
      UPDATE chat_sessions
      SET messages = $1, context = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const updateResult = await pool.query(updateQuery, [
      JSON.stringify(messages),
      JSON.stringify(combinedContext),
      id
    ]);

    const updatedSession: ChatSession = {
      ...updateResult.rows[0],
      messages: updateResult.rows[0].messages || [],
      context: updateResult.rows[0].context || undefined
    };

    const response: ApiResponse = {
      success: true,
      message: 'Message sent successfully',
      data: {
        userMessage: message,
        aiResponse,
        chatSession: updatedSession
      }
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    logger.error('Error generating AI response', { error });
    throw createError('Failed to generate AI response', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// Generar código (AI)
export const generateCode = asyncHandler(async (req: Request, res: Response) => {
  const { prompt, language, framework, context } = req.body;

  if (!req.user?.id) {
    throw createError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
  }

  try {
    const generatedCode = await aiService.generateCode({
      prompt,
      language,
      framework,
      context,
      userId:   req.user?.id,
      userPlan: req.user?.plan ?? 'free',
    });

    const response: ApiResponse = {
      success: true,
      message: 'Code generated successfully',
      data: {
        code: generatedCode,
        language,
        framework,
        prompt,
        context
      }
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    logger.error('Error generating code', { error });
    throw createError('Failed to generate code', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// Generar proyecto completo
export const generateProject = asyncHandler(async (req: Request, res: Response) => {
  const { prompt, framework = 'react', createFiles = false } = req.body;

  if (!req.user?.id) {
    throw createError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
  }

  try {
    // Generate project structure
    const projectStructure = await aiService.generateProjectStructure(prompt, framework);

    // Optionally create physical files
    let filesCreated = false;
    let projectPath = '';

    if (createFiles) {
      const projectsPath = process.env.PROJECTS_PATH || './generated-projects';
      await aiService.createProjectFiles(projectStructure, projectsPath);
      filesCreated = true;
      projectPath = `${projectsPath}/${projectStructure.name}`;
    }

    const response: ApiResponse = {
      success: true,
      message: 'Project structure generated successfully',
      data: {
        projectStructure,
        filesCreated,
        projectPath: filesCreated ? projectPath : null,
        prompt,
        framework
      }
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    logger.error('Error generating project', { error });
    throw createError('Failed to generate project', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// Generar componente React específico
export const generateReactComponent = asyncHandler(async (req: Request, res: Response) => {
  const { prompt, context } = req.body;

  if (!req.user?.id) {
    throw createError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
  }

  try {
    const component = await aiService.generateReactComponent(prompt, context, req.user?.id, req.user?.plan ?? 'free');

    const response: ApiResponse = {
      success: true,
      message: 'React component generated successfully',
      data: {
        component,
        prompt,
        context
      }
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    logger.error('Error generating React component', { error });
    throw createError('Failed to generate React component', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// Explicar código
export const explainCode = asyncHandler(async (req: Request, res: Response) => {
  const { code, language = 'typescript' } = req.body;

  if (!req.user?.id) {
    throw createError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
  }

  try {
    const explanation = await aiService.explainCode(code, language);

    const response: ApiResponse = {
      success: true,
      message: 'Code explanation generated successfully',
      data: {
        explanation,
        code,
        language
      }
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    logger.error('Error explaining code', { error });
    throw createError('Failed to explain code', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// Optimizar código
export const optimizeCode = asyncHandler(async (req: Request, res: Response) => {
  const { code, language = 'typescript' } = req.body;

  if (!req.user?.id) {
    throw createError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
  }

  try {
    const optimizedCode = await aiService.optimizeCode(code, language);

    const response: ApiResponse = {
      success: true,
      message: 'Code optimization completed successfully',
      data: {
        optimizedCode,
        originalCode: code,
        language
      }
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    logger.error('Error optimizing code', { error });
    throw createError('Failed to optimize code', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// Revisar código
export const reviewCode = asyncHandler(async (req: Request, res: Response) => {
  const { code, language = 'typescript' } = req.body;

  if (!req.user?.id) {
    throw createError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
  }

  try {
    const review = await aiService.reviewCode(code, language);

    const response: ApiResponse = {
      success: true,
      message: 'Code review completed successfully',
      data: {
        review,
        code,
        language
      }
    };

    res.status(HTTP_STATUS.OK).json(response);
  } catch (error) {
    logger.error('Error reviewing code', { error });
    throw createError('Failed to review code', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
});

// Eliminar (desactivar) sesión de chat
export const deleteChatSession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!req.user?.id) {
    throw createError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
  }

  const updateQuery = `
    UPDATE chat_sessions
    SET is_active = false, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `;
  const result = await pool.query(updateQuery, [id, parseInt(req.user.id)]);
  if (result.rows.length === 0) {
    throw createError('Chat session not found', HTTP_STATUS.NOT_FOUND);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Chat session deleted successfully'
  };

  res.status(HTTP_STATUS.OK).json(response);
});

// GET /api/ai/history — historial completo del usuario
export const getHistory = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw createError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
  }
  const userId = parseInt(req.user.id);

  const [sessionsResult, projectsResult, statsResult] = await Promise.all([
    // Últimas 30 sesiones activas
    pool.query(`
      SELECT
        id,
        title,
        jsonb_array_length(COALESCE(messages, '[]'::jsonb)) AS message_count,
        created_at,
        updated_at
      FROM chat_sessions
      WHERE user_id = $1 AND is_active = true
      ORDER BY updated_at DESC
      LIMIT 30
    `, [userId]),

    // Últimos 10 proyectos del usuario
    pool.query(`
      SELECT id, name, description, created_at, updated_at
      FROM projects
      WHERE owner_id = $1
      ORDER BY updated_at DESC
      LIMIT 10
    `, [userId]),

    // Stats globales
    pool.query(`
      SELECT
        COUNT(*)                                                       AS total_sessions,
        COALESCE(SUM(jsonb_array_length(COALESCE(messages,'[]'::jsonb))), 0) AS total_messages
      FROM chat_sessions
      WHERE user_id = $1 AND is_active = true
    `, [userId]),
  ]);

  const stats = statsResult.rows[0];

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      sessions:       sessionsResult.rows,
      recentProjects: projectsResult.rows,
      stats: {
        totalSessions:  parseInt(stats.total_sessions,  10),
        totalMessages:  parseInt(stats.total_messages,  10),
      },
    },
  });
});