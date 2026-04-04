import { Router, Request, Response, NextFunction } from 'express';
import {
  createChatSession,
  getChatSessions,
  getChatSession,
  sendMessage,
  generateCode,
  generateProject,
  generateReactComponent,
  explainCode,
  optimizeCode,
  reviewCode,
  deleteChatSession
} from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { body, param } from 'express-validator';
import path from 'path';
import fs from 'fs/promises';

const router: Router = Router();

// 🔓 Middleware condicional: autenticación solo en producción
const optionalAuth = process.env.NODE_ENV === 'production'
  ? authenticateToken
  : (req: Request, res: Response, next: NextFunction) => next();

// Validaciones
const createChatValidation = [
  body('title').optional().isString().isLength({ min: 1, max: 100 }),
  body('context').optional().isObject(),
  body('context.projectId').optional().isString(),
  body('context.fileContext').optional().isString(),
  body('context.codeContext').optional().isString(),
  handleValidationErrors
];

const sendMessageValidation = [
  body('message').isString().isLength({ min: 1, max: 5000 }),
  body('chatHistory').optional().isArray(),
  body('context').optional().isObject(),
  body('context.projectId').optional().isString(),
  body('context.fileContext').optional().isString(),
  body('context.codeContext').optional().isString(),
  handleValidationErrors
];

const generateCodeValidation = [
  body('prompt').isString().isLength({ min: 1, max: 2000 }),
  body('language').optional().isString(),
  body('framework').optional().isString(),
  body('context').optional().isObject(),
  handleValidationErrors
];

const generateProjectValidation = [
  body('prompt').isString().isLength({ min: 1, max: 1000 }),
  body('framework').optional().isString().isIn(['react', 'vue', 'angular', 'vanilla']),
  body('createFiles').optional().isBoolean(),
  handleValidationErrors
];

// 🆕 Validación para proyecto completo
const generateFullProjectValidation = [
  body('prompt').isString().isLength({ min: 1, max: 2000 }),
  body('framework').optional().isString().isIn(['react', 'vue', 'angular', 'nextjs', 'vanilla']),
  handleValidationErrors
];

const componentValidation = [
  body('prompt').isString().isLength({ min: 1, max: 1000 }),
  body('context').optional().isObject(),
  handleValidationErrors
];

const codeAnalysisValidation = [
  body('code').isString().isLength({ min: 1, max: 10000 }),
  body('language').optional().isString().isIn(['javascript', 'typescript', 'react', 'vue', 'angular']),
  handleValidationErrors
];

const validateIdParam = [
  param('id').isInt(),
  handleValidationErrors
];

// ========== Rutas Públicas para Chat (sin autenticación en desarrollo) ==========

