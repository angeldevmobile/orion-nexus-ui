import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { Socket } from 'socket.io';

// Load environment variables first
dotenv.config();

import passport from './config/githubAuth';

// Extend Express Request to include rawBody for Stripe webhook verification
interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

// Import utilities
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { aiQueue } from './services/aiQueue';
import { promptCache } from './services/promptCache';

// Import routes
import authRoutes from './routes/auth';
import projectRoutes from './routes/projetcs';
import aiRoutes from './routes/ai';
import userRoutes from './routes/users';
import componentRoutes from './routes/components';
import communityRoutes from './routes/community';
import paymentRoutes from './routes/payment';
import adminRoutes from './routes/admin';
import docsRoutes from './routes/docs';
import teamRoutes from './routes/team';
import previewRoutes, { PREVIEWS_DIR } from './routes/preview';

const app = express();
const server = createServer(app);

// Socket.IO configuration with multiple origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  process.env.FRONTEND_URL || 'http://localhost:8080'
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Rate limiting with environment variables
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes by default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false // Needed for some modern features
}));

// CORS configuration
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count']
}));

// Apply rate limiting
app.use('/api/', limiter);

// Body parsing middleware
const maxFileSize = process.env.MAX_FILE_SIZE || '10485760'; // 10MB default
app.use(express.json({
  limit: maxFileSize,
  // Preservar el rawBody para verificar la firma del webhook de Stripe
  verify: (req: RequestWithRawBody, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: maxFileSize }));

// IMPORTANTE: Inicializar Passport
app.use(passport.initialize());

// Request logging middleware (development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/components', componentRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/preview', previewRoutes);

// Static preview serving — /preview/:id/...
app.use('/preview', (req: Request, res: Response, next: NextFunction) => {
  const parts = req.url.split('/').filter(Boolean);
  if (parts.length === 0) { res.status(404).send('Not found'); return; }
  const id = parts[0];
  const previewDir = path.join(PREVIEWS_DIR, id);
  req.url = '/' + parts.slice(1).join('/');
  express.static(previewDir, { index: 'index.html' })(req, res, () => {
    // SPA fallback — serve index.html for any unmatched path
    res.sendFile(path.join(previewDir, 'index.html'), (err: Error) => {
      if (err) res.status(404).send('Preview not found');
    });
  });
});

// Health check with AI system metrics
app.get('/api/health', (_req, res) => {
  res.json({
    status:      'OK',
    service:     'Orion Nexus Backend',
    timestamp:   new Date().toISOString(),
    version:     process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database:    'PostgreSQL',
    uptime:      process.uptime(),
    ai: {
      queue: aiQueue.stats(),
      cache: promptCache.stats(),
    },
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Orion Nexus API',
    version: '1.0.0',
    docs: '/api/health'
  });
});

// Socket.IO for real-time features
interface CodeChangeData {
  projectId: string;
  fileId?: string;
  code: string;
  language?: string;
  userId: string;
  timestamp: number;
}

interface JoinProjectData {
  projectId: string;
  userId: string;
}

// Agregar interface para cursor position
interface CursorChangeData {
  projectId: string;
  userId: string;
  fileId: string;
  position: {
    line: number;
    column: number;
  };
  selection?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  timestamp?: number;
}

// Socket.IO event handlers
io.on('connection', (socket: Socket) => {
  console.log(` User connected: ${socket.id}`);

  // Join project room
  socket.on('join-project', (data: JoinProjectData) => {
    socket.join(data.projectId);
    socket.to(data.projectId).emit('user-joined', {
      userId: data.userId,
      socketId: socket.id
    });
    console.log(` User ${data.userId} joined project ${data.projectId}`);
  });

  // Handle code changes
  socket.on('code-change', (data: CodeChangeData) => {
    // Broadcast to all users in the project except sender
    socket.to(data.projectId).emit('code-update', {
      ...data,
      timestamp: Date.now()
    });
  });

  // Handle cursor position changes
  socket.on('cursor-change', (data: CursorChangeData) => {
    socket.to(data.projectId).emit('cursor-update', {
      ...data,
      timestamp: Date.now()
    });
  });

  // Leave project room
  socket.on('leave-project', (data: JoinProjectData) => {
    socket.leave(data.projectId);
    socket.to(data.projectId).emit('user-left', {
      userId: data.userId,
      socketId: socket.id
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(` User disconnected: ${socket.id}`);
  });
});

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start server
    server.listen(PORT, () => {
      console.log(` Server running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
      console.log(` Database: PostgreSQL`);
      console.log(` WebSocket: Enabled`);
    });
  } catch (error) {
    console.error(' Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(' SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log(' Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log(' SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log(' Process terminated');
  });
});

startServer();

export { io };