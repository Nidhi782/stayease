import axios from 'axios'

// ── Axios instance ────────────────────────────────────────────
// All API calls go through this client so the base URL is
// managed in one place.
// Phase 7: switched from json-server (:5001) → Express (:5000/api)
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// ── JWT Interceptor ───────────────────────────────────────────
// Automatically attach the stored JWT token to every outgoing
// request as "Authorization: Bearer <token>".
// The token is stored by AuthContext after login/register.
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('stayease_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default client
