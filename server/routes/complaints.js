import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// ── GET /api/complaints ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM complaints ORDER BY date DESC')
    res.json(rows)
  } catch (err) {
    console.error('[GET /complaints]', err)
    res.status(500).json({ message: 'Could not fetch complaints.' })
  }
})

// ── POST /api/complaints ──────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { title, room, hostel, status, date } = req.body

  if (!title || !room || !hostel || !date) {
    return res.status(400).json({ message: 'title, room, hostel, and date are required.' })
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO complaints (title, room, hostel, status, date) VALUES (?, ?, ?, ?, ?)',
      [title, room, hostel, status ?? 'Open', date]
    )
    const [rows] = await pool.query('SELECT * FROM complaints WHERE id = ?', [result.insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('[POST /complaints]', err)
    res.status(500).json({ message: 'Could not create complaint.' })
  }
})

// ── PATCH /api/complaints/:id ─────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const allowedFields = ['title', 'room', 'hostel', 'status', 'date']
  const updates = []
  const values = []

  for (const key of allowedFields) {
    if (key in req.body) {
      updates.push(`${key} = ?`)
      values.push(req.body[key])
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No valid fields to update.' })
  }

  values.push(id)

  try {
    await pool.query(`UPDATE complaints SET ${updates.join(', ')} WHERE id = ?`, values)
    const [rows] = await pool.query('SELECT * FROM complaints WHERE id = ?', [id])
    if (rows.length === 0) return res.status(404).json({ message: 'Complaint not found.' })
    res.json(rows[0])
  } catch (err) {
    console.error('[PATCH /complaints/:id]', err)
    res.status(500).json({ message: 'Could not update complaint.' })
  }
})

// ── DELETE /api/complaints/:id ────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.query('DELETE FROM complaints WHERE id = ?', [id])
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Complaint not found.' })
    res.status(204).send()
  } catch (err) {
    console.error('[DELETE /complaints/:id]', err)
    res.status(500).json({ message: 'Could not delete complaint.' })
  }
})

export default router
