import { Request, Response } from 'express';
import { pool } from '../config/database';
import { HTTP_STATUS } from '../utils/constants';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * GET /api/admin/stats
 * Retorna métricas completas de la plataforma.
 */
export const getAdminStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalsResult, plansResult, recentResult, topResult, dailyCreditResult] =
    await Promise.all([
      // ── Totales de usuarios ──────────────────────────────────────────
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

      // ── Distribución por plan ───────────────────────────────────────
      pool.query<{ plan: string; count: string }>(`
        SELECT
          COALESCE(preferences->>'subscription', 'free') AS plan,
          COUNT(*)                                        AS count
        FROM users
        GROUP BY plan
        ORDER BY count DESC
      `),

      // ── Últimos registros ───────────────────────────────────────────
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

      // ── Top consumidores de créditos diarios ────────────────────────
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
          COALESCE(preferences->>'subscription', 'free')   AS plan,
          COALESCE((preferences->>'credits_daily_remaining')::int, 5) AS daily_remaining,
          CASE COALESCE(preferences->>'subscription', 'free')
            WHEN 'pro'        THEN 10
            WHEN 'enterprise' THEN 50
            ELSE 5
          END                                               AS daily_limit,
          CASE COALESCE(preferences->>'subscription', 'free')
            WHEN 'pro'        THEN 10
            WHEN 'enterprise' THEN 50
            ELSE 5
          END - COALESCE((preferences->>'credits_daily_remaining')::int, 5) AS consumed
        FROM users
        ORDER BY consumed DESC
        LIMIT 10
      `),

      // ── Créditos totales consumidos hoy en toda la plataforma ───────
      pool.query<{ total_consumed: string }>(`
        SELECT
          SUM(
            CASE COALESCE(preferences->>'subscription', 'free')
              WHEN 'pro'        THEN 10
              WHEN 'enterprise' THEN 50
              ELSE 5
            END - COALESCE((preferences->>'credits_daily_remaining')::int, 5)
          ) AS total_consumed
        FROM users
      `),
    ]);

  // Calcular MRR estimado
  const planMap: Record<string, number> = {};
  for (const row of plansResult.rows) {
    planMap[row.plan] = parseInt(row.count, 10);
  }
  const mrr =
    (planMap['pro'] ?? 0) * 29 +
    (planMap['enterprise'] ?? 0) * 99;

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
    },
  });
});
