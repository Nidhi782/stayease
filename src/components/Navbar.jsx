import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/stayease_logo_light_clean.svg'

function Navbar() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const { isLoggedIn, currentUser, logout } = useAuth()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function isActive(path) {
    return location.pathname === path
  }

  function handleLogout() {
    setDropdownOpen(false)
    logout()
    navigate('/')
  }

  // Initials for avatar
  const initials = currentUser
    ? currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : ''

  const roleLabel = {
    student:      'Student',
    warden_boys:  'Head Warden — Boys',
    warden_girls: 'Head Warden — Girls',
  }[currentUser?.role] || 'Student'

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex justify-between items-center sticky top-0 z-50">

      {/* Logo */}
      <Link to="/">
        <img src={logo} alt="StayEase Logo" className="h-10 w-auto" />
      </Link>

      {/* Nav Links */}
      <div className="flex gap-5 text-sm font-medium items-center flex-wrap">
        {[
          { to: '/',           label: 'Home' },
          { to: '/rooms',      label: 'Rooms' },
          { to: '/mess',       label: 'Mess' },
          { to: '/services',   label: 'Services' },
          { to: '/complaints', label: 'Complaints' },
        ].map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`transition font-medium pb-0.5 ${
              isActive(link.to)
                ? 'text-[#1D9E75] border-b-2 border-[#1D9E75]'
                : 'text-[#1a1a2e] hover:text-[#1D9E75]'
            }`}
          >
            {link.label}
          </Link>
        ))}

        {/* Links only for logged-in users */}
        {isLoggedIn && (
          <>
            {[
              { to: '/dashboard',  label: 'Dashboard' },
              { to: '/outpass',    label: 'Outpass' },
              { to: '/attendance', label: 'Attendance' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`transition font-medium pb-0.5 ${
                  isActive(link.to)
                    ? 'text-[#1D9E75] border-b-2 border-[#1D9E75]'
                    : 'text-[#1a1a2e] hover:text-[#1D9E75]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </>
        )}

        {/* ── Auth area ── */}
        {isLoggedIn ? (
          /* Profile dropdown */
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="flex items-center gap-2 focus:outline-none group"
              aria-label="User menu"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-xs font-bold select-none group-hover:ring-2 group-hover:ring-[#5DCAA5] transition">
                {initials}
              </div>
              {/* Chevron */}
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-bold text-[#1a1a2e] text-sm truncate">{currentUser.name}</p>
                  <p className="text-xs text-gray-400 truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-xs bg-[#f0faf5] text-[#1D9E75] font-semibold px-2 py-0.5 rounded-full">
                    {roleLabel}
                  </span>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/dashboard') }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#1a1a2e] hover:bg-[#f0faf5] flex items-center gap-3 transition"
                  >
                    <span>🏠</span> Dashboard
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/outpass') }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#1a1a2e] hover:bg-[#f0faf5] flex items-center gap-3 transition"
                  >
                    <span>🚪</span> My Outpasses
                  </button>
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/attendance') }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#1a1a2e] hover:bg-[#f0faf5] flex items-center gap-3 transition"
                  >
                    <span>📋</span> Attendance
                  </button>
                </div>

                {/* Settings + Logout */}
                <div className="border-t border-gray-100 py-1 mt-1">
                  <button
                    onClick={() => setDropdownOpen(false)}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#1a1a2e] hover:bg-[#f0faf5] flex items-center gap-3 transition"
                  >
                    <span>⚙️</span> Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition font-semibold"
                  >
                    <span>🚪</span> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            to="/login"
            className={`px-5 py-2 rounded-full font-semibold transition ${
              isActive('/login') || isActive('/signup')
                ? 'bg-[#5DCAA5] text-white'
                : 'bg-[#1D9E75] text-white hover:bg-[#5DCAA5]'
            }`}
          >
            Login
          </Link>
        )}
      </div>

    </nav>
  )
}

export default Navbar