import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool, types } = pkg;
types.setTypeParser(1700, (val) => parseFloat(val));

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

try {
  await pool.query('SELECT NOW()');
  console.log("Database connected");
} catch (err) {
  console.error("Database connection failed:", err);
}
