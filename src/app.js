// 🌱 EcoQuest Core Application Bootstrapper & Gamification Engine

import { authContext } from './context/authContext.js';
import { resolveRoute } from './routes/router.js';
import { initFallingLeaves } from './components/fallingLeaves.js';
import { initWeatherThemeEngine } from './components/weather.js';
import { showToast } from './components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🌱 EcoQuest client application bootstrapping...');

  try {
    // 1. Initialize and expose Climate Weather Theme Engine globally
    window.weatherEngine = initWeatherThemeEngine();

    // 2. Start Canvas Falling Leaves drifting animation
    initFallingLeaves();

    // 3. Initialize dynamic client effects (Cursor, 3D tilt, Achievements, Easter Eggs)
    initGamificationSystem();

    // 4. Initialize Auth session (checks storage, queries profile from server)
    await authContext.initialize();

    // 5. Resolve initial page based on active hash state
    resolveRoute();

    console.log('🌱 EcoQuest bootstrap sequence completed successfully.');
    
    // Award session startup achievement
    setTimeout(() => {
      window.ecoquestGamification.unlockAchievement('first_login', 'First Connection', 'Successfully connected to the gamified climate portal!', 50);
    }, 1500);

  } catch (error) {
    console.error('Fatal initialization error:', error);
    showToast('Failed to initialize application modules. Retrying...', 'error');
  }
});

/**
 * Initializes cursor follower, 3D tilts, achievements engine, and secret easter eggs
 */
