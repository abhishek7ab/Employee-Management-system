import React, { useState, useEffect, useCallback } from 'react'

export default function AttendanceModule({ employees, showToast }) {
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [statusFilter, setStatusFilter] = useState('')
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchAttendance = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/attendance?date=${selectedDate}`)
      if (!res.ok) throw new Error('Failed to load attendance')
      const data = await res.json()
      setAttendanceRecords(data)
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [selectedDate, showToast])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  const handleMarkAttendance = async (emp, status) => {
    try {
      const payload = {
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        date: selectedDate,
        status: status,
      }
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to update attendance')
      const updated = await res.json()

      // Optimistic update in state
      setAttendanceRecords((prev) => {
        const index = prev.findIndex((r) => r.employeeId === emp.id)
        if (index >= 0) {
          const next = [...prev]
          next[index] = updated
          return next
        }
        return [...prev, updated]
      })

      showToast(`Marked ${emp.firstName} as ${status}`, 'success')
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  // Combine employees with their attendance status
  const rows = employees.map((emp) => {
    const record = attendanceRecords.find((r) => r.employeeId === emp.id)
    return {
      employee: emp,
      attendanceId: record ? record.id : null,
      status: record ? record.status : 'Not Marked',
    }
  })

  // Filter rows
  const filteredRows = rows.filter((r) => {
    if (!statusFilter) return true
    return r.status === statusFilter
  })

  // Summary counts
  const presentCount = rows.filter((r) => r.status === 'Present').length
  const absentCount = rows.filter((r) => r.status === 'Absent').length
  const halfDayCount = rows.filter((r) => r.status === 'Half-Day').length
  const notMarkedCount = rows.filter((r) => r.status === 'Not Marked').length

  return (
    <div>
      {/* Attendance Summary Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
        }}
      >
        <div className="status-pill online">
          <span>✅ Present:</span>
          <strong>{presentCount}</strong>
        </div>
        <div className="status-pill offline">
          <span>❌ Absent:</span>
          <strong>{absentCount}</strong>
        </div>
        <div
          className="status-pill"
          style={{
            borderColor: 'var(--amber-border)',
            color: 'var(--amber)',
            background: 'var(--amber-bg)',
          }}
        >
          <span>⏳ Half-Day:</span>
          <strong>{halfDayCount}</strong>
        </div>
        {notMarkedCount > 0 && (
          <div className="status-pill">
            <span style={{ color: 'var(--text-muted)' }}>⚪ Unmarked:</span>
            <strong>{notMarkedCount}</strong>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <label
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            Date:
          </label>
          <input
            type="date"
            className="select-filter"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <select
            className="select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
            <option value="Half-Day">Half-Day</option>
            <option value="Not Marked">Not Marked</option>
          </select>
        </div>

        <div className="toolbar-right">
          <button
            className="btn btn-secondary"
            onClick={fetchAttendance}
            disabled={loading}
          >
            🔄 {loading ? 'Loading...' : 'Refresh Attendance'}
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="table-card">
        <div className="table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Employee</th>
                <th>Department</th>
                <th>Current Status</th>
                <th style={{ textAlign: 'right' }}>Quick Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="5">
                    <div className="empty-state">
                      <div className="empty-icon">📅</div>
                      <div className="empty-title">No attendance records found</div>
                      <div className="empty-desc">
                        Change the date filter or select an attendance status.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ employee, status }) => (
                  <tr key={employee.id}>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                        #{employee.id}
                      </span>
                    </td>
                    <td>
                      <div className="employee-cell">
                        <div className="avatar">
                          {employee.firstName?.[0]}
                          {employee.lastName?.[0]}
                        </div>
                        <div>
                          <div className="employee-name">
                            {employee.firstName} {employee.lastName}
                          </div>
                          <div className="employee-email">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-dept">{employee.department}</span>
                    </td>
                    <td>
                      {status === 'Present' && (
                        <span className="badge badge-present">● Present</span>
                      )}
                      {status === 'Absent' && (
                        <span className="badge badge-absent">● Absent</span>
                      )}
                      {status === 'Half-Day' && (
                        <span className="badge badge-halfday">● Half-Day</span>
                      )}
                      {status === 'Not Marked' && (
                        <span
                          className="badge"
                          style={{
                            background: 'rgba(255,255,255,0.06)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          ○ Not Marked
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="status-pill-group">
                        <button
                          className={`status-pill-btn ${
                            status === 'Present' ? 'active present' : ''
                          }`}
                          onClick={() => handleMarkAttendance(employee, 'Present')}
                        >
                          Present
                        </button>
                        <button
                          className={`status-pill-btn ${
                            status === 'Half-Day' ? 'active halfday' : ''
                          }`}
                          onClick={() => handleMarkAttendance(employee, 'Half-Day')}
                        >
                          Half-Day
                        </button>
                        <button
                          className={`status-pill-btn ${
                            status === 'Absent' ? 'active absent' : ''
                          }`}
                          onClick={() => handleMarkAttendance(employee, 'Absent')}
                        >
                          Absent
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
