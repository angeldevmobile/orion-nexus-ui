import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserSubscription,
  deleteUser,
  getUserStats
} from '../controllers/userController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router: Router = Router();

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', authenticateToken, requireAdmin, getAllUsers);

// @route   GET /api/users/stats
// @desc    Get current user stats
// @access  Private
router.get('/stats', authenticateToken, getUserStats);

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', getUserById);

// @route   PUT /api/users/:id/role
// @desc    Update user role (admin only)
// @access  Private/Admin
router.put('/:id/role', authenticateToken, requireAdmin, updateUserRole);

// @route   PUT /api/users/:id/subscription
// @desc    Update user subscription (admin only)
// @access  Private/Admin
router.put('/:id/subscription', authenticateToken, requireAdmin, updateUserSubscription);

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);

export default router;