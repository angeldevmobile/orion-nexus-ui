import { Pool, QueryResult, PoolClient, QueryResultRow } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Crear pool de conexiones de PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'orion-nexus',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20, // máximo número de conexiones en el pool
  idleTimeoutMillis: 30000, // tiempo antes de cerrar conexiones inactivas
  connectionTimeoutMillis: 2000, // tiempo máximo para conectar
});

export const connectDatabase = async (): Promise<void> => {
  try {
    // Probar la conexión
    const client = await pool.connect();
    console.log(' Connected to PostgreSQL');
    client.release();

    // Configurar eventos del pool
    pool.on('error', (error) => {
      console.error(' PostgreSQL pool error:', error);
    });

    pool.on('connect', () => {
      console.log(' New PostgreSQL client connected');
    });

    pool.on('remove', () => {
      console.log(' PostgreSQL client removed');
    });

    // Cerrar conexiones al terminar la aplicación
    process.on('SIGINT', async () => {
      console.log(' Closing PostgreSQL pool...');
      await pool.end();
      console.log(' PostgreSQL pool closed');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log(' Closing PostgreSQL pool...');
      await pool.end();
      console.log(' PostgreSQL pool closed');
      process.exit(0);
    });

  } catch (error) {
    console.error(' Failed to connect to PostgreSQL:', error);
    throw error;
  }
};

// Exportar el pool para usar en otros archivos
export { pool };

// Tipos específicos para parámetros de query
export type QueryParams = (string | number | boolean | null | Date)[];

// Función helper para ejecutar queries con tipos seguros
export const query = async <T extends QueryResultRow = Record<string, unknown>>(
  text: string, 
  params?: QueryParams
): Promise<QueryResult<T>> => {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    console.log(' Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error(' Query error:', error);
    throw error;
  }
};

// Función helper para queries que devuelven una sola fila
export const queryOne = async <T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params?: QueryParams
): Promise<T | null> => {
  const result = await query<T>(text, params);
  return result.rows[0] || null;
};

// Función helper para queries que devuelven múltiples filas
export const queryMany = async <T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params?: QueryParams
): Promise<T[]> => {
  const result = await query<T>(text, params);
  return result.rows;
};

// Función para transacciones con tipos seguros
export const transaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};