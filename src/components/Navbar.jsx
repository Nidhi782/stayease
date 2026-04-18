import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/stayease_logo_light_clean.svg'

function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isLoggedIn, currentUser, logout } = useAuth()

  // Returns true if the link's path matches the current URL
  function isActive(path) {
    return location.pathname === path
  }

  function handleLogout() {
    logout()
    navigate('/')
  }

  // Initial(s) for the avatar bubble
  const initials = currentUser
    ? currentUser.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : ''

  return (
    <nav className="bg-white shadow-md px-8 py-3 flex justify-between items-center sticky top-0 z-50">

      {/* Logo */}
      <Link to="/">
        <img src={logo} alt="StayEase Logo" className="h-10 w-auto" />
      </Link>

      {/* Nav Links */}
      <div className="flex gap-6 text-sm font-medium items-center">
        <Link
          to="/"
          className={`transition font-medium pb-0.5 ${
            isActive('/')
              ? 'text-[#1D9E75] border-b-2 border-[#1D9E75]'
              : 'text-[#1a1a2e] hover:text-[#1D9E75]'
          }`}
        >
          Home
        </Link>
        <Link
          to="/dashboard"
          className={`transition font-medium pb-0.5 ${
            isActive('/dashboard')
              ? 'text-[#1D9E75] border-b-2 border-[#1D9E75]'
              : 'text-[#1a1a2e] hover:text-[#1D9E75]'
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/rooms"
          className={`transition font-medium pb-0.5 ${
            isActive('/rooms')
              ? 'text-[#1D9E75] border-b-2 border-[#1D9E75]'
              : 'text-[#1a1a2e] hover:text-[#1D9E75]'
          }`}
        >
          Rooms
        </Link>
        <Link
          to="/complaints"
          className={`transition font-medium pb-0.5 ${
            isActive('/complaints')
              ? 'text-[#1D9E75] border-b-2 border-[#1D9E75]'
              : 'text-[#1a1a2e] hover:text-[#1D9E75]'
          }`}
        >
          Complaints
        </Link>

        {/* ── Auth area ── */}
        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            {/* Avatar bubble */}
            <div className="w-9 h-9 rounded-full bg-[#1D9E75] flex items-center justify-center text-white text-xs font-bold select-none">
              {initials}
            </div>
            {/* Name */}
            <span className="text-[#1a1a2e] font-semibold text-sm hidden md:block">
              {currentUser.name}
            </span>
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="px-5 py-2 rounded-full font-semibold transition bg-[#0d1f17] text-white hover:bg-[#1D9E75]"
            >
              Logout
            </button>
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