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

const router: Router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET  /api/team/members           — list members & pending invites
router.get('/members', getTeamMembers);

// POST /api/team/invite            — invite by email
router.post('/invite', inviteMember);

// DELETE /api/team/invites/:id     — cancel a pending invite
router.delete('/invites/:id', cancelInvite);

// DELETE /api/team/members/:userId — remove an accepted member
router.delete('/members/:userId', removeMember);

// GET  /api/team/presence/:projectId  — active editors
router.get('/presence/:projectId', getPresence);

// POST /api/team/presence/:projectId  — heartbeat
router.post('/presence/:projectId', updatePresence);

export default router;
