import { pool } from '../config/database';
import { PLAN_LIMITS, CREDIT_COSTS, CreditOperation, PlanName } from '../utils/constants';

export interface CreditStatus {
  dailyRemaining: number;
  dailyLimit: number;
  monthlyRemaining: number;
  monthlyLimit: number;
  dailyResetAt: Date;
  monthlyResetAt: Date;
  plan: PlanName;
}

/**
 * Obtiene el estado de créditos de un usuario, reseteando contadores si ya expiró el período.
 */
export async function getCreditStatus(userId: string): Promise<CreditStatus> {
  const result = await pool.query(
    `SELECT
       COALESCE(preferences->>'subscription', 'free') AS plan,
       COALESCE((preferences->>'credits_daily_remaining')::int, 5) AS credits_daily_remaining,
       COALESCE((preferences->>'credits_monthly_remaining')::int, 0) AS credits_monthly_remaining,
       COALESCE((preferences->>'credits_daily_reset_at')::timestamptz, NOW()) AS credits_daily_reset_at,
       COALESCE((preferences->>'credits_monthly_reset_at')::timestamptz, NOW()) AS credits_monthly_reset_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) throw new Error('User not found');

  const row = result.rows[0];
  const plan = (row.plan as PlanName) in PLAN_LIMITS ? (row.plan as PlanName) : 'free';
  const limits = PLAN_LIMITS[plan];
  const now = new Date();

  let dailyRemaining: number = row.credits_daily_remaining;
  let monthlyRemaining: number = row.credits_monthly_remaining;
  let dailyResetAt: Date = new Date(row.credits_daily_reset_at);
  let monthlyResetAt: Date = new Date(row.credits_monthly_reset_at);

  // Resetear créditos diarios si pasó el tiempo de reset
  if (now >= dailyResetAt) {
    dailyRemaining = limits.daily;
    dailyResetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24h
    await _saveCredits(userId, dailyRemaining, monthlyRemaining, dailyResetAt, monthlyResetAt);
  }

  // Resetear créditos mensuales si pasó el mes
  if (now >= monthlyResetAt) {
    monthlyRemaining = limits.monthly;
    // Primer día del próximo mes
    monthlyResetAt = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    await _saveCredits(userId, dailyRemaining, monthlyRemaining, dailyResetAt, monthlyResetAt);
  }

  return {
    dailyRemaining,
    dailyLimit: limits.daily,
    monthlyRemaining,
    monthlyLimit: limits.monthly,
    dailyResetAt,
    monthlyResetAt,
    plan,
  };
}

/**
 * Verifica si el usuario tiene suficientes créditos para una operación.
 * Devuelve true si puede proceder, false si no tiene créditos.
 * Consume en este orden: diarios primero, luego mensuales.
 */
export async function consumeCredits(userId: string, operation: CreditOperation): Promise<boolean> {
  const cost = CREDIT_COSTS[operation];
  const status = await getCreditStatus(userId);

  // Enterprise con monthly ilimitado no necesita verificación
  if (status.plan === 'enterprise' && status.monthlyLimit >= 2000) {
    // Igual descontamos para tracking, pero no bloqueamos
    await _deductCredits(userId, cost, status);
    return true;
  }

  // Verificar si hay créditos suficientes (diarios + mensuales combinados)
  const totalAvailable = status.dailyRemaining + status.monthlyRemaining;
  if (totalAvailable < cost) return false;

  await _deductCredits(userId, cost, status);
  return true;
}

async function _deductCredits(userId: string, cost: number, status: CreditStatus): Promise<void> {
  let daily = status.dailyRemaining;
  let monthly = status.monthlyRemaining;

  // Consumir diarios primero
  if (daily >= cost) {
    daily -= cost;
  } else {
    const remaining = cost - daily;
    daily = 0;
    monthly = Math.max(0, monthly - remaining);
  }

  await _saveCredits(userId, daily, monthly, status.dailyResetAt, status.monthlyResetAt);
}

async function _saveCredits(
  userId: string,
  daily: number,
  monthly: number,
  dailyResetAt: Date,
  monthlyResetAt: Date
): Promise<void> {
  await pool.query(
    `UPDATE users
     SET preferences = preferences
       || jsonb_build_object(
           'credits_daily_remaining', $2::text,
           'credits_monthly_remaining', $3::text,
           'credits_daily_reset_at', $4::text,
           'credits_monthly_reset_at', $5::text
         )
     WHERE id = $1`,
    [userId, daily.toString(), monthly.toString(), dailyResetAt.toISOString(), monthlyResetAt.toISOString()]
  );
}

/**
 * Inicializa los créditos cuando un usuario se registra o cambia de plan.
 */
export async function initializeCredits(userId: string, plan: PlanName = 'free'): Promise<void> {
  const limits = PLAN_LIMITS[plan];
  const now = new Date();
  const dailyResetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const monthlyResetAt = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  await pool.query(
    `UPDATE users
     SET preferences = COALESCE(preferences, '{}')::jsonb
       || jsonb_build_object(
           'subscription', $2::text,
           'credits_daily_remaining', $3::text,
           'credits_monthly_remaining', $4::text,
           'credits_daily_reset_at', $5::text,
           'credits_monthly_reset_at', $6::text
         )
     WHERE id = $1`,
    [userId, plan, limits.daily.toString(), limits.monthly.toString(),
     dailyResetAt.toISOString(), monthlyResetAt.toISOString()]
  );
}
