import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

// ── Derive room status from occupancy ──────────────────────
function deriveStatus(occupied, capacity) {
  if (occupied >= capacity) return 'Full'
  if (occupied === 0)       return 'Vacant'
  return 'Available'
}

// ── Context ────────────────────────────────────────────────
const RoomsContext = createContext(null)

// ── Provider ───────────────────────────────────────────────
export function RoomsProvider({ children }) {
  const [rooms, setRooms]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // ── Fetch all rooms from API ─────────────────────────────
  async function fetchRooms() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await client.get('/rooms')
      setRooms(data)
    } catch (err) {
      console.error('Failed to fetch rooms:', err)
      setError('Could not load rooms. Is the server running?')
    } finally {
      setLoading(false)
    }
  }

  // ── Add ──────────────────────────────────────────────────
  async function addRoom(formData) {
    const capacity = formData.type === 'Single' ? 1 : formData.type === 'Double' ? 2 : 3
    const newRoom = {
      number:    formData.number.trim().toUpperCase(),
      type:      formData.type,
      hostel:    formData.hostel,
      floor:     Number(formData.floor),
      capacity,
      occupied:  0,
      status:    'Vacant',
      amenities: ['WiFi'],
    }
    try {
      await client.post('/rooms', newRoom)
      await fetchRooms()
    } catch (err) {
      console.error('Failed to add room:', err)
      setError('Could not save room. Please try again.')
    }
  }

  // ── Edit ─────────────────────────────────────────────────
  async function updateRoom(id, formData) {
    const occupied = Number(formData.occupied)
    const capacity = Number(formData.capacity)
    const updated = {
      occupied,
      amenities: formData.amenities,
      status:    deriveStatus(occupied, capacity),
    }
    try {
      await client.patch(`/rooms/${id}`, updated)
      await fetchRooms()
    } catch (err) {
      console.error('Failed to update room:', err)
      setError('Could not update room. Please try again.')
    }
  }

  // ── Delete ───────────────────────────────────────────────
  async function deleteRoom(id) {
    try {
      await client.delete(`/rooms/${id}`)
      await fetchRooms()
    } catch (err) {
      console.error('Failed to delete room:', err)
      setError('Could not delete room. Please try again.')
    }
  }

  // ── Duplicate check ──────────────────────────────────────
  function roomExists(number) {
    return rooms.some((r) => r.number.toLowerCase() === number.trim().toLowerCase())
  }

  // ── Load on mount ────────────────────────────────────────
  useEffect(() => {
    fetchRooms()
  }, [])

  return (
    <RoomsContext.Provider value={{ rooms, loading, error, addRoom, updateRoom, deleteRoom, roomExists }}>
      {children}
    </RoomsContext.Provider>
  )
}

// ── Custom hook ────────────────────────────────────────────
export function useRooms() {
  return useContext(RoomsContext)
}
