import pLimit from 'p-limit';
import type { PlanName } from '../utils/constants';

/**
 * AI concurrency queue — Lovable-style architecture.
 *
 * Two layers of protection:
 *
 * 1. Per-user queue (primary):
 *    Each user gets their own p-limit instance so they never block each other.
 *    Max concurrent requests per user depends on their plan:
 *      free:       2  (can have 2 tabs generating at once)
 *      pro:        4
 *      enterprise: 8
 *
 * 2. Global safety net (secondary):
 *    A single global pool prevents hitting Anthropic's RPM/TPM limits
 *    when the platform has many active users simultaneously.
 *    Set this based on your Anthropic tier:
 *      Tier 1 (~5 RPM):   AI_QUEUE_GLOBAL=5
 *      Tier 2 (~50 RPM):  AI_QUEUE_GLOBAL=30
 *      Tier 3+ (1000 RPM): AI_QUEUE_GLOBAL=100
 *
 * Result: User A never waits for User B. A user only waits if they
 * personally have too many concurrent requests, or the global Anthropic
 * limit is being approached.
 */

// Per-user concurrency limits by plan
const USER_CONCURRENCY: Record<PlanName, number> = {
  free:       parseInt(process.env.AI_QUEUE_USER_FREE       || '2', 10),
  pro:        parseInt(process.env.AI_QUEUE_USER_PRO        || '4', 10),
  enterprise: parseInt(process.env.AI_QUEUE_USER_ENTERPRISE || '8', 10),
};

// Global safety net — tune to your Anthropic plan limits
const GLOBAL_CONCURRENCY = parseInt(process.env.AI_QUEUE_GLOBAL || '30', 10);
const globalPool = pLimit(GLOBAL_CONCURRENCY);

// Per-user pools — created on first request, cleaned up after 10 min idle
interface UserPool {
  limit: ReturnType<typeof pLimit>;
  plan: PlanName;
  lastUsed: number;
}
const userPools = new Map<string, UserPool>();

function getOrCreateUserPool(userId: string, plan: PlanName): ReturnType<typeof pLimit> {
  const existing = userPools.get(userId);

  // Re-create if plan changed (e.g. user just upgraded)
  if (existing && existing.plan === plan) {
    existing.lastUsed = Date.now();
    return existing.limit;
  }

  const pool: UserPool = {
    limit: pLimit(USER_CONCURRENCY[plan] ?? USER_CONCURRENCY.free),
    plan,
    lastUsed: Date.now(),
  };
  userPools.set(userId, pool);
  return pool.limit;
}

// Clean up idle user pools every 10 minutes to avoid memory leaks
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [id, pool] of userPools) {
    if (pool.lastUsed < cutoff) userPools.delete(id);
  }
}, 10 * 60 * 1000).unref();

class AIQueue {
  /**
   * Run an async AI operation through both the per-user queue and the global
   * safety net. If no userId is provided, only the global pool is used.
   *
   * @example
   *   const result = await aiQueue.run(
   *     () => claude.messages.create(...),
   *     req.user.id,
   *     req.user.plan
   *   );
   */
  run<T>(fn: () => Promise<T>, userId?: string, plan: PlanName | string = 'free'): Promise<T> {
    const safePlan = (plan as PlanName) in USER_CONCURRENCY
      ? (plan as PlanName)
      : 'free';

    // Wrap in global pool first, then per-user pool inside
    if (userId) {
      const userPool = getOrCreateUserPool(userId, safePlan);
      return globalPool(() => userPool(fn));
    }

    return globalPool(fn);
  }

  /** Live stats for health / admin endpoints. */
  stats() {
    return {
      global: {
        active:      globalPool.activeCount,
        pending:     globalPool.pendingCount,
        concurrency: GLOBAL_CONCURRENCY,
      },
      activeUsers: userPools.size,
      perPlanConcurrency: USER_CONCURRENCY,
    };
  }
}

export const aiQueue = new AIQueue();
