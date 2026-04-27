import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useStudents } from '../context/StudentsContext'
import { useRooms } from '../context/RoomsContext'
import { useComplaints } from '../context/ComplaintsContext'
import Spinner from '../components/Spinner'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import SearchBar from '../components/SearchBar'
import EmptyState from '../components/EmptyState'
import Footer from '../components/Footer'

const PAGE_SIZE = 5

const ROOM_FEES = {
  'Double AC':     145000,
  'Double Non-AC': 130000,
  'Triple AC':     135000,
  'Triple Non-AC': 115000,
}

function installments(fee) {
  const inst = Math.round(fee / 3)
  return [
    { label: 'Installment 1 (Day 1)',                   amount: inst },
    { label: 'Installment 2 (Day 46)',                  amount: inst },
    { label: 'Installment 3 (Day 91) −₹10k pre-booking', amount: inst - 10000 },
  ]
}

function daysRemaining(dateStr) {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000)
  return diff
}

function Dashboard() {
  const navigate = useNavigate()

  // ── Context ──────────────────────────────────────────────
  const { currentUser } = useAuth()
  const { students, addStudent, updateStudent, deleteStudent, loading: studentsLoading, error: studentsError } = useStudents()
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms()
  const { complaints, loading: complaintsLoading, error: complaintsError } = useComplaints()

  const isLoading = studentsLoading || roomsLoading || complaintsLoading
  const apiError  = studentsError || roomsError || complaintsError

  // ── Local UI state ───────────────────────────────────────
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [studentForm, setStudentForm] = useState({
    name: '', room: '', hostel: 'Boys', feeStatus: 'Paid',
    parent_name: '', parent_phone: '', parent_email: '',
    parent2_name: '', parent2_phone: '',
    college_name: '', college_year: '1st Year',
    session_start: '', session_end: '', total_fee: 135000, plan: '3-Installment',
  })
  const [editingStudent, setEditingStudent]   = useState(null)
  const [formError, setFormError]             = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [expandedId, setExpandedId]           = useState(null)

  // Search & pagination
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Toast
  const [toast, setToast]     = useState('')
  const [toastType, setToastType] = useState('success')

  // ── Derived stats ─────────────────────────────────────────
  const totalStudents  = students.length
  const boysCount      = students.filter((s) => s.hostel === 'Boys').length
  const girlsCount     = students.filter((s) => s.hostel === 'Girls').length
  const paidCount      = students.filter((s) => s.feeStatus === 'Paid').length
  const pendingCount   = students.filter((s) => s.feeStatus !== 'Paid').length
  const totalComplaints   = complaints.length
  const openComplaints    = complaints.filter((c) => c.status === 'Open').length

  // ── Search + pagination pipeline ─────────────────────────
  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return students
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.room.toLowerCase().includes(q) ||
        s.hostel.toLowerCase().includes(q)
    )
  }, [students, searchQuery])

  const pagedStudents  = filteredStudents.slice(0, currentPage * PAGE_SIZE)
  const hasMore        = pagedStudents.length < filteredStudents.length

  function handleSearchChange(e) {
    setSearchQuery(e.target.value)
    setCurrentPage(1) // reset page every time query changes
  }

  // ── Fee badge style ───────────────────────────────────────
  function feeStyle(status) {
    if (status === 'Paid')    return 'bg-green-100 text-green-700'
    if (status === 'Pending') return 'bg-red-100 text-red-600'
    return 'bg-yellow-100 text-yellow-700'
  }

  // ── Form helpers ──────────────────────────────────────────
  function handleFormChange(e) {
    setStudentForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setFormError('')
  }

  function openAddModal() {
    setEditingStudent(null)
    setStudentForm({
      name: '', room: '', hostel: 'Boys', feeStatus: 'Paid',
      parent_name: '', parent_phone: '', parent_email: '',
      parent2_name: '', parent2_phone: '',
      college_name: '', college_year: '1st Year',
      session_start: '', session_end: '', total_fee: 135000, plan: '3-Installment',
    })
    setFormError('')
    setShowStudentModal(true)
  }

  function openEditModal(student) {
    setEditingStudent(student)
    setStudentForm({
      name: student.name, room: student.room, hostel: student.hostel, feeStatus: student.feeStatus,
      parent_name:   student.parent_name   || '',
      parent_phone:  student.parent_phone  || '',
      parent_email:  student.parent_email  || '',
      parent2_name:  student.parent2_name  || '',
      parent2_phone: student.parent2_phone || '',
      college_name:  student.college_name  || '',
      college_year:  student.college_year  || '1st Year',
      session_start: student.session_start || '',
      session_end:   student.session_end   || '',
      total_fee:     student.total_fee     || 135000,
      plan:          student.plan          || '3-Installment',
    })
    setFormError('')
    setShowStudentModal(true)
  }

  async function handleSubmitStudent(e) {
    e.preventDefault()
    if (!studentForm.name.trim()) { setFormError('Name is required');        return }
    if (!studentForm.room.trim()) { setFormError('Room number is required'); return }

    if (editingStudent) {
      await updateStudent(editingStudent.id, studentForm)
      showToast('Student updated!', 'success')
    } else {
      await addStudent(studentForm)
      showToast('Student added!', 'success')
    }
    closeStudentModal()
  }

  function closeStudentModal() {
    setShowStudentModal(false)
    setEditingStudent(null)
    setStudentForm({
      name: '', room: '', hostel: 'Boys', feeStatus: 'Paid',
      parent_name: '', parent_phone: '', parent_email: '',
      parent2_name: '', parent2_phone: '',
      college_name: '', college_year: '1st Year',
      session_start: '', session_end: '', total_fee: 135000, plan: '3-Installment',
    })
    setFormError('')
  }

  // ── Toast notification ────────────────────────────────────
  function showToast(msg, type = 'success') {
    setToast(msg)
    setToastType(type)
    setTimeout(() => setToast(''), 2600)
  }

  return (
    <div className="min-h-screen bg-[#f0faf5] flex flex-col">

      {/* ───── TOP HEADER ───── */}
      <div className="bg-[#0d1f17] px-8 py-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, <span className="text-[#5DCAA5]">{currentUser?.name ?? 'Admin'}</span> 👋
            </h1>
            <p className="text-[#a0d4be] text-sm mt-1">
              Here's what's happening in your hostel today
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1D9E75] flex items-center justify-center text-white font-bold">
              {currentUser?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{currentUser?.name ?? 'Admin'}</p>
              <p className="text-[#a0d4be] text-xs">{currentUser?.email ?? 'admin@stayease.com'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ───── ERROR BANNER ───── */}
      {apiError && (
        <div className="max-w-6xl mx-auto px-8 pt-4 w-full">
          <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-5 py-3">
            <span>⚠️ {apiError}</span>
          </div>
        </div>
      )}

      {/* ───── LOADING SPINNER ───── */}
      {isLoading && (
        <div className="max-w-6xl mx-auto px-8 w-full">
          <Spinner />
        </div>
      )}

      {!isLoading && <div className="max-w-6xl mx-auto px-8 py-8 flex-1 w-full">

        {/* ───── STATS CARDS ───── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">

          <div className="bg-white rounded-2xl p-6 shadow-md border border-[#c8f0df]">
            <div className="text-3xl mb-2">🏠</div>
            <p className="text-3xl font-bold text-[#1D9E75]">{rooms.length}</p>
            <p className="text-[#2d4a3e] text-sm mt-1 font-medium">Total Rooms</p>
            <p className="text-xs text-gray-400 mt-1">{rooms.filter(r => r.status === 'Vacant').length} vacant</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-[#c8f0df]">
            <div className="text-3xl mb-2">👨‍🎓</div>
            <p className="text-3xl font-bold text-[#1D9E75]">{totalStudents}</p>
            <p className="text-[#2d4a3e] text-sm mt-1 font-medium">Total Students</p>
            <p className="text-xs text-gray-400 mt-1">{boysCount} boys · {girlsCount} girls</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-[#c8f0df]">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-3xl font-bold text-[#1D9E75]">{paidCount}</p>
            <p className="text-[#2d4a3e] text-sm mt-1 font-medium">Fees Paid</p>
            <p className="text-xs text-gray-400 mt-1">{pendingCount} pending / partial</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-md border border-[#c8f0df]">
            <div className="text-3xl mb-2">📋</div>
            <p className="text-3xl font-bold text-[#1D9E75]">{totalComplaints}</p>
            <p className="text-[#2d4a3e] text-sm mt-1 font-medium">Complaints</p>
            <p className="text-xs text-gray-400 mt-1">{openComplaints} unresolved</p>
          </div>

        </div>

        {/* ───── MAIN CONTENT ───── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

          {/* Recent Students Table */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-md border border-[#c8f0df] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[#1a1a2e] font-bold text-lg">
                Recent Students
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({filteredStudents.length === totalStudents
                    ? `${totalStudents} total`
                    : `${filteredStudents.length} of ${totalStudents}`})
                </span>
              </h2>
              <Link to="/rooms" className="text-[#1D9E75] text-sm font-semibold hover:underline">
                View All
              </Link>
            </div>

            {/* Search bar */}
            <div className="mb-4">
              <SearchBar
                id="student-search"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search by name, room or hostel…"
              />
            </div>

            {/* No students at all */}
            {totalStudents === 0 ? (
              <EmptyState
                icon="👨‍🎓"
                title="No students yet"
                message="Add your first student to get started."
                actionLabel="+ Add Student"
                onAction={openAddModal}
              />
            ) : filteredStudents.length === 0 ? (
              /* Search returned nothing */
              <EmptyState
                icon="🔍"
                title="No students match your search"
                message={`No results for "${searchQuery}". Try a different keyword.`}
              />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[#2d4a3e] border-b border-gray-100">
                        <th className="pb-3 font-semibold">Name</th>
                        <th className="pb-3 font-semibold">Room</th>
                        <th className="pb-3 font-semibold">Hostel</th>
                        <th className="pb-3 font-semibold">Fee Status</th>
                        <th className="pb-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {pagedStudents.map((student) => {
                        const isExpanded = expandedId === student.id
                        const days = daysRemaining(student.session_end)
                        const instList = installments(student.total_fee || 135000)
                        return (
                          <>
                            <tr
                              key={student.id}
                              className="hover:bg-[#f0faf5] transition cursor-pointer"
                              onClick={() => setExpandedId(isExpanded ? null : student.id)}
                            >
                              <td className="py-3 font-medium text-[#1a1a2e]">
                                <div className="flex items-center gap-2">
                                  <span>{student.name}</span>
                                  {days !== null && days <= 10 && days >= 0 && (
                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">⚠️ {days}d left</span>
                                  )}
                                </div>
                                {student.college_name && <p className="text-xs text-gray-400">{student.college_name} · {student.college_year}</p>}
                              </td>
                              <td className="py-3 text-gray-500">{student.room}</td>
                              <td className="py-3 text-gray-500">{student.hostel}</td>
                              <td className="py-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${feeStyle(student.feeStatus)}`}>
                                  {student.feeStatus}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="flex gap-2 justify-end">
                                  <button onClick={e => { e.stopPropagation(); openEditModal(student) }}
                                    className="text-xs px-2.5 py-1 rounded-lg bg-[#f0faf5] text-[#1D9E75] hover:bg-[#c8f0df] font-semibold transition">
                                    ✏️ Edit
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); setDeleteConfirmId(student.id) }}
                                    className="text-xs px-2.5 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-semibold transition">
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* ── Expanded detail row ── */}
                            {isExpanded && (
                              <tr key={`${student.id}-detail`} className="bg-[#f0faf5]">
                                <td colSpan={5} className="px-4 pb-4 pt-2">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">

                                    {/* Session */}
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                      <p className="font-bold text-[#1a1a2e] mb-2">📅 Session</p>
                                      <p className="text-gray-500">Start: <span className="font-semibold text-[#1a1a2e]">{student.session_start || '—'}</span></p>
                                      <p className="text-gray-500">End: <span className={`font-semibold ${days !== null && days <= 10 ? 'text-red-500' : 'text-[#1a1a2e]'}`}>{student.session_end || '—'}</span></p>
                                      {days !== null && <p className={`text-xs mt-1 font-semibold ${days <= 10 ? 'text-red-500' : 'text-green-600'}`}>{days > 0 ? `${days} days remaining` : 'Session expired'}</p>}
                                      <p className="text-gray-500 mt-1">Plan: <span className="font-semibold text-[#1a1a2e]">{student.plan || '3-Installment'}</span></p>
                                    </div>

                                    {/* Installments */}
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                      <p className="font-bold text-[#1a1a2e] mb-2">💰 Fee: ₹{(student.total_fee || 135000).toLocaleString('en-IN')}</p>
                                      {instList.map((inst, i) => (
                                        <div key={i} className="flex justify-between text-xs mb-1">
                                          <span className="text-gray-500">Inst. {i + 1}</span>
                                          <span className="font-semibold text-[#1a1a2e]">₹{inst.amount.toLocaleString('en-IN')}</span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Parent + College */}
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                      <p className="font-bold text-[#1a1a2e] mb-2">👨‍👩‍👧 Parent & College</p>
                                      {student.parent_name && <p className="text-gray-500 text-xs">Parent 1: <span className="font-semibold text-[#1a1a2e]">{student.parent_name}</span> {student.parent_phone && `· ${student.parent_phone}`}</p>}
                                      {student.parent2_name && <p className="text-gray-500 text-xs">Parent 2: <span className="font-semibold text-[#1a1a2e]">{student.parent2_name}</span> {student.parent2_phone && `· ${student.parent2_phone}`}</p>}
                                      {student.college_name && <p className="text-gray-500 text-xs mt-1">🏫 {student.college_name}</p>}
                                      {student.college_year && <p className="text-gray-500 text-xs">📚 {student.college_year}</p>}
                                      {!student.parent_name && !student.college_name && <p className="text-gray-400 text-xs">No details added yet</p>}
                                    </div>

                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      className="text-sm text-[#1D9E75] font-semibold hover:underline"
                    >
                      Load More ({filteredStudents.length - pagedStudents.length} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Side Panel */}
          <div className="flex flex-col gap-6">

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-md border border-[#c8f0df] p-6">
              <h2 className="text-[#1a1a2e] font-bold text-lg mb-4">Quick Actions</h2>
              <div className="flex flex-col gap-3">
                <button
                  onClick={openAddModal}
                  className="w-full bg-[#1D9E75] hover:bg-[#5DCAA5] text-white font-semibold py-2 px-4 rounded-xl text-sm transition"
                >
                  + Add Student
                </button>
                <button
                  onClick={() => navigate('/rooms')}
                  className="w-full border-2 border-[#1D9E75] text-[#1D9E75] hover:bg-[#f0faf5] font-semibold py-2 px-4 rounded-xl text-sm transition"
                >
                  + Add Room
                </button>
                <button
                  onClick={() => navigate('/complaints')}
                  className="w-full border-2 border-[#1D9E75] text-[#1D9E75] hover:bg-[#f0faf5] font-semibold py-2 px-4 rounded-xl text-sm transition"
                >
                  View Complaints
                </button>
              </div>
            </div>

            {/* Hostel Overview */}
            <div className="bg-white rounded-2xl shadow-md border border-[#c8f0df] p-6">
              <h2 className="text-[#1a1a2e] font-bold text-lg mb-4">Hostel Overview</h2>
              <div className="flex flex-col gap-3">
                {/* Girls */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#1D9E75]"></div>
                    <span className="text-sm text-[#2d4a3e]">Girls Hostel</span>
                  </div>
                  <span className="text-sm font-bold text-[#1a1a2e]">{girlsCount} students</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-[#1D9E75] h-2 rounded-full transition-all"
                    style={{ width: totalStudents > 0 ? `${(girlsCount / totalStudents) * 100}%` : '0%' }}
                  />
                </div>

                {/* Boys */}
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#185FA5]"></div>
                    <span className="text-sm text-[#2d4a3e]">Boys Hostel</span>
                  </div>
                  <span className="text-sm font-bold text-[#1a1a2e]">{boysCount} students</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-[#185FA5] h-2 rounded-full transition-all"
                    style={{ width: totalStudents > 0 ? `${(boysCount / totalStudents) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>}

      {/* ───── FOOTER ───── */}
      <Footer />

      {/* ───── ADD / EDIT STUDENT MODAL ───── */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">

            <button
              onClick={closeStudentModal}
              className="absolute top-5 right-5 text-gray-400 hover:text-[#1D9E75] text-xl transition"
              aria-label="Close modal"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold text-[#1a1a2e] mb-1">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h2>
            <p className="text-sm text-[#2d4a3e] mb-6">
              {editingStudent ? 'Update the student details below.' : 'Fill in the student details below.'}
            </p>

            <form onSubmit={handleSubmitStudent} className="flex flex-col gap-4">

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-[#1a1a2e]">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Aisha Khan"
                  value={studentForm.name}
                  onChange={handleFormChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition"
                />
              </div>

              {/* Room */}
              <div>
                <label className="text-sm font-medium text-[#1a1a2e]">Room Number</label>
                <input
                  type="text"
                  name="room"
                  placeholder="e.g. A-105"
                  value={studentForm.room}
                  onChange={handleFormChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition"
                />
                {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
              </div>

              {/* Hostel */}
              <div>
                <label className="text-sm font-medium text-[#1a1a2e]">Hostel</label>
                <select
                  name="hostel"
                  value={studentForm.hostel}
                  onChange={handleFormChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition"
                >
                  <option value="Boys">Boys Hostel</option>
                  <option value="Girls">Girls Hostel</option>
                </select>
              </div>

              {/* Fee Status */}
              <div>
                <label className="text-sm font-medium text-[#1a1a2e]">Fee Status</label>
                <select
                  name="feeStatus"
                  value={studentForm.feeStatus}
                  onChange={handleFormChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={closeStudentModal}
                  className="flex-1 border-2 border-[#1D9E75] text-[#1D9E75] py-3 rounded-xl font-semibold text-sm hover:bg-[#f0faf5] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#1D9E75] hover:bg-[#5DCAA5] text-white py-3 rounded-xl font-semibold text-sm transition"
                >
                  {editingStudent ? 'Save Changes' : 'Add Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───── DELETE CONFIRM DIALOG ───── */}
      {deleteConfirmId !== null && (
        <ConfirmDialog
          message="This student will be permanently removed from the system."
          onConfirm={async () => { await deleteStudent(deleteConfirmId); setDeleteConfirmId(null); showToast('Student deleted', 'error') }}
          onCancel={() => setDeleteConfirmId(null)}
        />
      )}

      {/* ───── TOAST NOTIFICATION ───── */}
      <Toast message={toast} type={toastType} />

    </div>
  )
}

export default Dashboard