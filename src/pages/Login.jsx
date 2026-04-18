import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import logo from '../assets/stayease_logo_dark_clean.svg'

function Login() {
  // ── State ──────────────────────────────────────────────
  const [role, setRole] = useState('Student')         // 'Student' | 'Admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  // ── Validation ─────────────────────────────────────────
  function validate() {
    const newErrors = {}
    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email'
    if (!password) newErrors.password = 'Password is required'
    return newErrors
  }

  // ── Submit ─────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault()
    const foundErrors = validate()
    if (Object.keys(foundErrors).length > 0) {
      setErrors(foundErrors)
      return
    }
    setErrors({})
    setSubmitted(true)
    try {
      const { data } = await client.post('/auth/login', { email, password })
      // data = { token, user: { id, name, email } }
      login(data)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please try again.'
      setErrors({ server: msg })
      setSubmitted(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f0faf5] flex items-center justify-center px-4">

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex">

        {/* ───── LEFT SIDE - Green Panel ───── */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-[#0d1f17] p-10">

          {/* Logo */}
          <img src={logo} alt="StayEase" className="w-48" />

          {/* Middle Text */}
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug">
              Welcome Back to <br />
              <span className="text-[#5DCAA5]">StayEase</span>
            </h2>
            <p className="text-[#a0d4be] mt-4 text-sm leading-relaxed">
              Login to manage your hostel, track fees,
              view rooms and much more.
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-[#1a3d30] rounded-xl p-4 text-center">
                <p className="text-[#5DCAA5] text-xl font-bold">120+</p>
                <p className="text-[#a0d4be] text-xs mt-1">Rooms</p>
              </div>
              <div className="bg-[#1a3d30] rounded-xl p-4 text-center">
                <p className="text-[#5DCAA5] text-xl font-bold">500+</p>
                <p className="text-[#a0d4be] text-xs mt-1">Students</p>
              </div>
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-[#a0d4be] text-xs opacity-60">
            © 2025 StayEase. All rights reserved.
          </p>

        </div>

        {/* ───── RIGHT SIDE - Login Form ───── */}
        <div className="flex-1 p-10 flex flex-col justify-center">

          <h2 className="text-2xl font-bold text-[#1a1a2e]">Login to your account</h2>
          <p className="text-[#2d4a3e] text-sm mt-1">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#1D9E75] font-semibold hover:underline">
              Sign up
            </Link>
          </p>

          {/* ── Role Toggle ── */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setRole('Student')}
              className={`flex-1 py-2 rounded-full border-2 border-[#1D9E75] text-sm font-semibold transition ${
                role === 'Student'
                  ? 'bg-[#1D9E75] text-white'
                  : 'text-[#1D9E75] hover:bg-[#f0faf5]'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('Admin')}
              className={`flex-1 py-2 rounded-full border-2 border-[#1D9E75] text-sm font-semibold transition ${
                role === 'Admin'
                  ? 'bg-[#1D9E75] text-white'
                  : 'text-[#1D9E75] hover:bg-[#f0faf5]'
              }`}
            >
              Admin
            </button>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-[#1a1a2e]">
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrors((prev) => ({ ...prev, email: '' }))
                }}
                className={`w-full mt-1 px-4 py-3 rounded-xl border bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:ring-1 transition ${
                  errors.email
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                    : 'border-gray-200 focus:border-[#1D9E75] focus:ring-[#1D9E75]'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-[#1a1a2e]">
                  Password
                </label>
                <a href="#" className="text-xs text-[#1D9E75] hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrors((prev) => ({ ...prev, password: '' }))
                  }}
                  className={`w-full mt-1 px-4 py-3 pr-12 rounded-xl border bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:ring-1 transition ${
                    errors.password
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                      : 'border-gray-200 focus:border-[#1D9E75] focus:ring-[#1D9E75]'
                  }`}
                />
                {/* Show / Hide toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 mt-0.5 text-gray-400 hover:text-[#1D9E75] transition text-sm"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Server-side error */}
            {errors.server && (
              <p className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                {errors.server}
              </p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={submitted}
              className={`w-full font-bold py-3 rounded-xl transition mt-2 ${
                submitted
                  ? 'bg-[#5DCAA5] text-white cursor-not-allowed'
                  : 'bg-[#1D9E75] hover:bg-[#5DCAA5] text-white'
              }`}
            >
              {submitted ? 'Logging in…' : 'Login'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Google Button */}
          <button className="w-full border border-gray-200 rounded-xl py-3 text-sm font-medium text-[#1a1a2e] hover:bg-[#f0faf5] transition flex items-center justify-center gap-2">
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>

        </div>
      </div>
    </div>
  )
}

export default Login