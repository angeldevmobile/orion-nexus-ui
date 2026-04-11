import { Request, Response } from 'express';
import { pool } from '../config/database';
import { HTTP_STATUS } from '../utils/constants';
import { asyncHandler, createError } from '../middleware/errorHandler';
import crypto from 'crypto';

//                                                                 
// GET /api/team/members  — list members & pending invites
//                                                                 
export const getTeamMembers = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user?.id;

  // Accepted members (invitee_id filled + status = 'accepted')
  const membersResult = await pool.query(
    `SELECT wi.id, wi.role, wi.status, wi.created_at,
            u.id AS user_id, u.username, u.email, u.avatar
     FROM workspace_invites wi
     JOIN users u ON u.id = wi.invitee_id
     WHERE wi.workspace_owner_id = $1 AND wi.status = 'accepted'
     ORDER BY wi.created_at DESC`,
    [ownerId]
  );

  // Pending invites
  const pendingResult = await pool.query(
    `SELECT id, invitee_email, role, status, created_at, expires_at
     FROM workspace_invites
     WHERE workspace_owner_id = $1 AND status = 'pending'
     ORDER BY created_at DESC`,
    [ownerId]
  );

  res.json({
    success: true,
    data: {
      members: membersResult.rows,
      pending: pendingResult.rows,
    },
  });
});

//                                                                 
// POST /api/team/invite  — send invite by email
//                                                                 
export const inviteMember = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user?.id;
  const { email, role = 'editor' } = req.body as { email: string; role?: string };

  if (!email) throw createError('Email is required', HTTP_STATUS.BAD_REQUEST);

  const validRoles = ['viewer', 'editor', 'admin'];
  if (!validRoles.includes(role)) {
    throw createError('Invalid role. Use: viewer, editor, admin', HTTP_STATUS.BAD_REQUEST);
  }

  // Prevent self-invite
  const ownerResult = await pool.query('SELECT email FROM users WHERE id = $1', [ownerId]);
  if (ownerResult.rows[0]?.email === email) {
    throw createError('You cannot invite yourself', HTTP_STATUS.BAD_REQUEST);
  }

  // Check if already invited / already a member
  const existing = await pool.query(
    `SELECT id, status FROM workspace_invites
     WHERE workspace_owner_id = $1 AND invitee_email = $2 AND status IN ('pending', 'accepted')`,
    [ownerId, email]
  );
  if (existing.rows.length > 0) {
    throw createError(
      existing.rows[0].status === 'accepted'
        ? 'This user is already a member of your workspace'
        : 'An invitation has already been sent to this email',
      HTTP_STATUS.CONFLICT
    );
  }

  // Look up if the invitee already has an account
  const inviteeResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  const inviteeId: number | null = inviteeResult.rows[0]?.id ?? null;

  const token = crypto.randomBytes(32).toString('hex');

  const insertResult = await pool.query(
    `INSERT INTO workspace_invites
       (workspace_owner_id, invitee_email, invitee_id, role, status, token)
     VALUES ($1, $2, $3, $4, 'pending', $5)
     RETURNING id, invitee_email, role, status, created_at, expires_at`,
    [ownerId, email, inviteeId, role, token]
  );

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: `Invitation sent to ${email}`,
    data: insertResult.rows[0],
  });
});

//                                                                 
// DELETE /api/team/invites/:id  — cancel a pending invite
//                                                                 
export const cancelInvite = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user?.id;
  const { id } = req.params;

  const result = await pool.query(
    `DELETE FROM workspace_invites
     WHERE id = $1 AND workspace_owner_id = $2 AND status = 'pending'
     RETURNING id`,
    [id, ownerId]
  );

  if (result.rows.length === 0) {
    throw createError('Invite not found or already processed', HTTP_STATUS.NOT_FOUND);
  }

  res.json({ success: true, message: 'Invitation cancelled' });
});

//                                                                 
// DELETE /api/team/members/:userId  — remove a member
//                                                                 
export const removeMember = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = req.user?.id;
  const { userId } = req.params;

  const result = await pool.query(
    `DELETE FROM workspace_invites
     WHERE workspace_owner_id = $1 AND invitee_id = $2 AND status = 'accepted'
     RETURNING id`,
    [ownerId, userId]
  );

  if (result.rows.length === 0) {
    throw createError('Member not found in your workspace', HTTP_STATUS.NOT_FOUND);
  }

  res.json({ success: true, message: 'Member removed from workspace' });
});

//                                                                 
// GET /api/team/presence/:projectId  — get active editors
//                                                                 
export const getPresence = asyncHandler(async (req: Request, res: Response) => {
  const { projectId } = req.params;
  // Users active in the last 30 seconds
  const result = await pool.query(
    `SELECT ep.user_id, ep.color, ep.last_seen,
            u.username, u.avatar, u.email
     FROM editor_presence ep
     JOIN users u ON u.id = ep.user_id
     WHERE ep.project_id = $1
       AND ep.last_seen > NOW() - INTERVAL '30 seconds'
     ORDER BY ep.last_seen DESC`,
    [projectId]
  );

  res.json({ success: true, data: result.rows });
});

//                                                                 
// POST /api/team/presence/:projectId  — heartbeat (upsert)
//                                                                 
const PRESENCE_COLORS = [
  '#00D9FF', '#FF6B6B', '#51CF66', '#FCC419',
  '#845EF7', '#FF922B', '#20C997', '#F06595',
];

export const updatePresence = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { projectId } = req.params;

  // Assign a deterministic color based on userId
  const colorIndex = parseInt(String(userId), 10) % PRESENCE_COLORS.length;
  const color = PRESENCE_COLORS[colorIndex];

  await pool.query(
    `INSERT INTO editor_presence (user_id, project_id, color, last_seen)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (user_id, project_id)
     DO UPDATE SET last_seen = NOW(), color = EXCLUDED.color`,
    [userId, projectId, color]
  );

  res.json({ success: true });
});
