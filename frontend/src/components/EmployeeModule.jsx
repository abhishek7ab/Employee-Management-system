import React, { useState } from 'react'

const DEPARTMENTS = [
  'IT',
  'HR',
  'Finance',
  'Marketing',
  'Management',
  'Sales',
  'Operations',
]

export default function EmployeeModule({
  employees,
  loading,
  onRefresh,
  showToast,
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDept, setSelectedDept] = useState('')
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('add') // 'add' | 'edit'
  const [currentEmployee, setCurrentEmployee] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // Form fields
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: 'IT',
    designation: 'Staff',
    salary: 50000,
    managerName: '',
  })

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesDept = selectedDept ? emp.department === selectedDept : true
    const term = searchTerm.toLowerCase().trim()
    if (!term) return matchesDept

    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase()
    const email = (emp.email || '').toLowerCase()
    const dept = (emp.department || '').toLowerCase()
    const desig = (emp.designation || '').toLowerCase()
    const mgr = (emp.managerName || '').toLowerCase()

    return (
      matchesDept &&
      (fullName.includes(term) ||
        email.includes(term) ||
        dept.includes(term) ||
        desig.includes(term) ||
        mgr.includes(term))
    )
  })

  const openAddModal = () => {
    setModalMode('add')
    setCurrentEmployee(null)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      department: 'IT',
      designation: 'Staff',
      salary: 50000,
      managerName: '',
    })
    setIsModalOpen(true)
  }

  const openEditModal = (emp) => {
    setModalMode('edit')
    setCurrentEmployee(emp)
    setFormData({
      firstName: emp.firstName || '',
      lastName: emp.lastName || '',
      email: emp.email || '',
      department: emp.department || 'IT',
      designation: emp.designation || 'Staff',
      salary: emp.salary || 50000,
      managerName: emp.managerName || '',
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setCurrentEmployee(null)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    try {
      if (modalMode === 'add') {
        const res = await fetch('/api/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error('Failed to create employee')
        showToast('Employee created successfully!', 'success')
      } else {
        const res = await fetch(`/api/employees/${currentEmployee.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
        if (!res.ok) throw new Error('Failed to update employee')
        showToast('Employee updated successfully!', 'success')
      }
      closeModal()
      onRefresh()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete employee')
      showToast('Employee deleted successfully!', 'success')
      setDeleteConfirmId(null)
      onRefresh()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const getInitials = (first, last) => {
    return `${(first || '')[0] || ''}${(last || '')[0] || ''}`.toUpperCase() || '?'
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, role, manager..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="select-filter"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="toolbar-right">
          <button className="btn btn-secondary" onClick={onRefresh} disabled={loading}>
            🔄 {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button className="btn btn-primary" onClick={openAddModal}>
            ➕ Add Employee
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
                <th>Designation</th>
                <th>Salary</th>
                <th>Assigned Manager</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7">
                    <div className="empty-state">
                      <div className="empty-icon">👥</div>
                      <div className="empty-title">No employees found</div>
                      <div className="empty-desc">
                        Try clearing your search or add a new employee to get started.
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                        #{emp.id}
                      </span>
                    </td>
                    <td>
                      <div className="employee-cell">
                        <div className="avatar">
                          {getInitials(emp.firstName, emp.lastName)}
                        </div>
                        <div>
                          <div className="employee-name">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="employee-email">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-dept">{emp.department}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {emp.designation || 'Staff'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--emerald)', fontWeight: 600 }}>
                        ${Number(emp.salary || 0).toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {emp.managerName || 'Unassigned'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-sm btn-primary-ghost"
                          title="Edit employee"
                          onClick={() => openEditModal(emp)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn btn-sm btn-danger-ghost"
                          title="Delete employee"
                          onClick={() => setDeleteConfirmId(emp.id)}
                        >
                          🗑️
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalMode === 'add' ? '➕ Add New Employee' : '✏️ Edit Employee Details'}</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                ✕
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData({ ...formData, firstName: e.target.value })
                      }
                      placeholder="e.g. Aarav"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      required
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData({ ...formData, lastName: e.target.value })
                      }
                      placeholder="e.g. Sharma"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">Work Email *</label>
                    <input
                      type="email"
                      className="form-input"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="e.g. aarav.sharma@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select
                      className="form-select"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                    >
                      {DEPARTMENTS.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData({ ...formData, designation: e.target.value })
                      }
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Annual Salary ($)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.salary}
                      onChange={(e) =>
                        setFormData({ ...formData, salary: Number(e.target.value) })
                      }
                      min="0"
                      step="1000"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned Manager</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.managerName}
                      onChange={(e) =>
                        setFormData({ ...formData, managerName: e.target.value })
                      }
                      placeholder="e.g. Rajesh Menon"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {modalMode === 'add' ? 'Create Employee' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="modal-content"
            style={{ maxWidth: '420px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 style={{ color: 'var(--rose)' }}>⚠️ Confirm Deletion</h3>
              <button
                className="modal-close-btn"
                onClick={() => setDeleteConfirmId(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Are you sure you want to delete employee{' '}
                <strong>#{deleteConfirmId}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  background: 'var(--rose)',
                  color: '#fff',
                }}
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
