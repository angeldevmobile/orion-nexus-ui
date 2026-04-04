const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'orion-nexus',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432'),
});

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id VARCHAR(255) UNIQUE;
    `);
    console.log('OK: github_id column added');

    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
    `);
    console.log('OK: reset_token column added');

    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;
    `);
    console.log('OK: reset_token_expires column added');

    // Table for workspace/team invites
    await pool.query(`
      CREATE TABLE IF NOT EXISTS workspace_invites (
        id SERIAL PRIMARY KEY,
        workspace_owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        invitee_email VARCHAR(255) NOT NULL,
        invitee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        role VARCHAR(50) DEFAULT 'editor',
        status VARCHAR(20) DEFAULT 'pending',
        token VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days')
      );
    `);
    console.log('OK: workspace_invites table created');

    // Table for tracking active editors (presence)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS editor_presence (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        project_id VARCHAR(255) NOT NULL,
        last_seen TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        color VARCHAR(20) DEFAULT '#00D9FF',
        UNIQUE(user_id, project_id)
      );
    `);
    console.log('OK: editor_presence table created');

    // Components library enhancements
    await pool.query(`
      ALTER TABLE components ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
    `);
    console.log('OK: components.slug column added');

    await pool.query(`
      ALTER TABLE components ADD COLUMN IF NOT EXISTS file_name VARCHAR(255);
    `);
    console.log('OK: components.file_name column added');

    await pool.query(`
      ALTER TABLE components ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;
    `);
    console.log('OK: components.is_system column added');

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS components_slug_unique ON components(slug) WHERE slug IS NOT NULL;
    `);
    console.log('OK: components slug unique index created');

    // Allow system components to have NULL creator_id
    await pool.query(`
      ALTER TABLE components ALTER COLUMN creator_id DROP NOT NULL;
    `);
    console.log('OK: components.creator_id made nullable');

    // Expand category check to include new frontend categories
    await pool.query(`
      ALTER TABLE components DROP CONSTRAINT IF EXISTS components_category_check;
    `);
    await pool.query(`
      ALTER TABLE components ADD CONSTRAINT components_category_check
        CHECK (category = ANY(ARRAY[
          'ui','layout','form','navigation','data','feedback','overlay','other',
          'Buttons','Cards','Forms','Navigation','Layouts','UI Elements',
          'Animations','Loaders','Data Display'
        ]::text[]));
    `);
    console.log('OK: components.category constraint expanded');

    console.log('\nAll migrations completed successfully!');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
