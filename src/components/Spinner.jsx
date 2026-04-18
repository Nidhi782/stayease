// ── Spinner ────────────────────────────────────────────────────
// Reusable loading indicator used while API calls are in-flight.
export default function Spinner() {
  return (
    <div className="flex flex-col justify-center items-center py-16 gap-4">
      <div className="w-10 h-10 border-4 border-[#1D9E75] border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-[#2d4a3e] opacity-60 font-medium">Loading…</p>
    </div>
  )
}
