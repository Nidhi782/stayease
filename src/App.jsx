import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { StudentsProvider } from './context/StudentsContext'
import { RoomsProvider } from './context/RoomsContext'
import { ComplaintsProvider } from './context/ComplaintsContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Rooms from './pages/Rooms'
import Complaints from './pages/Complaints'
import AuthCallback from './pages/AuthCallback'
import MessMenu from './pages/MessMenu'
import Services from './pages/Services'
import Outpass from './pages/Outpass'
import Attendance from './pages/Attendance'
import NotFound from './pages/NotFound'

// ── Inner component so useLocation is inside BrowserRouter ──
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <div key={location.pathname} className="page-enter">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/mess" element={<MessMenu />} />
        <Route path="/services" element={<Services />} />
        <Route
          path="/complaints"
          element={
            <ProtectedRoute>
              <Complaints />
            </ProtectedRoute>
          }
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/outpass" element={<ProtectedRoute><Outpass /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <StudentsProvider>
        <RoomsProvider>
          <ComplaintsProvider>
            <BrowserRouter>
              <Navbar />
              <AnimatedRoutes />
            </BrowserRouter>
          </ComplaintsProvider>
        </RoomsProvider>
      </StudentsProvider>
    </AuthProvider>
  )
}

export default App