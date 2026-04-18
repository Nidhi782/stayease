import { useState } from 'react'
import { useRooms } from '../context/RoomsContext'
import Spinner from '../components/Spinner'
import ConfirmDialog from '../components/ConfirmDialog'
import SearchBar from '../components/SearchBar'
import EmptyState from '../components/EmptyState'
import Footer from '../components/Footer'

// ── Empty add form ─────────────────────────────────────────
const emptyForm = { number: '', type: 'Single', hostel: 'Boys', floor: '1' }

// ── All possible amenities ─────────────────────────────────
const ALL_AMENITIES = ['WiFi', 'AC', 'Fan', 'Attached Bath', 'Common Bath', 'Hot Water', 'Locker']

function Rooms() {
  const { rooms, addRoom, updateRoom, deleteRoom, roomExists, loading, error } = useRooms()

  // ── Local UI state ───────────────────────────────────────
  const [activeFilter, setActiveFilter] = useState('All')
  const [searchQuery, setSearchQuery]   = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm]                 = useState(emptyForm)
  const [formError, setFormError]       = useState('')

  // View Details modal
  const [detailRoom, setDetailRoom]     = useState(null)

  // Manage modal
  const [manageRoom, setManageRoom]     = useState(null)
  const [manageForm, setManageForm]     = useState({ occupied: 0, amenities: [] })
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  // ── Derived: filtered rooms (filter button + search) ──────
  const filteredRooms = rooms.filter((room) => {
    const matchesFilter =
      activeFilter === 'All'    ? true :
      activeFilter === 'Boys'   ? room.hostel === 'Boys' :
      activeFilter === 'Girls'  ? room.hostel === 'Girls' :
      /* Vacant */                room.status === 'Vacant'

    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q || room.number.toLowerCase().includes(q)

    return matchesFilter && matchesSearch
  })

  const totalRooms  = rooms.length
  const fullCount   = rooms.filter((r) => r.status === 'Full').length
  const availCount  = rooms.filter((r) => r.status === 'Available').length
  const vacantCount = rooms.filter((r) => r.status === 'Vacant').length

  // ── Status badge style ────────────────────────────────────
  function getStatusStyle(status) {
    if (status === 'Full')      return 'bg-red-100 text-red-600'
    if (status === 'Available') return 'bg-yellow-100 text-yellow-700'
    if (status === 'Vacant')    return 'bg-green-100 text-green-700'
  }

  // ── Add modal helpers ─────────────────────────────────────
  function handleFormChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setFormError('')
  }

  async function handleAddRoom(e) {
    e.preventDefault()
    if (!form.number.trim()) { setFormError('Room number is required'); return }
    if (roomExists(form.number)) { setFormError(`Room "${form.number}" already exists`); return }
    await addRoom(form)
    setForm(emptyForm)
    setFormError('')
    setShowAddModal(false)
  }

  // ── Manage modal helpers ──────────────────────────────────
  function openManage(room) {
    setManageRoom(room)
    setManageForm({ occupied: room.occupied, amenities: [...room.amenities] })
  }

  function toggleAmenity(a) {
    setManageForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(a)
        ? prev.amenities.filter((x) => x !== a)
        : [...prev.amenities, a],
    }))
  }

  async function handleSaveManage() {
    await updateRoom(manageRoom.id, { ...manageRoom, ...manageForm })
    setManageRoom(null)
  }

  async function handleDeleteRoom() {
    await deleteRoom(confirmDeleteId)
    setConfirmDeleteId(null)
    setManageRoom(null)
  }

  const filters = ['All', 'Boys', 'Girls', 'Vacant']

  return (
    <div className="min-h-screen bg-[#f0faf5] flex flex-col">

      {/* ───── HEADER ───── */}
      <div className="bg-[#0d1f17] px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-white">
            Room <span className="text-[#5DCAA5]">Management</span>
          </h1>
          <p className="text-[#a0d4be] text-sm mt-1">
            View and manage all hostel rooms
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-md border border-[#c8f0df] text-center">
              <p className="text-2xl font-bold text-[#1D9E75]">{totalRooms}</p>
              <p className="text-sm text-[#2d4a3e] mt-1">Total Rooms</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-md border border-[#c8f0df] text-center">
              <p className="text-2xl font-bold text-red-500">{fullCount}</p>
              <p className="text-sm text-[#2d4a3e] mt-1">Full</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-md border border-[#c8f0df] text-center">
              <p className="text-2xl font-bold text-yellow-500">{availCount}</p>
              <p className="text-sm text-[#2d4a3e] mt-1">Available</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-md border border-[#c8f0df] text-center">
              <p className="text-2xl font-bold text-green-500">{vacantCount}</p>
              <p className="text-sm text-[#2d4a3e] mt-1">Vacant</p>
            </div>
          </div>

          {/* ───── FILTER + SEARCH BAR ───── */}
          <div className="bg-white rounded-2xl shadow-md border border-[#c8f0df] p-4 mb-6 flex flex-wrap gap-3 items-center justify-between">
            <div className="flex gap-3 flex-wrap items-center">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                    activeFilter === f
                      ? 'bg-[#1D9E75] text-white'
                      : 'border border-[#1D9E75] text-[#1D9E75] hover:bg-[#f0faf5]'
                  }`}
                >
                  {f === 'All' ? 'All Rooms' : f === 'Boys' ? 'Boys Hostel' : f === 'Girls' ? 'Girls Hostel' : 'Vacant Only'}
                </button>
              ))}
              <SearchBar
                id="room-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search room number…"
              />
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#1D9E75] hover:bg-[#5DCAA5] text-white px-5 py-2 rounded-full text-sm font-semibold transition"
            >
              + Add Room
            </button>
          </div>

          {/* ───── ROOM CARDS ───── */}
          {filteredRooms.length === 0 ? (
            <EmptyState
              icon="🏠"
              title="No rooms found"
              message={searchQuery ? `No rooms match "${searchQuery}". Try a different search or filter.` : 'Try a different filter or add a new room.'}
              actionLabel={searchQuery ? undefined : '+ Add Room'}
              onAction={searchQuery ? undefined : () => setShowAddModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-2xl shadow-md border border-[#c8f0df] p-6 hover:shadow-xl transition"
                >
                  {/* Top Row */}
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-[#1a1a2e]">Room {room.number}</h3>
                      <p className="text-sm text-gray-400 mt-1">{room.type} · Floor {room.floor}</p>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusStyle(room.status)}`}>
                      {room.status}
                    </span>
                  </div>

                  {/* Hostel Badge */}
                  <div className="mt-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      room.hostel === 'Boys' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                    }`}>
                      {room.hostel} Hostel
                    </span>
                  </div>

                  {/* Occupancy Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Occupancy</span>
                      <span>{room.occupied}/{room.capacity}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-[#1D9E75] h-2 rounded-full transition-all"
                        style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {room.amenities.map((a, i) => (
                      <span key={i} className="bg-[#f0faf5] text-[#1D9E75] text-xs px-2 py-1 rounded-lg font-medium">
                        {a}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => setDetailRoom(room)}
                      className="flex-1 border border-[#1D9E75] text-[#1D9E75] py-2 rounded-xl text-sm font-semibold hover:bg-[#f0faf5] transition"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => openManage(room)}
                      className="flex-1 bg-[#1D9E75] text-white py-2 rounded-xl text-sm font-semibold hover:bg-[#5DCAA5] transition"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ───── FOOTER ───── */}
      <Footer />

      {/* ───── ADD ROOM MODAL ───── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
            <button
              onClick={() => { setShowAddModal(false); setForm(emptyForm); setFormError('') }}
              className="absolute top-5 right-5 text-gray-400 hover:text-[#1D9E75] text-xl transition"
              aria-label="Close modal"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-1">Add New Room</h2>
            <p className="text-sm text-[#2d4a3e] mb-6">Fill in the details to create a new room.</p>

            <form onSubmit={handleAddRoom} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-[#1a1a2e]">Room Number</label>
                <input type="text" name="number" placeholder="e.g. B-301" value={form.number} onChange={handleFormChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition" />
                {formError && <p className="text-red-500 text-xs mt-1">{formError}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-[#1a1a2e]">Room Type</label>
                <select name="type" value={form.type} onChange={handleFormChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition">
                  <option value="Single">Single (1 bed)</option>
                  <option value="Double">Double (2 beds)</option>
                  <option value="Triple">Triple (3 beds)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#1a1a2e]">Hostel</label>
                <select name="hostel" value={form.hostel} onChange={handleFormChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition">
                  <option value="Boys">Boys Hostel</option>
                  <option value="Girls">Girls Hostel</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[#1a1a2e]">Floor</label>
                <input type="number" name="floor" min="1" max="10" value={form.floor} onChange={handleFormChange}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition" />
              </div>
              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => { setShowAddModal(false); setForm(emptyForm); setFormError('') }}
                  className="flex-1 border-2 border-[#1D9E75] text-[#1D9E75] py-3 rounded-xl font-semibold text-sm hover:bg-[#f0faf5] transition">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-[#1D9E75] hover:bg-[#5DCAA5] text-white py-3 rounded-xl font-semibold text-sm transition">
                  Add Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───── VIEW DETAILS MODAL ───── */}
      {detailRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
            <button onClick={() => setDetailRoom(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-[#1D9E75] text-xl transition" aria-label="Close">
              ✕
            </button>
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-1">Room {detailRoom.number}</h2>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusStyle(detailRoom.status)}`}>
              {detailRoom.status}
            </span>

            <div className="mt-6 flex flex-col gap-3 text-sm">
              {[
                ['Type',     detailRoom.type],
                ['Hostel',   `${detailRoom.hostel} Hostel`],
                ['Floor',    detailRoom.floor],
                ['Capacity', detailRoom.capacity],
                ['Occupied', detailRoom.occupied],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="text-gray-400 font-medium">{label}</span>
                  <span className="text-[#1a1a2e] font-semibold">{value}</span>
                </div>
              ))}
              <div>
                <span className="text-gray-400 font-medium">Amenities</span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {detailRoom.amenities.map((a, i) => (
                    <span key={i} className="bg-[#f0faf5] text-[#1D9E75] text-xs px-2 py-1 rounded-lg font-medium">{a}</span>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => setDetailRoom(null)}
              className="w-full mt-6 bg-[#1D9E75] hover:bg-[#5DCAA5] text-white py-3 rounded-xl font-semibold text-sm transition">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ───── MANAGE MODAL ───── */}
      {manageRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative">
            <button onClick={() => setManageRoom(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-[#1D9E75] text-xl transition" aria-label="Close">
              ✕
            </button>
            <h2 className="text-xl font-bold text-[#1a1a2e] mb-1">Manage Room {manageRoom.number}</h2>
            <p className="text-sm text-[#2d4a3e] mb-6">Update occupancy and amenities.</p>

            <div className="flex flex-col gap-5">
              {/* Occupied count */}
              <div>
                <label className="text-sm font-medium text-[#1a1a2e]">
                  Occupied Beds <span className="text-gray-400 font-normal">(max {manageRoom.capacity})</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max={manageRoom.capacity}
                  value={manageForm.occupied}
                  onChange={(e) => setManageForm((prev) => ({ ...prev, occupied: Number(e.target.value) }))}
                  className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 bg-[#f0faf5] text-[#1a1a2e] text-sm focus:outline-none focus:border-[#1D9E75] focus:ring-1 focus:ring-[#1D9E75] transition"
                />
              </div>

              {/* Amenities checkboxes */}
              <div>
                <label className="text-sm font-medium text-[#1a1a2e] block mb-2">Amenities</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_AMENITIES.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                        manageForm.amenities.includes(a)
                          ? 'bg-[#1D9E75] text-white'
                          : 'bg-[#f0faf5] text-[#1D9E75] border border-[#1D9E75]'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save / Delete */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleSaveManage}
                  className="flex-1 bg-[#1D9E75] hover:bg-[#5DCAA5] text-white py-3 rounded-xl font-semibold text-sm transition"
                >
                  Save Changes
                </button>
              </div>
              <button
                onClick={() => setConfirmDeleteId(manageRoom.id)}
                className="w-full border-2 border-red-400 text-red-500 hover:bg-red-50 py-2.5 rounded-xl font-semibold text-sm transition"
              >
                🗑️ Delete This Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───── DELETE CONFIRM DIALOG ───── */}
      {confirmDeleteId !== null && (
        <ConfirmDialog
          message={`Room ${rooms.find(r => r.id === confirmDeleteId)?.number ?? ''} will be permanently deleted.`}
          onConfirm={handleDeleteRoom}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}
    </div>
  )
}

export default Rooms