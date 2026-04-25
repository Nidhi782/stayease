import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import passport from 'passport'

import authRouter from './routes/auth.js'
import googleAuthRouter from './routes/googleAuth.js'
import roomsRouter from './routes/rooms.js'
import studentsRouter from './routes/students.js'
import complaintsRouter from './routes/complaints.js'
import outpassRouter from './routes/outpass.js'
import attendanceRouter from './routes/attendance.js'
import { verifyToken } from './middleware/auth.js'
import { startSessionChecker } from './jobs/sessionChecker.js'

const app = express()
const PORT = process.env.PORT || 5000

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ]
    // Allow any Vercel deployment or no origin (e.g. curl/Postman)
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))
app.use(express.json())
app.use(passport.initialize())

// ── Routes ────────────────────────────────────────────────────────────────────
// Public routes — no JWT required
app.use('/api/auth',        authRouter)
app.use('/api/auth/google', googleAuthRouter)
app.get('/api/rooms',      roomsRouter)   // public read

// Protected routes — JWT required on every request
app.use('/api/rooms',      verifyToken, roomsRouter)
app.use('/api/students',   verifyToken, studentsRouter)
app.use('/api/complaints', verifyToken, complaintsRouter)
app.use('/api/outpass',    verifyToken, outpassRouter)
app.use('/api/attendance', verifyToken, attendanceRouter)

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found.` })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error('[Unhandled Error]', err)
  res.status(500).json({ message: 'Internal server error.' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  StayEase API running at http://localhost:${PORT}`)
  console.log(`    Health check → http://localhost:${PORT}/api/health`)
  startSessionChecker()   // daily session expiry + email alerts
})
