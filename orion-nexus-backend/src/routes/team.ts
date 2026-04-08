import { Router } from 'express';
import {
  getTeamMembers,
  inviteMember,
  cancelInvite,
  removeMember,
  getPresence,
  updatePresence,
} from '../controllers/teamController';
import { authenticateToken } from '../middleware/auth';
import { checkPlan } from '../middleware/checkPlan';
import { presenceLimiter } from '../middleware/rateLimit';

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET  /api/team/members           — list members & pending invites (read-only, abierto)
router.get('/members', getTeamMembers);

// POST /api/team/invite            — invite by email (requiere Business+)
router.post('/invite', checkPlan('teamManagement'), inviteMember);

// DELETE /api/team/invites/:id     — cancel a pending invite (requiere Business+)
router.delete('/invites/:id', checkPlan('teamManagement'), cancelInvite);

// DELETE /api/team/members/:userId — remove an accepted member (requiere Business+)
router.delete('/members/:userId', checkPlan('teamManagement'), removeMember);

// GET  /api/team/presence/:projectId  — active editors
router.get('/presence/:projectId', presenceLimiter, getPresence);

// POST /api/team/presence/:projectId  — heartbeat
router.post('/presence/:projectId', presenceLimiter, updatePresence);

export default router;
