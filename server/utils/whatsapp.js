// ── utils/whatsapp.js ─────────────────────────────────────────────────────────
// YCloud WhatsApp REST API — no SDK needed, just HTTP calls.
// Sign up at ycloud.com → get API Key → add your WhatsApp number
//
// Required env vars:
//   YCLOUD_API_KEY        = your YCloud API key
//   YCLOUD_WHATSAPP_FROM  = your WhatsApp Business number (e.g. 919876543210)

async function sendWhatsApp(to, message) {
  // Normalize number: strip non-digits, ensure starts with 91 (India)
  const normalized = to.replace(/\D/g, '')
  const phoneNumber = normalized.startsWith('91') ? normalized : `91${normalized}`

  const response = await fetch('https://api.ycloud.com/v2/whatsapp/messages', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'X-API-Key':     process.env.YCLOUD_API_KEY || '',
    },
    body: JSON.stringify({
      from: process.env.YCLOUD_WHATSAPP_FROM,
      to:   phoneNumber,
      type: 'text',
      text: { body: message },
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`YCloud API error: ${response.status} — ${err}`)
  }

  return response.json()
}

// ── Send outpass notification to both parents ─────────────────────────────────
export async function notifyParentsOutpass({ student, outpass }) {
  const message =
    `🏫 *StayEase Hostel — Outpass Request*\n\n` +
    `Dear Parent,\n\n` +
    `Your ward *${student.name}* has requested an outpass:\n\n` +
    `📍 Destination: *${outpass.destination}*\n` +
    `📝 Reason: ${outpass.reason}\n` +
    `🗓 Departure: *${outpass.departure_date}*\n` +
    `🔙 Expected Return: *${outpass.return_date}*\n\n` +
    `This is for your information. The warden will review and approve/reject.\n\n` +
    `— StayEase Management`

  const sends = []

  if (student.parent_phone) {
    sends.push(
      sendWhatsApp(student.parent_phone, message).catch(err =>
        console.error(`[WhatsApp] Parent 1 failed (${student.parent_phone}):`, err.message)
      )
    )
  }

  if (student.parent2_phone) {
    sends.push(
      sendWhatsApp(student.parent2_phone, message).catch(err =>
        console.error(`[WhatsApp] Parent 2 failed (${student.parent2_phone}):`, err.message)
      )
    )
  }

  if (sends.length > 0) {
    await Promise.allSettled(sends)
    console.log(`[WhatsApp] Notified ${sends.length} parent(s) for student: ${student.name}`)
  } else {
    console.warn(`[WhatsApp] No parent phone numbers found for student: ${student.name}`)
  }
}
