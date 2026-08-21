import { authContext } from '../context/authContext.js';
import { adminAPI } from '../api/admin.js';

export async function render() {
  return `
    <div style="display: flex; flex-direction: column; gap: 30px;">
      
      <!-- Header card -->
      <div class="glass-panel" style="padding: 24px 30px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px;">
        <div>
          <h2 style="font-size: 1.8rem; font-family: var(--font-title);">Manage Students</h2>
          <p style="color: var(--text-secondary); margin-top: 4px;">Monitor student accounts, colleges, points, and streaks.</p>
        </div>
        
        <!-- Search filter input -->
        <div style="position: relative; min-width: 280px;">
          <input type="text" id="admin-search-students" class="form-control" placeholder="Search by name or college..." style="padding-left: 40px;">
          <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 16px; top: 14px; color: var(--text-secondary); opacity: 0.7;"></i>
        </div>
      </div>

      <!-- Students table panel -->
      <div class="glass-panel section-card">
        <div class="table-responsive">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Institution / College</th>
                <th>Course / Year</th>
                <th style="text-align: center;">XP</th>
                <th style="text-align: center;">Points</th>
                <th style="text-align: center;">Streak</th>
              </tr>
            </thead>
            <tbody id="admin-students-table-body">
              <tr>
                <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-secondary);">
                  <i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Querying student records...
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

export async function init() {
  const tableBody = document.getElementById('admin-students-table-body');
  const searchInput = document.getElementById('admin-search-students');
  
  let studentsData = [];

  function renderRows(filteredList) {
    if (filteredList.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-secondary); font-weight:600;">
            No student records match your query.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = '';
    filteredList.forEach(student => {
      const courseText = student.course || 'N/A';
      const yearText = student.year ? `(${student.year})` : '';

      tableBody.innerHTML += `
        <tr>
          <td style="font-weight: 700; font-family: var(--font-title); color: var(--forest-color);">@${student.username}</td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:24px; height:24px; border-radius:50%; background:rgba(0,0,0,0.05); display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:700;">
                ${student.full_name ? student.full_name.charAt(0).toUpperCase() : 'S'}
              </div>
              <span>${student.full_name}</span>
            </div>
          </td>
          <td><span style="font-size:0.8rem; color:var(--text-secondary);">${student.email}</span></td>
          <td>${student.college}</td>
          <td>${courseText} <span style="font-size:0.8rem; color:var(--text-secondary);">${yearText}</span></td>
          <td style="text-align: center; font-weight: 700; color: var(--xp-color);">${student.total_xp}</td>
          <td style="text-align: center; font-weight: 700; color: var(--points-color);">${student.total_points}</td>
          <td style="text-align: center; font-weight: 700; color: var(--streak-color);">${student.current_streak} 🔥</td>
        </tr>
      `;
    });
  }

  try {
    studentsData = await adminAPI.getStudents();
    renderRows(studentsData);

    // Bind real-time search filtering
    if (searchInput) {
      searchInput.oninput = (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          renderRows(studentsData);
          return;
        }

        const filtered = studentsData.filter(student => 
          student.full_name.toLowerCase().includes(query) ||
          student.username.toLowerCase().includes(query) ||
          student.college.toLowerCase().includes(query) ||
          (student.email && student.email.toLowerCase().includes(query))
        );
        renderRows(filtered);
      };
    }

  } catch (error) {
    console.error('Error fetching admin students list:', error);
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--danger-color); font-weight:600;">
          Error querying database: ${error.message}
        </td>
      </tr>
    `;
  }
}
