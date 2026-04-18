import { useState } from 'react'
import { useComplaints } from '../context/ComplaintsContext'
import Spinner from '../components/Spinner'
import ConfirmDialog from '../components/ConfirmDialog'
import SearchBar from '../components/SearchBar'
import EmptyState from '../components/EmptyState'
import Footer from '../components/Footer'

// ── Empty form ─────────────────────────────────────────────
const emptyForm = { title: '', room: '', hostel: 'Boys' }

// ── Status badge style ─────────────────────────────────────
function statusStyle(status) {
  return status === 'Open'
    ? 'bg-red-100 text-red-600'
    : 'bg-green-100 text-green-700'
}

function Complaints() {
  const { complaints, loading, error, addComplaint, resolveComplaint, deleteComplaint } = useComplaints()

  // ── Local UI state ───────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery]   = useState('')
  const [showModal, setShowModal]       = useState(false)
  const [form, setForm]                 = useState(emptyForm)
  const [formError, setFormError]       = useState('')
  const [confirmId, setConfirmId]       = useState(null) // id to delete

  // ── Derived ──────────────────────────────────────────────
  const totalCount    = complaints.length
  const openCount     = complaints.filter((c) => c.status === 'Open').length
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length

  const filtered = complaints.filter((c) => {
    const matchesFilter =
      activeFilter === 'Open'     ? c.status === 'Open' :
      activeFilter === 'Resolved' ? c.status === 'Resolved' :
      true

    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q || c.title.toLowerCase().includes(q) || c.room.toLowerCase().includes(q)

    return matchesFilter && matchesSearch
  })

  // ── Form helpers ─────────────────────────────────────────
  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setFormError('')
  }

  async function handleAddComplaint(e) {
    e.preventDefault()
    if (!form.title.trim()) { setFormError('Complaint title is required'); return }
    if (!form.room.trim())  { setFormError('Room number is required');      return }
    await addComplaint(form)
    setForm(emptyForm)
    setFormError('')
    setShowModal(false)
  }

  return (
    <div className="min-h-screen bg-[#f0faf5] flex flex-col">

      {/* ───── HEADER ───── */}
      <div className="bg-[#0d1f17] px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-white">
            Complaint <span className="text-[#5DCAA5]">Management</span>
          </h1>
          <p className="text-[#a0d4be] text-sm mt-1">
            Track and resolve hostel complaints
          </p>
        </div>
      </div>

      {/* ───── ERROR BANNER ───── */}
      {error && (
        <div className="max-w-6xl mx-auto px-8 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-5 py-3">
            ⚠️ {error}
          </div>
        </div>
      )}

      {loading ? (
        <div className="max-w-6xl mx-auto px-8">
          <Spinner />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-8 py-8">

          {/* ───── SUMMARY CARDS ───── */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-md border border-[#c8f0df] text-center">
              <p className="text-2xl font-bold text-[#1D9E75]">{totalCount}</p>
              <p className="text-sm text-[#2d4a3e] mt-1">Total</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-md border border-[#c8f0df] text-center">
              <p className="text-2xl font-bold text-red-500">{openCount}</p>
              <p className="text-sm text-[#2d4a3e] mt-1">Open</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-md border border-[#c8f0df] text-center">
              <p className="text-2xl font-bold text-green-500">{resolvedCount}</p>
              <p className="text-sm text-[#2d4a3e] mt-1">Resolved</p>
            </div>
          </div>

          {/* ───── FILTER + SEARCH BAR ───── */}
          <div className="bg-white rounded-2xl shadow-md border border-[#c8f0df] p-4 mb-6 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 flex-wrap items-center">
              {['All', 'Open', 'Resolved'].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    activeFilter === f
                      ? 'bg-[#1D9E75] text-white'
                      : 'border border-[#1D9E75] text-[#1D9E75] hover:bg-[#f0faf5]'
                  }`}
                >
                  {f === 'All' ? 'All Complaints' : f}
                </button>
              ))}
              <SearchBar
                id="complaint-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or room…"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#1D9E75] hover:bg-[#5DCAA5] text-white px-5 py-2 rounded-full text-sm font-semibold transition"
            >
              + File Complaint
            </button>
          </div>

          {/* ───── COMPLAINTS TABLE ───── */}
          <div className="bg-white rounded-2xl shadow-md border border-[#c8f0df] overflow-hidden">
            {filtered.length === 0 ? (
              <EmptyState
                icon="📋"
                title={searchQuery ? 'No complaints match your search' : 'No complaints here'}
                message={
                  searchQuery
                    ? `No results for "${searchQuery}". Try a different keyword.`
                    : activeFilter !== 'All'
                    ? `No ${activeFilter.toLowerCase()} complaints.`
                    : 'File a complaint to get started.'
                }
                actionLabel={searchQuery || activeFilter !== 'All' ? undefined : '+ File Complaint'}
                onAction={searchQuery || activeFilter !== 'All' ? undefined : () => setShowModal(true)}
              />
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#2d4a3e] border-b border-gray-100 bg-[#f7fdfb]">
                    <th className="px-6 py-4 font-semibold">Complaint</th>
                    <th className="px-4 py-4 font-semibold">Room</th>
                    <th className="px-4 py-4 font-semibold">Hostel</th>
                    <th className="px-4 py-4 font-semibold">Date</th>
                    <th className="px-4 py-4 font-semibold">Status</th>
                    <th className="px-4 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-[#f0faf5] transition">
                      <td className="px-6 py-4 font-medium text-[#1a1a2e]">{c.title}</td>
                      <td className="px-4 py-4 text-gray-500">{c.room}</td>
                      <td className="px-4 py-4 text-gray-500">{c.hostel}</td>
                      <td className="px-4 py-4 text-gray-400 text-xs">{c.date}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyle(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2 justify-end">
                          {c.status === 'Open' && (
                            <button
                              onClick={() => resolveComplaint(c.id)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 font-semibold transition"
                            >
                              ✓ Resolve
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmId(c.id)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-semibold transition"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ───── FOOTER ───── */}
      <Footer />

      {/* ───── ADD COMPLAINT MODAL ───── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
            <button
              onClick={() => { setShowModal(false); setForm(emptyForm); setFormError('') }}
              className="absolute top-5 right-5 text-gray-400 hover:text-[#1D9E75] text-xl transition"
              aria-label="Close modal"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-1">File a Complaint</h2>
            <p className="text-sm text-[#2d4a3e] mb-6">Describe the issue below.</p>

            <form onSubmit={handleAddComplaint} className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-[#1a1a2e]">Complaint Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Leaking pipe in bathroom"
                  value={form.title}
                  onChange={handleFormChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition"
                />
                {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
              </div>
              {/* Room */}
              <div>
                <label className="text-sm font-medium text-[#1a1a2e]">Room Number</label>
                <input
                  type="text"
                  name="room"
                  placeholder="e.g. A-101"
                  value={form.room}
                  onChange={handleFormChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition"
                />
              </div>
              {/* Hostel */}
              <div>
                <label className="text-sm font-medium text-[#1a1a2e]">Hostel</label>
                <select
                  name="hostel"
                  value={form.hostel}
                  onChange={handleFormChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition"
                >
                  <option value="Boys">Boys Hostel</option>
                  <option value="Girls">Girls Hostel</option>
                </select>
              </div>
              {/* Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setForm(emptyForm); setFormError('') }}
                  className="flex-1 border-2 border-[#1D9E75] text-[#1D9E75] py-3 rounded-xl font-semibold text-sm hover:bg-[#f0faf5] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1D9E75] hover:bg-[#5DCAA5] text-white py-3 rounded-xl font-semibold text-sm transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───── DELETE CONFIRM DIALOG ───── */}
      {confirmId !== null && (
        <ConfirmDialog
          message="This complaint will be permanently removed."
          onConfirm={async () => { await deleteComplaint(confirmId); setConfirmId(null) }}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  )
}

export default Complaints
