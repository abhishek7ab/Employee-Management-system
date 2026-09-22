import React, { useState, useEffect, useCallback } from 'react'
import EmployeeModule from './components/EmployeeModule'
import AttendanceModule from './components/AttendanceModule'
import LeaveModule from './components/LeaveModule'
import DepartmentInsights from './components/DepartmentInsights'
import Toast from './components/Toast'

export default function App() {
  const [activeTab, setActiveTab] = useState('employees')
  const [employees, setEmployees] = useState([])
  const [leaves, setLeaves] = useState([])
  const [attendanceToday, setAttendanceToday] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiConnected, setApiConnected] = useState(true)
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  // Load all initial dashboard data
  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const [empRes, leaveRes, attRes] = await Promise.all([
        fetch('/api/employees'),
        fetch('/api/leaves'),
        fetch(`/api/attendance?date=${today}`),
      ])

      if (!empRes.ok || !leaveRes.ok || !attRes.ok) {
        throw new Error('API communication error')
      }

      const [empData, leaveData, attData] = await Promise.all([
        empRes.json(),
        leaveRes.json(),
        attRes.json(),
      ])

      setEmployees(empData)
      setLeaves(leaveData)
      setAttendanceToday(attData)
      setApiConnected(true)
    } catch (err) {
      console.error('Error fetching data:', err)
      setApiConnected(false)
      showToast('Could not connect to Spring Boot API. Make sure backend is running.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadData()
  }, [loadData])

  // KPI Calculations
  const totalEmployees = employees.length
  const uniqueDepts = new Set(employees.map((e) => e.department).filter(Boolean)).size
  const presentTodayCount = attendanceToday.filter((a) => a.status === 'Present').length
  const pendingLeavesCount = leaves.filter(
    (l) => !l.status || l.status.toLowerCase() === 'pending'
  ).length

  const attendanceRate = totalEmployees > 0 
    ? Math.round((presentTodayCount / totalEmployees) * 100) 
    : 0

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="brand-section">
            <div className="brand-logo-badge">SP</div>
            <div className="brand-title-wrap">
              <h1>StaffPulse</h1>
              <p>Employee Management System &bull; Spring Boot &amp; React</p>
            </div>
          </div>

          <div className="header-status-group">
            <div className={`status-pill ${apiConnected ? 'online' : 'offline'}`}>
              <span className={`status-dot ${apiConnected ? 'pulse' : ''}`} />
              <span>{apiConnected ? 'Spring Boot API Live' : 'API Disconnected'}</span>
            </div>

            <a
              href="http://localhost:8080/h2-console"
              target="_blank"
              rel="noreferrer"
              className="h2-console-link"
              title="Open H2 Database Console"
            >
              <span>🗄️ H2 Console</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* KPI Grid */}
        <section className="stats-grid">
          <div className="stat-card purple">
            <div className="stat-icon purple">👥</div>
            <div>
              <div className="stat-label">Total Employees</div>
              <div className="stat-value">{totalEmployees}</div>
              <div className="stat-sub">Active staff members</div>
            </div>
          </div>

          <div className="stat-card blue">
            <div className="stat-icon blue">🏢</div>
            <div>
              <div className="stat-label">Departments</div>
              <div className="stat-value">{uniqueDepts}</div>
              <div className="stat-sub">Operational divisions</div>
            </div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon green">📅</div>
            <div>
              <div className="stat-label">Present Today</div>
              <div className="stat-value">{presentTodayCount}</div>
              <div className="stat-sub">{attendanceRate}% attendance rate</div>
            </div>
          </div>

          <div className="stat-card amber">
            <div className="stat-icon amber">⏳</div>
            <div>
              <div className="stat-label">Pending Leaves</div>
              <div className="stat-value">{pendingLeavesCount}</div>
              <div className="stat-sub">Awaiting management review</div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <nav className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'employees' ? 'active' : ''}`}
            onClick={() => setActiveTab('employees')}
          >
            <span>👥 Employees Directory</span>
            <span className="tab-badge">{totalEmployees}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
          >
            <span>📅 Daily Attendance</span>
            <span className="tab-badge">{attendanceToday.length}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`}
            onClick={() => setActiveTab('leaves')}
          >
            <span>📝 Leave Requests</span>
            <span className="tab-badge">{pendingLeavesCount}</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            <span>📊 Insights &amp; Analytics</span>
          </button>
        </nav>

        {/* Active Tab View */}
        {activeTab === 'employees' && (
          <EmployeeModule
            employees={employees}
            loading={loading}
            onRefresh={loadData}
            showToast={showToast}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceModule
            employees={employees}
            showToast={showToast}
          />
        )}

        {activeTab === 'leaves' && (
          <LeaveModule
            leaves={leaves}
            employees={employees}
            loading={loading}
            onRefresh={loadData}
            showToast={showToast}
          />
        )}

        {activeTab === 'insights' && (
          <DepartmentInsights employees={employees} />
        )}
      </main>

      {/* Floating Toasts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
