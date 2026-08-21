import { authContext } from '../context/authContext.js';
import { lessonsAPI } from '../api/lessons.js';
import { coursesAPI } from '../api/courses.js';
import { progressCache, formatDuration } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';
import { client } from '../api/client.js';

export async function render(params) {
  return `
    <div class="lesson-study-container" style="margin-top: 10px;">
      <!-- Left Column: Video & Details -->
      <div style="display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Premium Video Player Mount -->
        <div class="video-player-wrapper" id="lesson-video-player-outlet">
          <div style="position: absolute; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#94a3b8; gap:10px;">
            <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.5rem;"></i>
            <p style="font-weight:600;">Loading player...</p>
          </div>
        </div>

        <!-- Lesson Title & Info -->
        <div class="glass-panel lesson-study-details">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 15px; margin-bottom: 12px;">
            <div>
              <span id="lesson-course-context" style="font-size: 0.8rem; font-weight: 700; color: var(--forest-color); text-transform: uppercase; letter-spacing: 1px;">Loading context...</span>
              <h2 id="lesson-study-title" style="margin-top: 4px;">Loading lesson title...</h2>
            </div>
            
            <div class="lesson-study-meta">
              <span class="lesson-study-badge duration"><i class="fa-regular fa-clock"></i> <span id="lesson-study-duration">-- min</span></span>
              <span class="lesson-study-badge xp"><i class="fa-solid fa-star"></i> <span id="lesson-study-points">+0 XP</span></span>
            </div>
          </div>

          <p id="lesson-study-description" style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.6;">
            Loading description details...
          </p>
        </div>

        <!-- Back and Next Lesson triggers -->
        <div class="lesson-navigation-btns">
          <a id="btn-prev-lesson" class="btn btn-secondary" style="text-decoration: none; display: none;">
            <i class="fa-solid fa-arrow-left"></i> Previous Lesson
          </a>
          <div style="flex-grow: 1;"></div>
          <a id="btn-next-lesson" class="btn btn-secondary" style="text-decoration: none; display: none;">
            Next Lesson <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>

      <!-- Right Column: Completion & Curriculums -->
      <div class="lesson-study-sidebar">
        <!-- Completion panel -->
        <div class="glass-panel" style="padding: 24px; text-align: center;">
          <h3 style="font-size: 1.15rem; margin-bottom: 15px;"><i class="fa-solid fa-square-check"></i> Completion Status</h3>
          <div id="lesson-completion-status-outlet">
            <button class="btn btn-primary" style="width: 100%;" disabled>Loading...</button>
          </div>
        </div>

        <!-- Quick curriculum references links -->
        <div class="glass-panel" style="padding: 24px;">
          <h3 style="font-size: 1.15rem; margin-bottom: 15px;"><i class="fa-solid fa-list-ol"></i> Modules Progress</h3>
          <div id="lesson-sidebar-curriculum-outlet" style="max-height: 380px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">
            <div class="skeleton" style="height: 40px; margin-bottom: 8px;"></div>
            <div class="skeleton" style="height: 40px;"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function init(params) {
  const lessonId = Number(params.id);
  const { user } = authContext.getState();
  if (!user) return;

  const videoOutlet = document.getElementById('lesson-video-player-outlet');
  const contextEl = document.getElementById('lesson-course-context');
  const titleEl = document.getElementById('lesson-study-title');
  const durationEl = document.getElementById('lesson-study-duration');
  const pointsEl = document.getElementById('lesson-study-points');
  const descEl = document.getElementById('lesson-study-description');
  
  const completionOutlet = document.getElementById('lesson-completion-status-outlet');
  const prevBtn = document.getElementById('btn-prev-lesson');
  const nextBtn = document.getElementById('btn-next-lesson');
  const sidebarCurriculumOutlet = document.getElementById('lesson-sidebar-curriculum-outlet');

  try {
    // 1. Fetch current lesson data
    const lesson = await lessonsAPI.getById(lessonId);
    
    // Award student scholar achievement
    if (window.ecoquestGamification) {
      window.ecoquestGamification.unlockAchievement('student_scholar', 'Student Scholar', `Began studying the lesson: ${lesson.title}!`, 50);
    }
    
    // Fill basic UI text details
    titleEl.textContent = `${lesson.lesson_number}. ${lesson.title}`;
    durationEl.textContent = formatDuration(lesson.duration);
    pointsEl.textContent = `+${lesson.points} XP`;
    descEl.textContent = lesson.description || 'No description provided for this lesson.';

    // Render Video Player or premium placeholder
    if (lesson.video_path) {
      // Normalize video URL paths (convert backslashes for Windows environment compatibility)
      let videoUrl = lesson.video_path.replace(/\\/g, '/');
      
      if (videoUrl.startsWith('uploads/videos/')) {
        videoUrl = videoUrl.replace('uploads/videos/', '/videos/');
      }
      if (!videoUrl.startsWith('/') && !videoUrl.startsWith('http')) {
        videoUrl = '/' + videoUrl;
      }
      if (!videoUrl.startsWith('http')) {
        videoUrl = `${client.baseUrl}${videoUrl}`;
      }
      
      videoOutlet.innerHTML = `
        <video controls autoplay poster="" style="width: 100%; height: 100%; border-radius: var(--border-radius-lg);">
          <source src="${videoUrl}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `;
    } else {
      // Environmental ambient climate animation placeholder
      const weatherText = window.weatherEngine.getClimateWeatherText();
      
      videoOutlet.innerHTML = `
        <div style="position: absolute; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; color: white; background: linear-gradient(135deg, #0d5c3a 0%, #059669 100%); text-align: center; padding: 20px; border-radius: var(--border-radius-lg);">
          <div style="font-size: 4rem; color: #a7f3d0; animation: floatLeaf 4s ease-in-out infinite alternate;">
            <i class="fa-solid fa-tree"></i>
          </div>
          <div style="max-width: 500px;">
            <h3 style="color: white; font-size: 1.3rem; margin-bottom: 8px; font-family: var(--font-title);">Environmental Interactive Study Panel</h3>
            <p style="font-size: 0.9rem; opacity: 0.85; line-height: 1.5; font-family: var(--font-body);">
              Watch and read closely! This lesson explores ${lesson.title}. Read the material and mark it complete to earn points.
            </p>
          </div>
          <span style="font-size: 0.8rem; background: rgba(255,255,255,0.15); padding: 4px 12px; border-radius: 100px; font-weight: 600;">
            <i class="fa-solid fa-cloud-sun-rain"></i> Climate Focus: ${weatherText}
          </span>
        </div>
      `;
    }

    // 2. Scan courses catalog to resolve course and module relations
    const allCourses = await coursesAPI.getAll();
    let currentCourse = null;
    let currentModule = null;
    let lessonsSequence = [];

    // Search lessons tree client-side (pre-fetching module lessons explicitly)
    for (const c of allCourses) {
      try {
        const modules = await coursesAPI.getModules(c.id);
        for (const m of modules) {
          try {
            m.lessons = await lessonsAPI.getByModule(m.id);
            const hasLesson = m.lessons.some(l => l.id === lessonId);
            if (hasLesson) {
              currentCourse = c;
              currentModule = m;
              
              // Load all lessons in sequence for this course for next/prev routing
              for (const subMod of modules) {
                try {
                  subMod.lessons = await lessonsAPI.getByModule(subMod.id);
                  lessonsSequence.push(...subMod.lessons);
                } catch (err) {
                  console.error(err);
                }
              }
              break;
            }
          } catch (err) {
            console.error(err);
          }
        }
      } catch (e) {
        console.error(e);
      }
      if (currentCourse) break;
    }

    if (currentCourse && currentModule) {
      contextEl.textContent = `${currentCourse.title} • Module ${currentModule.module_number}`;
      
      // Auto enroll if somehow not enrolled (safeguard)
      if (!progressCache.isEnrolled(user.id, currentCourse.id)) {
        progressCache.enrollInCourse(user.id, currentCourse.id);
      }

      // Render Curriculum sidebar
      sidebarCurriculumOutlet.innerHTML = '';
      
      lessonsSequence.forEach(les => {
        const active = les.id === lessonId;
        const done = progressCache.isLessonCompleted(user.id, les.id);
        const icon = done ? 'fa-circle-check' : 'fa-circle';
        const color = done ? 'var(--success-color)' : 'var(--text-secondary)';
        
        sidebarCurriculumOutlet.innerHTML += `
          <a href="#lessons/${les.id}" style="text-decoration: none;">
            <div class="glass-card" style="padding: 10px 14px; display: flex; align-items: center; gap: 10px; border-color: ${active ? 'var(--forest-color)' : 'var(--panel-border)'}; background: ${active ? 'var(--sidebar-active-bg)' : 'rgba(255,255,255,0.45)'}; font-weight: ${active ? '600' : 'normal'};">
              <i class="fa-solid ${icon}" style="color: ${color};"></i>
              <span style="font-size: 0.85rem; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; flex-grow: 1;">
                ${les.lesson_number}. ${les.title}
              </span>
            </div>
          </a>
        `;
      });

      // Find indices in sequence to set Prev/Next buttons
      const currentIndex = lessonsSequence.findIndex(l => l.id === lessonId);
      
      if (currentIndex > 0) {
        prevBtn.href = `#lessons/${lessonsSequence[currentIndex - 1].id}`;
        prevBtn.style.display = 'inline-flex';
      } else {
        prevBtn.style.display = 'none';
      }

      if (currentIndex < lessonsSequence.length - 1) {
        nextBtn.href = `#lessons/${lessonsSequence[currentIndex + 1].id}`;
        nextBtn.style.display = 'inline-flex';
      } else {
        nextBtn.style.display = 'none';
      }
    } else {
      contextEl.textContent = 'Curriculum Course Lesson';
    }

    // 3. Render Completion Status CTA
    const isCompleted = progressCache.isLessonCompleted(user.id, lessonId);

    function renderCompletionButton(done) {
      if (done) {
        completionOutlet.innerHTML = `
          <div style="background: rgba(16,185,129,0.1); border: 1px solid var(--success-color); color: var(--success-color); padding: 12px; border-radius: var(--border-radius-md); font-weight: 700; font-family: var(--font-title); display: flex; align-items: center; justify-content: center; gap: 8px;">
            <i class="fa-solid fa-circle-check"></i> Lesson Completed ✓
          </div>
        `;
      } else {
        completionOutlet.innerHTML = `
          <button id="btn-complete-lesson" class="btn btn-primary" style="width: 100%; padding: 12px;">
            <i class="fa-solid fa-check"></i> Mark Lesson Complete
          </button>
        `;
        
        // Bind complete button action
        const completeBtn = document.getElementById('btn-complete-lesson');
        if (completeBtn) {
          completeBtn.onclick = async () => {
            completeBtn.disabled = true;
            completeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
            
            try {
              const res = await lessonsAPI.complete(lessonId);
              
              // Save in local progress cache
              progressCache.completeLesson(user.id, lessonId);
              
              // Dynamic stats alert
              if (res.xp_earned > 0) {
                showToast(`🌱 Lesson Complete! +${res.xp_earned} XP awarded!`, 'success');
              } else {
                showToast('Lesson marked complete successfully!', 'success');
              }
              
              // Refresh header stats in context
              await authContext.refreshProfile();
              
              // Render completed state
              renderCompletionButton(true);
              
              // Re-render sidebar curriculum list
              init(params);
            } catch (error) {
              showToast(error.message || 'Could not complete lesson.', 'error');
              completeBtn.disabled = false;
              completeBtn.innerHTML = '<i class="fa-solid fa-check"></i> Mark Lesson Complete';
            }
          };
        }
      }
    }

    renderCompletionButton(isCompleted);

  } catch (error) {
    console.error('Error initializing lesson study panel:', error);
    videoOutlet.innerHTML = `<p style="color: var(--danger-color); padding: 20px;">Could not mount player: ${error.message}</p>`;
  }
}
