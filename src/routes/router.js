import { authContext } from '../context/authContext.js';

let currentLayoutType = null;

// Route definition mapping hashes to renderers and roles
const routes = [
  { path: '#login', page: 'auth', guestOnly: true },
  { path: '#register', page: 'auth', guestOnly: true },
  { path: '#dashboard', page: 'dashboard', role: 'student' },
  { path: '#courses', page: 'courses', role: 'student' },
  { path: '#my-learning', page: 'myLearning', role: 'student' },
  { path: '#courses/:id', page: 'courseDetail', role: 'student' },
  { path: '#lessons/:id', page: 'lessonView', role: 'student' },
  { path: '#quizzes', page: 'quizzes', role: 'student' },
  { path: '#quizzes/:id', page: 'quizInterface', role: 'student' },
  { path: '#quizzes/:id/leaderboard', page: 'leaderboard', role: 'student' },
  { path: '#profile', page: 'profile', role: 'student' },
  
  // Admin Routes
  { path: '#admin/dashboard', page: 'adminDashboard', role: 'admin' },
  { path: '#admin/students', page: 'adminStudents', role: 'admin' },
  { path: '#admin/courses', page: 'adminCourses', role: 'admin' },
];

/**
 * Parses dynamic hash routes like '#courses/12' against templates like '#courses/:id'
 */
function matchRoute(hash, template) {
  const hashParts = hash.split('/');
  const templateParts = template.split('/');
  
  if (hashParts.length !== templateParts.length) return null;
  
  const params = {};
  
  for (let i = 0; i < templateParts.length; i++) {
    if (templateParts[i].startsWith(':')) {
      const key = templateParts[i].slice(1);
      params[key] = decodeURIComponent(hashParts[i]);
    } else if (templateParts[i] !== hashParts[i]) {
      return null;
    }
  }
  
  return params;
}

/**
 * Resolves active page renderer and parameters
 */
export function resolveRoute() {
  const hash = window.location.hash || '#dashboard';
  const { isAuthenticated, user, isLoading } = authContext.getState();
  
  if (isLoading) {
    document.getElementById('app').innerHTML = `
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh;">
        <div class="skeleton" style="width: 80px; height: 80px; border-radius: 50%;"></div>
        <p style="margin-top:20px; font-weight:600; color:var(--text-secondary);">Protecting your environment...</p>
      </div>
    `;
    return;
  }

  let matchedRoute = null;
  let routeParams = {};

  for (const route of routes) {
    const params = matchRoute(hash, route.path);
    if (params) {
      matchedRoute = route;
      routeParams = params;
      break;
    }
  }

  // Handle route not found
  if (!matchedRoute) {
    console.warn(`Route not found: ${hash}`);
    window.location.hash = isAuthenticated ? (user?.role === 'admin' ? '#admin/dashboard' : '#dashboard') : '#login';
    return;
  }

  // Route security guards
  if (matchedRoute.guestOnly && isAuthenticated) {
    window.location.hash = user?.role === 'admin' ? '#admin/dashboard' : '#dashboard';
    return;
  }

  if (matchedRoute.role) {
    if (!isAuthenticated) {
      window.location.hash = '#login';
      return;
    }
    if (matchedRoute.role !== user?.role) {
      console.warn(`Access Denied. Required role: ${matchedRoute.role}, user role: ${user?.role}`);
      window.location.hash = user?.role === 'admin' ? '#admin/dashboard' : '#dashboard';
      return;
    }
  }

  // Load and render page component dynamically
  renderPage(matchedRoute.page, routeParams);
}

/**
 * Dynamically loads and mounts the correct layout and page HTML
 */
