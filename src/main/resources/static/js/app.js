/**
 * StaffPulse - Employee Management System
 * Frontend Application Logic
 */

// Application State
let state = {
  employees: [],
  attendance: [],
  leaves: []
};

// Initialization on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initDateInputs();
  loadEmployees();
  loadAttendance();
  loadLeaves();
});

function getTodayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function initDateInputs() {
  const todayStr = getTodayString();
  const attDateInput = document.getElementById('attendanceDateInput');
  const attModalDate = document.getElementById('attDate');
  const leaveStart = document.getElementById('leaveStartDate');
  const leaveEnd = document.getElementById('leaveEndDate');

  if (attDateInput) attDateInput.value = todayStr;
  if (attModalDate) attModalDate.value = todayStr;
  if (leaveStart) leaveStart.value = todayStr;
  if (leaveEnd) leaveEnd.value = todayStr;
}

// Tab Switching
function switchTab(tabName) {
  const tabs = ['employees', 'attendance', 'leaves'];
  tabs.forEach(t => {
    const btn = document.getElementById(`tabBtn${capitalize(t)}`);
    const content = document.getElementById(`tab${capitalize(t)}`);
    if (t === tabName) {
      if (btn) btn.classList.add('active');
      if (content) content.classList.add('active');
    } else {
      if (btn) btn.classList.remove('active');
      if (content) content.classList.remove('active');
    }
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ==========================================================================
// 1. EMPLOYEES MODULE
// ==========================================================================

async function loadEmployees() {
  try {
    const response = await fetch('/api/employees');
    if (!response.ok) throw new Error('Failed to fetch employees');
    state.employees = await response.json();

    updateEmployeeStats();
    populateEmployeeDropdowns();
    renderEmployees(state.employees);

    document.getElementById('badgeEmpCount').textContent = state.employees.length;
  } catch (err) {
    showToast('Error loading employees: ' + err.message, 'error');
  }
}

function renderEmployees(list) {
  const tbody = document.getElementById('employeeTableBody');
  if (!tbody) return;

  if (!list || list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-icon">👥</div>
            <div class="empty-text">No Employees Found</div>
            <div class="empty-sub">Try adjusting your search query or add a new employee above.</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(emp => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
    const initials = (emp.firstName ? emp.firstName[0] : '') + (emp.lastName ? emp.lastName[0] : '');
    const deptClass = (emp.department || '').toLowerCase().replace(/\s+/g, '-');
    const formattedSalary = Number(emp.salary || 0).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });

    return `
      <tr>
        <td style="font-weight: 600; color: var(--text-muted);">#${emp.id}</td>
        <td>
          <div class="user-info-cell">
            <div class="avatar">${initials || 'EM'}</div>
            <div>
              <div class="user-name-title">${escapeHtml(fullName)}</div>
              <div class="user-email-sub">${escapeHtml(emp.email || 'N/A')}</div>
            </div>
          </div>
        </td>
        <td>
          <span class="badge badge-dept ${deptClass}">${escapeHtml(emp.department || 'General')}</span>
        </td>
        <td>${escapeHtml(emp.designation || 'Staff')}</td>
        <td style="font-weight: 600;">${formattedSalary}</td>
        <td>
          <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: var(--text-muted); font-size: 0.85rem;">
            👔 ${escapeHtml(emp.managerName || 'Unassigned')}
          </span>
        </td>
        <td style="text-align: right;">
          <button class="btn btn-sm btn-action-edit" onclick="openEditEmployeeModal(${emp.id})" title="Edit Employee">
            ✏️ Edit
          </button>
          <button class="btn btn-sm btn-action-delete" onclick="deleteEmployee(${emp.id}, '${escapeHtml(fullName)}')" title="Delete Employee">
            🗑️ Delete
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

function handleEmployeeSearch() {
  const query = (document.getElementById('employeeSearchInput').value || '').toLowerCase().trim();
  const dept = (document.getElementById('employeeDeptFilter').value || '').toLowerCase().trim();

  filterAndRenderEmployees(query, dept);
}

function handleEmployeeFilter() {
  handleEmployeeSearch();
}

function filterAndRenderEmployees(query, dept) {
  const filtered = state.employees.filter(emp => {
    const fullName = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const designation = (emp.designation || '').toLowerCase();
    const department = (emp.department || '').toLowerCase();
    const manager = (emp.managerName || '').toLowerCase();

    const matchesQuery = !query ||
      fullName.includes(query) ||
      email.includes(query) ||
      designation.includes(query) ||
      department.includes(query) ||
      manager.includes(query);

    const matchesDept = !dept || department === dept;

    return matchesQuery && matchesDept;
  });

  renderEmployees(filtered);
}

function openAddEmployeeModal() {
  document.getElementById('employeeModalTitle').textContent = 'Add New Employee';
  document.getElementById('empFormId').value = '';
  document.getElementById('employeeForm').reset();
  openModal('employeeModal');
}

function openEditEmployeeModal(id) {
  const emp = state.employees.find(e => e.id === id);
  if (!emp) return;

  document.getElementById('employeeModalTitle').textContent = `Edit Employee (ID: #${emp.id})`;
  document.getElementById('empFormId').value = emp.id;
  document.getElementById('empFirstName').value = emp.firstName || '';
  document.getElementById('empLastName').value = emp.lastName || '';
  document.getElementById('empEmail').value = emp.email || '';
  document.getElementById('empDepartment').value = emp.department || '';
  document.getElementById('empDesignation').value = emp.designation || '';
  document.getElementById('empSalary').value = emp.salary || 0;
  document.getElementById('empManagerName').value = emp.managerName || '';

  openModal('employeeModal');
}

async function saveEmployee(event) {
  event.preventDefault();
  const id = document.getElementById('empFormId').value;
  const employeeData = {
    firstName: document.getElementById('empFirstName').value.trim(),
    lastName: document.getElementById('empLastName').value.trim(),
    email: document.getElementById('empEmail').value.trim(),
    department: document.getElementById('empDepartment').value,
    designation: document.getElementById('empDesignation').value.trim(),
    salary: parseFloat(document.getElementById('empSalary').value) || 0,
    managerName: document.getElementById('empManagerName').value.trim()
  };

  try {
    const url = id ? `/api/employees/${id}` : '/api/employees';
    const method = id ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData)
    });

    if (!res.ok) throw new Error('Failed to save employee.');

    closeModal('employeeModal');
    showToast(id ? 'Employee updated successfully!' : 'New employee added successfully!', 'success');
    await loadEmployees();
    await loadAttendance(); // keep attendance employee names synced
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteEmployee(id, name) {
  if (!confirm(`Are you sure you want to permanently delete employee "${name}" (ID: #${id})?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete employee');

    showToast(`Employee "${name}" deleted successfully!`, 'success');
    await loadEmployees();
    await loadAttendance();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function updateEmployeeStats() {
  // Total Employees
  const total = state.employees.length;
  document.getElementById('statTotalEmployees').textContent = total;

  // Unique Departments
  const depts = new Set(state.employees.map(e => e.department).filter(Boolean));
  document.getElementById('statTotalDepts').textContent = depts.size;
}

function populateEmployeeDropdowns() {
  const attSelect = document.getElementById('attEmployeeSelect');
  const leaveSelect = document.getElementById('leaveEmployeeSelect');

  const options = state.employees.map(e => {
    const name = `${e.firstName} ${e.lastName}`.trim();
    return `<option value="${e.id}" data-name="${escapeHtml(name)}">${escapeHtml(name)} (${escapeHtml(e.department || 'Staff')})</option>`;
  }).join('');

  if (attSelect) attSelect.innerHTML = options || '<option value="">No employees available</option>';
  if (leaveSelect) leaveSelect.innerHTML = options || '<option value="">No employees available</option>';
}

// ==========================================================================
// 2. ATTENDANCE MODULE
// ==========================================================================

async function loadAttendance() {
  const dateInput = document.getElementById('attendanceDateInput');
  const date = dateInput ? dateInput.value : getTodayString();

  try {
    const response = await fetch(`/api/attendance?date=${encodeURIComponent(date)}`);
    if (!response.ok) throw new Error('Failed to fetch attendance');
    state.attendance = await response.json();

    updateAttendanceStats();
    renderAttendance();

    document.getElementById('badgeAttCount').textContent = state.attendance.length;
  } catch (err) {
    showToast('Error loading attendance: ' + err.message, 'error');
  }
}

function renderAttendance() {
  const tbody = document.getElementById('attendanceTableBody');
  const filterStatus = (document.getElementById('attendanceFilterStatus').value || '').trim();
  if (!tbody) return;

  let list = state.attendance;
  if (filterStatus) {
    list = list.filter(a => a.status === filterStatus);
  }

  if (!list || list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5">
          <div class="empty-state">
            <div class="empty-icon">📅</div>
            <div class="empty-text">No Attendance Records for this Date</div>
            <div class="empty-sub">Click "+ Mark Attendance" above to record employee presence.</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = list.map(att => {
    const statusClass = (att.status || 'present').toLowerCase().replace(/\s+/g, '');
    return `
      <tr>
        <td style="font-weight: 600; color: var(--text-muted);">#${att.employeeId}</td>
        <td style="font-weight: 600;">${escapeHtml(att.employeeName || 'Unknown')}</td>
        <td>${escapeHtml(att.date || '')}</td>
        <td>
          <span class="badge badge-${statusClass}">
            ${att.status === 'Present' ? '✔' : att.status === 'Absent' ? '✖' : '⏳'} ${escapeHtml(att.status || 'Present')}
          </span>
        </td>
        <td style="text-align: right;">
          <div style="display: inline-flex; gap: 0.35rem;">
            <button class="btn btn-sm ${att.status === 'Present' ? 'btn-primary' : 'btn-secondary'}"
              onclick="quickUpdateAttendance(${att.employeeId}, '${escapeHtml(att.employeeName)}', '${att.date}', 'Present')"
              title="Mark Present">
              P
            </button>
            <button class="btn btn-sm ${att.status === 'Absent' ? 'btn-action-delete' : 'btn-secondary'}"
              onclick="quickUpdateAttendance(${att.employeeId}, '${escapeHtml(att.employeeName)}', '${att.date}', 'Absent')"
              title="Mark Absent">
              A
            </button>
            <button class="btn btn-sm ${att.status === 'Half-Day' ? 'btn-action-edit' : 'btn-secondary'}"
              onclick="quickUpdateAttendance(${att.employeeId}, '${escapeHtml(att.employeeName)}', '${att.date}', 'Half-Day')"
              title="Mark Half-Day">
              H
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

async function quickUpdateAttendance(empId, empName, date, newStatus) {
  try {
    const res = await fetch('/api/attendance/mark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: empId,
        employeeName: empName,
        date: date,
        status: newStatus
      })
    });

    if (!res.ok) throw new Error('Failed to update attendance');
    showToast(`Marked ${empName} as ${newStatus}`, 'success');
    await loadAttendance();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openMarkAttendanceModal() {
  populateEmployeeDropdowns();
  document.getElementById('attDate').value = document.getElementById('attendanceDateInput').value || getTodayString();
  openModal('attendanceModal');
}

async function saveAttendance(event) {
  event.preventDefault();
  const select = document.getElementById('attEmployeeSelect');
  const empId = select.value;
  const selectedOption = select.options[select.selectedIndex];
  const empName = selectedOption ? selectedOption.getAttribute('data-name') : 'Employee';
  const date = document.getElementById('attDate').value;
  const status = document.getElementById('attStatus').value;

  try {
    const res = await fetch('/api/attendance/mark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: parseInt(empId),
        employeeName: empName,
        date: date,
        status: status
      })
    });

    if (!res.ok) throw new Error('Failed to mark attendance');
    closeModal('attendanceModal');
    showToast(`Attendance recorded: ${empName} (${status})`, 'success');
    await loadAttendance();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function updateAttendanceStats() {
  const presentCount = state.attendance.filter(a => a.status === 'Present').length;
  const totalRecs = state.attendance.length;
  document.getElementById('statPresentToday').textContent = presentCount;
  document.getElementById('statPresentRate').textContent = totalRecs > 0 ? `out of ${totalRecs} logged` : 'No logs today';
}

// ==========================================================================
// 3. LEAVE REQUESTS MODULE
// ==========================================================================

async function loadLeaves() {
  const filter = document.getElementById('leavesFilterStatus');
  const statusParam = filter && filter.value ? `?status=${encodeURIComponent(filter.value)}` : '';

  try {
    const response = await fetch(`/api/leaves${statusParam}`);
    if (!response.ok) throw new Error('Failed to fetch leaves');
    state.leaves = await response.json();

    updateLeaveStats();
    renderLeaves();

    const pendingCount = state.leaves.filter(l => l.status === 'Pending').length;
    document.getElementById('badgeLeavesCount').textContent = pendingCount;
  } catch (err) {
    showToast('Error loading leaves: ' + err.message, 'error');
  }
}

function renderLeaves() {
  const tbody = document.getElementById('leavesTableBody');
  if (!tbody) return;

  if (!state.leaves || state.leaves.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <div class="empty-icon">📝</div>
            <div class="empty-text">No Leave Requests Found</div>
            <div class="empty-sub">Employees have not submitted any matching leave applications.</div>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = state.leaves.map(req => {
    const statusLower = (req.status || 'pending').toLowerCase();
    const isPending = req.status === 'Pending';

    return `
      <tr>
        <td style="font-weight: 600; color: var(--text-muted);">#${req.id}</td>
        <td>
          <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(req.employeeName || 'Unknown')}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">ID: #${req.employeeId}</div>
        </td>
        <td>
          <span style="font-weight: 500;">${escapeHtml(req.leaveType || 'General')}</span>
        </td>
        <td style="font-size: 0.85rem; color: var(--text-muted);">
          ${escapeHtml(req.startDate || '')} &rarr; ${escapeHtml(req.endDate || '')}
        </td>
        <td style="max-width: 260px; font-size: 0.85rem; color: var(--text-main);" title="${escapeHtml(req.reason || '')}">
          ${escapeHtml(req.reason || 'None provided')}
        </td>
        <td>
          <span class="badge badge-${statusLower}">${escapeHtml(req.status || 'Pending')}</span>
        </td>
        <td style="text-align: right;">
          ${isPending ? `
            <button class="btn btn-sm btn-action-approve" onclick="updateLeaveStatus(${req.id}, 'Approved')" title="Approve Leave">
              ✔ Approve
            </button>
            <button class="btn btn-sm btn-action-reject" onclick="updateLeaveStatus(${req.id}, 'Rejected')" title="Reject Leave">
              ✖ Reject
            </button>
          ` : `
            <span style="font-size: 0.8rem; color: var(--text-light); font-style: italic;">Decided</span>
          `}
        </td>
      </tr>
    `;
  }).join('');
}

async function updateLeaveStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/leaves/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (!res.ok) throw new Error('Failed to update leave status');
    showToast(`Leave request #${id} ${newStatus.toLowerCase()}!`, newStatus === 'Approved' ? 'success' : 'warning');
    await loadLeaves();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openApplyLeaveModal() {
  populateEmployeeDropdowns();
  openModal('leaveModal');
}

async function saveLeave(event) {
  event.preventDefault();
  const select = document.getElementById('leaveEmployeeSelect');
  const empId = select.value;
  const selectedOption = select.options[select.selectedIndex];
  const empName = selectedOption ? selectedOption.getAttribute('data-name') : 'Employee';

  const leaveData = {
    employeeId: parseInt(empId),
    employeeName: empName,
    leaveType: document.getElementById('leaveType').value,
    startDate: document.getElementById('leaveStartDate').value,
    endDate: document.getElementById('leaveEndDate').value,
    reason: document.getElementById('leaveReason').value.trim(),
    status: 'Pending'
  };

  try {
    const res = await fetch('/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leaveData)
    });

    if (!res.ok) throw new Error('Failed to submit leave request');

    closeModal('leaveModal');
    showToast('Leave request submitted successfully!', 'success');
    document.getElementById('leaveForm').reset();
    await loadLeaves();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function updateLeaveStats() {
  const pending = state.leaves.filter(l => l.status === 'Pending').length;
  document.getElementById('statPendingLeaves').textContent = pending;
}

// ==========================================================================
// 4. MODALS & TOAST NOTIFICATIONS
// ==========================================================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
}

// Close modals when clicking overlay backdrop
window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('active');
  }
});

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️';
  toast.innerHTML = `<span>${icon}</span><span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
