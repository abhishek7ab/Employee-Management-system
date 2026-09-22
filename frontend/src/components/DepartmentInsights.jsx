import React from 'react'

export default function DepartmentInsights({ employees }) {
  if (!employees || employees.length === 0) return null

  // Calculate department metrics
  const deptMap = {}
  let totalPayroll = 0

  employees.forEach((emp) => {
    const dept = emp.department || 'Other'
    const salary = Number(emp.salary) || 0
    totalPayroll += salary

    if (!deptMap[dept]) {
      deptMap[dept] = { count: 0, totalSalary: 0 }
    }
    deptMap[dept].count += 1
    deptMap[dept].totalSalary += salary
  })

  const deptList = Object.entries(deptMap).map(([name, data]) => ({
    name,
    count: data.count,
    percentage: Math.round((data.count / employees.length) * 100),
    avgSalary: Math.round(data.totalSalary / data.count),
    totalSalary: data.totalSalary,
  }))

  deptList.sort((a, b) => b.count - a.count)

  const overallAvgSalary = Math.round(totalPayroll / employees.length)

  return (
    <div className="insights-grid">
      {/* Department Headcount Breakdown */}
      <div className="insight-card">
        <h3>🏢 Headcount by Department</h3>
        <div>
          {deptList.map((dept) => (
            <div key={dept.name} className="dept-bar-item">
              <div className="dept-bar-info">
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {dept.name}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {dept.count} staff ({dept.percentage}%)
                </span>
              </div>
              <div className="dept-bar-track">
                <div
                  className="dept-bar-fill"
                  style={{ width: `${dept.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Salary & Payroll Insights */}
      <div className="insight-card">
        <h3>💰 Compensation & Payroll Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="stat-label">Total Payroll</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--emerald)' }}>
              ${totalPayroll.toLocaleString()}
            </div>
            <div className="stat-sub">Annual total</div>
          </div>

          <div
            style={{
              background: 'rgba(255,255,255,0.03)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div className="stat-label">Average Salary</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#818cf8' }}>
              ${overallAvgSalary.toLocaleString()}
            </div>
            <div className="stat-sub">Per employee</div>
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            Average by Department:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {deptList.map((dept) => (
              <div
                key={dept.name}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.85rem',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <span style={{ color: 'var(--text-primary)' }}>{dept.name}</span>
                <span style={{ fontWeight: 600, color: 'var(--emerald)' }}>
                  ${dept.avgSalary.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
