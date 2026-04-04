import { Router } from 'express';
import {
  getArticles,
  getArticleBySlug,
  getCategoryCounts,
  createArticle,
  updateArticle,
  deleteArticle,
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from '../controllers/docsController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router: Router = Router();

// ─── Artículos (públicos) ─────────────────────────────────────────────────────

// GET /api/docs/articles
router.get('/articles', getArticles);

// GET /api/docs/articles/categories
router.get('/articles/categories', getCategoryCounts);

// GET /api/docs/articles/:slug
router.get('/articles/:slug', getArticleBySlug);

// ─── Artículos (solo admin) ───────────────────────────────────────────────────

// POST /api/docs/articles
router.post('/articles', authenticateToken, requireAdmin, createArticle);

// PUT /api/docs/articles/:id
router.put('/articles/:id', authenticateToken, requireAdmin, updateArticle);

// DELETE /api/docs/articles/:id
router.delete('/articles/:id', authenticateToken, requireAdmin, deleteArticle);

// ─── FAQs (públicos) ──────────────────────────────────────────────────────────

// GET /api/docs/faqs
router.get('/faqs', getFaqs);

// ─── FAQs (solo admin) ────────────────────────────────────────────────────────

// POST /api/docs/faqs
router.post('/faqs', authenticateToken, requireAdmin, createFaq);

// PUT /api/docs/faqs/:id
router.put('/faqs/:id', authenticateToken, requireAdmin, updateFaq);

// DELETE /api/docs/faqs/:id
router.delete('/faqs/:id', authenticateToken, requireAdmin, deleteFaq);

export default router;
