import { Request, Response } from 'express';
import { pool } from '../config/database';
import { HTTP_STATUS } from '../utils/constants';
import { asyncHandler } from '../middleware/errorHandler';
import { aiQueue } from '../services/aiQueue';
import { promptCache } from '../services/promptCache';

/**
 * GET /api/admin/templates
 * Lista todas las plantillas públicas para gestión.
 */
export const getAdminTemplates = asyncHandler(async (_req: Request, res: Response) => {
  const result = await pool.query<{
    id: string;
    name: string;
    description: string;
    owner_username: string;
    likes_count: number;
    created_at: string;
    settings: string;
  }>(`
    SELECT
      p.id,
      p.name,
      p.description,
      u.username AS owner_username,
      COALESCE(p.likes_count, 0) AS likes_count,
      TO_CHAR(p.created_at, 'DD/MM/YYYY') AS created_at,
      p.settings
    FROM projects p
    LEFT JOIN users u ON p.owner_id = u.id
    WHERE p.is_public = true
    ORDER BY p.created_at DESC
  `);

  res.status(HTTP_STATUS.OK).json({ success: true, data: result.rows });
});

/**
 * DELETE /api/admin/templates/:id
 * Admin elimina cualquier plantilla independientemente del owner.
 */
export const deleteAdminTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const check = await pool.query(
    `SELECT id FROM projects WHERE id = $1 AND is_public = true`,
    [id]
  );
  if (check.rows.length === 0) {
    res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: 'Template not found' });
    return;
  }

  await pool.query('DELETE FROM projects WHERE id = $1', [id]);

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Template deleted successfully' });
});

/**
 * GET /api/admin/stats
 * Retorna métricas completas de la plataforma.
 */
export const getAdminStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalsResult, plansResult, recentResult, topResult, dailyCreditResult] =
    await Promise.all([
      // ── Totales de usuarios  ───
      pool.query<{
        total: string;
        new_week: string;
        new_month: string;
      }>(`
        SELECT
          COUNT(*)                                                              AS total,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days')       AS new_week,
          COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')      AS new_month
        FROM users
      `),

      //  Distribución por plan  
      pool.query<{ plan: string; count: string }>(`
        SELECT
          COALESCE(preferences->>'subscription', 'free') AS plan,
          COUNT(*)                                        AS count
        FROM users
        GROUP BY plan
        ORDER BY count DESC
      `),

      //  Últimos registros  
      pool.query<{
        id: string;
        username: string;
        email: string;
        plan: string;
        joined: string;
      }>(`
        SELECT
          id,
          username,
          email,
          COALESCE(preferences->>'subscription', 'free')   AS plan,
          TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI')         AS joined
        FROM users
        ORDER BY created_at DESC
        LIMIT 10
      `),

      //  Top consumidores de créditos diarios 
      pool.query<{
        id: string;
        username: string;
        email: string;
        plan: string;
        daily_remaining: number;
        daily_limit: number;
        consumed: number;
      }>(`
        SELECT
          id,
          username,
          email,
          COALESCE(preferences->>'subscription', 'free')              AS plan,
          COALESCE((preferences->>'credits_daily_remaining')::int, 5) AS daily_remaining,
          CASE COALESCE(preferences->>'subscription', 'free')
            WHEN 'pro'        THEN 20
            WHEN 'business'   THEN 60
            WHEN 'enterprise' THEN 200
            ELSE 5
          END                                                          AS daily_limit,
          CASE COALESCE(preferences->>'subscription', 'free')
            WHEN 'pro'        THEN 20
            WHEN 'business'   THEN 60
            WHEN 'enterprise' THEN 200
            ELSE 5
          END - COALESCE((preferences->>'credits_daily_remaining')::int, 5) AS consumed
        FROM users
        ORDER BY consumed DESC
        LIMIT 10
      `),

      //  Créditos totales consumidos hoy en toda la plataforma  
      pool.query<{ total_consumed: string }>(`
        SELECT
          SUM(
            CASE COALESCE(preferences->>'subscription', 'free')
              WHEN 'pro'        THEN 20
              WHEN 'business'   THEN 60
              WHEN 'enterprise' THEN 200
              ELSE 5
            END - COALESCE((preferences->>'credits_daily_remaining')::int, 5)
          ) AS total_consumed
        FROM users
      `),
    ]);

  // Calcular MRR estimado (precios mensuales base)
  const planMap: Record<string, number> = {};
  for (const row of plansResult.rows) {
    planMap[row.plan] = parseInt(row.count, 10);
  }
  const mrr =
    (planMap['pro']        ?? 0) * 20 +
    (planMap['business']   ?? 0) * 45 +
    (planMap['enterprise'] ?? 0) * 99; // enterprise usa precio base estimado

  const totals = totalsResult.rows[0];

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: {
      users: {
        total:    parseInt(totals.total,     10),
        newWeek:  parseInt(totals.new_week,  10),
        newMonth: parseInt(totals.new_month, 10),
      },
      plans: plansResult.rows.map((r) => ({
        plan:  r.plan,
        count: parseInt(r.count, 10),
      })),
      mrr,
      totalCreditsConsumedToday: parseInt(dailyCreditResult.rows[0]?.total_consumed ?? '0', 10),
      recentSignups: recentResult.rows,
      topConsumers:  topResult.rows,
      aiSystem: {
        queue: aiQueue.stats(),
        cache: promptCache.stats(),
      },
    },
  });
});
