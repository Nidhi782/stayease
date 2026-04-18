import { Router } from 'express'
import pool from '../db.js'

const router = Router()

// Helper: parse amenities from MySQL JSON column
// MySQL returns JSON columns as strings in some drivers — JSON.parse makes it an array.
function parseRoom(row) {
  return {
    ...row,
    amenities: typeof row.amenities === 'string' ? JSON.parse(row.amenities) : row.amenities,
  }
}

// ── GET /api/rooms ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM rooms ORDER BY number ASC')
    res.json(rows.map(parseRoom))
  } catch (err) {
    console.error('[GET /rooms]', err)
    res.status(500).json({ message: 'Could not fetch rooms.' })
  }
})

// ── POST /api/rooms ───────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { number, type, hostel, floor, capacity, occupied, status, amenities } = req.body

  if (!number || !type || !hostel || capacity === undefined) {
    return res.status(400).json({ message: 'number, type, hostel, and capacity are required.' })
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO rooms (number, type, hostel, floor, capacity, occupied, status, amenities)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        number,
        type,
        hostel,
        floor ?? 1,
        capacity,
        occupied ?? 0,
        status ?? 'Vacant',
        JSON.stringify(amenities ?? []),
      ]
    )

    const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [result.insertId])
    res.status(201).json(parseRoom(rows[0]))
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: `Room number "${number}" already exists.` })
    }
    console.error('[POST /rooms]', err)
    res.status(500).json({ message: 'Could not create room.' })
  }
})

// ── PATCH /api/rooms/:id ──────────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const fields = req.body

  // Build dynamic SET clause from request body keys
  const allowedFields = ['number', 'type', 'hostel', 'floor', 'capacity', 'occupied', 'status', 'amenities']
  const updates = []
  const values = []

  for (const key of allowedFields) {
    if (key in fields) {
      updates.push(`${key} = ?`)
      values.push(key === 'amenities' ? JSON.stringify(fields[key]) : fields[key])
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No valid fields to update.' })
  }

  values.push(id)

  try {
    await pool.query(`UPDATE rooms SET ${updates.join(', ')} WHERE id = ?`, values)
    const [rows] = await pool.query('SELECT * FROM rooms WHERE id = ?', [id])
    if (rows.length === 0) return res.status(404).json({ message: 'Room not found.' })
    res.json(parseRoom(rows[0]))
  } catch (err) {
    console.error('[PATCH /rooms/:id]', err)
    res.status(500).json({ message: 'Could not update room.' })
  }
})

// ── DELETE /api/rooms/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.query('DELETE FROM rooms WHERE id = ?', [id])
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Room not found.' })
    res.status(204).send()
  } catch (err) {
    console.error('[DELETE /rooms/:id]', err)
    res.status(500).json({ message: 'Could not delete room.' })
  }
})

export default router
