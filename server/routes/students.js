import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// Helper: the DB column is fee_status but the React frontend uses feeStatus (camelCase).
// We normalise here so the frontend code needs zero changes.
function normalizeStudent(row) {
  return {
    id:        row.id,
    name:      row.name,
    room:      row.room,
    hostel:    row.hostel,
    feeStatus: row.fee_status, // camelCase for frontend
  }
}

// ── GET /api/students ─────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY name ASC')
    res.json(rows.map(normalizeStudent))
  } catch (err) {
    console.error('[GET /students]', err)
    res.status(500).json({ message: 'Could not fetch students.' })
  }
})

// ── POST /api/students ────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  // Accept both camelCase (feeStatus) and snake_case (fee_status) from caller
  const { name, room, hostel } = req.body
  const feeStatus = req.body.feeStatus ?? req.body.fee_status ?? 'Pending'

  if (!name || !room || !hostel) {
    return res.status(400).json({ message: 'name, room, and hostel are required.' })
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO students (name, room, hostel, fee_status) VALUES (?, ?, ?, ?)',
      [name, room, hostel, feeStatus]
    )
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [result.insertId])
    res.status(201).json(normalizeStudent(rows[0]))
  } catch (err) {
    console.error('[POST /students]', err)
    res.status(500).json({ message: 'Could not add student.' })
  }
})

// ── PATCH /api/students/:id ───────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const body = req.body

  // Map camelCase frontend keys → snake_case DB columns
  const fieldMap = {
    name:      'name',
    room:      'room',
    hostel:    'hostel',
    feeStatus: 'fee_status',
    fee_status:'fee_status',
  }

  const updates = []
  const values = []

  for (const [frontendKey, dbCol] of Object.entries(fieldMap)) {
    if (frontendKey in body) {
      if (!updates.find(u => u === `${dbCol} = ?`)) {
        updates.push(`${dbCol} = ?`)
        values.push(body[frontendKey])
      }
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No valid fields to update.' })
  }

  values.push(id)

  try {
    await pool.query(`UPDATE students SET ${updates.join(', ')} WHERE id = ?`, values)
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [id])
    if (rows.length === 0) return res.status(404).json({ message: 'Student not found.' })
    res.json(normalizeStudent(rows[0]))
  } catch (err) {
    console.error('[PATCH /students/:id]', err)
    res.status(500).json({ message: 'Could not update student.' })
  }
})

// ── DELETE /api/students/:id ──────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id])
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Student not found.' })
    res.status(204).send()
  } catch (err) {
    console.error('[DELETE /students/:id]', err)
    res.status(500).json({ message: 'Could not delete student.' })
  }
})

export default router
