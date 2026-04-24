import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import logo from '../assets/stayease_logo_dark_clean.svg'

function Signup() {
  // ── State ──────────────────────────────────────────────
  const [role, setRole] = useState('Student')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [roomNumber, setRoomNumber] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  // ── Validation ─────────────────────────────────────────
  function validate() {
    const newErrors = {}
    if (!name.trim()) newErrors.name = 'Full name is required'
    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Enter a valid email'
    if (role === 'Student' && !roomNumber.trim())
      newErrors.roomNumber = 'Room number is required for students'
    if (!password) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
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
      const { data } = await client.post('/auth/register', {
        name: name.trim(),
        email,
        password,
      })
      // data = { token, user: { id, name, email } }
      login(data)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.'
      setErrors({ server: msg })
      setSubmitted(false)
    }
  }

  // ── Helper: clear one error on change ──────────────────
  function clearError(field) {
    setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  // ── Google OAuth ──────────────────────────────────────────
  function handleGoogleLogin() {
    const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
      .replace('/api', '')
    window.location.href = `${apiBase}/api/auth/google`
  }

  return (
    <div className="min-h-screen bg-[#f0faf5] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden flex">

        {/* ───── LEFT SIDE - Green Panel ───── */}
        <div className="hidden md:flex flex-col justify-between w-1/2 bg-[#0d1f17] p-10">

          {/* Logo */}
          <img src={logo} alt="StayEase" className="w-48" />

          {/* Middle Text */}
          <div>
            <h2 className="text-3xl font-bold text-white leading-snug">
              Join <span className="text-[#5DCAA5]">StayEase</span> <br />
              Today
            </h2>
            <p className="text-[#a0d4be] mt-4 text-sm leading-relaxed">
              Create your account and get access to room management,
              fee tracking, complaints and much more.
            </p>

            {/* Features List */}
            <div className="mt-8 flex flex-col gap-3">
              {[
                'Room allocation & management',
                'Fee payment tracking',
                'Complaint management system',
                'Role based access control',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-xs">
                    ✓
                  </div>
                  <p className="text-[#a0d4be] text-sm">{feature}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <p className="text-[#a0d4be] text-xs opacity-60">
            © 2025 StayEase. All rights reserved.
          </p>

        </div>

        {/* ───── RIGHT SIDE - Signup Form ───── */}
        <div className="flex-1 p-10 flex flex-col justify-center">

          <h2 className="text-2xl font-bold text-[#1a1a2e]">Create your account</h2>
          <p className="text-[#2d4a3e] text-sm mt-1">
            Already have an account?{' '}
            <Link to="/login" className="text-[#1D9E75] font-semibold hover:underline">
              Login
            </Link>
          </p>

          {/* ── Role Toggle ── */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => { setRole('Student'); clearError('roomNumber') }}
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

            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-[#1a1a2e]">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => { setName(e.target.value); clearError('name') }}
                className={`w-full mt-1 px-4 py-3 rounded-xl border bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:ring-1 transition ${
                  errors.name
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                    : 'border-gray-200 focus:border-[#1D9E75] focus:ring-[#1D9E75]'
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-[#1a1a2e]">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError('email') }}
                className={`w-full mt-1 px-4 py-3 rounded-xl border bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:ring-1 transition ${
                  errors.email
                    ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                    : 'border-gray-200 focus:border-[#1D9E75] focus:ring-[#1D9E75]'
                }`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Room Number — only for Students */}
            {role === 'Student' && (
              <div>
                <label className="text-sm font-medium text-[#1a1a2e]">Room Number</label>
                <input
                  type="text"
                  placeholder="e.g. A-101"
                  value={roomNumber}
                  onChange={(e) => { setRoomNumber(e.target.value); clearError('roomNumber') }}
                  className={`w-full mt-1 px-4 py-3 rounded-xl border bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:ring-1 transition ${
                    errors.roomNumber
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                      : 'border-gray-200 focus:border-[#1D9E75] focus:ring-[#1D9E75]'
                  }`}
                />
                {errors.roomNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.roomNumber}</p>
                )}
              </div>
            )}

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-[#1a1a2e]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password (min 6 chars)"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError('password') }}
                  className={`w-full mt-1 px-4 py-3 pr-12 rounded-xl border bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:ring-1 transition ${
                    errors.password
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-300'
                      : 'border-gray-200 focus:border-[#1D9E75] focus:ring-[#1D9E75]'
                  }`}
                />
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
              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3].map((bar) => (
                    <div
                      key={bar}
                      className={`flex-1 h-1 rounded-full transition-all ${
                        password.length >= bar * 4
                          ? bar === 1
                            ? 'bg-red-400'
                            : bar === 2
                            ? 'bg-yellow-400'
                            : 'bg-[#1D9E75]'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Server-side error */}
            {errors.server && (
              <p className="text-red-500 text-sm text-center bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                {errors.server}
              </p>
            )}

            {/* Signup Button */}
            <button
              type="submit"
              disabled={submitted}
              className={`w-full font-bold py-3 rounded-xl transition mt-2 ${
                submitted
                  ? 'bg-[#5DCAA5] text-white cursor-not-allowed'
                  : 'bg-[#1D9E75] hover:bg-[#5DCAA5] text-white'
              }`}
            >
              {submitted ? 'Creating Account…' : 'Create Account'}
            </button>

          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border border-gray-200 rounded-xl py-3 text-sm font-medium text-[#1a1a2e] hover:bg-[#f0faf5] transition flex items-center justify-center gap-2"
          >
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

export default Signup