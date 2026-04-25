// ── Attendance.jsx ────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'

// 🟢 Present  🔴 Absent  🟡 On-Leave (outpass)
const STATUS_CONFIG = {
  Present:   { color: 'bg-green-500',  text: 'text-green-700',  bg: 'bg-green-50',  label: 'Present',  emoji: '🟢' },
  Absent:    { color: 'bg-red-500',    text: 'text-red-700',    bg: 'bg-red-50',    label: 'Absent',   emoji: '🔴' },
  'On-Leave':{ color: 'bg-yellow-400', text: 'text-yellow-700', bg: 'bg-yellow-50', label: 'On Leave', emoji: '🟡' },
}

export default function Attendance() {
  const { currentUser } = useAuth()
  const isWarden = currentUser?.role === 'warden_boys' || currentUser?.role === 'warden_girls'
  const hostel   = currentUser?.role === 'warden_girls' ? 'Girls' : 'Boys'

  const todayStr = new Date().toISOString().split('T')[0]
  const [date, setDate]         = useState(todayStr)
  const [records, setRecords]   = useState([])
  const [changes, setChanges]   = useState({})   // { studentId: status }
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [toast, setToast]       = useState(null)
  const [viewMonth, setViewMonth] = useState(todayStr.slice(0, 7))
  const [monthData, setMonthData] = useState(null)

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Load daily attendance for warden
  async function loadDaily() {
    setLoading(true)
    setChanges({})
    try {
      const { data } = await client.get(`/attendance?date=${date}&hostel=${hostel}`)
      setRecords(data)
    } catch { showToast('Failed to load attendance', 'error') }
    finally { setLoading(false) }
  }

  // Load monthly view for student
  async function loadMonthly() {
    if (!currentUser?.id) return
    setLoading(true)
    try {
      const { data } = await client.get(`/attendance/student/${currentUser.id}?month=${viewMonth}`)
      setMonthData(data)
    } catch { showToast('Failed to load attendance', 'error') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (isWarden) loadDaily()
  }, [date, isWarden])

  useEffect(() => {
    if (!isWarden) loadMonthly()
  }, [viewMonth, isWarden])

  function toggleStatus(studentId, currentStatus, onOutpass) {
    if (onOutpass) return   // auto On-Leave, can't change
    const cycle = { Absent: 'Present', Present: 'On-Leave', 'On-Leave': 'Absent' }
    const next   = cycle[changes[studentId] || currentStatus] || 'Present'
    setChanges(c => ({ ...c, [studentId]: next }))
  }

  async function saveAttendance() {
    setSaving(true)
    const bulkRecords = records.map(r => ({
      student_id: r.id,
      status:     changes[r.id] || (r.on_outpass ? 'On-Leave' : r.status),
    }))
    try {
      await client.post('/attendance/bulk', { date, records: bulkRecords })
      showToast(`Attendance saved for ${records.length} students ✅`)
      loadDaily()
    } catch { showToast('Failed to save attendance', 'error') }
    finally { setSaving(false) }
  }

  const summary = {
    present:  records.filter(r => (changes[r.id] || r.status) === 'Present').length,
    absent:   records.filter(r => (changes[r.id] || r.status) === 'Absent').length,
    onLeave:  records.filter(r => r.on_outpass || (changes[r.id] || r.status) === 'On-Leave').length,
  }

  // ── WARDEN VIEW ──────────────────────────────────────────────────────────────
  if (isWarden) return (
    <div className="min-h-screen bg-[#f0faf5]">
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-semibold
          ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#1D9E75]'}`}>
          {toast.msg}
        </div>
      )}

      <div className="bg-[#0d1f17] py-12 px-6 text-center">
        <p className="text-[#5DCAA5] text-sm font-semibold tracking-widest uppercase mb-2">{hostel} Hostel</p>
        <h1 className="text-4xl font-bold text-white mb-2">📋 Daily Attendance</h1>
        <p className="text-[#a0d4be] text-sm">Mark and save today's roll call</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">

        {/* Controls */}
        <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-[#1a1a2e]">Date:</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} max={todayStr}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
          </div>

          {/* Summary pills */}
          <div className="flex gap-3 text-sm font-semibold">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">🟢 {summary.present} Present</span>
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">🔴 {summary.absent} Absent</span>
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">🟡 {summary.onLeave} On Leave</span>
          </div>
        </div>

        {/* Legend */}
        <p className="text-xs text-gray-400 mb-4">Click a student's status to cycle: 🟢 Present → 🟡 On-Leave → 🔴 Absent. Students on outpass are auto-marked 🟡.</p>

        {/* Student grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {records.map(r => {
              const currentStatus = r.on_outpass ? 'On-Leave' : (changes[r.id] || r.status || 'Absent')
              const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.Absent
              return (
                <button key={r.id} onClick={() => toggleStatus(r.id, r.status, r.on_outpass)}
                  className={`${cfg.bg} border-2 ${r.on_outpass ? 'border-yellow-300' : 'border-transparent'} 
                    rounded-2xl p-4 text-left transition hover:shadow-md ${r.on_outpass ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-[#1a1a2e] text-sm">{r.name}</p>
                      <p className="text-xs text-gray-500">Room {r.room}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full ${cfg.color} flex items-center justify-center text-white text-xs font-bold`}>
                      {currentStatus === 'Present' ? '✓' : currentStatus === 'On-Leave' ? '✈' : '✗'}
                    </div>
                  </div>
                  <p className={`text-xs font-semibold mt-2 ${cfg.text}`}>
                    {cfg.emoji} {cfg.label} {r.on_outpass ? '(Outpass)' : ''}
                  </p>
                </button>
              )
            })}
          </div>
        )}

        {records.length > 0 && (
          <button onClick={saveAttendance} disabled={saving}
            className="w-full bg-[#1D9E75] hover:bg-[#0d6e52] text-white font-bold py-3 rounded-2xl transition disabled:opacity-60">
            {saving ? 'Saving…' : `💾 Save Attendance for ${date}`}
          </button>
        )}
      </div>
    </div>
  )

  // ── STUDENT VIEW ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0faf5]">
      <div className="bg-[#0d1f17] py-12 px-6 text-center">
        <p className="text-[#5DCAA5] text-sm font-semibold tracking-widest uppercase mb-2">My Record</p>
        <h1 className="text-4xl font-bold text-white mb-2">📊 My Attendance</h1>
        <p className="text-[#a0d4be] text-sm">View your monthly attendance summary</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Month picker */}
        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm font-semibold text-[#1a1a2e]">Month:</label>
          <input type="month" value={viewMonth} onChange={e => setViewMonth(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]" />
        </div>

        {loading ? <div className="text-center py-16 text-gray-400">Loading…</div> : monthData && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Present', val: monthData.summary.present, cfg: STATUS_CONFIG.Present },
                { label: 'Absent',  val: monthData.summary.absent,  cfg: STATUS_CONFIG.Absent },
                { label: 'On Leave',val: monthData.summary.onLeave, cfg: STATUS_CONFIG['On-Leave'] },
              ].map(s => (
                <div key={s.label} className={`${s.cfg.bg} rounded-2xl p-5 text-center`}>
                  <p className={`text-3xl font-extrabold ${s.cfg.text}`}>{s.val}</p>
                  <p className="text-sm text-gray-500 mt-1">{s.cfg.emoji} {s.label}</p>
                </div>
              ))}
            </div>

            {/* Daily records */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {monthData.records.length === 0 ? (
                <p className="text-center text-gray-400 py-10">No records for this month.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-[#0d1f17] text-white">
                    <tr>
                      <th className="py-3 px-5 text-left">Date</th>
                      <th className="py-3 px-5 text-left">Status</th>
                      <th className="py-3 px-5 text-left">Marked By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthData.records.map((r, i) => {
                      const cfg = STATUS_CONFIG[r.status] || STATUS_CONFIG.Absent
                      return (
                        <tr key={r.date} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="py-3 px-5 text-[#1a1a2e] font-medium">{r.date}</td>
                          <td className="py-3 px-5">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
                              {cfg.emoji} {cfg.label}
                            </span>
                          </td>
                          <td className="py-3 px-5 text-gray-500 text-xs">{r.marked_by}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
