import { useEffect, useState } from 'react'

// type: 'success' | 'error' | 'info'
const CONFIG = {
  success: { icon: '✅', bg: 'bg-[#0d1f17]', border: 'border-[#1D9E75]', text: 'text-white' },
  error:   { icon: '❌', bg: 'bg-red-900',    border: 'border-red-500',    text: 'text-white' },
  info:    { icon: 'ℹ️', bg: 'bg-[#0d1f17]',  border: 'border-blue-400',   text: 'text-white' },
}

function Toast({ message, type = 'success' }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) { setVisible(false); return }
    setVisible(true)
  }, [message])

  if (!message) return null

  const { icon, bg, border, text } = CONFIG[type] ?? CONFIG.success

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]
        flex items-center gap-3
        ${bg} ${text} border ${border}
        px-6 py-3 rounded-full shadow-2xl text-sm font-medium
        transition-all duration-300
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
      role="status"
      aria-live="polite"
    >
      <span>{icon}</span>
      <span>{message}</span>
    </div>
  )
}

export default Toast
