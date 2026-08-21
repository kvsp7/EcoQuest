import { authContext } from '../context/authContext.js';
import { showToast } from '../components/toast.js';

const leftTreeHtml = `
  <div class="auth-tree-left">
    <svg viewBox="0 0 300 480" width="100%" height="100%">
      <!-- Organic Tree Trunk -->
      <path d="M 150,480 C 150,400 130,300 130,220 L 170,220 C 170,300 150,400 150,480 Z" fill="#78350f" opacity="0.45" />
      <path d="M 130,220 C 100,240 70,220 40,180" fill="none" stroke="#78350f" stroke-width="8" stroke-linecap="round" opacity="0.45" />
      <path d="M 170,220 C 200,240 230,220 260,180" fill="none" stroke="#78350f" stroke-width="8" stroke-linecap="round" opacity="0.45" />
      <path d="M 150,220 C 150,150 120,100 100,60" fill="none" stroke="#78350f" stroke-width="8" stroke-linecap="round" opacity="0.45" />
      <path d="M 150,220 C 150,150 180,100 200,60" fill="none" stroke="#78350f" stroke-width="8" stroke-linecap="round" opacity="0.45" />
      
      <!-- Foliage circles overlaying organically -->
      <circle cx="40" cy="180" r="45" fill="var(--forest-color)" opacity="0.2" />
      <circle cx="25" cy="165" r="30" fill="var(--accent-color)" opacity="0.25" />
      <circle cx="260" cy="180" r="45" fill="var(--forest-color)" opacity="0.2" />
      <circle cx="275" cy="165" r="30" fill="var(--accent-color)" opacity="0.25" />
      <circle cx="150" cy="160" r="60" fill="var(--forest-color)" opacity="0.18" />
      <circle cx="100" cy="60" r="45" fill="var(--accent-color)" opacity="0.25" />
      <circle cx="200" cy="60" r="45" fill="var(--accent-color)" opacity="0.25" />
      <circle cx="150" cy="70" r="50" fill="var(--forest-color)" opacity="0.2" />
    </svg>
  </div>
`;

const rightTreeHtml = `
  <div class="auth-tree-right">
    <svg viewBox="0 0 300 480" width="100%" height="100%">
      <!-- Organic Leaning Tree Trunk -->
      <path d="M 150,480 C 145,400 155,300 160,220 L 200,220 C 195,300 185,400 150,480 Z" fill="#78350f" opacity="0.45" />
      <path d="M 160,220 C 120,230 80,210 50,160" fill="none" stroke="#78350f" stroke-width="8" stroke-linecap="round" opacity="0.45" />
      <path d="M 200,220 C 230,230 260,200 280,150" fill="none" stroke="#78350f" stroke-width="8" stroke-linecap="round" opacity="0.45" />
      <path d="M 180,220 C 170,140 130,90 110,50" fill="none" stroke="#78350f" stroke-width="8" stroke-linecap="round" opacity="0.45" />
      <path d="M 180,220 C 190,140 220,90 240,50" fill="none" stroke="#78350f" stroke-width="8" stroke-linecap="round" opacity="0.45" />
      
      <!-- Foliage overlay circles -->
      <circle cx="50" cy="160" r="45" fill="var(--forest-color)" opacity="0.2" />
      <circle cx="35" cy="145" r="30" fill="var(--accent-color)" opacity="0.25" />
      <circle cx="280" cy="150" r="45" fill="var(--forest-color)" opacity="0.2" />
      <circle cx="295" cy="135" r="30" fill="var(--accent-color)" opacity="0.25" />
      <circle cx="180" cy="150" r="60" fill="var(--forest-color)" opacity="0.18" />
      <circle cx="110" cy="50" r="45" fill="var(--accent-color)" opacity="0.25" />
      <circle cx="240" cy="50" r="45" fill="var(--accent-color)" opacity="0.25" />
      <circle cx="175" cy="60" r="50" fill="var(--forest-color)" opacity="0.2" />
    </svg>
  </div>
`;

