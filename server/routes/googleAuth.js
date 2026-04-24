import { Router } from 'express'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import jwt from 'jsonwebtoken'
import pool from '../db.js'

const router = Router()

// ── Configure Google Strategy ─────────────────────────────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value
      const name  = profile.displayName

      if (!email) return done(new Error('No email from Google'), null)

      // Find existing user or create new one
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])

      let user
      if (rows.length > 0) {
        // Existing user — just return them
        user = rows[0]
      } else {
        // New user — insert with a random unusable password hash
        const [result] = await pool.query(
          'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
          [name, email, 'GOOGLE_OAUTH_NO_PASSWORD']
        )
        user = { id: result.insertId, name, email }
      }

      return done(null, user)
    } catch (err) {
      return done(err, null)
    }
  }
))

// Passport needs these even if we're not using sessions
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

// ── GET /api/auth/google ──────────────────────────────────────────────────────
// Redirects the user to Google's consent screen
router.get('/',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)

// ── GET /api/auth/google/callback ─────────────────────────────────────────────
// Google redirects here after the user logs in
router.get('/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`, session: false }),
  (req, res) => {
    const user = req.user

    // Sign a JWT exactly like email/password login does
    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Redirect to frontend /auth/callback with token in URL
    // The frontend page reads it, stores it, then goes to /dashboard
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`)
  }
)

export default router
