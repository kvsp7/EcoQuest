import { authContext } from '../context/authContext.js';
import { quizzesAPI } from '../api/quizzes.js';
import { coursesAPI } from '../api/courses.js';
import { progressCache } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

export async function render(params) {
  const quizId = params?.id;

  // Case 1: Render Active Quiz / Quiz Results View
  if (quizId) {
    return `
      <div class="quiz-container">
        <!-- Main Quiz Interface -->
        <div id="active-quiz-outlet" class="glass-panel" style="padding: 40px; border-radius: var(--border-radius-lg);">
          <div style="text-align: center; padding: 40px;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.5rem; color: var(--forest-color); margin-bottom: 15px;"></i>
            <p style="font-weight: 600; color: var(--text-secondary);">Assembling quiz questions...</p>
          </div>
        </div>
      </div>
    `;
  }

  // Case 2: Render Quizzes Catalog List
  return `
    <div style="display: flex; flex-direction: column; gap: 30px;">
      <div class="glass-panel" style="padding: 24px 30px;">
        <h2 style="font-size: 1.8rem; font-family: var(--font-title);"><i class="fa-solid fa-circle-question"></i> Environmental Quizzes</h2>
        <p style="color: var(--text-secondary); margin-top: 4px;">Test your knowledge, gain experience points, and compete on the leaderboard!</p>
      </div>

      <div class="courses-grid" id="quizzes-catalog-outlet">
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
      </div>
    </div>
  `;
}

