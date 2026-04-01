import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { HTTP_STATUS } from '../utils/constants';
import { ApiResponse } from '../types/api';

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log de errores para depuración
    console.log('Validation errors:', errors.array());
    const response: ApiResponse = {
      success: false,
      message: 'Validation errors',
      error: errors.array().map(err => err.msg).join(', ')
    };
    res.status(HTTP_STATUS.BAD_REQUEST).json(response);
    return;
  }
  next();
};

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Log de errores para depuración
    console.log('Validation errors:', errors.array());
    const response: ApiResponse = {
      success: false,
      message: 'Validation errors',
      error: errors.array().map(err => err.msg).join(', ')
    };
    res.status(HTTP_STATUS.BAD_REQUEST).json(response);
    return;
  }
  next();
};

export const validateRegister = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

export const validateProject = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Project name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('settings.framework')
    .isIn(['react', 'vue', 'angular', 'vanilla'])
    .withMessage('Invalid framework'),
  body('settings.language')
    .isIn(['javascript', 'typescript'])
    .withMessage('Invalid language'),
  handleValidationErrors
];