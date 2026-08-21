import { authContext } from '../context/authContext.js';
import { calculateLevel } from '../utils/helpers.js';

export async function render() {
  const { user } = authContext.getState();
  
  const xp = user?.gamification?.total_xp ?? user?.total_xp ?? 0;
  const points = user?.gamification?.total_points ?? user?.total_points ?? 0;
  const streak = user?.gamification?.current_streak ?? user?.current_streak ?? 0;
  const longestStreak = user?.gamification?.longest_streak ?? user?.longest_streak ?? 0;
  const activeDays = user?.gamification?.active_days ?? user?.active_days ?? 1;

  const initialLetter = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S';
  const lvlInfo = calculateLevel(xp);

  return `
    <div style="max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; gap: 30px;">
      
      <!-- Top profile card -->
      <div class="glass-panel spotlight-card tilt-card" style="padding: 40px; display: flex; align-items: center; gap: 30px; flex-wrap: wrap;">
        <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--forest-color) 0%, var(--accent-color) 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 3rem; font-family: var(--font-title); font-weight: 800; box-shadow: 0 8px 25px rgba(46,125,50,0.3);">
          ${initialLetter}
        </div>
        
        <div style="flex-grow: 1; min-width: 250px;">
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <h2 style="font-size: 1.8rem; font-family: var(--font-title);">${user?.full_name || 'Explorer Student'}</h2>
            <span class="badge" style="background: rgba(76, 175, 80, 0.15); color: var(--forest-color); padding: 4px 10px; border-radius: 100px; font-weight: 700; text-transform: uppercase;">
              <i class="fa-solid fa-leaf"></i> Level ${lvlInfo.level} Eco-Guardian
            </span>
          </div>
          <p style="color: var(--text-secondary); margin-top: 4px; font-weight: 500;">@${user?.username || 'username'}</p>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 6px;"><i class="fa-solid fa-envelope"></i> ${user?.email || 'student@school.edu'}</p>
        </div>
      </div>

      <!-- Information & Gamification Grid -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; flex-wrap: wrap;">
        
        <!-- Academics Card -->
        <div class="glass-panel section-card spotlight-card" style="margin-bottom: 0;">
          <h2><i class="fa-solid fa-school"></i> Academic Details</h2>
          <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--panel-border); padding-bottom: 8px;">
              <span style="color: var(--text-secondary); font-weight: 500; font-size: 0.95rem;">Institution / College</span>
              <span style="font-weight: 600;">${user?.college || 'EcoQuest Academy'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--panel-border); padding-bottom: 8px;">
              <span style="color: var(--text-secondary); font-weight: 500; font-size: 0.95rem;">Course / Branch</span>
              <span style="font-weight: 600;">${user?.course || 'Environmental Education'}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 8px;">
              <span style="color: var(--text-secondary); font-weight: 500; font-size: 0.95rem;">Year of Study</span>
              <span style="font-weight: 600;">${user?.year || '1st Year'}</span>
            </div>
          </div>
        </div>

        <!-- Gamification stats -->
        <div class="glass-panel section-card spotlight-card" style="margin-bottom: 0;">
          <h2><i class="fa-solid fa-medal"></i> Learning Achievements</h2>
          <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 15px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--panel-border); padding-bottom: 8px;">
              <span style="color: var(--text-secondary); font-weight: 500; font-size: 0.95rem;"><i class="fa-solid fa-star" style="color: var(--xp-color);"></i> Experience Points</span>
              <span style="font-weight: 700; color: var(--xp-color);">${xp} XP</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--panel-border); padding-bottom: 8px;">
              <span style="color: var(--text-secondary); font-weight: 500; font-size: 0.95rem;"><i class="fa-solid fa-leaf" style="color: var(--points-color);"></i> EcoPoints Balance</span>
              <span style="font-weight: 700; color: var(--points-color);">${points} PTS</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--panel-border); padding-bottom: 8px;">
              <span style="color: var(--text-secondary); font-weight: 500; font-size: 0.95rem;"><i class="fa-solid fa-fire" style="color: var(--streak-color);"></i> Active Streak</span>
              <span style="font-weight: 700; color: var(--streak-color);">${streak} days 🔥</span>
            </div>
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid var(--panel-border); padding-bottom: 8px;">
              <span style="color: var(--text-secondary); font-weight: 500; font-size: 0.95rem;"><i class="fa-solid fa-fire-burner" style="color: var(--streak-color);"></i> Longest Streak</span>
              <span style="font-weight: 700;">${longestStreak} days</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding-bottom: 8px;">
              <span style="color: var(--text-secondary); font-weight: 500; font-size: 0.95rem;"><i class="fa-solid fa-calendar-check" style="color: var(--forest-color);"></i> Active Days</span>
              <span style="font-weight: 700;">${activeDays} days</span>
            </div>
          </div>
        </div>

      </div>

      <!-- 🌳 Environmental Technology Skill Tree -->
      <div class="glass-panel section-card">
        <h2><i class="fa-solid fa-tree"></i> Environmental Tech Tree</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px;">
          Your level unlocks green tech skills. Click any unlocked skill node to read competency specs, or focus locks to view leveling criteria.
        </p>
        
        <div class="skill-tree-container" style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center; justify-content: center;">
          <!-- SVG Tech Tree canvas mapping nodes -->
          <div style="flex: 1.3; min-width: 320px; background: rgba(0,0,0,0.02); border-radius: var(--border-radius-md); padding: 10px; border: 1px solid var(--panel-border);">
            <svg viewBox="0 0 450 300" style="width: 100%; height: auto; display: block;">
              <!-- Connections (Lines) -->
              <line x1="80" y1="150" x2="200" y2="70" class="skill-tree-connection" id="conn-eco-climate" />
              <line x1="80" y1="150" x2="200" y2="150" class="skill-tree-connection" id="conn-eco-conservation" />
              <line x1="80" y1="150" x2="200" y2="230" class="skill-tree-connection" id="conn-eco-systems" />
              
              <line x1="200" y1="70" x2="350" y2="70" class="skill-tree-connection" id="conn-climate-carbon" />
              <line x1="200" y1="150" x2="350" y2="150" class="skill-tree-connection" id="conn-conservation-biodiversity" />
              <line x1="200" y1="230" x2="350" y2="230" class="skill-tree-connection" id="conn-systems-waste" />

              <!-- Nodes (Circles + Labels) -->
              <g class="skill-tree-node unlocked active" id="node-eco" data-skill="eco">
                <circle cx="80" cy="150" r="28" />
                <text x="80" y="154" text-anchor="middle" dominant-baseline="middle" style="font-size: 1.25rem;">🌱</text>
                <text x="80" y="193" text-anchor="middle" style="font-weight: 700;">Ecology</text>
              </g>

              <g class="skill-tree-node" id="node-climate" data-skill="climate">
                <circle cx="200" cy="70" r="24" />
                <text x="200" y="74" text-anchor="middle" dominant-baseline="middle" style="font-size: 1.1rem;">☀️</text>
                <text x="200" y="108" text-anchor="middle" style="font-weight: 700;">Climate</text>
              </g>

              <g class="skill-tree-node" id="node-conservation" data-skill="conservation">
                <circle cx="200" cy="150" r="24" />
                <text x="200" y="154" text-anchor="middle" dominant-baseline="middle" style="font-size: 1.1rem;">🐼</text>
                <text x="200" y="188" text-anchor="middle" style="font-weight: 700;">Conservation</text>
              </g>

              <g class="skill-tree-node" id="node-systems" data-skill="systems">
                <circle cx="200" cy="230" r="24" />
                <text x="200" y="234" text-anchor="middle" dominant-baseline="middle" style="font-size: 1.1rem;">♻️</text>
                <text x="200" y="268" text-anchor="middle" style="font-weight: 700;">Systems</text>
              </g>

              <g class="skill-tree-node" id="node-carbon" data-skill="carbon">
                <circle cx="350" cy="70" r="22" />
                <text x="350" y="74" text-anchor="middle" dominant-baseline="middle" style="font-size: 1rem;">📊</text>
                <text x="350" y="105" text-anchor="middle" style="font-weight: 700;">Carbon</text>
              </g>

              <g class="skill-tree-node" id="node-biodiversity" data-skill="biodiversity">
                <circle cx="350" cy="150" r="22" />
                <text x="350" y="154" text-anchor="middle" dominant-baseline="middle" style="font-size: 1rem;">🗺️</text>
                <text x="350" y="185" text-anchor="middle" style="font-weight: 700;">Mapping</text>
              </g>

              <g class="skill-tree-node" id="node-waste" data-skill="waste">
                <circle cx="350" cy="230" r="22" />
                <text x="350" y="234" text-anchor="middle" dominant-baseline="middle" style="font-size: 1rem;">📦</text>
                <text x="350" y="265" text-anchor="middle" style="font-weight: 700;">Circularity</text>
              </g>
            </svg>
          </div>

          <!-- Skill detail description panel -->
          <div style="flex: 1; min-width: 250px; display: flex; flex-direction: column; gap: 15px;" id="skill-tree-details-panel">
            <div class="glass-card spotlight-card" style="padding: 20px; border-color: var(--forest-color); min-height: 220px; display: flex; flex-direction: column; justify-content: center;">
              <h3 id="skill-detail-title" style="font-family: var(--font-title); font-size: 1.2rem; color: var(--forest-color); margin-bottom: 8px;">🌱 Ecology Fundamentals</h3>
              <div style="margin-bottom: 12px;" id="skill-detail-badge"><span class="badge" style="background: rgba(16,185,129,0.15); color: var(--forest-color); font-weight:700;">UNLOCKED • Default</span></div>
              <p id="skill-detail-desc" style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5;">
                Study how living organisms interact with their physical environment. Foundation for environmental policy planning.
              </p>
              <div style="margin-top: 15px; border-top: 1px dashed var(--panel-border); padding-top: 10px;">
                <span style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary);"><i class="fa-solid fa-award"></i> Core Competency:</span>
                <p id="skill-detail-comp" style="font-size: 0.8rem; font-weight: 600; margin-top:2px;">Ecosystem analysis & niche mapping</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Social and Roadmap panel -->
      <div class="glass-panel section-card">
        <h2><i class="fa-solid fa-paper-plane"></i> Environmental Networks (Coming Soon)</h2>
        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 20px;">
          Link your profiles to showcase your green badges and curriculum progress to peers and potential recruiters.
        </p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px;">
          <div class="glass-card" style="padding: 15px; display: flex; align-items: center; gap: 12px; opacity: 0.55; cursor: not-allowed;">
            <i class="fa-brands fa-linkedin" style="font-size: 1.5rem; color: #0077b5;"></i>
            <div>
              <span style="font-weight: 600; font-size: 0.85rem; display:block;">LinkedIn Profile</span>
              <span style="font-size: 0.75rem; color: var(--text-secondary);">Connect account</span>
            </div>
          </div>
          
          <div class="glass-card" style="padding: 15px; display: flex; align-items: center; gap: 12px; opacity: 0.55; cursor: not-allowed;">
            <i class="fa-brands fa-github" style="font-size: 1.5rem; color: #333;"></i>
            <div>
              <span style="font-weight: 600; font-size: 0.85rem; display:block;">GitHub Repository</span>
              <span style="font-size: 0.75rem; color: var(--text-secondary);">Link project profile</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function init() {
  // Sync profile details on start
  authContext.refreshProfile();

  // Initialize interactive skill tree mappings
  const { user } = authContext.getState();
  const xp = user?.gamification?.total_xp ?? user?.total_xp ?? 0;
  const lvlInfo = calculateLevel(xp);
  const activeLevel = lvlInfo.level;

  const skillsData = {
    eco: {
      title: '🌱 Ecology Fundamentals',
      desc: 'Understand how organisms interact with their environments. Foundation for environmental policy, systems tracking, and conservation.',
      comp: 'Ecosystem analysis & niche mapping',
      level: 1
    },
    climate: {
      title: '☀️ Climate Dynamics',
      desc: 'Study global thermodynamic systems, carbon cycles, greenhouse gas impacts, and historical temperature fluctuations.',
      comp: 'GHG forcing metrics & climate modeling',
      level: 2
    },
    conservation: {
      title: '🐼 Conservation Science',
      desc: 'Understand species preservation strategies, wildlife corridors, gene flow protection, and national park management policies.',
      comp: 'Endangered species action planning',
      level: 2
    },
    systems: {
      title: '♻️ Sustainable Systems',
      desc: 'Study anthropogenic design systems, materials lifecycle analysis (LCA), and resource balancing frameworks.',
      comp: 'Eco-efficiency audit & resource accounting',
      level: 3
    },
    carbon: {
      title: '📊 Carbon Auditing',
      desc: 'Learn Scope 1, 2, and 3 emissions tracking protocols. Audit supply chains for carbon footprints and offsets.',
      comp: 'ISO 14064 corporate emissions accounting',
      level: 4
    },
    biodiversity: {
      title: '🗺️ Biodiversity Mapping',
      desc: 'Utilize spatial GIS systems to catalog biome health, habitat loss rates, and ecological indicator species populations.',
      comp: 'QGIS spatial mapping & habitat auditing',
      level: 5
    },
    waste: {
      title: '📦 Zero-Waste Circularity',
      desc: 'Implement zero-landfill industrial layouts, circular supply chains, biological/technical loops, and composting logistics.',
      comp: 'Cradle-to-cradle lifecycle engineering',
      level: 6
    }
  };

  // 1. Highlight unlocked nodes and connections in SVG
  Object.keys(skillsData).forEach(key => {
    const node = document.getElementById(`node-${key}`);
    if (node) {
      const isUnlocked = skillsData[key].level <= activeLevel;
      if (isUnlocked) {
        node.classList.add('unlocked');
      } else {
        node.classList.remove('unlocked');
        const icon = node.querySelector('text');
        if (icon) icon.textContent = '🔒'; // Replace text with lock if locked
      }
    }
  });

  // Verify connection lines
  const connections = [
    { id: 'conn-eco-climate', from: 'eco', to: 'climate' },
    { id: 'conn-eco-conservation', from: 'eco', to: 'conservation' },
    { id: 'conn-eco-systems', from: 'eco', to: 'systems' },
    { id: 'conn-climate-carbon', from: 'climate', to: 'carbon' },
    { id: 'conn-conservation-biodiversity', from: 'conservation', to: 'biodiversity' },
    { id: 'conn-systems-waste', from: 'systems', to: 'waste' }
  ];

  connections.forEach(conn => {
    const line = document.getElementById(conn.id);
    if (line) {
      const fromUnlocked = skillsData[conn.from].level <= activeLevel;
      const toUnlocked = skillsData[conn.to].level <= activeLevel;
      if (fromUnlocked && toUnlocked) {
        line.classList.add('unlocked');
      }
    }
  });

  // 2. Bind click handlers to nodes
  document.querySelectorAll('.skill-tree-node').forEach(node => {
    node.onclick = () => {
      const skillKey = node.getAttribute('data-skill');
      const data = skillsData[skillKey];
      if (!data) return;

      // Update active highlight style
      document.querySelectorAll('.skill-tree-node').forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      const isUnlocked = data.level <= activeLevel;

      // Update details panel elements
      const panelTitle = document.getElementById('skill-detail-title');
      const panelBadge = document.getElementById('skill-detail-badge');
      const panelDesc = document.getElementById('skill-detail-desc');
      const panelComp = document.getElementById('skill-detail-comp');

      panelTitle.textContent = data.title;
      panelDesc.textContent = data.desc;
      panelComp.textContent = isUnlocked ? data.comp : 'Locked (Gain level to inspect competency specs)';

      if (isUnlocked) {
        panelBadge.innerHTML = `<span class="badge" style="background: rgba(16,185,129,0.15); color: var(--forest-color); font-weight:700;">UNLOCKED • Level ${data.level}</span>`;
      } else {
        panelBadge.innerHTML = `<span class="badge" style="background: rgba(239,68,68,0.15); color: #ef4444; font-weight:700;"><i class="fa-solid fa-lock"></i> LOCKED • Requires Level ${data.level}</span>`;
      }

      // Award XP for exploring skills tree nodes!
      if (window.ecoquestGamification) {
        window.ecoquestGamification.awardExplorationXP(10);
        window.ecoquestGamification.unlockAchievement('explore_skills', 'Curriculum Tech Tree', 'Successfully inspected the environmental skills matrix branches!', 75);
      }
    };
  });
}
