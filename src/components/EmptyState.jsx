// Props: { icon, title, message, actionLabel?, onAction? }
function EmptyState({ icon = '📭', title = 'Nothing here', message = '', actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="text-6xl mb-4 select-none">{icon}</div>
      <p className="text-[#1a1a2e] font-bold text-lg">{title}</p>
      {message && (
        <p className="text-gray-400 text-sm mt-1 max-w-xs">{message}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 bg-[#1D9E75] hover:bg-[#5DCAA5] text-white font-semibold px-6 py-2.5 rounded-full text-sm transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
