// ── utils/whatsapp.js ─────────────────────────────────────────────────────────
// Twilio WhatsApp utility for sending outpass parent notifications.
// Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM in env.
// TWILIO_WHATSAPP_FROM format: "whatsapp:+14155238886" (Twilio sandbox number)

import twilio from 'twilio'

function getClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )
}

// Send WhatsApp message to both parents before outpass approval
export async function notifyParentsOutpass({ student, outpass }) {
  const client = getClient()
  const from   = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886'

  const message = `🏫 *StayEase Hostel — Outpass Request*\n\nDear Parent,\n\n` +
    `Your ward *${student.name}* has requested an outpass:\n\n` +
    `📍 Destination: *${outpass.destination}*\n` +
    `📝 Reason: ${outpass.reason}\n` +
    `🗓 Departure: *${outpass.departure_date}*\n` +
    `🔙 Expected Return: *${outpass.return_date}*\n\n` +
    `The warden has been notified. For queries, contact the hostel office.\n\n` +
    `— StayEase Management`

  const parents = []

  // Parent 1
  if (student.parent_phone) {
    parents.push(
      client.messages.create({
        from,
        to:   `whatsapp:+91${student.parent_phone.replace(/\D/g, '')}`,
        body: message,
      })
    )
  }

  // Parent 2
  if (student.parent2_phone) {
    parents.push(
      client.messages.create({
        from,
        to:   `whatsapp:+91${student.parent2_phone.replace(/\D/g, '')}`,
        body: message,
      })
    )
  }

  if (parents.length > 0) {
    await Promise.allSettled(parents) // don't fail if one number is bad
  }
}
