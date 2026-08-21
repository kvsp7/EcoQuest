import { authContext } from '../context/authContext.js';
import { calculateLevel } from '../utils/helpers.js';

export function render() {
  const { user } = authContext.getState();
  const initialLetter = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S';
  const theme = document.body.getAttribute('data-theme') === 'night' ? 'night' : 'day';
  const themeIcon = theme === 'night' ? 'fa-sun' : 'fa-moon';
  
  // Gamification metrics
  const xp = user?.gamification?.total_xp ?? user?.total_xp ?? 0;
  const points = user?.gamification?.total_points ?? user?.total_points ?? 0;
  const streak = user?.gamification?.current_streak ?? user?.current_streak ?? 0;
  
  const { level, xpInCurrentLevel, nextLevelXp } = calculateLevel(xp);
  const xpPercent = Math.min(100, Math.floor((xpInCurrentLevel / nextLevelXp) * 100));

  return `
    <!-- Mobile Hamburger Toggle Header -->
    <header class="mobile-layout-header glass-panel" style="display: none; padding: 12px 20px; align-items: center; justify-content: space-between; position: fixed; top: 0; left: 0; width: 100%; z-index: 1000;">
      <div style="display: flex; align-items: center; gap: 10px;">
        <button id="mobile-sidebar-toggle" class="btn btn-secondary btn-icon" style="border: none; background: rgba(0,0,0,0.05);">
          <i class="fa-solid fa-bars"></i>
        </button>
        <span style="font-family: var(--font-title); font-weight: 800; color: var(--forest-color); font-size: 1.25rem;">🌱 EcoQuest</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <div style="font-size: 0.95rem; font-weight: 700; color: var(--streak-color); display: flex; align-items: center; gap: 4px;">
          <i class="fa-solid fa-fire animate-bounce"></i> ${streak}
        </div>
      </div>
    </header>

    <!-- Radial Command Sidebar -->
    <aside class="sidebar glass-panel" id="app-sidebar">
      <div style="width: 100%; display: flex; justify-content: center; margin-bottom: 15px; padding-left: 0;">
        <h2 style="font-family: var(--font-title); font-size: 1.6rem; font-weight: 850; color: var(--forest-color); display: flex; align-items: center; gap: 10px;">
          <i class="fa-solid fa-leaf text-accent"></i> EcoQuest
        </h2>
      </div>

      <!-- 🌳 Interactive Quest Tree Navigation (Enlarged Majestic Tree) -->
      <div class="tree-navigation-wrapper">
        <!-- SVG Tree Structure -->
        <svg width="240" height="380" viewBox="0 0 240 380" style="position: absolute; top: 0; left: 0; z-index: 1;">
          <!-- Ground Grass Base Camp Mound -->
          <path d="M 15,360 C 70,335 170,335 225,360 L 225,378 C 170,370 70,370 15,378 Z" fill="var(--mountain-bg)" stroke="var(--panel-border)" stroke-width="1.5" />
          <path d="M 15,360 C 70,335 170,335 225,360" fill="none" stroke="var(--accent-color)" stroke-width="2" />

          <!-- Top crown tree canopy background (lush overlapping green leaves shifted down) -->
          <circle cx="120" cy="60" r="48" fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.22)" stroke-width="1.5" />
          <circle cx="90" cy="70" r="34" fill="rgba(16, 185, 129, 0.08)" />
          <circle cx="150" cy="70" r="34" fill="rgba(16, 185, 129, 0.08)" />
          <circle cx="120" cy="40" r="28" fill="rgba(5, 150, 105, 0.1)" />
          
          <!-- Organic Tapered Tree Trunk (rooted inside ground mound) -->
          <path d="M 110,365 C 114,260 116,140 117,60 L 123,60 C 124,140 126,260 130,365 Z" fill="#78350f" opacity="0.45" />
          
          <!-- Large Tapered Branches -->
          <!-- Branch 1 (Base Left) -->
          <path d="M 118,335 C 95,340 75,340 45,315" fill="none" stroke="#78350f" stroke-width="5" stroke-linecap="round" opacity="0.45" />
          <!-- Branch 2 (Lower Right) -->
          <path d="M 122,265 C 145,270 165,270 195,245" fill="none" stroke="#78350f" stroke-width="5" stroke-linecap="round" opacity="0.45" />
          <!-- Branch 3 (Mid Left) -->
          <path d="M 118,195 C 95,200 75,200 45,175" fill="none" stroke="#78350f" stroke-width="5" stroke-linecap="round" opacity="0.45" />
          <!-- Branch 4 (High Right) -->
          <path d="M 122,125 C 145,130 165,130 195,105" fill="none" stroke="#78350f" stroke-width="5" stroke-linecap="round" opacity="0.45" />

          <!-- Lush Sprouts / Leaf Ellipses on Branches -->
          <!-- Branch 1 Leaves -->
          <ellipse cx="85" cy="333" rx="16" ry="7" fill="var(--forest-color)" transform="rotate(-15 85 333)" opacity="0.85" />
          <ellipse cx="60" cy="327" rx="12" ry="5" fill="var(--accent-color)" transform="rotate(-30 60 327)" opacity="0.85" />
          
          <!-- Branch 2 Leaves -->
          <ellipse cx="155" cy="263" rx="16" ry="7" fill="var(--forest-color)" transform="rotate(15 155 263)" opacity="0.85" />
          <ellipse cx="180" cy="257" rx="12" ry="5" fill="var(--accent-color)" transform="rotate(30 180 257)" opacity="0.85" />
          
          <!-- Branch 3 Leaves -->
          <ellipse cx="85" cy="193" rx="16" ry="7" fill="var(--forest-color)" transform="rotate(-15 85 193)" opacity="0.85" />
          <ellipse cx="60" cy="187" rx="12" ry="5" fill="var(--accent-color)" transform="rotate(-30 60 187)" opacity="0.85" />
          
          <!-- Branch 4 Leaves -->
          <ellipse cx="155" cy="123" rx="16" ry="7" fill="var(--forest-color)" transform="rotate(15 155 123)" opacity="0.85" />
          <ellipse cx="180" cy="117" rx="12" ry="5" fill="var(--accent-color)" transform="rotate(30 180 117)" opacity="0.85" />
        </svg>

        <!-- Interactive Branch Nodes -->
        <!-- Branch 1: Dashboard (Base Left) -->
        <a href="#dashboard" class="tree-node magnetic-element" data-route="#dashboard" style="left: 11px; top: 291px;" title="Dashboard">
          <div class="tree-node-circle"><i class="fa-solid fa-house"></i></div>
          <span class="tree-node-tooltip">Dashboard</span>
        </a>

        <!-- Branch 2: Courses (Lower Right) -->
        <a href="#courses" class="tree-node magnetic-element" data-route="#courses" style="left: 181px; top: 221px;" title="Courses">
          <div class="tree-node-circle"><i class="fa-solid fa-compass"></i></div>
          <span class="tree-node-tooltip tooltip-left">Courses</span>
        </a>

        <!-- Branch 3: My Learning (Mid Left) -->
        <a href="#my-learning" class="tree-node magnetic-element" data-route="#my-learning" style="left: 11px; top: 151px;" title="My Pathways">
          <div class="tree-node-circle"><i class="fa-solid fa-graduation-cap"></i></div>
          <span class="tree-node-tooltip">Pathways</span>
        </a>

        <!-- Branch 4: Leaderboard (High Right) -->
        <a href="#quizzes" class="tree-node magnetic-element" data-route="#quizzes" style="left: 181px; top: 81px;" title="Leaderboard">
          <div class="tree-node-circle"><i class="fa-solid fa-trophy"></i></div>
          <span class="tree-node-tooltip tooltip-left">Leaderboard</span>
        </a>

        <!-- Branch 5: Profile (Crown Center) -->
        <a href="#profile" class="tree-node magnetic-element" data-route="#profile" style="left: 96px; top: 31px;" title="Summit Profile">
          <div class="tree-node-circle"><i class="fa-solid fa-user-astronaut"></i></div>
          <span class="tree-node-tooltip">Summit Profile</span>
        </a>

        <!-- 🐒 Swinging Monkey Token -->
        <div id="tree-monkey-token" style="position: absolute; width: 32px; height: 32px; font-size: 1.85rem; display: flex; align-items: center; justify-content: center; z-index: 10; pointer-events: none; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));">
          🐒
        </div>
      </div>

      <!-- Bottom actions & profile card -->
      <div class="sidebar-footer" style="width: 100%; display: flex; flex-direction: column; gap: 15px;">
        <a id="btn-student-logout" class="sidebar-link" style="color: var(--danger-color); display: flex; align-items: center; gap: 10px; padding: 10px 12px; font-weight: 700; text-decoration: none; cursor: pointer;">
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>Logout</span>
        </a>

        <!-- Student Profile Widget -->
        <div class="sidebar-user-card">
          <div class="sidebar-user-avatar">
            <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:var(--forest-color); color:white; font-weight:800; font-size:1.15rem;">
              ${initialLetter}
            </div>
          </div>
          <div class="sidebar-user-info">
            <h4>${user?.full_name || 'Alex Mercer'}</h4>
            <p>Level ${level} Eco-Guardian</p>
            
            <div style="margin-top: 5px;">
              <div style="display:flex; justify-content:space-between; font-size:0.6rem; font-weight:700; margin-bottom:2px; color: var(--text-secondary);">
                <span>XP Progress</span>
                <span>${xpInCurrentLevel}/${nextLevelXp}</span>
              </div>
              <div class="progress-bar-track" style="height: 4px;">
                <div class="progress-bar-fill" style="width: ${xpPercent}%;"></div>
              </div>
            </div>
            
            <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem; font-weight: 600; color: var(--text-secondary); border-top: 1px dashed var(--panel-border); padding-top: 8px;">
              <span><i class="fa-solid fa-compass" style="color: var(--accent-color);"></i> Exploration XP</span>
              <span id="sidebar-exploration-xp" style="font-weight: 750; color: var(--forest-color);">${window.ecoquestGamification ? window.ecoquestGamification.getExplorationXP() : 0} XP</span>
            </div>
          </div>
        </div>
        
        <!-- Hidden Ladybug Easter Egg -->
        <div style="text-align: center; margin-top: 5px; font-size: 0.85rem;">
          <span class="ladybug-easter-egg" id="ladybug-egg-trigger" title="Eco-Companion 🐞">🐞</span>
        </div>
      </div>
    </aside>

    <!-- Main Content wrapper -->
    <main class="main-content" id="main-content-layout">
      <!-- Top header bar for stats, theme toggle, and search inputs -->
      <div class="top-header glass-panel">
        <div class="header-title-section">
          <h1 id="header-greeting-title" style="font-size: 1.6rem; font-family: var(--font-title); font-weight: 800;">Welcome back! 👋</h1>
          <p id="header-greeting-subtitle">Protect & learn about the environment today.</p>
        </div>

        <div class="header-actions">
          <!-- Live search courses, quizzes bar -->
          <div class="header-search-bar">
            <input type="text" id="header-global-search" class="form-control" placeholder="Search courses, quizzes...">
            <i class="fa-solid fa-magnifying-glass"></i>
          </div>

          <!-- Climate Theme switcher override toggler -->
          <button id="layout-theme-toggle" class="theme-switcher-btn" title="Toggle climate time theme override" style="margin-left: 10px;">
            <i class="fa-solid ${themeIcon}"></i>
          </button>

          <!-- Notification Bell icon badge -->
          <div style="position: relative; cursor: pointer; margin-left: 5px;" id="btn-notification-bell" title="Alert Notifications">
            <button class="btn btn-secondary btn-icon" style="width: 38px; height: 38px; border-radius: 50%; padding: 0;">
              <i class="fa-regular fa-bell" style="font-size: 1.1rem;"></i>
            </button>
            <span style="position: absolute; top: -3px; right: -3px; background: var(--streak-color); color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 0.65rem; font-weight: 800; display: flex; align-items: center; justify-content: center;">3</span>
          </div>

          <!-- Settings Cog icon link -->
          <button class="btn btn-secondary btn-icon" style="width: 38px; height: 38px; border-radius: 50%; padding: 0; margin-left: 5px;" id="btn-settings-cog" title="Settings">
            <i class="fa-solid fa-gear" style="font-size: 1.1rem;"></i>
          </button>
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
  const hash = window.location.hash || '#dashboard';

  // Tree Quest coordinate offsets for monkey token hanging below active branch nodes (shifted down 25px)
  const treeCoordinates = {
    '#dashboard': { x: 19, y: 327 },
    '#courses': { x: 189, y: 257 },
    '#my-learning': { x: 19, y: 187 },
    '#quizzes': { x: 189, y: 117 },
    '#profile': { x: 104, y: 67 }
  };

  const activeNodeKey = Object.keys(treeCoordinates).find(key => {
    if (key === '#quizzes') {
      return hash === '#quizzes' || hash.startsWith('#quizzes/') || hash.startsWith('#leaderboard');
    }
    if (key === '#courses') {
      return hash === '#courses' || hash.startsWith('#courses/');
    }
    return hash === key;
  }) || '#dashboard';

  // Highlight active link in Quest Tree nodes
  document.querySelectorAll('.tree-node').forEach(node => {
    const route = node.getAttribute('data-route');
    const isQuizzesRoute = route === '#quizzes' && activeNodeKey === '#quizzes';
    const isCoursesRoute = route === '#courses' && activeNodeKey === '#courses';
    if (route && (activeNodeKey === route || isQuizzesRoute || isCoursesRoute)) {
      node.classList.add('active');
    } else {
      node.classList.remove('active');
    }
  });

  // Animate Swinging Monkey Token to the active coordinate branch with acrobatics!
  const monkey = document.getElementById('tree-monkey-token');
  const coord = treeCoordinates[activeNodeKey];
  if (monkey && coord) {
    const currentLeft = monkey.style.left;
    const currentTop = monkey.style.top;
    
    // Only perform jump backflip acrobat when changing locations!
    if (currentLeft && (currentLeft !== `${coord.x}px` || currentTop !== `${coord.y}px`)) {
      monkey.classList.add('monkey-jump');
      setTimeout(() => {
        monkey.classList.remove('monkey-jump');
      }, 900);
    }
    
    monkey.style.left = `${coord.x}px`;
    monkey.style.top = `${coord.y}px`;
  }

  // Mobile sidebar slide in
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });
    
    // Clicking outside sidebar closes it
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== sidebarToggle) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Bind theme toggler
  let themeClickCount = 0;
  const themeBtn = document.getElementById('layout-theme-toggle');
  if (themeBtn) {
    themeBtn.onclick = () => {
      const nextTheme = window.weatherEngine.toggleTheme();
      const icon = themeBtn.querySelector('i');
      if (icon) {
        icon.className = nextTheme === 'night' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
      
      themeClickCount++;
      if (themeClickCount >= 3 && window.ecoquestGamification) {
        window.ecoquestGamification.unlockAchievement('curious_explorer', 'Curious Astronomer', 'Controlled the day and night environmental cycles 3 times!', 50);
      }
    };
  }

  // Bind Ladybug click easter egg
  const ladybug = document.getElementById('ladybug-egg-trigger');
  if (ladybug) {
    ladybug.onclick = () => {
      if (window.ecoquestGamification) {
        window.ecoquestGamification.unlockAchievement('egg_ladybug', 'Ladybug Discovery', 'Discovered the hidden forest companion on the sidebar!', 100);
      }
      
      // Spawn ladybug flying effect particles
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'matrix-sparkle';
        const rect = ladybug.getBoundingClientRect();
        
        const size = Math.random() * 8 + 4;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${rect.left + 10 + (Math.random() - 0.5) * 50}px`;
        particle.style.top = `${rect.top + 10 + (Math.random() - 0.5) * 50}px`;
        particle.style.backgroundColor = '#ef4444'; // Ladybug red
        
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
      }
    };
  }

  // Bind notifications bell
  const bell = document.getElementById('btn-notification-bell');
  if (bell) {
    bell.onclick = () => {
      import('../components/toast.js').then(module => {
        module.showToast("You have 3 unread notification highlights. Keep learning! 🔥", "info");
      });
    };
  }

  // Bind settings cog
  const cog = document.getElementById('btn-settings-cog');
  if (cog) {
    cog.onclick = () => {
      window.location.hash = '#profile';
    };
  }

  // Bind global search bar actions
  const globalSearch = document.getElementById('header-global-search');
  if (globalSearch) {
    globalSearch.onkeypress = (e) => {
      if (e.key === 'Enter') {
        const query = globalSearch.value.trim();
        if (query) {
          window.location.hash = '#courses';
          // Filter explorer catalog dynamically on loading after timeout
          setTimeout(() => {
            const catSearch = document.getElementById('catalog-search-input');
            if (catSearch) {
              catSearch.value = query;
              catSearch.dispatchEvent(new Event('input'));
            }
          }, 200);
        }
      }
    };
  }

  // Bind logout action
  const logoutBtn = document.getElementById('btn-student-logout');
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
