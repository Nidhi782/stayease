import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

// ── JWT Verification Middleware ───────────────────────────────────────────────
// Applied to all protected routes (rooms, students, complaints).
// Reads the "Authorization: Bearer <token>" header, verifies the signature,
// and attaches the decoded payload to req.user so downstream routes know
// who is making the request.
export function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization']

  // Header must be present and follow "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided. Please log in.' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { id, name, email, iat, exp }
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' })
  }
}
