import { Router } from 'express';
import { register, login, getProfile, updateProfile, changePassword, disconnectGithub, verifyEmail } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validation';
import { requestPasswordReset, resetPassword } from '../controllers/authController';
import passport from 'passport';
import { githubCallback } from '../controllers/authController';

import type { Router as ExpressRouter } from 'express';
const router: ExpressRouter = Router();


// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', validateRegister, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, login);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', authenticateToken, getProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change password (authenticated)
// @access  Private
router.put('/change-password', authenticateToken, changePassword);

// @route   GET /api/auth/verify-email
// @desc    Verify email with token
// @access  Public
router.get('/verify-email', verifyEmail);

// @route   POST /api/auth/request-password-reset
// @desc    Send password reset email
// @access  Public
router.post('/request-password-reset', requestPasswordReset);

// @route   POST /api/auth/reset-password
// @desc    Reset password using token
// @access  Public
router.post('/reset-password', resetPassword);

// @route   DELETE /api/auth/github
// @desc    Disconnect GitHub from account
// @access  Private
router.delete('/github', authenticateToken, disconnectGithub);

// @route   GET /api/auth/github
// @desc    Initiate GitHub OAuth authentication
// @access  Public
router.get('/github', passport.authenticate('github', { scope: ['user:email', 'public_repo'] }));

// @route   GET /api/auth/github/callback
// @desc    GitHub OAuth callback
// @access  Public
router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=github_auth_failed`,
    session: false 
  }),
  githubCallback
);

export default router;