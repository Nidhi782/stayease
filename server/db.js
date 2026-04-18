import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

// ── Connection Pool ───────────────────────────────────────────────────────────
// Using a pool (not a single connection) so concurrent requests don't block.
// All route files import this pool and call pool.query(sql, params).
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'stayease',
  // Keep up to 10 connections alive. mysql2 handles checkout/return automatically.
  connectionLimit: 10,
  // Return dates as JavaScript Date objects (not strings)
  dateStrings: true,
})

export default pool