export async function init(params) {
  const { user } = authContext.getState();
  if (!user) return;

  const quizId = params?.id;

  // Case 1: Initialize Active Quiz Flow
  if (quizId) {
    const outlet = document.getElementById('active-quiz-outlet');
    
    try {
      // Check if user has already completed this quiz (from local storage results cache)
      const cachedAttempt = progressCache.getQuizAttempt(user.id, quizId);
      if (cachedAttempt) {
        renderQuizResults(cachedAttempt, quizId);
        return;
      }

      // Fetch quiz details
      const quiz = await quizzesAPI.getById(quizId);
      const questions = quiz.questions || [];

      if (questions.length === 0) {
        outlet.innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <i class="fa-solid fa-circle-info" style="font-size: 3rem; color: var(--text-secondary); opacity: 0.3; margin-bottom: 15px;"></i>
            <h3 style="margin-bottom: 10px;">Empty Quiz</h3>
            <p style="color: var(--text-secondary); margin-bottom: 20px;">No questions have been added to this quiz yet.</p>
            <a href="#quizzes" class="btn btn-secondary" style="text-decoration: none;">Back to Quizzes</a>
          </div>
        `;
        return;
      }

      let currentQuestionIndex = 0;
      const selectedAnswers = {}; // Map of { questionId: 'A'|'B'|'C'|'D' }

      function renderQuestion() {
        const question = questions[currentQuestionIndex];
        const options = question.options || {};
        const selectedOption = selectedAnswers[question.id] || null;

        outlet.innerHTML = `
          <div class="quiz-header">
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--forest-color); text-transform: uppercase;">${quiz.title}</span>
            <div class="progress-bar-track" style="height: 6px; margin: 15px 0 25px 0;">
              <div class="progress-bar-fill" style="width: ${((currentQuestionIndex + 1) / questions.length) * 100}%;"></div>
            </div>
          </div>

          <div class="question-number">Question ${currentQuestionIndex + 1} of ${questions.length}</div>
          <div class="question-text">${question.question}</div>

          <div class="quiz-options-list">
            ${['A', 'B', 'C', 'D'].map(letter => {
              const optionText = options[letter] || '';
              if (!optionText) return '';
              const isSelected = selectedOption === letter;
              return `
                <label class="quiz-option-label ${isSelected ? 'selected' : ''}" data-letter="${letter}">
                  <span class="option-letter-badge">${letter}</span>
                  <span style="font-size: 0.95rem;">${optionText}</span>
                </label>
              `;
            }).join('')}
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 40px; gap: 15px; border-top: 1px solid var(--panel-border); padding-top: 25px;">
            <button id="btn-quiz-prev" class="btn btn-secondary" ${currentQuestionIndex === 0 ? 'disabled' : ''}>
              <i class="fa-solid fa-arrow-left"></i> Previous
            </button>
            
            ${currentQuestionIndex === questions.length - 1 ? `
              <button id="btn-quiz-submit" class="btn btn-primary" style="box-shadow: 0 4px 15px rgba(76,175,80,0.4);">
                <i class="fa-solid fa-cloud-arrow-up"></i> Submit Quiz
              </button>
            ` : `
              <button id="btn-quiz-next" class="btn btn-secondary">
                Next <i class="fa-solid fa-arrow-right"></i>
              </button>
            `}
          </div>
        `;

        // Bind Radio Options Click
        outlet.querySelectorAll('.quiz-option-label').forEach(label => {
          label.onclick = () => {
            const letter = label.getAttribute('data-letter');
            selectedAnswers[question.id] = letter;
            
            // Re-render question to update styles
            renderQuestion();
          };
        });

        // Bind Nav buttons
        const prevBtn = document.getElementById('btn-quiz-prev');
        if (prevBtn) {
          prevBtn.onclick = () => {
            if (currentQuestionIndex > 0) {
              currentQuestionIndex--;
              renderQuestion();
            }
          };
        }

        const nextBtn = document.getElementById('btn-quiz-next');
        if (nextBtn) {
          nextBtn.onclick = () => {
            if (!selectedAnswers[question.id]) {
              showToast('Please select an option before moving next!', 'warning');
              return;
            }
            if (currentQuestionIndex < questions.length - 1) {
              currentQuestionIndex++;
              renderQuestion();
            }
          };
        }

        const submitBtn = document.getElementById('btn-quiz-submit');
        if (submitBtn) {
          submitBtn.onclick = async () => {
            if (!selectedAnswers[question.id]) {
              showToast('Please answer the final question before submitting!', 'warning');
              return;
            }
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Grading Answers...';

            try {
              // Submit to backend
              const res = await quizzesAPI.submit(quizId, selectedAnswers);
              
              // Cache attempt results
              progressCache.saveQuizAttempt(user.id, quizId, res);
              
              // Refresh context profile details
              await authContext.refreshProfile();
              
              showToast(`Quiz completed successfully! +${res.xp_earned} XP earned! 🎉`, 'success');
              
              // Render scoreboard page
              renderQuizResults(res, quizId);
            } catch (error) {
              showToast(error.message || 'Submission failed.', 'error');
              submitBtn.disabled = false;
              submitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Submit Quiz';
            }
          };
        }
      }

      renderQuestion();

    } catch (error) {
      console.error('Quiz details fetch error:', error);
      outlet.innerHTML = `<p style="color: var(--danger-color);">Error launching quiz interface: ${error.message}</p>`;
    }
    return;
  }

  // Case 2: Initialize Quizzes Catalog Catalog / list view
  const catalogOutlet = document.getElementById('quizzes-catalog-outlet');
  try {
    const quizzes = await quizzesAPI.getAll();
    const courses = await coursesAPI.getAll();
    
    // Create course title lookup maps
    const courseLookup = {};
    courses.forEach(c => { courseLookup[c.id] = c; });

    if (quizzes.length === 0) {
      catalogOutlet.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
          <div style="font-size: 3rem; color: var(--text-secondary); opacity: 0.3; margin-bottom: 15px;">
            <i class="fa-solid fa-clipboard-question"></i>
          </div>
          <p style="font-weight: 600; color: var(--text-secondary);">No quizzes have been created yet.</p>
        </div>
      `;
    } else {
      catalogOutlet.innerHTML = '';
      quizzes.forEach(quiz => {
        const cachedAttempt = progressCache.getQuizAttempt(user.id, quiz.id);
        const parentCourse = courseLookup[quiz.course_id];
        
        let color = '#2e7d32';
        if (parentCourse?.category.toLowerCase().includes('climate')) color = '#0288d1';
        if (parentCourse?.category.toLowerCase().includes('waste')) color = '#f57c00';

        catalogOutlet.innerHTML += `
          <div class="course-card glass-panel">
            <div class="course-card-header" style="background-color: ${color}; background-image: radial-gradient(circle at 10% 20%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0) 80%);">
              <span class="badge badge-category" style="position: absolute; top:16px; left:16px; background: rgba(255,255,255,0.25); color:white;">
                ${parentCourse ? parentCourse.category : 'General'}
              </span>
              <h3 style="z-index: 2; font-family: var(--font-title); font-size: 1.25rem;">${quiz.title}</h3>
            </div>
            
            <div class="course-card-body">
              <p>${quiz.description || 'Test your knowledge on course concepts.'}</p>
              
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px; font-size:0.85rem; color:var(--text-secondary); font-weight:600;">
                <span><i class="fa-solid fa-list-ol"></i> ${quiz.total_questions} Questions</span>
                ${cachedAttempt ? `
                  <span style="color: var(--success-color); font-weight:700;"><i class="fa-solid fa-square-poll-vertical"></i> Score: ${cachedAttempt.score}/${cachedAttempt.total_questions}</span>
                ` : `
                  <span><i class="fa-solid fa-star" style="color: var(--xp-color);"></i> Multiplier XP</span>
                `}
              </div>
            </div>

            <div class="course-card-footer" style="display: flex; gap: 10px;">
              ${cachedAttempt ? `
                <a href="#quizzes/${quiz.id}" class="btn btn-secondary" style="flex:1; text-decoration:none; text-align:center; padding: 10px 0;">Results</a>
                <a href="#quizzes/${quiz.id}/leaderboard" class="btn btn-primary" style="flex:1.2; text-decoration:none; text-align:center; padding: 10px 0;">
                  <i class="fa-solid fa-trophy"></i> Rankings
                </a>
              ` : `
                <a href="#quizzes/${quiz.id}" class="btn btn-primary" style="width: 100%; text-decoration: none; text-align:center; padding:10px 0;">
                  <i class="fa-solid fa-play"></i> Start Quiz
                </a>
              `}
            </div>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error('Quiz index fetch error:', error);
    catalogOutlet.innerHTML = `<p style="color: var(--danger-color);">Error fetching environmental quizzes list: ${error.message}</p>`;
  }
}

/**
 * Render quiz scores results details
 */
function renderQuizResults(attempt, quizId) {
  const outlet = document.getElementById('active-quiz-outlet');
  if (!outlet) return;

  const isPerfect = attempt.percentage === 100;
  const ratingEmoji = isPerfect ? '🏆' : (attempt.percentage >= 70 ? '🎉' : '🌱');
  const ratingText = isPerfect ? 'Perfect Score!' : (attempt.percentage >= 70 ? 'Great job!' : 'Keep learning!');

  outlet.innerHTML = `
    <div class="quiz-results-card">
      <div class="quiz-results-icon">${ratingEmoji}</div>
      <h2 style="font-family: var(--font-title); font-size: 2.2rem; margin-bottom: 5px;">Quiz Completed</h2>
      <p style="color: var(--text-secondary); font-weight:600;">${ratingText}</p>

      <div class="quiz-score-circle" style="border-color: ${isPerfect ? 'gold' : 'var(--forest-color)'};">
        <span class="quiz-score-val">${attempt.score} / ${attempt.total_questions}</span>
        <span class="quiz-score-lbl">Correct</span>
      </div>

      <div style="font-size: 1.4rem; font-weight: 800; font-family: var(--font-title); color: var(--forest-color); margin-bottom: 25px;">
        ${attempt.percentage}% Correct
      </div>

      <!-- XP and Points details cards -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 40px;">
        <div class="glass-card" style="padding: 16px;">
          <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">XP Gained</span>
          <p style="font-size: 1.5rem; font-weight: 800; color: var(--xp-color); font-family: var(--font-title); margin-top: 4px;">+${attempt.xp_earned} XP</p>
        </div>
        <div class="glass-card" style="padding: 16px;">
          <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 600; text-transform: uppercase;">Points Gained</span>
          <p style="font-size: 1.5rem; font-weight: 800; color: var(--points-color); font-family: var(--font-title); margin-top: 4px;">+${attempt.points_earned} PTS</p>
        </div>
      </div>

      <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
        <a href="#quizzes" class="btn btn-secondary" style="text-decoration: none;">
          <i class="fa-solid fa-list"></i> All Quizzes
        </a>
        <a href="#quizzes/${quizId}/leaderboard" class="btn btn-primary" style="text-decoration: none;">
          <i class="fa-solid fa-trophy"></i> View Leaderboard
        </a>
      </div>
    </div>
  `;
}
