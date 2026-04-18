import { createContext, useContext, useState } from 'react'

// ── Storage keys ───────────────────────────────────────────
// Phase 7: store the JWT token instead of the raw user object.
// The Axios interceptor in client.js reads stayease_token automatically.
const TOKEN_KEY = 'stayease_token'
const USER_KEY  = 'stayease_user'

// ── Helpers ────────────────────────────────────────────────
// Decode the JWT payload (middle segment) without a library.
// We only need name + email from it — no signature verification
// is needed client-side (the server verifies on every request).
function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

// ── Context ────────────────────────────────────────────────
const AuthContext = createContext(null)

// ── Provider ───────────────────────────────────────────────
export function AuthProvider({ children }) {
  // Restore session from localStorage so user stays logged in
  // after a page refresh. Try to read from the new JWT key first,
  // falling back to the legacy user-object key for compatibility.
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) return decodeJwtPayload(token)

      // Legacy fallback (Phase 1-6 stored the raw user object)
      const legacy = localStorage.getItem(USER_KEY)
      return legacy ? JSON.parse(legacy) : null
    } catch {
      return null
    }
  })

  const isLoggedIn = currentUser !== null

  // login() now receives { token, user } from the API response.
  // We store the JWT token — client.js interceptor attaches it
  // automatically to every subsequent Axios request.
  function login({ token, user }) {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.removeItem(USER_KEY) // remove any legacy entry
    setCurrentUser(user)
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setCurrentUser(null)
  }

  return (
    <AuthContext.Provider value={{ currentUser, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Custom hook ────────────────────────────────────────────
export function useAuth() {
  return useContext(AuthContext)
}
