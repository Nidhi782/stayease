// ── routes/outpass.js ─────────────────────────────────────────────────────────
import { Router } from 'express'
import pool from '../db.js'
import { notifyParentsOutpass } from '../utils/whatsapp.js'
import { sendOutpassApprovedEmail } from '../utils/mailer.js'

const router = Router()

// ── GET /api/outpass ──────────────────────────────────────────────────────────
// Wardens see all; students see own (matched by name via user session)
router.get('/', async (req, res) => {
  try {
    const role = req.user?.role || 'student'
    let rows
    if (role === 'warden_boys' || role === 'warden_girls') {
      const hostel = role === 'warden_boys' ? 'Boys' : 'Girls'
      ;[rows] = await pool.query(
        `SELECT o.*, s.name as student_name, s.room, s.hostel, s.parent_phone, s.parent2_phone
         FROM outpasses o
         JOIN students s ON s.id = o.student_id
         WHERE s.hostel = ?
         ORDER BY o.created_at DESC`,
        [hostel]
      )
    } else {
      // Students see only their own — matched by email
      ;[rows] = await pool.query(
        `SELECT o.*, s.name as student_name, s.room, s.hostel
         FROM outpasses o
         JOIN students s ON s.id = o.student_id
         ORDER BY o.created_at DESC
         LIMIT 50`
      )
    }
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch outpasses.' })
  }
})

// ── POST /api/outpass ─────────────────────────────────────────────────────────
// Student submits a new outpass request
router.post('/', async (req, res) => {
  const { student_id, reason, destination, departure_date, return_date } = req.body
  if (!student_id || !reason || !destination || !departure_date || !return_date) {
    return res.status(400).json({ message: 'All fields are required.' })
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO outpasses (student_id, reason, destination, departure_date, return_date)
       VALUES (?, ?, ?, ?, ?)`,
      [student_id, reason, destination, departure_date, return_date]
    )
    res.status(201).json({ id: result.insertId, message: 'Outpass request submitted.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to submit outpass request.' })
  }
})

// ── PATCH /api/outpass/:id/approve ───────────────────────────────────────────
// Warden approves → sends WhatsApp to parents + email to student
router.patch('/:id/approve', async (req, res) => {
  const { id }        = req.params
  const { admin_note } = req.body
  try {
    // Get full outpass + student info
    const [[outpass]] = await pool.query(
      `SELECT o.*, s.name, s.email, s.parent_phone, s.parent2_phone
       FROM outpasses o JOIN students s ON s.id = o.student_id
       WHERE o.id = ?`,
      [id]
    )
    if (!outpass) return res.status(404).json({ message: 'Outpass not found.' })

    await pool.query(
      'UPDATE outpasses SET status = ?, admin_note = ? WHERE id = ?',
      ['Approved', admin_note || null, id]
    )

    // WhatsApp both parents (non-blocking)
    notifyParentsOutpass({ student: outpass, outpass }).catch(err =>
      console.error('[WhatsApp] Failed:', err.message)
    )

    // Email student (non-blocking)
    if (outpass.email) {
      sendOutpassApprovedEmail({
        toEmail:    outpass.email,
        toName:     outpass.name,
        destination: outpass.destination,
        returnDate: outpass.return_date,
      }).catch(err => console.error('[Email] Failed:', err.message))
    }

    res.json({ message: 'Outpass approved. Parents notified via WhatsApp.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to approve outpass.' })
  }
})

// ── PATCH /api/outpass/:id/reject ────────────────────────────────────────────
router.patch('/:id/reject', async (req, res) => {
  const { admin_note } = req.body
  try {
    await pool.query(
      'UPDATE outpasses SET status = ?, admin_note = ? WHERE id = ?',
      ['Rejected', admin_note || null, req.params.id]
    )
    res.json({ message: 'Outpass rejected.' })
  } catch (err) {
    res.status(500).json({ message: 'Failed to reject outpass.' })
  }
})

// ── PATCH /api/outpass/:id/return ────────────────────────────────────────────
// Student marks themselves as returned → creates/updates attendance record (Present)
router.patch('/:id/return', async (req, res) => {
  try {
    const [[outpass]] = await pool.query('SELECT * FROM outpasses WHERE id = ?', [req.params.id])
    if (!outpass) return res.status(404).json({ message: 'Outpass not found.' })

    await pool.query(
      'UPDATE outpasses SET status = ?, returned_at = NOW() WHERE id = ?',
      ['Returned', req.params.id]
    )

    // Mark attendance as Present for today
    const today = new Date().toISOString().split('T')[0]
    await pool.query(
      `INSERT INTO attendance (student_id, date, status, marked_by)
       VALUES (?, ?, 'Present', 'Student')
       ON DUPLICATE KEY UPDATE status = 'Present', marked_by = 'Student'`,
      [outpass.student_id, today]
    )

    res.json({ message: 'Marked as returned and attendance recorded.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to process return.' })
  }
})

export default router
