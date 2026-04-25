// ── routes/attendance.js ──────────────────────────────────────────────────────
import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ── GET /api/attendance?date=YYYY-MM-DD&hostel=Boys|Girls ─────────────────────
// Warden fetches all students' attendance for a given date
router.get('/', async (req, res) => {
  const { date, hostel } = req.query
  const targetDate = date || new Date().toISOString().split('T')[0]
  try {
    // Get all students in hostel with their attendance status for the day
    const [rows] = await pool.query(
      `SELECT
        s.id, s.name, s.room, s.hostel,
        COALESCE(a.status, 'Absent') as status,
        a.marked_by,
        -- Check if student has approved outpass for this date
        (SELECT COUNT(*) FROM outpasses op
          WHERE op.student_id = s.id
          AND op.status = 'Approved'
          AND op.departure_date <= ?
          AND op.return_date >= ?) as on_outpass
       FROM students s
       LEFT JOIN attendance a ON a.student_id = s.id AND a.date = ?
       WHERE s.hostel = ?
       ORDER BY s.room, s.name`,
      [targetDate, targetDate, targetDate, hostel || 'Boys']
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch attendance.' })
  }
})

// ── POST /api/attendance/bulk ─────────────────────────────────────────────────
// Warden marks attendance for all students in one go
// Body: { date: 'YYYY-MM-DD', records: [{ student_id, status }] }
router.post('/bulk', async (req, res) => {
  const { date, records } = req.body
  if (!date || !Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ message: 'date and records[] required.' })
  }
  try {
    // Upsert each record
    for (const r of records) {
      await pool.query(
        `INSERT INTO attendance (student_id, date, status, marked_by)
         VALUES (?, ?, ?, 'Admin')
         ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = 'Admin'`,
        [r.student_id, date, r.status]
      )
    }
    res.json({ message: `Attendance saved for ${records.length} students.` })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to save attendance.' })
  }
})

// ── GET /api/attendance/student/:id ──────────────────────────────────────────
// Get a student's attendance for a month
router.get('/student/:id', async (req, res) => {
  const { month } = req.query // YYYY-MM
  const target = month || new Date().toISOString().slice(0, 7)
  try {
    const [rows] = await pool.query(
      `SELECT date, status, marked_by
       FROM attendance
       WHERE student_id = ? AND DATE_FORMAT(date, '%Y-%m') = ?
       ORDER BY date ASC`,
      [req.params.id, target]
    )
    // Also count summary
    const present  = rows.filter(r => r.status === 'Present').length
    const absent   = rows.filter(r => r.status === 'Absent').length
    const onLeave  = rows.filter(r => r.status === 'On-Leave').length
    res.json({ records: rows, summary: { present, absent, onLeave } })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch student attendance.' })
  }
})

export default router
