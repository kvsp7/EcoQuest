import { authContext } from '../context/authContext.js';

export function render() {
  const { user } = authContext.getState();
  const initialLetter = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A';
  const theme = document.body.getAttribute('data-theme') === 'night' ? 'night' : 'day';
  const themeIcon = theme === 'night' ? 'fa-sun' : 'fa-moon';

  return `
    <!-- Mobile Hamburger Toggle Header -->
    <header class="mobile-layout-header glass-panel" style="display: none; padding: 12px 20px; align-items: center; justify-content: space-between; position: fixed; top: 0; left: 0; width: 100%; z-index: 1000;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <button id="mobile-sidebar-toggle" class="btn btn-secondary btn-icon" style="border: none; background: rgba(0,0,0,0.05);">
          <i class="fa-solid fa-bars"></i>
        </button>
        <span style="font-family: var(--font-title); font-weight: 800; color: var(--forest-color); font-size: 1.15rem;">🌱 EcoQuest Admin</span>
      </div>
    </header>

    <!-- Sidebar Navigation -->
    <aside class="sidebar glass-panel" id="app-sidebar">
      <div class="sidebar-logo" style="color: var(--danger-color);">
        <i class="fa-solid fa-screwdriver-wrench"></i>
        <span>Admin Panel</span>
      </div>
      
      <nav class="sidebar-menu">
        <a href="#admin/dashboard" class="sidebar-link" data-route="#admin/dashboard">
          <i class="fa-solid fa-chart-line"></i>
          <span>Dashboard Stats</span>
        </a>
        <a href="#admin/students" class="sidebar-link" data-route="#admin/students">
          <i class="fa-solid fa-users-gear"></i>
          <span>Manage Students</span>
        </a>
        <a href="#admin/courses" class="sidebar-link" data-route="#admin/courses">
          <i class="fa-solid fa-folder-plus"></i>
          <span>Courses & Content</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <a id="btn-admin-logout" class="sidebar-link" style="color: var(--danger-color); margin-top: auto; border-top: 1px solid var(--panel-border); border-radius: 0; padding-top: 15px; margin-top: 15px;">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>Logout</span>
        </a>
      </div>
    </aside>

    <!-- Main Content wrapper -->
    <main class="main-content" id="main-content-layout">
      <!-- Top header bar -->
      <div class="top-header glass-panel">
        <div class="header-title-section">
          <h1>Admin Control Panel ⚙️</h1>
          <p>Configure course structures, upload videos, and monitor students.</p>
        </div>

        <div class="header-actions">
          <!-- Theme Switcher -->
          <button id="layout-theme-toggle" class="theme-switcher-btn">
            <i class="fa-solid ${themeIcon}"></i>
          </button>

          <!-- User avatar badge -->
          <div class="profile-summary-badge" style="border-color: var(--danger-color);">
            <div class="profile-summary-avatar" style="background: var(--danger-color);">${initialLetter}</div>
            <span style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">
              ${user?.full_name || 'Admin'}
            </span>
          </div>
        </div>
      </div>

      <!-- Outlets for dynamic pages rendering -->
      <div id="main-view-outlet"></div>
    </main>
  `;
}

export function init() {
  const sidebar = document.getElementById('app-sidebar');
  const sidebarToggle = document.getElementById('mobile-sidebar-toggle');
  const mainContent = document.getElementById('main-content-layout');
  const hash = window.location.hash || '#admin/dashboard';

  // Highlight active link
  document.querySelectorAll('.sidebar-link').forEach(link => {
    const route = link.getAttribute('data-route');
    if (route && hash === route) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Mobile sidebar slide in
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });
    
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== sidebarToggle) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Bind theme toggler
  const themeBtn = document.getElementById('layout-theme-toggle');
  if (themeBtn) {
    themeBtn.onclick = () => {
      const nextTheme = window.weatherEngine.toggleTheme();
      const icon = themeBtn.querySelector('i');
      if (icon) {
        icon.className = nextTheme === 'night' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
    };
  }

  // Bind logout action
  const logoutBtn = document.getElementById('btn-admin-logout');
  if (logoutBtn) {
    logoutBtn.onclick = (e) => {
      e.preventDefault();
      authContext.logout();
    };
  }

  // Adjust styling for mobile header overlay spacing
  const mobileHeader = document.querySelector('.mobile-layout-header');
  if (window.innerWidth <= 768) {
    if (mobileHeader) mobileHeader.style.display = 'flex';
    if (mainContent) mainContent.style.paddingTop = '80px';
  } else {
    if (mobileHeader) mobileHeader.style.display = 'none';
    if (mainContent) mainContent.style.paddingTop = '40px';
  }
}