export async function render() {
  const hash = window.location.hash || '#login';
  const isRegister = hash === '#register';

  if (isRegister) {
    return `
      ${leftTreeHtml}
      ${rightTreeHtml}
      <div class="auth-card glass-panel">
        <div style="font-size: 3rem; margin-bottom: 10px; color: var(--forest-color);">
          <i class="fa-solid fa-seedling animate-bounce"></i>
        </div>
        <h2 style="font-size: 2rem; margin-bottom: 10px; font-family: var(--font-title);">Join EcoQuest</h2>
        <p style="color: var(--text-secondary); margin-bottom: 30px;">Embark on your environmental learning journey</p>
        
        <form id="auth-register-form" autocomplete="off">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input type="text" id="reg-fullname" class="form-control" placeholder="Your Full Name" required autocomplete="off">
          </div>
          
          <div class="form-group">
            <label class="form-label">Email Address</label>
            <input type="email" id="reg-email" class="form-control" placeholder="yourname@domain.com" required autocomplete="off">
          </div>

          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" id="reg-username" class="form-control" placeholder="Choose a username" required autocomplete="off">
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <input type="password" id="reg-password" class="form-control" placeholder="Choose a password" required minlength="6" autocomplete="new-password">
          </div>

          <div class="form-group">
            <label class="form-label">College / School Name</label>
            <input type="text" id="reg-college" class="form-control" placeholder="Your College/School Name" required autocomplete="off">
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px;">
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Course / Stream</label>
              <input type="text" id="reg-course" class="form-control" placeholder="e.g. Science" autocomplete="off">
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label class="form-label">Year of Study</label>
              <input type="text" id="reg-year" class="form-control" placeholder="e.g. 2nd Year" autocomplete="off">
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px;"><i class="fa-solid fa-user-plus"></i> Complete Registration</button>
        </form>

        <p style="margin-top: 25px; font-size: 0.9rem; color: var(--text-secondary);">
          Already have an account? <a href="#login" style="color: var(--forest-color); font-weight: 600; text-decoration: none;">Sign In here</a>
        </p>
      </div>
    `;
  }

  // Else, render login
  return `
    ${leftTreeHtml}
    ${rightTreeHtml}
    <div class="auth-card glass-panel" style="max-width: 440px;">
      <div style="font-size: 3.5rem; margin-bottom: 15px; color: var(--forest-color);">
        <i class="fa-solid fa-earth-americas"></i>
      </div>
      <h2 style="font-size: 2rem; margin-bottom: 10px; font-family: var(--font-title);">EcoQuest</h2>
      <p style="color: var(--text-secondary); margin-bottom: 30px;">Sign in to continue your environmental quest</p>
      
      <form id="auth-login-form" autocomplete="off">
        <div class="form-group">
          <label class="form-label">Username or Email</label>
          <input type="text" id="login-username" class="form-control" placeholder="Enter your username or email" required autocomplete="new-password">
        </div>
        
        <div class="form-group" style="margin-bottom: 25px;">
          <label class="form-label">Password</label>
          <input type="password" id="login-password" class="form-control" placeholder="Enter your password" required autocomplete="new-password">
        </div>

        <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px;"><i class="fa-solid fa-right-to-bracket"></i> Sign In</button>
      </form>

      <p style="margin-top: 25px; font-size: 0.9rem; color: var(--text-secondary);">
        New to EcoQuest? <a href="#register" style="color: var(--forest-color); font-weight: 600; text-decoration: none;">Create an account</a>
      </p>
    </div>
  `;
}

export function init() {
  const loginForm = document.getElementById('auth-login-form');
  const registerForm = document.getElementById('auth-register-form');

  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const username = document.getElementById('login-username').value.trim();
      const password = document.getElementById('login-password').value;
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

      try {
        const user = await authContext.login(username, password);
        showToast(`Welcome back, ${user.full_name || user.username}! 🌱`, 'success');
        
        // Append full-screen popping tree loading overlay
        const overlay = document.createElement('div');
        overlay.className = 'tree-loading-overlay';
        overlay.innerHTML = `
          <div class="tree-loading-content">
            <svg class="pop-tree-svg" viewBox="0 0 120 120" width="120" height="120">
              <!-- Trunk -->
              <path class="grow-trunk" d="M 60,110 L 60,50" fill="none" stroke="#78350f" stroke-width="8" stroke-linecap="round" />
              <!-- Branches -->
              <path class="grow-branch left" d="M 60,85 C 45,85 35,70 25,60" fill="none" stroke="#78350f" stroke-width="5" stroke-linecap="round" />
              <path class="grow-branch right" d="M 60,70 C 75,70 85,55 95,45" fill="none" stroke="#78350f" stroke-width="5" stroke-linecap="round" />
              <!-- Leaves -->
              <circle class="pop-leaf leaf-1" cx="60" cy="42" r="18" fill="var(--forest-color)" />
              <circle class="pop-leaf leaf-2" cx="25" cy="60" r="12" fill="var(--accent-color)" />
              <circle class="pop-leaf leaf-3" cx="95" cy="45" r="12" fill="var(--accent-color)" />
            </svg>
            <p class="pop-tree-text">Growing your EcoQuest...</p>
          </div>
        `;
        document.body.appendChild(overlay);
        
        // Let the tree pop and grow (1.8s) before redirection
        await new Promise(resolve => setTimeout(resolve, 1800));
        overlay.remove();

        // Role redirect
        if (user.role === 'admin') {
          window.location.hash = '#admin/dashboard';
        } else {
          window.location.hash = '#dashboard';
        }
      } catch (error) {
        showToast(error.message || 'Login failed. Please check your credentials.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In';
      }
    };
  }

  if (registerForm) {
    registerForm.onsubmit = async (e) => {
      e.preventDefault();
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      
      const userData = {
        username: document.getElementById('reg-username').value.trim(),
        email: document.getElementById('reg-email').value.trim(),
        password: document.getElementById('reg-password').value,
        full_name: document.getElementById('reg-fullname').value.trim(),
        college: document.getElementById('reg-college').value.trim(),
        course: document.getElementById('reg-course').value.trim() || null,
        year: document.getElementById('reg-year').value.trim() || null
      };

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating account...';

      try {
        await authContext.register(userData);
        showToast('Registration successful! Please login.', 'success');
        window.location.hash = '#login';
      } catch (error) {
        showToast(error.message || 'Registration failed. Try a different username/email.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Complete Registration';
      }
    };
  }
}
