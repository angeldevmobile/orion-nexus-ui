import { Router } from 'express';
import {
  createComponent,
  getComponents,
  getComponentById,
  updateComponent,
  rateComponent,
  deleteComponent
} from '../controllers/componentController';
import { authenticateToken } from '../middleware/auth';

import type { Router as ExpressRouter } from 'express';
const router: ExpressRouter = Router();

// @route   POST /api/components
// @desc    Create new component
// @access  Private
router.post('/', authenticateToken, createComponent);

// @route   GET /api/components
// @desc    Get all components
// @access  Public
router.get('/', getComponents);

// @route   GET /api/components/:id
// @desc    Get component by ID
// @access  Public
router.get('/:id', getComponentById);

// @route   PUT /api/components/:id
// @desc    Update component
// @access  Private
router.put('/:id', authenticateToken, updateComponent);

// @route   POST /api/components/:id/rate
// @desc    Rate component
// @access  Private
router.post('/:id/rate', authenticateToken, rateComponent);

// @route   DELETE /api/components/:id
// @desc    Delete component (creator only)
// @access  Private
router.delete('/:id', authenticateToken, deleteComponent);

export default router;