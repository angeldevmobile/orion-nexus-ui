import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../types/api';

// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    error: 'Rate limit exceeded'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    error: 'Authentication rate limit exceeded'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// AI endpoint rate limiting (more restrictive)
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 AI requests per minute
  message: {
    success: false,
    message: 'Too many AI requests, please try again later.',
    error: 'AI rate limit exceeded'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload rate limiting
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // limit each IP to 5 uploads per minute
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.',
    error: 'Upload rate limit exceeded'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

// Community post rate limiting
export const postLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 posts per minute
  message: {
    success: false,
    message: 'Too many posts created, please try again later.',
    error: 'Post creation rate limit exceeded'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

// Create custom rate limiter
export const createRateLimiter = (windowMs: number, max: number, message: string) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      error: 'Rate limit exceeded'
    } as ApiResponse,
    standardHeaders: true,
    legacyHeaders: false,
  });
};