// ── Outpass.jsx ───────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

const STATUS_STYLES = {
  Pending:  'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800',
  Returned: 'bg-blue-100 text-blue-800',
}

export default function Outpass() {
  const { currentUser } = useAuth()
  const isWarden = currentUser?.role === 'warden_boys' || currentUser?.role === 'warden_girls'

  const [outpasses, setOutpasses]   = useState([])
  const [students, setStudents]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast]           = useState(null)

  // Form state
  const [form, setForm] = useState({
    student_id: '', reason: '', destination: '',
    departure_date: '', return_date: '',
  })

  // Admin note for approve/reject
  const [actionNote, setActionNote] = useState({})

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function loadOutpasses() {
    setLoading(true)
    try {
      const { data } = await client.get('/outpass')
      setOutpasses(data)
    } catch { /* handled below */ }
    finally { setLoading(false) }
  }

  async function loadStudents() {
    try {
      const { data } = await client.get('/students')
      setStudents(data)
    } catch { /* ignore */ }
  }

  useEffect(() => {
    loadOutpasses()
    if (isWarden) loadStudents()
  }, [isWarden])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await client.post('/outpass', form)
      showToast('Outpass request submitted successfully!')
      setForm({ student_id: '', reason: '', destination: '', departure_date: '', return_date: '' })
      loadOutpasses()
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit request', 'error')
    } finally { setSubmitting(false) }
  }

  async function handleApprove(id) {
    try {
      await client.patch(`/outpass/${id}/approve`, { admin_note: actionNote[id] || '' })
      showToast('Outpass approved!')
      loadOutpasses()
    } catch { showToast('Failed to approve', 'error') }
  }

  async function handleReject(id) {
    try {
      await client.patch(`/outpass/${id}/reject`, { admin_note: actionNote[id] || '' })
      showToast('Outpass rejected.')
      loadOutpasses()
    } catch { showToast('Failed to reject', 'error') }
  }

  async function handleReturn(id) {
    try {
      await client.patch(`/outpass/${id}/return`)
      showToast('Marked as returned! Attendance recorded ✅')
      loadOutpasses()
    } catch { showToast('Failed to mark return', 'error') }
  }

  return (
    <div className="min-h-screen bg-[#f0faf5]">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold transition-all
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#1D9E75]'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="bg-[#0d1f17] py-12 px-6 text-center">
        <p className="text-[#5DCAA5] text-sm font-semibold tracking-widest uppercase mb-2">Hostel Management</p>
        <h1 className="text-4xl font-bold text-white mb-2">🚪 Outpass System</h1>
        <p className="text-[#a0d4be] text-sm">
          {isWarden ? 'Review and manage student outpass requests' : 'Submit and track your outpass requests'}
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">

        {/* ── Submit Form (student / warden can submit on behalf) ── */}
        {!isWarden && (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-5">📝 Request Outpass</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#1a1a2e] mb-1">Destination</label>
                <input
                  required value={form.destination}
                  onChange={e => setForm(f => ({ ...f, destination: e.target.value }))}
                  placeholder="e.g. Home — New Delhi"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#1a1a2e] mb-1">Reason</label>
                <textarea
                  required value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  rows={2} placeholder="Brief reason for leaving..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1a2e] mb-1">Departure Date</label>
                <input type="date" required value={form.departure_date}
                  onChange={e => setForm(f => ({ ...f, departure_date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1a1a2e] mb-1">Expected Return Date</label>
                <input type="date" required value={form.return_date}
                  onChange={e => setForm(f => ({ ...f, return_date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                />
              </div>
              {isWarden && (
                <div>
                  <label className="block text-sm font-semibold text-[#1a1a2e] mb-1">Student</label>
                  <select required value={form.student_id}
                    onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]">
                    <option value="">Select student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} — Room {s.room}</option>)}
                  </select>
                </div>
              )}
              <div className="md:col-span-2">
                <button type="submit" disabled={submitting}
                  className="bg-[#1D9E75] hover:bg-[#0d6e52] text-white font-semibold px-8 py-2.5 rounded-xl transition disabled:opacity-60">
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Outpass List ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#1a1a2e]">
              {isWarden ? '📋 All Outpass Requests' : '📋 My Requests'}
            </h2>
            <button onClick={loadOutpasses} className="text-sm text-[#1D9E75] hover:underline">Refresh</button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-gray-400">Loading…</div>
          ) : outpasses.length === 0 ? (
            <div className="p-10 text-center text-gray-400">No outpass requests found.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {outpasses.map(op => (
                <div key={op.id} className="px-6 py-5">
                  <div className="flex flex-wrap justify-between items-start gap-3">
                    <div>
                      {isWarden && (
                        <p className="font-bold text-[#1a1a2e] text-base">{op.student_name}
                          <span className="ml-2 text-xs text-gray-400 font-normal">Room {op.room} · {op.hostel}</span>
                        </p>
                      )}
                      <p className="text-sm text-[#2d4a3e] mt-1">
                        📍 <span className="font-medium">{op.destination}</span>
                        <span className="mx-2 text-gray-300">|</span>
                        🗓 {op.departure_date} → {op.return_date}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">📝 {op.reason}</p>
                      {op.admin_note && (
                        <p className="text-xs text-gray-400 mt-1 italic">Warden note: {op.admin_note}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[op.status]}`}>
                      {op.status}
                    </span>
                  </div>

                  {/* Warden actions */}
                  {isWarden && op.status === 'Pending' && (
                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                      <input
                        placeholder="Note (optional)"
                        value={actionNote[op.id] || ''}
                        onChange={e => setActionNote(n => ({ ...n, [op.id]: e.target.value }))}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs flex-1 min-w-[180px] focus:outline-none focus:ring-1 focus:ring-[#1D9E75]"
                      />
                      <button onClick={() => handleApprove(op.id)}
                        className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition">
                        ✅ Approve
                      </button>
                      <button onClick={() => handleReject(op.id)}
                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition">
                        ❌ Reject
                      </button>
                    </div>
                  )}

                  {/* Student: mark returned */}
                  {!isWarden && op.status === 'Approved' && (
                    <button onClick={() => handleReturn(op.id)}
                      className="mt-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition">
                      🏠 I'm Back — Mark Returned
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
