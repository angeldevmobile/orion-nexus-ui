import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Orion Nexus API',
    version: '1.0.0',
    description: 'Backend API for Orion Nexus Studio — AI-powered code editor',
  },
  servers: [
    { url: '/api', description: 'Current server' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        security: [],
        responses: {
          200: { description: 'Service is healthy' },
        },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'email', 'password'],
                properties: {
                  username: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
          409: { description: 'Email already in use' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful, returns JWT token' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List user projects',
        responses: {
          200: { description: 'Array of projects' },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Projects'],
        summary: 'Create a new project',
        responses: {
          201: { description: 'Project created' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/ai/chat': {
      post: {
        tags: ['AI'],
        summary: 'Send a chat message to the AI assistant',
        responses: {
          200: { description: 'AI response' },
          429: { description: 'Rate limit exceeded' },
        },
      },
    },
    '/payments/checkout': {
      post: {
        tags: ['Payments'],
        summary: 'Create a Lemon Squeezy checkout session',
        responses: {
          200: { description: 'Checkout URL' },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};

export function setupSwagger(app: Express): void {
  if (process.env.NODE_ENV === 'production') return; // disable in prod if desired

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: 'Orion Nexus API Docs',
    })
  );
}

export default swaggerDocument;
