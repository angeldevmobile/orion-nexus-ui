import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { getAdminStats, getAdminTemplates, deleteAdminTemplate } from '../controllers/adminController';

const router = Router();

// Todas las rutas admin requieren token válido + rol admin
router.use(authenticateToken, requireAdmin);

router.get('/stats', getAdminStats);
router.get('/templates', getAdminTemplates);
router.delete('/templates/:id', deleteAdminTemplate);

export default router;
