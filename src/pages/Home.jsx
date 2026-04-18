import { Link } from 'react-router-dom'
import logo from '../assets/stayease_logo_light_clean.svg'

function Home() {
  return (
    <div className="min-h-screen bg-[#f0faf5]">

      {/* ───── HERO SECTION ───── */}
      <section className="bg-[#0d1f17] text-white py-20 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12">
          
          {/* Left Side - Text */}
          <div className="flex-1">
            <span className="bg-[#1D9E75] text-white text-xs font-semibold px-4 py-1 rounded-full tracking-widest uppercase">
              Hostel & Student Management
            </span>
            <h1 className="text-5xl font-bold mt-6 leading-tight">
              Manage Your Hostel <br />
              <span className="text-[#5DCAA5]">The Smart Way</span>
            </h1>
            <p className="text-[#a0d4be] mt-4 text-lg leading-relaxed">
              StayEase helps hostel admins and students manage rooms, fees, 
              complaints and more — all in one place.
            </p>
            <div className="flex gap-4 mt-8">
              <Link
                to="/signup"
                className="bg-[#1D9E75] hover:bg-[#5DCAA5] text-white font-semibold px-8 py-3 rounded-full transition">
                Get Started
              </Link>
              <Link
                to="/login"
                className="border border-[#1D9E75] text-[#5DCAA5] hover:bg-[#1a3d30] font-semibold px-8 py-3 rounded-full transition">
                Login
              </Link>
            </div>
          </div>

          {/* Right Side - Logo / Visual */}
          <div className="flex-1 flex justify-center">
            <div className="bg-[#1a3d30] rounded-2xl p-8 shadow-2xl">
              <img src={logo} alt="StayEase" className="w-80" />
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="bg-[#0d1f17] rounded-xl p-4 text-center">
                  <p className="text-[#5DCAA5] text-2xl font-bold">120+</p>
                  <p className="text-[#a0d4be] text-xs mt-1">Rooms Managed</p>
                </div>
                <div className="bg-[#0d1f17] rounded-xl p-4 text-center">
                  <p className="text-[#5DCAA5] text-2xl font-bold">500+</p>
                  <p className="text-[#a0d4be] text-xs mt-1">Students</p>
                </div>
                <div className="bg-[#0d1f17] rounded-xl p-4 text-center">
                  <p className="text-[#5DCAA5] text-2xl font-bold">98%</p>
                  <p className="text-[#a0d4be] text-xs mt-1">Satisfaction</p>
                </div>
                <div className="bg-[#0d1f17] rounded-xl p-4 text-center">
                  <p className="text-[#5DCAA5] text-2xl font-bold">24/7</p>
                  <p className="text-[#a0d4be] text-xs mt-1">Support</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ───── FEATURES SECTION ───── */}
      <section className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1a1a2e]">
              Everything You Need
            </h2>
            <p className="text-[#2d4a3e] mt-3 text-base">
              Powerful features built for hostel admins and students
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition border border-[#c8f0df]">
              <div className="bg-[#f0faf5] w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4">
                🏠
              </div>
              <h3 className="text-[#1a1a2e] font-bold text-lg">Room Management</h3>
              <p className="text-[#2d4a3e] mt-2 text-sm leading-relaxed">
                Easily manage room allocations, availability, and assignments for boys and girls hostels.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition border border-[#c8f0df]">
              <div className="bg-[#f0faf5] w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4">
                👨‍🎓
              </div>
              <h3 className="text-[#1a1a2e] font-bold text-lg">Student Records</h3>
              <p className="text-[#2d4a3e] mt-2 text-sm leading-relaxed">
                Maintain complete student profiles, documents, and contact information in one place.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition border border-[#c8f0df]">
              <div className="bg-[#f0faf5] w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4">
                💰
              </div>
              <h3 className="text-[#1a1a2e] font-bold text-lg">Fee Tracking</h3>
              <p className="text-[#2d4a3e] mt-2 text-sm leading-relaxed">
                Track fee payments, send reminders, and generate payment reports automatically.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition border border-[#c8f0df]">
              <div className="bg-[#f0faf5] w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4">
                📋
              </div>
              <h3 className="text-[#1a1a2e] font-bold text-lg">Complaint System</h3>
              <p className="text-[#2d4a3e] mt-2 text-sm leading-relaxed">
                Students can raise complaints online. Admins can track and resolve them efficiently.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition border border-[#c8f0df]">
              <div className="bg-[#f0faf5] w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4">
                📊
              </div>
              <h3 className="text-[#1a1a2e] font-bold text-lg">Dashboard & Reports</h3>
              <p className="text-[#2d4a3e] mt-2 text-sm leading-relaxed">
                Get a bird's eye view of your hostel with stats, charts and detailed reports.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition border border-[#c8f0df]">
              <div className="bg-[#f0faf5] w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4">
                🔐
              </div>
              <h3 className="text-[#1a1a2e] font-bold text-lg">Role Based Access</h3>
              <p className="text-[#2d4a3e] mt-2 text-sm leading-relaxed">
                Separate dashboards and permissions for Admins and Students using secure JWT login.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ───── CTA SECTION ───── */}
      <section className="bg-[#1D9E75] py-16 px-8 text-center">
        <h2 className="text-3xl font-bold text-white">
          Ready to simplify your hostel management?
        </h2>
        <p className="text-white opacity-80 mt-3 text-base">
          Join hundreds of hostels already using StayEase
        </p>
        <Link
          to="/signup"
          className="inline-block mt-8 bg-white text-[#1D9E75] font-bold px-10 py-3 rounded-full hover:bg-[#f0faf5] transition">
          Create Free Account
        </Link>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="bg-[#0d1f17] text-[#a0d4be] py-10 px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <img src={logo} alt="StayEase" className="h-10 w-auto mb-2" />
            <p className="text-xs text-[#5DCAA5]">Hostel & Student Management Platform</p>
          </div>
          <div className="flex gap-8 text-sm">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link to="/rooms" className="hover:text-white transition">Rooms</Link>
            <Link to="/login" className="hover:text-white transition">Login</Link>
          </div>
          <p className="text-xs opacity-50">© 2025 StayEase. All rights reserved.</p>
        </div>
      </footer>

    </div>
  )
}

export default Home