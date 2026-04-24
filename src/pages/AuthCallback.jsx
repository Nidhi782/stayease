import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ── AuthCallback ───────────────────────────────────────────────────────────────
// This page is the landing point after Google OAuth.
// The backend redirects here with ?token=<JWT> in the URL.
// We read it, store it via AuthContext, then go to /dashboard.
function AuthCallback() {
  const { login } = useAuth()
  const navigate   = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token  = params.get('token')
    const error  = params.get('error')

    if (error || !token) {
      // Google auth failed — send back to login with message
      navigate('/login?error=google_failed', { replace: true })
      return
    }

    // Decode the JWT payload to get user info (same as AuthContext does)
    try {
      const base64  = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(atob(base64))
      login({ token, user: { id: payload.id, name: payload.name, email: payload.email } })
      navigate('/dashboard', { replace: true })
    } catch {
      navigate('/login?error=google_failed', { replace: true })
    }
  }, [login, navigate])

  return (
    <div className="min-h-screen bg-[#f0faf5] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#1D9E75] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#2d4a3e] font-medium">Signing you in with Google…</p>
      </div>
    </div>
  )
}

export default AuthCallback
