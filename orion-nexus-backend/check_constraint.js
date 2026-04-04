const { Pool } = require('pg');
require('dotenv').config();
const p = new Pool();
p.query(
  `SELECT constraint_name, check_clause
   FROM information_schema.check_constraints
   WHERE constraint_name LIKE '%category%'`
).then(r => {
  console.log(JSON.stringify(r.rows, null, 2));
}).catch(e => console.error(e.message)).finally(() => p.end());
