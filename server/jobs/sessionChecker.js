// ── jobs/sessionChecker.js ────────────────────────────────────────────────────
// Runs daily at 6 AM. Checks for:
//   1. Sessions ending in exactly 5 days → send reminder email
//   2. Sessions that ended today → mark room Vacant, update student

import cron from 'node-cron'
import pool from '../db.js'
import { sendSessionEndingEmail } from '../utils/mailer.js'

const DAILY_RATES = {
  'Double AC':     700,
  'Double Non-AC': 550,
  'Triple AC':     600,
  'Triple Non-AC': 500,
}

function getRoomLabel(type, ac) {
  return `${type} ${ac ? 'AC' : 'Non-AC'}`
}

export function startSessionChecker() {
  // Run daily at 6:00 AM
  cron.schedule('0 6 * * *', async () => {
    console.log('[SessionChecker] Running daily check...')
    const today   = new Date()
    const in5Days = new Date(today)
    in5Days.setDate(today.getDate() + 5)

    const todayStr   = today.toISOString().split('T')[0]
    const in5DaysStr = in5Days.toISOString().split('T')[0]

    try {
      // ── 1. Send reminder emails (session ending in 5 days) ──
      const [expiringSoon] = await pool.query(
        `SELECT s.*, r.type as room_type, r.ac
         FROM students s
         LEFT JOIN rooms r ON r.number = s.room
         WHERE s.session_end = ? AND s.extended_stay = FALSE`,
        [in5DaysStr]
      )

      for (const student of expiringSoon) {
        if (!student.email) continue
        const roomLabel = getRoomLabel(student.room_type, student.ac)
        const dailyRate = DAILY_RATES[roomLabel] || 600
        try {
          await sendSessionEndingEmail({
            toEmail:    student.email,
            toName:     student.name,
            sessionEnd: student.session_end,
            dailyRate,
            roomType:   roomLabel,
          })
          console.log(`[SessionChecker] Reminder sent to ${student.email}`)
        } catch (err) {
          console.error(`[SessionChecker] Email failed for ${student.email}:`, err.message)
        }
      }

      // ── 2. Auto-vacate rooms (session ended today, no extension) ──
      const [expired] = await pool.query(
        `SELECT s.*, r.id as room_id, r.occupied, r.capacity
         FROM students s
         LEFT JOIN rooms r ON r.number = s.room
         WHERE s.session_end = ? AND s.extended_stay = FALSE`,
        [todayStr]
      )

      for (const student of expired) {
        // Update room: decrement occupied, update status
        const newOccupied = Math.max(0, (student.occupied || 1) - 1)
        const newStatus   = newOccupied === 0 ? 'Vacant' : 'Available'
        await pool.query(
          'UPDATE rooms SET occupied = ?, status = ? WHERE number = ?',
          [newOccupied, newStatus, student.room]
        )
        console.log(`[SessionChecker] Room ${student.room} → ${newStatus} (session ended for ${student.name})`)
      }

      console.log(`[SessionChecker] Done. Reminded: ${expiringSoon.length}, Vacated: ${expired.length} rooms.`)
    } catch (err) {
      console.error('[SessionChecker] Error:', err)
    }
  })

  console.log('✅  Session checker cron scheduled (daily at 6 AM)')
}
