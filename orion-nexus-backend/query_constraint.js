const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'orion-nexus',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432'),
});

pool.query(
  `SELECT constraint_name, check_clause
   FROM information_schema.check_constraints
   WHERE constraint_name LIKE '%category%'`
).then(r => {
  if (r.rows.length === 0) {
    console.log('No category check constraints found.');
  } else {
    console.log(JSON.stringify(r.rows, null, 2));
  }
}).catch(e => console.error(e.message)).finally(() => pool.end());
