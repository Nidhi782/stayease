import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="bg-[#0d1f17] text-[#a0d4be] py-8 px-8 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">

        {/* Brand */}
        <div>
          <p className="text-white font-bold text-lg tracking-tight">
            Stay<span className="text-[#5DCAA5]">Ease</span>
          </p>
          <p className="text-xs text-[#5DCAA5] mt-0.5">Hostel &amp; Student Management Platform</p>
        </div>

        {/* Nav links */}
        <div className="flex gap-6 text-sm">
          <Link to="/"           className="hover:text-white transition">Home</Link>
          <Link to="/dashboard"  className="hover:text-white transition">Dashboard</Link>
          <Link to="/rooms"      className="hover:text-white transition">Rooms</Link>
          <Link to="/complaints" className="hover:text-white transition">Complaints</Link>
        </div>

        {/* Copyright */}
        <p className="text-xs opacity-50">© 2025 StayEase. All rights reserved.</p>

      </div>
    </footer>
  )
}

export default Footer
