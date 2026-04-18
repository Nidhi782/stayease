import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

// ── Context ────────────────────────────────────────────────
const ComplaintsContext = createContext(null)

// ── Provider ───────────────────────────────────────────────
export function ComplaintsProvider({ children }) {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)

  // ── Fetch ────────────────────────────────────────────────
  async function fetchComplaints() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await client.get('/complaints')
      setComplaints(data)
    } catch (err) {
      console.error('Failed to fetch complaints:', err)
      setError('Could not load complaints. Is the server running?')
    } finally {
      setLoading(false)
    }
  }

  // ── Add ──────────────────────────────────────────────────
  async function addComplaint(formData) {
    const newComplaint = {
      title:  formData.title.trim(),
      room:   formData.room.trim().toUpperCase(),
      hostel: formData.hostel,
      status: 'Open',
      date:   new Date().toISOString().split('T')[0],
    }
    try {
      await client.post('/complaints', newComplaint)
      await fetchComplaints()
    } catch (err) {
      console.error('Failed to add complaint:', err)
      setError('Could not save complaint. Please try again.')
    }
  }

  // ── Resolve (toggle Open → Resolved) ────────────────────
  async function resolveComplaint(id) {
    try {
      await client.patch(`/complaints/${id}`, { status: 'Resolved' })
      await fetchComplaints()
    } catch (err) {
      console.error('Failed to resolve complaint:', err)
      setError('Could not update complaint. Please try again.')
    }
  }

  // ── Delete ───────────────────────────────────────────────
  async function deleteComplaint(id) {
    try {
      await client.delete(`/complaints/${id}`)
      await fetchComplaints()
    } catch (err) {
      console.error('Failed to delete complaint:', err)
      setError('Could not delete complaint. Please try again.')
    }
  }

  // ── Load on mount ────────────────────────────────────────
  useEffect(() => {
    fetchComplaints()
  }, [])

  return (
    <ComplaintsContext.Provider
      value={{ complaints, loading, error, addComplaint, resolveComplaint, deleteComplaint }}
    >
      {children}
    </ComplaintsContext.Provider>
  )
}

// ── Custom hook ────────────────────────────────────────────
export function useComplaints() {
  return useContext(ComplaintsContext)
}
