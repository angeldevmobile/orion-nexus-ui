import { createHash } from 'crypto';
import { createClient, RedisClientType } from 'redis';

const TTL_SECONDS = 60 * 60;       // 1 hour
const MEM_TTL_MS  = TTL_SECONDS * 1000;
const MEM_MAX     = 500;            // max entries in the memory fallback

//   Memory fallback                    ─
interface MemEntry { value: string; expiresAt: number }
const memStore = new Map<string, MemEntry>();

function memGet(key: string): string | null {
  const e = memStore.get(key);
  if (!e) return null;
  if (Date.now() > e.expiresAt) { memStore.delete(key); return null; }
  return e.value;
}

function memSet(key: string, value: string): void {
  if (memStore.size >= MEM_MAX) {
    const first = memStore.keys().next().value;
    if (first) memStore.delete(first);
  }
  memStore.set(key, { value, expiresAt: Date.now() + MEM_TTL_MS });
}

//   Redis client                     ─
let redis: RedisClientType | null = null;
let redisReady = false;

async function connectRedis(): Promise<void> {
  const url = process.env.REDIS_URL;
  if (!url) {
    console.log('[Cache] REDIS_URL not set — using in-memory cache');
    return;
  }

  try {
    redis = createClient({ url }) as RedisClientType;

    redis.on('error', (err) => {
      if (redisReady) {
        console.error('[Cache] Redis error — falling back to memory:', err.message);
        redisReady = false;
      }
    });

    redis.on('ready', () => {
      console.log('[Cache] Redis connected');
      redisReady = true;
    });

    redis.on('reconnecting', () => {
      redisReady = false;
    });

    await redis.connect();
  } catch (err) {
    console.error('[Cache] Redis connection failed — using in-memory cache:', (err as Error).message);
    redis = null;
    redisReady = false;
  }
}

// Connect at startup; failures are silent — memory cache takes over
connectRedis().catch(() => {});

//   Public cache API                    
class PromptCache {
  /** SHA-256 key from prompt text + version tag. */
  key(prompt: string, version: string): string {
    return createHash('sha256').update(`${version}:${prompt}`).digest('hex');
  }

  async get(key: string): Promise<string | null> {
    if (redisReady && redis) {
      try {
        return await redis.get(key);
      } catch {
        // Redis hiccup — fall through to memory
      }
    }
    return memGet(key);
  }

  async set(key: string, value: string): Promise<void> {
    if (redisReady && redis) {
      try {
        await redis.set(key, value, { EX: TTL_SECONDS });
        return;
      } catch {
        // Redis hiccup — fall through to memory
      }
    }
    memSet(key, value);
  }

  /** Stats for the health/admin endpoints. */
  stats(): { backend: 'redis' | 'memory'; memEntries: number; redisReady: boolean } {
    return {
      backend: redisReady ? 'redis' : 'memory',
      memEntries: memStore.size,
      redisReady,
    };
  }

  /** Remove all expired entries from the memory store. */
  purgeExpired(): void {
    const now = Date.now();
    for (const [k, v] of memStore) {
      if (now > v.expiresAt) memStore.delete(k);
    }
  }
}

export const promptCache = new PromptCache();

// Keep memory store clean even when Redis is the primary
setInterval(() => promptCache.purgeExpired(), 30 * 60 * 1000).unref();
