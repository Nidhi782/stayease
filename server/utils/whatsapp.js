// ── utils/whatsapp.js ─────────────────────────────────────────────────────────
// Gupshup WhatsApp REST API — accepts Gmail signup, India-friendly.
// Sign up at gupshup.io → Create App → Get API Key
//
// Required env vars:
//   GUPSHUP_API_KEY       = your Gupshup API key
//   GUPSHUP_APP_NAME      = your Gupshup app name (you set this when creating the app)
//   GUPSHUP_WHATSAPP_FROM = your WhatsApp sender number (e.g. 919876543210)

async function sendWhatsApp(to, message) {
  // Normalize: strip non-digits, add 91 if missing
  const normalized = to.replace(/\D/g, '')
  const phoneNumber = normalized.startsWith('91') ? normalized : `91${normalized}`

  const params = new URLSearchParams({
    channel:     'whatsapp',
    source:      process.env.GUPSHUP_WHATSAPP_FROM || '',
    destination: phoneNumber,
    'src.name':  process.env.GUPSHUP_APP_NAME || 'StayEase',
    message:     JSON.stringify({ type: 'text', text: message }),
  })

  const response = await fetch('https://api.gupshup.io/sm/api/v1/msg', {
    method:  'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'apikey':        process.env.GUPSHUP_API_KEY || '',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gupshup API error: ${response.status} — ${err}`)
  }

  return response.json()
}

// ── Notify both parents when outpass is submitted ─────────────────────────────
export async function notifyParentsOutpass({ student, outpass }) {
  const message =
    `🏫 *StayEase Hostel — Outpass Request*\n\n` +
    `Dear Parent,\n\n` +
    `Your ward *${student.name}* has requested an outpass:\n\n` +
    `📍 Destination: *${outpass.destination}*\n` +
    `📝 Reason: ${outpass.reason}\n` +
    `🗓 Departure: *${outpass.departure_date}*\n` +
    `🔙 Expected Return: *${outpass.return_date}*\n\n` +
    `The warden will review and approve/reject shortly.\n\n` +
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
    console.warn(`[WhatsApp] No parent phones found for student: ${student.name}`)
  }
}
