// Props: { value, onChange, placeholder, id }
function SearchBar({ value, onChange, placeholder = 'Search…', id }) {
  return (
    <div className="relative w-full max-w-sm">
      {/* Magnifying glass icon */}
      <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none select-none">
        🔍
      </span>

      <input
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full pl-9 pr-9 py-2.5 text-sm rounded-xl
          border border-gray-200 bg-[#f0faf5] text-[#1a1a2e]
          focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75]
          transition placeholder-gray-400
        "
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={() => onChange({ target: { value: '' } })}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-[#1D9E75] transition text-lg leading-none"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default SearchBar
