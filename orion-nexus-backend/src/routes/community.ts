import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  addComment
} from '../controllers/communityController';
import { authenticateToken } from '../middleware/auth';

const router: Router = Router();

// @route   POST /api/community/posts
// @desc    Create new community post
// @access  Private
router.post('/posts', authenticateToken, createPost);

// @route   GET /api/community/posts
// @desc    Get all community posts
// @access  Public
router.get('/posts', getPosts);

// @route   GET /api/community/posts/:id
// @desc    Get post by ID
// @access  Public
router.get('/posts/:id', getPostById);

// @route   PUT /api/community/posts/:id
// @desc    Update post
// @access  Private
router.put('/posts/:id', authenticateToken, updatePost);

// @route   DELETE /api/community/posts/:id
// @desc    Delete post
// @access  Private
router.delete('/posts/:id', authenticateToken, deletePost);

// @route   POST /api/community/posts/:id/like
// @desc    Like/Unlike post
// @access  Private
router.post('/posts/:id/like', authenticateToken, likePost);

// @route   GET /api/community/posts/:id/comments
// @route   GET /api/community/posts/:id/comments
// @desc    Get comments for a post
// @access  Public
// router.get('/posts/:id/comments', getComments);
// @route   POST /api/community/posts/:id/comments
// @desc    Add comment to post
// @access  Private
router.post('/posts/:id/comments', authenticateToken, addComment);

export default router;