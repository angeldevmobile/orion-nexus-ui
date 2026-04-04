import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { getAdminStats } from '../controllers/adminController';

const router = Router();

// Todas las rutas admin requieren token válido + rol admin
router.use(authenticateToken, requireAdmin);

router.get('/stats', getAdminStats);

export default router;
