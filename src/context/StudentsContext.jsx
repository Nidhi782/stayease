import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'
import { useAuth } from './AuthContext'

// ── Context ────────────────────────────────────────────────
const StudentsContext = createContext(null)

// ── Provider ───────────────────────────────────────────────
export function StudentsProvider({ children }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const { isLoggedIn }          = useAuth()

  // ── Fetch all students from API ──────────────────────────
  async function fetchStudents() {
    setLoading(true)
    setError(null)
    try {
      const { data } = await client.get('/students')
      setStudents(data)
    } catch (err) {
      console.error('Failed to fetch students:', err)
      setError('Could not load students. Is the server running?')
    } finally {
      setLoading(false)
    }
  }

  // ── Add ──────────────────────────────────────────────────
  async function addStudent(studentData) {
    const newStudent = {
      name:      studentData.name.trim(),
      room:      studentData.room.trim().toUpperCase(),
      hostel:    studentData.hostel,
      feeStatus: studentData.feeStatus,
    }
    try {
      await client.post('/students', newStudent)
      await fetchStudents()
    } catch (err) {
      console.error('Failed to add student:', err)
      setError('Could not save student. Please try again.')
    }
  }

  // ── Edit ─────────────────────────────────────────────────
  async function updateStudent(id, studentData) {
    const updated = {
      name:      studentData.name.trim(),
      room:      studentData.room.trim().toUpperCase(),
      hostel:    studentData.hostel,
      feeStatus: studentData.feeStatus,
    }
    try {
      await client.patch(`/students/${id}`, updated)
      await fetchStudents()
    } catch (err) {
      console.error('Failed to update student:', err)
      setError('Could not update student. Please try again.')
    }
  }

  // ── Delete ───────────────────────────────────────────────
  async function deleteStudent(id) {
    try {
      await client.delete(`/students/${id}`)
      await fetchStudents()
    } catch (err) {
      console.error('Failed to delete student:', err)
      setError('Could not delete student. Please try again.')
    }
  }

  // ── Load when user logs in ───────────────────────────────
  useEffect(() => {
    if (isLoggedIn) fetchStudents()
    else { setStudents([]); setLoading(false) }
  }, [isLoggedIn])

  return (
    <StudentsContext.Provider value={{ students, loading, error, addStudent, updateStudent, deleteStudent }}>
      {children}
    </StudentsContext.Provider>
  )
}

// ── Custom hook ────────────────────────────────────────────
export function useStudents() {
  return useContext(StudentsContext)
}
