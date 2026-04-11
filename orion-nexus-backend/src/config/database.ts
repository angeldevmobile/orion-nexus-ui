import { Pool, QueryResult, PoolClient, QueryResultRow } from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

// Pool configuration  
//
// Development:  max=10, no SSL, no keepAlive
// Production:   max=20, SSL required, keepAlive enabled, statement_timeout
//
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'orion-nexus',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432'),

  // Connection pool sizing
  max: parseInt(process.env.DB_POOL_MAX || (isProduction ? '20' : '10')),
  min: parseInt(process.env.DB_POOL_MIN || (isProduction ? '2' : '0')),

  // Timeouts
  idleTimeoutMillis: 30_000,         // close idle connections after 30 s
  connectionTimeoutMillis: 5_000,    // give up connecting after 5 s
  statement_timeout: 30_000,         // cancel slow queries after 30 s
  query_timeout: 30_000,             // same at the pg-driver level

  // Keep long-lived connections alive through load-balancer / firewall NAT
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,

  // SSL: required in production; disabled locally unless DB_SSL=true
  ssl: isProduction || process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }  // set to true when you have a valid cert
    : undefined,
});

// Circuit-breaker state  
let consecutiveErrors = 0;
const ERROR_THRESHOLD = 5;          // open circuit after 5 consecutive failures
const RESET_AFTER_MS = 30_000;      // attempt reset after 30 s
let circuitOpenAt: number | null = null;

function isCircuitOpen(): boolean {
  if (circuitOpenAt === null) return false;
  if (Date.now() - circuitOpenAt > RESET_AFTER_MS) {
    // Half-open: let one request through to test recovery
    circuitOpenAt = null;
    consecutiveErrors = 0;
    return false;
  }
  return true;
}

function recordSuccess(): void {
  consecutiveErrors = 0;
  circuitOpenAt = null;
}

function recordError(): void {
  consecutiveErrors++;
  if (consecutiveErrors >= ERROR_THRESHOLD && circuitOpenAt === null) {
    circuitOpenAt = Date.now();
    logger.error(`[DB] Circuit breaker OPEN after ${ERROR_THRESHOLD} consecutive errors`);
  }
}

// ─── Lifecycle  ─────────
export const connectDatabase = async (): Promise<void> => {
  const client = await pool.connect();
  logger.info('[DB] Connected to PostgreSQL');
  client.release();

  pool.on('error', (error) => {
    logger.error('[DB] Pool error', { error });
    recordError();
  });

  pool.on('connect', () => {
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('[DB] New client connected');
    }
  });

  pool.on('remove', () => {
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('[DB] Client removed');
    }
  });

  const shutdown = async () => {
    logger.info('[DB] Closing pool...');
    await pool.end();
    logger.info('[DB] Pool closed');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

// ─── Query helpers  ─────
export type QueryParams = (string | number | boolean | null | Date)[];

export const query = async <T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params?: QueryParams
): Promise<QueryResult<T>> => {
  if (isCircuitOpen()) {
    throw new Error('[DB] Circuit breaker is open — database unavailable');
  }

  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production' || duration > 500) {
      logger.debug('[DB] Query', { duration, rows: res.rowCount });
    }
    recordSuccess();
    return res;
  } catch (error) {
    recordError();
    logger.error('[DB] Query error', { error });
    throw error;
  }
};

export const queryOne = async <T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params?: QueryParams
): Promise<T | null> => {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
};

export const queryMany = async <T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params?: QueryParams
): Promise<T[]> => {
  const result = await query<T>(text, params);
  return result.rows;
};

export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  if (isCircuitOpen()) {
    throw new Error('[DB] Circuit breaker is open — database unavailable');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    recordSuccess();
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    recordError();
    throw error;
  } finally {
    client.release();
  }
};

export { pool };
