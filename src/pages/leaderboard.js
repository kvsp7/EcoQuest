import { authContext } from '../context/authContext.js';
import { quizzesAPI } from '../api/quizzes.js';
import { showToast } from '../components/toast.js';

export async function render(params) {
  const quizId = params?.id;

  return `
    <div class="leaderboard-container" style="display: flex; flex-direction: column; gap: 30px;">
      
      <!-- Header context card -->
      <div class="glass-panel" style="padding: 24px 30px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
        <div>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--forest-color); text-transform: uppercase; letter-spacing: 1px;">Quiz Rankings</span>
          <h2 id="leaderboard-quiz-title" style="margin-top: 4px; font-family: var(--font-title); font-size: 1.8rem;">Loading Quiz Leaderboard...</h2>
        </div>
        <a href="#quizzes" class="btn btn-secondary" style="text-decoration: none;">
          <i class="fa-solid fa-circle-question"></i> Back to Quizzes
        </a>
      </div>

      <!-- Podium Top 3 Section -->
      <div class="glass-panel" style="padding: 30px;" id="leaderboard-podium-outlet">
        <div style="text-align: center; padding: 20px;">
          <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; color: var(--forest-color); margin-bottom: 10px;"></i>
          <p style="font-weight: 600; color: var(--text-secondary);">Calculating podium spots...</p>
        </div>
      </div>

      <!-- General Rankings Table Section -->
      <div class="glass-panel section-card">
        <h2><i class="fa-solid fa-list-ol"></i> General Standings</h2>
        <div class="table-responsive">
          <table class="leaderboard-table">
            <thead>
              <tr>
                <th class="leaderboard-rank">Rank</th>
                <th>Student Name</th>
                <th>College / School</th>
                <th style="text-align: center;">Score</th>
                <th style="text-align: center;">Accuracy</th>
                <th style="text-align: right;">XP Gained</th>
              </tr>
            </thead>
            <tbody id="leaderboard-table-outlet">
              <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-secondary);">Loading standings...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

export async function init(params) {
  const quizId = Number(params.id);
  const titleEl = document.getElementById('leaderboard-quiz-title');
  const podiumOutlet = document.getElementById('leaderboard-podium-outlet');
  const tableOutlet = document.getElementById('leaderboard-table-outlet');

  try {
    const data = await quizzesAPI.getLeaderboard(quizId);
    titleEl.textContent = `${data.quiz_title} — Standings`;

    const leaderboard = data.leaderboard || [];

    if (leaderboard.length === 0) {
      podiumOutlet.style.display = 'none';
      tableOutlet.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-secondary); font-weight:600;">
            No student has completed this quiz yet. Be the first to claim 1st place! 🏆
          </td>
        </tr>
      `;
      return;
    }

    podiumOutlet.style.display = 'block';

    // 1. Separate Podium Top 3
    const firstPlace = leaderboard.find(item => item.rank === 1) || null;
    const secondPlace = leaderboard.find(item => item.rank === 2) || null;
    const thirdPlace = leaderboard.find(item => item.rank === 3) || null;

    // Render visual podium
    podiumOutlet.innerHTML = `
      <h3 style="font-size: 1.25rem; text-align: center; margin-bottom: 30px;"><i class="fa-solid fa-trophy" style="color: gold;"></i> EcoQuest Podium</h3>
      
      <div class="podium-row">
        <!-- 2nd Place (Silver) -->
        ${secondPlace ? `
          <div class="podium-place silver">
            <div class="podium-avatar">🥈</div>
            <div style="font-weight: 700; font-family: var(--font-title); font-size: 1.15rem; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 140px;">
              ${secondPlace.student_name}
            </div>
            <div class="podium-score">${secondPlace.percentage}% Accuracy</div>
            <div class="podium-college">${secondPlace.college || 'EcoSchool'}</div>
            <div style="margin-top: 10px; font-weight: 600; color: var(--xp-color); font-size:0.8rem;">+${secondPlace.xp_earned} XP</div>
          </div>
        ` : `
          <div style="flex:1; max-width: 180px;"></div>
        `}

        <!-- 1st Place (Gold) -->
        ${firstPlace ? `
          <div class="podium-place gold">
            <div class="podium-avatar" style="transform: scale(1.15); animation: pulseGold 2s infinite alternate;">🥇</div>
            <div style="font-weight: 800; font-family: var(--font-title); font-size: 1.3rem; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 145px; margin-top: 6px;">
              ${firstPlace.student_name}
            </div>
            <div class="podium-score" style="font-size: 1.05rem;">${firstPlace.percentage}% Accuracy</div>
            <div class="podium-college" style="font-weight:600;">${firstPlace.college || 'EcoSchool'}</div>
            <div style="margin-top: 12px; font-weight: 700; color: var(--xp-color); font-size: 0.9rem;">+${firstPlace.xp_earned} XP</div>
          </div>
        ` : `
          <div style="flex:1; max-width: 180px;"></div>
        `}

        <!-- 3rd Place (Bronze) -->
        ${thirdPlace ? `
          <div class="podium-place bronze">
            <div class="podium-avatar">🥉</div>
            <div style="font-weight: 700; font-family: var(--font-title); font-size: 1.1rem; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 140px;">
              ${thirdPlace.student_name}
            </div>
            <div class="podium-score">${thirdPlace.percentage}% Accuracy</div>
            <div class="podium-college">${thirdPlace.college || 'EcoSchool'}</div>
            <div style="margin-top: 10px; font-weight: 600; color: var(--xp-color); font-size:0.8rem;">+${thirdPlace.xp_earned} XP</div>
          </div>
        ` : `
          <div style="flex:1; max-width: 180px;"></div>
        `}
      </div>
    `;

    // 2. Render standings table (all players)
    tableOutlet.innerHTML = '';
    leaderboard.forEach(student => {
      // Highlight ranks 1, 2, 3 in the table too
      let rankText = student.rank;
      if (student.rank === 1) rankText = '🥇';
      if (student.rank === 2) rankText = '🥈';
      if (student.rank === 3) rankText = '🥉';

      tableOutlet.innerHTML += `
        <tr class="leaderboard-row" style="${student.rank <= 3 ? 'font-weight: 600;' : ''}">
          <td class="leaderboard-rank" style="font-size: ${student.rank <= 3 ? '1.25rem' : '0.95rem'}">${rankText}</td>
          <td>
            <div style="display:flex; align-items:center; gap: 10px;">
              <div style="width: 28px; height: 28px; border-radius:50%; background: ${student.rank <= 3 ? 'var(--sidebar-active-bg)' : 'rgba(0,0,0,0.04)'}; display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:700;">
                ${student.student_name.charAt(0).toUpperCase()}
              </div>
              <span>${student.student_name}</span>
            </div>
          </td>
          <td>${student.college || 'N/A'}</td>
          <td style="text-align: center;">${student.score} / ${student.total_questions}</td>
          <td style="text-align: center; color: var(--success-color);">${student.percentage}%</td>
          <td style="text-align: right; color: var(--xp-color); font-weight:700;">+${student.xp_earned} XP</td>
        </tr>
      `;
    });

  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    podiumOutlet.innerHTML = `<p style="color: var(--danger-color);">Could not calculate podium positions: ${error.message}</p>`;
    tableOutlet.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 30px; color: var(--danger-color);">
          Could not fetch scoreboard standings: ${error.message}
        </td>
      </tr>
    `;
  }
}
