import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email: string;
      role: 'user' | 'admin';
      username?: string;
    };
  }
}

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: 'user' | 'admin';
      username?: string;
    }
  }
}

export {};