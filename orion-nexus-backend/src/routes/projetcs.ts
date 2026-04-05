import { Router } from 'express';
import {
  createProject,
  getProjects,
  getPublicProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectFiles,
  pushToGitHub
} from '../controllers/projectController';
import { authenticateToken } from '../middleware/auth';
import { validateProject } from '../middleware/validation';

import type { Router as ExpressRouter } from 'express';
const router: ExpressRouter = Router();

// @route   POST /api/projects
// @desc    Create new project
// @access  Private
router.post('/', authenticateToken, validateProject, createProject);

// @route   GET /api/projects
// @desc    Get all projects (owned, collaborated, or public)
// @access  Private
router.get('/', authenticateToken, getProjects);

// @route   GET /api/projects/public
// @desc    Get public projects (optionally filtered by type=template)
// @access  Public
router.get('/public', getPublicProjects);

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', authenticateToken, getProjectById);

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', authenticateToken, updateProject);

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private
router.delete('/:id', authenticateToken, deleteProject);

// @route   PUT /api/projects/:id/files
// @desc    Update project files
// @access  Private
router.put('/:id/files', authenticateToken, updateProjectFiles);

// @route   POST /api/projects/:id/push-to-github
// @desc    Push project to user's GitHub account
// @access  Private
router.post('/:id/push-to-github', authenticateToken, pushToGitHub);

export default router;