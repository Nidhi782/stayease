import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../db.js'
import dotenv from 'dotenv'

dotenv.config()

const router = Router()
const SALT_ROUNDS = 12

// ── POST /api/auth/register ───────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' })
  }

  try {
    // Check if email already registered
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    // Hash password and insert user
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name, email, passwordHash]
    )

    // Sign JWT with user info (no sensitive data in payload)
    const token = jwt.sign(
      { id: result.insertId, name, email, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      user: { id: result.insertId, name, email, role: 'student' },
    })
  } catch (err) {
    console.error('[register]', err)
    res.status(500).json({ message: 'Registration failed. Please try again.' })
  }
})

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' })
  }

  try {
    // Find user by email
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const user = rows[0]

    // Compare password against stored hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash)
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    // Sign and return JWT
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role || 'student' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role || 'student' },
    })
  } catch (err) {
    console.error('[login]', err)
    res.status(500).json({ message: 'Login failed. Please try again.' })
  }
})

export default router
