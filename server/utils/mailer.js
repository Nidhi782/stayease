// ── utils/mailer.js ───────────────────────────────────────────────────────────
// SendGrid email utility. Set SENDGRID_API_KEY + EMAIL_FROM in Railway env vars.

import sgMail from '@sendgrid/mail'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')

export async function sendSessionEndingEmail({ toEmail, toName, sessionEnd, dailyRate, roomType }) {
  const msg = {
    to:      toEmail,
    from:    process.env.EMAIL_FROM || 'noreply@stayease.com',
    subject: `⚠️ Your StayEase session ends in 5 days — Action Required`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;background:#f0faf5;border-radius:16px">
        <div style="background:#0d1f17;padding:24px;border-radius:12px;text-align:center;margin-bottom:24px">
          <h1 style="color:#5DCAA5;margin:0;font-size:24px">StayEase</h1>
          <p style="color:#a0d4be;margin:8px 0 0">Hostel Management System</p>
        </div>
        <h2 style="color:#1a1a2e">Dear ${toName},</h2>
        <p style="color:#2d4a3e">Your current hostel session is ending on <strong>${sessionEnd}</strong>.</p>
        <div style="background:white;border-radius:12px;padding:20px;margin:20px 0;border-left:4px solid #1D9E75">
          <h3 style="margin-top:0;color:#1D9E75">Your Options</h3>
          <p>1️⃣ <strong>Vacate by ${sessionEnd}</strong> — your room will be released automatically</p>
          <p>2️⃣ <strong>Extended Stay</strong> — ₹${dailyRate}/day from ${sessionEnd} onwards (${roomType})</p>
          <p>3️⃣ <strong>New Session</strong> — book the next 10-month session</p>
        </div>
        <p style="color:#2d4a3e">Please visit the hostel office or contact the warden to confirm your choice <strong>before ${sessionEnd}</strong>.</p>
        <hr style="border:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#9ca3af;font-size:12px;text-align:center">© 2026 StayEase · This is an automated message</p>
      </div>
    `,
  }
  await sgMail.send(msg)
}

export async function sendOutpassApprovedEmail({ toEmail, toName, destination, returnDate }) {
  const msg = {
    to:      toEmail,
    from:    process.env.EMAIL_FROM || 'noreply@stayease.com',
    subject: `✅ Outpass Approved — StayEase`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px">
        <h2>Dear ${toName},</h2>
        <p>Your outpass request has been <strong style="color:#1D9E75">approved</strong>.</p>
        <p>📍 Destination: <strong>${destination}</strong></p>
        <p>📅 Expected Return: <strong>${returnDate}</strong></p>
        <p>Please remember to mark yourself <strong>Present</strong> when you return.</p>
        <p>— StayEase Management</p>
      </div>
    `,
  }
  await sgMail.send(msg)
}