// @route   POST /api/ai/chat/stream
// @desc    Send message to AI with SSE streaming
// @access  Public (dev) / Private (prod)
router.post('/chat/stream', optionalAuth, sendMessageValidation, async (req: Request, res: Response) => {
  const { message, chatHistory = [], context } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  try {
    const { aiService } = await import('../services/aiService');

    await aiService.streamResponse(message, { chatHistory, context }, (chunk) => {
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    });

    res.write('data: [DONE]\n\n');
  } catch (error) {
    console.error('Stream Error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
    res.write('data: [DONE]\n\n');
  } finally {
    res.end();
  }
});

// @route   POST /api/ai/chat
// @desc    Send message to AI (stateless chat)
// @access  Public (dev) / Private (prod)
router.post('/chat', optionalAuth, sendMessageValidation, async (req: Request, res: Response) => {
  try {
    const { message, chatHistory = [], context } = req.body;

    const { aiService } = await import('../services/aiService');

    const response = await aiService.generateResponse(message, {
      chatHistory,
      context
    });

    res.json({ response });
  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ========== Rutas de Sesiones de Chat (con autenticación) ==========

// @route   POST /api/ai/chat-session
// @desc    Create new chat session
// @access  Private
router.post('/chat-session', authenticateToken, createChatValidation, createChatSession);

// @route   GET /api/ai/chat-session
// @desc    Get all chat sessions
// @access  Private
router.get('/chat-session', authenticateToken, getChatSessions);

// @route   GET /api/ai/chat-session/:id
// @desc    Get chat session by ID
// @access  Private
router.get('/chat-session/:id', authenticateToken, validateIdParam, getChatSession);

// @route   POST /api/ai/chat-session/:id/message
// @desc    Send message to chat session
// @access  Private
router.post('/chat-session/:id/message', authenticateToken, sendMessageValidation, sendMessage);

// @route   DELETE /api/ai/chat-session/:id
// @desc    Delete chat session
// @access  Private
router.delete('/chat-session/:id', authenticateToken, validateIdParam, deleteChatSession);

// ========== Rutas de Generación de Código (públicas en dev) ==========

// @route   POST /api/ai/generate-code
// @desc    Generate code with AI
// @access  Public (dev) / Private (prod)
router.post('/generate-code', optionalAuth, generateCodeValidation, async (req: Request, res: Response) => {
  try {
    const { aiService } = await import('../services/aiService');
    const code = await aiService.generateCode(req.body);
    res.json({ code });
  } catch (error) {
    console.error('Generate Code Error:', error);
    res.status(500).json({
      error: 'Failed to generate code',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   POST /api/ai/generate-project
// @desc    Generate complete project structure with AI
// @access  Public (dev) / Private (prod)
router.post('/generate-project', optionalAuth, generateProjectValidation, async (req: Request, res: Response) => {
  try {
    const { prompt, framework = 'react' } = req.body;
    const { aiService } = await import('../services/aiService');
    const projectStructure = await aiService.generateProjectStructure(prompt, framework);
    res.json({ projectStructure });
  } catch (error) {
    console.error('Generate Project Error:', error);
    res.status(500).json({
      error: 'Failed to generate project',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @desc    Generate complete project with multiple files (optimized for filesystem)
// @access  Public (dev) / Private (prod)
router.post('/generate-full-project', optionalAuth, generateFullProjectValidation, async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, framework = 'react' } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      res.status(400).json({
        error: 'Prompt is required',
        message: 'Please provide a valid project description'
      });
      return;
    }

    const { aiService } = await import('../services/aiService');
    const result = await aiService.generateFullProject(prompt, framework);

    res.json({
      success: true,
      files: result.files,
      meta: result.meta
    });
  } catch (error) {
    console.error('Generate Full Project Error:', error);
    res.status(500).json({
      error: 'Failed to generate full project',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   POST /api/ai/generate-component
// @desc    Generate React component with AI
// @access  Public (dev) / Private (prod)
router.post('/generate-component', optionalAuth, componentValidation, async (req: Request, res: Response) => {
  try {
    const { prompt, context } = req.body;
    const { aiService } = await import('../services/aiService');
    const result = await aiService.generateReactComponent(prompt, context);
    res.json(result);
  } catch (error) {
    console.error('Generate Component Error:', error);
    res.status(500).json({
      error: 'Failed to generate component',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ========== Rutas de Análisis de Código ==========

// @route   POST /api/ai/explain
// @desc    Explain code with AI
// @access  Public (dev) / Private (prod)
router.post('/explain', optionalAuth, codeAnalysisValidation, async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    const { aiService } = await import('../services/aiService');
    const explanation = await aiService.explainCode(code, language);
    res.json({ explanation });
  } catch (error) {
    console.error('Explain Error:', error);
    res.status(500).json({
      error: 'Failed to explain code',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   POST /api/ai/optimize
// @desc    Optimize code with AI
// @access  Public (dev) / Private (prod)
router.post('/optimize', optionalAuth, codeAnalysisValidation, async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    const { aiService } = await import('../services/aiService');
    const optimized = await aiService.optimizeCode(code, language);
    res.json({ optimized });
  } catch (error) {
    console.error('Optimize Error:', error);
    res.status(500).json({
      error: 'Failed to optimize code',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

router.post('/create-files', async (req: Request, res: Response): Promise<void> => {
  try {
    const { files, projectPath } = req.body;

    if (!files || !Array.isArray(files)) {
      res.status(400).json({ error: 'Files array required' });
      return;
    }

    const basePath = projectPath || path.join(process.cwd(), '../orion-nexus-frontend');
    const result = {
      created: [] as string[],
      errors: [] as { path: string; error: string }[]
    };

    for (const file of files) {
      try {
        const fullPath = path.join(basePath, file.path);
        const dir = path.dirname(fullPath);

        // Crear directorio si no existe
        await fs.mkdir(dir, { recursive: true });

        // Escribir archivo
        await fs.writeFile(fullPath, file.content, 'utf-8');

        result.created.push(file.path);
        console.log(`Created: ${file.path}`);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push({
          path: file.path,
          error: errorMessage
        });
        console.error(`Failed to create ${file.path}:`, errorMessage);
      }
    }

    res.json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('File Creation Error:', errorMessage);
    res.status(500).json({ error: 'Failed to create files' });
  }
});

// @route   POST /api/ai/review
// @desc    Review code with AI
// @access  Public (dev) / Private (prod)
router.post('/review', optionalAuth, codeAnalysisValidation, async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body;
    const { aiService } = await import('../services/aiService');
    const review = await aiService.reviewCode(code, language);
    res.json({ review });
  } catch (error) {
    console.error('Review Error:', error);
    res.status(500).json({
      error: 'Failed to review code',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   POST /api/ai/generate-tests
// @desc    Generate tests with AI
// @access  Public (dev) / Private (prod)
router.post('/generate-tests', optionalAuth, [
  body('code').isString().isLength({ min: 1, max: 10000 }),
  body('language').isString(),
  body('framework').optional().isString(),
  handleValidationErrors
], async (req: Request, res: Response) => {
  try {
    const { code, language, framework } = req.body;
    const { aiService } = await import('../services/aiService');
    const tests = await aiService.generateTests(code, language, framework);
    res.json({ tests });
  } catch (error) {
    console.error('Generate Tests Error:', error);
    res.status(500).json({
      error: 'Failed to generate tests',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;