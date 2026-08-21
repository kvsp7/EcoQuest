import { authContext } from '../context/authContext.js';
import { adminAPI } from '../api/admin.js';

export async function render() {
  return `
    <div style="display: flex; flex-direction: column; gap: 30px;">
      
      <!-- Welcome card -->
      <div class="glass-panel" style="padding: 24px 30px;">
        <h2 style="font-size: 1.8rem; font-family: var(--font-title);">Admin Dashboard</h2>
        <p style="color: var(--text-secondary); margin-top: 4px;">Welcome back! Here is a summary of the EcoQuest education database metrics.</p>
      </div>

      <!-- Statistics grid -->
      <div class="admin-stats-grid" id="admin-stats-outlet">
        <div class="skeleton skeleton-card" style="height: 120px;"></div>
        <div class="skeleton skeleton-card" style="height: 120px;"></div>
        <div class="skeleton skeleton-card" style="height: 120px;"></div>
        <div class="skeleton skeleton-card" style="height: 120px;"></div>
      </div>

      <!-- Quick Action Shortcuts -->
      <div class="glass-panel section-card">
        <h2><i class="fa-solid fa-bolt"></i> Database Quick Links</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-top: 15px;">
          <a href="#admin/courses" class="glass-card" style="padding: 20px; display: flex; flex-direction: column; gap: 10px; text-decoration: none; border-color: rgba(var(--forest-color-rgb), 0.25);">
            <div style="font-size: 1.5rem; color: var(--forest-color);"><i class="fa-solid fa-folder-plus"></i></div>
            <h3 style="font-size: 1.05rem;">Course Builder</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Add courses, modules, lessons and manage configurations.</p>
          </a>
          
          <a href="#admin/courses" class="glass-card" style="padding: 20px; display: flex; flex-direction: column; gap: 10px; text-decoration: none; border-color: rgba(255,152,0,0.25);">
            <div style="font-size: 1.5rem; color: var(--xp-color);"><i class="fa-solid fa-file-video"></i></div>
            <h3 style="font-size: 1.05rem;">Video uploader</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Link mp4 files directly to lesson nodes.</p>
          </a>

          <a href="#admin/students" class="glass-card" style="padding: 20px; display: flex; flex-direction: column; gap: 10px; text-decoration: none; border-color: rgba(2,136,209,0.25);">
            <div style="font-size: 1.5rem; color: #0288d1;"><i class="fa-solid fa-users"></i></div>
            <h3 style="font-size: 1.05rem;">Monitor Students</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Inspect active profiles, year levels and streaks.</p>
          </a>
        </div>
      </div>

    </div>
  `;
}

export async function init() {
  const statsOutlet = document.getElementById('admin-stats-outlet');

  try {
    const data = await adminAPI.getDashboardStats();
    const stats = data.statistics || {};

    statsOutlet.innerHTML = `
      <div class="glass-panel stat-card admin-stat-card">
        <div class="stat-icon" style="background: rgba(2, 136, 209, 0.1); color: #0288d1;"><i class="fa-solid fa-user-graduate"></i></div>
        <div class="stat-details">
          <h3>Total Students</h3>
          <div class="admin-stat-val">${stats.students ?? 0}</div>
        </div>
      </div>

      <div class="glass-panel stat-card admin-stat-card">
        <div class="stat-icon" style="background: rgba(46, 125, 50, 0.1); color: #2e7d32;"><i class="fa-solid fa-book-bookmark"></i></div>
        <div class="stat-details">
          <h3>Active Courses</h3>
          <div class="admin-stat-val">${stats.courses ?? 0}</div>
        </div>
      </div>

      <div class="glass-panel stat-card admin-stat-card">
        <div class="stat-icon" style="background: rgba(255, 152, 0, 0.1); color: #f57c00;"><i class="fa-solid fa-cubes"></i></div>
        <div class="stat-details">
          <h3>Total Modules</h3>
          <div class="admin-stat-val">${stats.modules ?? 0}</div>
        </div>
      </div>

      <div class="glass-panel stat-card admin-stat-card">
        <div class="stat-icon" style="background: rgba(0, 188, 212, 0.1); color: #00acc1;"><i class="fa-solid fa-chalkboard-user"></i></div>
        <div class="stat-details">
          <h3>Total Lessons</h3>
          <div class="admin-stat-val">${stats.lessons ?? 0}</div>
        </div>
      </div>
    `;

  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    statsOutlet.innerHTML = `<p style="color: var(--danger-color); grid-column: 1 / -1;">Error loading statistics cards: ${error.message}</p>`;
  }
}
