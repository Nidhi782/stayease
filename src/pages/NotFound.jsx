import { useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#f0faf5] flex flex-col">

      {/* Dark header strip */}
      <div className="bg-[#0d1f17] px-8 py-5">
        <p className="text-white font-bold text-lg tracking-tight">
          Stay<span className="text-[#5DCAA5]">Ease</span>
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-20">
        <p className="text-[120px] font-black text-[#1D9E75] leading-none select-none">404</p>
        <h1 className="text-2xl font-bold text-[#1a1a2e] mt-4">Page Not Found</h1>
        <p className="text-gray-400 mt-2 text-sm max-w-sm">
          The page you're looking for doesn't exist or may have been moved.
        </p>

        <div className="flex gap-4 mt-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-[#1D9E75] hover:bg-[#5DCAA5] text-white font-semibold px-7 py-3 rounded-full transition text-sm"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/')}
            className="border-2 border-[#1D9E75] text-[#1D9E75] hover:bg-[#f0faf5] font-semibold px-7 py-3 rounded-full transition text-sm"
          >
            Go Home
          </button>
        </div>
      </div>

    </div>
  )
}

export default NotFound