async function renderPage(pageKey, params) {
  const appContainer = document.getElementById('app');
  const user = authContext.getState().user;
  
  try {
    let pageModule;
    let layoutModule;

    // Dynamically load page module based on route key
    switch (pageKey) {
      case 'auth':
        currentLayoutType = null; // Clear layout tracker when on auth pages
        pageModule = await import('../pages/auth.js?v=' + Date.now());
        appContainer.className = 'auth-wrapper';
        appContainer.innerHTML = await pageModule.render(params);
        if (pageModule.init) pageModule.init(params);
        break;

      default:
        // Load layout based on user role and avoid re-rendering if already active
        const requiredLayout = user?.role === 'admin' ? 'admin' : 'student';
        
        if (currentLayoutType !== requiredLayout) {
          currentLayoutType = requiredLayout;
          
          if (requiredLayout === 'admin') {
            layoutModule = await import('../layouts/adminLayout.js?v=' + Date.now());
            appContainer.className = 'layout-container';
            appContainer.innerHTML = layoutModule.render();
            layoutModule.init();
          } else {
            layoutModule = await import('../layouts/studentLayout.js?v=' + Date.now());
            appContainer.className = 'layout-container';
            appContainer.innerHTML = layoutModule.render();
            layoutModule.init();
          }
        } else {
          // Sync header information / highlight active link without rewriting layout
          if (requiredLayout === 'admin') {
            layoutModule = await import('../layouts/adminLayout.js?v=' + Date.now());
            layoutModule.init();
          } else {
            layoutModule = await import('../layouts/studentLayout.js?v=' + Date.now());
            layoutModule.init();
          }
        }

        // Target content placeholder in layout
        const mainContentEl = document.getElementById('main-view-outlet');
        if (mainContentEl) {
          // 1. Add transition fade-out class
          mainContentEl.className = 'route-transition-outlet fade-out';
          
          // Dynamic page importer
          let pagePath = `../pages/${pageKey}.js`;
          // Map special route keys to actual files
          if (pageKey === 'myLearning' || pageKey === 'courseDetail') {
            pagePath = '../pages/courses.js';
          } else if (pageKey === 'lessonView') {
            pagePath = '../pages/lessons.js';
          } else if (pageKey === 'quizInterface') {
            pagePath = '../pages/quizzes.js';
          }
          
          const page = await import(pagePath + '?v=' + Date.now());
          
          // Wait briefly for transition fade-out to finalize
          await new Promise(r => setTimeout(r, 120));
          
          // 2. Render page inside outlet
          mainContentEl.innerHTML = await page.render(params, pageKey === 'myLearning');
          
          // 3. Trigger fade-in transition
          mainContentEl.className = 'route-transition-outlet fade-in';
          if (page.init) page.init(params, pageKey === 'myLearning');
          
          // 4. Finalize animation class reset and audit visited directories
          setTimeout(() => {
            mainContentEl.className = 'route-transition-outlet';
            trackExplorerAchievement(pageKey);
          }, 120);
        }
        break;
    }
  } catch (error) {
    console.error(`Error mounting page ${pageKey}:`, error);
    appContainer.innerHTML = `
      <div class="glass-panel" style="padding: 40px; text-align: center; max-width: 500px; margin: 100px auto;">
        <h2 style="color: var(--danger-color); margin-bottom: 20px;"><i class="fa-solid fa-triangle-exclamation"></i> Rendering Error</h2>
        <p style="margin-bottom: 20px;">Could not render page: ${error.message}</p>
        <button class="btn btn-primary" onclick="window.location.reload()"><i class="fa-solid fa-rotate-right"></i> Reload Page</button>
      </div>
    `;
  }
}

// Router Event Listeners
window.addEventListener('hashchange', resolveRoute);
let previousUserId = null;
authContext.subscribe((state) => {
  const currentUserId = state.user?.id || null;
  if (currentUserId !== previousUserId) {
    previousUserId = currentUserId;
    resolveRoute();
  }
});

// Achievement tracking set
const visitedPages = new Set();
function trackExplorerAchievement(pageKey) {
  const primaryKeys = ['dashboard', 'courses', 'quizzes', 'profile', 'leaderboard'];
  if (primaryKeys.includes(pageKey)) {
    visitedPages.add(pageKey);
    if (visitedPages.size === 5 && window.ecoquestGamification) {
      window.ecoquestGamification.unlockAchievement('explorer_all', 'Master Explorer', 'Visited every environmental hub in the learning portal!', 100);
    }
  }
}