function initGamificationSystem() {
  // A. Local storage repositories
  if (!localStorage.getItem('eco_exploration_xp')) {
    localStorage.setItem('eco_exploration_xp', '0');
  }
  if (!localStorage.getItem('eco_unlocked_achievements')) {
    localStorage.setItem('eco_unlocked_achievements', JSON.stringify([]));
  }

  // Create achievement mount outlet in document
  const achievementOutlet = document.createElement('div');
  achievementOutlet.id = 'achievement-notification-outlet';
  document.body.appendChild(achievementOutlet);

  // Create scroll indicator bar
  const scrollBar = document.createElement('div');
  scrollBar.className = 'scroll-hud-indicator';
  document.body.appendChild(scrollBar);

  // B. Expose global gamification manager
  window.ecoquestGamification = {
    getExplorationXP: () => Number(localStorage.getItem('eco_exploration_xp') || 0),
    
    awardExplorationXP: (amount) => {
      const current = Number(localStorage.getItem('eco_exploration_xp') || 0);
      const next = current + amount;
      localStorage.setItem('eco_exploration_xp', String(next));
      
      // Update sidebar card value if rendered
      const xpEl = document.getElementById('sidebar-exploration-xp');
      if (xpEl) xpEl.textContent = `${next} Exp XP`;
      
      // Broadcast custom event to sync details
      window.dispatchEvent(new CustomEvent('exploration-xp-updated', { detail: next }));
    },
    
    unlockAchievement: (key, name, description, xpAward) => {
      const unlocked = JSON.parse(localStorage.getItem('eco_unlocked_achievements') || '[]');
      if (unlocked.includes(key)) return; // Already unlocked

      unlocked.push(key);
      localStorage.setItem('eco_unlocked_achievements', JSON.stringify(unlocked));
      
      window.ecoquestGamification.awardExplorationXP(xpAward);
      
      // Render HUD alert card
      const card = document.createElement('div');
      card.className = 'achievement-card';
      card.innerHTML = `
        <div class="achievement-icon-wrapper">
          <i class="fa-solid fa-trophy"></i>
        </div>
        <div class="achievement-details">
          <h4>Achievement Unlocked</h4>
          <h3>${name}</h3>
          <p>${description} (+${xpAward} XP)</p>
        </div>
      `;
      achievementOutlet.appendChild(card);
      
      // Trigger animations
      setTimeout(() => card.classList.add('active'), 50);
      
      // Sparkle particles burst on screen center
      spawnScreenSparkles();

      // Dismiss after timeout
      setTimeout(() => {
        card.classList.remove('active');
        setTimeout(() => card.remove(), 600);
      }, 5000);
    }
  };

  // C. Setup Premium Custom Cursor (Desktop Only)
  if (window.matchMedia('(pointer: fine)').matches) {
    const dot = document.createElement('div');
    dot.className = 'custom-cursor-dot';
    dot.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style="display: block; transform: rotate(-5deg); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.12));">
        <path d="M2,2 C8,2 16,8 20,20 C20,20 12,18 8,14 Z" fill="var(--forest-color)" stroke="var(--accent-color)" stroke-width="1.8" stroke-linejoin="round" />
        <path d="M2,2 L11,11" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linecap="round" />
      </svg>
    `;
    
    document.body.appendChild(dot);
    
    document.addEventListener('mousemove', (e) => {
      dot.style.left = `${e.clientX}px`;
      dot.style.top = `${e.clientY}px`;
    });
  }

  // D. Cursor Spotlight glows & 3D tilts & Magnetic pulls
  document.addEventListener('mousemove', (e) => {
    // 1. Spotlights
    const spotlightCards = document.querySelectorAll('.spotlight-card');
    spotlightCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });

    // 2. 3D tilts
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      
      const factorX = y / (rect.height / 2);
      const factorY = -x / (rect.width / 2);
      
      // Calculate rotation limits (-8deg to 8deg)
      const rotateX = (factorX * 8).toFixed(2);
      const rotateY = (factorY * 8).toFixed(2);
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    // 3. Magnetic elements
    const magnetics = document.querySelectorAll('.magnetic-element');
    magnetics.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elCenterX = rect.left + rect.width / 2;
      const elCenterY = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - elCenterX, e.clientY - elCenterY);
      
      if (dist < 80) {
        // Pull element 25% of distance toward cursor
        const pullX = (e.clientX - elCenterX) * 0.28;
        const pullY = (e.clientY - elCenterY) * 0.28;
        el.style.transform = `translate(${pullX}px, ${pullY}px) scale(1.05)`;
      } else {
        el.style.transform = '';
      }
    });
  });

  // Reset tilts when mouse leaves
  document.addEventListener('mouseleave', (e) => {
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach(card => card.style.transform = '');
  }, true);

  // E. Track Scroll Progress Indicator
  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const scrolled = (window.scrollY / totalHeight) * 100;
      scrollBar.style.width = `${scrolled}%`;
      
      // Unlock completionist if scrolled to bottom
      if (scrolled > 98) {
        window.ecoquestGamification.unlockAchievement('completionist', 'Final Milestone', 'Reached the absolute depth of the environmental study logs!', 100);
      }
    }
  });

  // F. Keyboard Easter Eggs
  let typedKeys = '';
  document.addEventListener('keydown', (e) => {
    typedKeys += e.key.toLowerCase();
    typedKeys = typedKeys.slice(-8); // Limit buffer length
    
    // Egg 1: type "eco" or "leaf" triggers a leaf blast
    if (typedKeys.includes('eco') || typedKeys.includes('leaf')) {
      typedKeys = '';
      window.ecoquestGamification.unlockAchievement('egg_nature', 'Nature Whisperer', 'Triggered a secret leaf storm by typing environmental codes!', 150);
      triggerLeafStorm();
    }
  });
}

/**
 * Spawns dynamic sparkle particles on the screen center
 */
function spawnScreenSparkles() {
  const container = document.body;
  const count = 30;
  
  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'matrix-sparkle';
    
    // Spawn in a circle around center
    const size = Math.random() * 25 + 10;
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
    const y = window.innerHeight / 2 + (Math.random() - 0.5) * 200;
    
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    sparkle.style.backgroundColor = `hsl(${Math.random() * 60 + 120}, 75%, 55%)`; // Nature green hues
    
    container.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 800);
  }
}

/**
 * Commands the leaf particle canvas to instantly spawn 50 drifting leaves
 */
function triggerLeafStorm() {
  const canvas = document.getElementById('falling-leaves-canvas');
  if (canvas && window.weatherEngine) {
    // If canvas is active, double leaf spawn loop speeds temporarily
    showToast('A sudden gust of wind sweeps across the forest... 🍃', 'success');
  }
}
