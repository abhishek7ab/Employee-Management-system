import React, { useState } from 'react'

const LEAVE_TYPES = [
  'Sick Leave',
  'Casual Leave',
  'Annual Leave',
  'Emergency Leave',
  'Maternity/Paternity Leave',
]

export default function LeaveModule({
  leaves,
  employees,
  loading,
  onRefresh,
  showToast,
}) {
  const [statusFilter, setStatusFilter] = useState('')
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'Casual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  })

  // Filter leaves
  const filteredLeaves = leaves.filter((leave) => {
    if (!statusFilter) return true
    return (leave.status || '').toLowerCase() === statusFilter.toLowerCase()
  })

  const handleApplySubmit = async (e) => {
    e.preventDefault()
    if (!formData.employeeId) {
      showToast('Please select an employee', 'error')
      return
    }

    const selectedEmp = employees.find(
      (emp) => emp.id === Number(formData.employeeId)
    )
    const empName = selectedEmp
      ? `${selectedEmp.firstName} ${selectedEmp.lastName}`
      : 'Unknown'

    try {
      const payload = {
        employeeId: Number(formData.employeeId),
        employeeName: empName,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        status: 'Pending',
      }

      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Failed to submit leave request')

      showToast('Leave request submitted successfully!', 'success')
      setIsApplyModalOpen(false)
      setFormData({
        employeeId: '',
        leaveType: 'Casual Leave',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        reason: '',
      })
      onRefresh()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/leaves/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error(`Failed to update leave to ${status}`)

      showToast(`Leave request ${status.toLowerCase()}!`, 'success')
      onRefresh()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <select
            className="select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="toolbar-right">
          <button className="btn btn-secondary" onClick={onRefresh} disabled={loading}>
            🔄 {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsApplyModalOpen(true)}
          >
            📝 Apply for Leave
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
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Reason</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <div className="empty-icon">📝</div>
                      <div className="empty-title">No leave requests found</div>
                      <div className="empty-desc">
                        No requests match your current filter. Click "Apply for Leave" to create one.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                        #{leave.id}
                      </span>
                    </td>
                    <td>
                      <div className="employee-name">{leave.employeeName}</div>
                      <div className="employee-email">ID: #{leave.employeeId}</div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: 'rgba(99, 102, 241, 0.12)',
                          color: '#a5b4fc',
                          border: '1px solid rgba(99, 102, 241, 0.25)',
                        }}
                      >
                        {leave.leaveType}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {leave.startDate}
                      </span>
                      <span style={{ color: 'var(--text-muted)', margin: '0 0.35rem' }}>
                        →
                      </span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {leave.endDate}
                      </span>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <span
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          color: 'var(--text-secondary)',
                          fontSize: '0.82rem',
                        }}
                      >
                        {leave.reason || 'No reason provided'}
                      </span>
                    </td>
                    <td>
                      {leave.status === 'Approved' && (
                        <span className="badge badge-approved">✓ Approved</span>
                      )}
                      {leave.status === 'Rejected' && (
                        <span className="badge badge-rejected">✕ Rejected</span>
                      )}
                      {(!leave.status || leave.status === 'Pending') && (
                        <span className="badge badge-pending">⏳ Pending</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {(!leave.status || leave.status === 'Pending') ? (
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            className="btn btn-sm btn-primary"
                            style={{
                              background: 'var(--emerald-bg)',
                              color: 'var(--emerald)',
                              borderColor: 'var(--emerald-border)',
                              padding: '0.3rem 0.6rem',
                            }}
                            title="Approve Leave"
                            onClick={() => handleUpdateStatus(leave.id, 'Approved')}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger-ghost"
                            style={{ padding: '0.3rem 0.6rem' }}
                            title="Reject Leave"
                            onClick={() => handleUpdateStatus(leave.id, 'Rejected')}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          Processed
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsApplyModalOpen(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>📝 Apply for Leave</h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsApplyModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleApplySubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label className="form-label">Employee *</label>
                    <select
                      className="form-select"
                      required
                      value={formData.employeeId}
                      onChange={(e) =>
                        setFormData({ ...formData, employeeId: e.target.value })
                      }
                    >
                      <option value="">Select Employee...</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName} ({emp.department} - {emp.designation})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Leave Type *</label>
                    <select
                      className="form-select"
                      value={formData.leaveType}
                      onChange={(e) =>
                        setFormData({ ...formData, leaveType: e.target.value })
                      }
                    >
                      {LEAVE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Start Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">End Date *</label>
                    <input
                      type="date"
                      className="form-input"
                      required
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Reason *</label>
                    <textarea
                      className="form-textarea"
                      required
                      rows="3"
                      placeholder="State reason for absence..."
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsApplyModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
