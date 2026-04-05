import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';
import { verifyToken } from '../utils/jwt';
import { HTTP_STATUS } from '../utils/constants';
import { ApiResponse } from '../types/api';

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      const response: ApiResponse = {
        success: false,
        message: 'Access token required'
      };
      res.status(HTTP_STATUS.UNAUTHORIZED).json(response);
      return;
    }

    const decoded = verifyToken(token);

    // Buscar usuario en PostgreSQL (incluye plan para la cola de IA)
    const userResult = await pool.query(
      `SELECT id, email, role,
              COALESCE(preferences->>'subscription', 'free') AS plan
       FROM users WHERE id = $1`,
      [decoded.userId]
    );
    if (userResult.rows.length === 0) {
      const response: ApiResponse = {
        success: false,
        message: 'User not found'
      };
      res.status(HTTP_STATUS.UNAUTHORIZED).json(response);
      return;
    }
    const user = userResult.rows[0];
    const rawPlan = user.plan as string;

    req.user = {
      id: user.id.toString(),
      email: user.email,
      role: user.role as 'user' | 'admin',
      plan: (rawPlan === 'pro' || rawPlan === 'enterprise' ? rawPlan : 'free') as 'free' | 'pro' | 'enterprise',
    };

    next();
  } catch (error) {
    const response: ApiResponse = {
      success: false,
      message: 'Invalid token'
    };
    res.status(HTTP_STATUS.UNAUTHORIZED).json(response);
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    const response: ApiResponse = {
      success: false,
      message: 'Admin access required'
    };
    res.status(HTTP_STATUS.FORBIDDEN).json(response);
    return;
  }
  next();
};