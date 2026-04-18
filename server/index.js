import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRouter from './routes/auth.js'
import roomsRouter from './routes/rooms.js'
import studentsRouter from './routes/students.js'
import complaintsRouter from './routes/complaints.js'
import { verifyToken } from './middleware/auth.js'

const app = express()
const PORT = process.env.PORT || 5000

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // React Vite dev server
  credentials: true,
}))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
// Public routes — no JWT required
app.use('/api/auth', authRouter)

// Protected routes — JWT required on every request
app.use('/api/rooms',      verifyToken, roomsRouter)
app.use('/api/students',   verifyToken, studentsRouter)
app.use('/api/complaints', verifyToken, complaintsRouter)

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
})
