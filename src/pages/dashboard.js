import { authContext } from '../context/authContext.js';
import { coursesAPI } from '../api/courses.js';
import { lessonsAPI } from '../api/lessons.js';
import { calculateLevel, progressCache } from '../utils/helpers.js';

export async function render() {
  const { user } = authContext.getState();
  const xp = user?.gamification?.total_xp ?? user?.total_xp ?? 0;
  const points = user?.gamification?.total_points ?? user?.total_points ?? 0;
  const streak = user?.gamification?.current_streak ?? user?.current_streak ?? 0;
  
  // Calculate level info
  const lvlInfo = calculateLevel(xp);

  return `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      
      <!-- 📈 Eco-Score Timeline Wave (Gamified milestone path) -->
      <div class="wavy-timeline-wrapper">
        <span class="wavy-timeline-title">Eco-Score Milestone Timeline</span>
        
        <!-- SVG wave path -->
        <svg viewBox="0 0 1000 120" preserveAspectRatio="none" class="wavy-timeline-svg">
          <path d="M 80,95 C 180,30 220,30 260,50 C 350,120 400,120 450,95 C 550,20 600,20 640,50 C 720,110 780,110 800,90 C 850,50 880,50 920,50" fill="none" stroke="rgba(16, 185, 129, 0.25)" stroke-width="8" stroke-linecap="round" />
        </svg>

        <!-- Milestones (Pos absolute overlaid on curve) -->
        <!-- Milestone 1: XP Shield -->
        <div class="timeline-milestone" style="left: 8%; top: 55px;" title="Experience Points Milestone">
          <div class="timeline-milestone-node" style="color: var(--xp-color);"><i class="fa-solid fa-shield-halved"></i></div>
          <span class="timeline-milestone-label">${xp} XP</span>
        </div>

        <!-- Milestone 2: Level Flag -->
        <div class="timeline-milestone" style="left: 26%; top: 10px;" title="Eco-Guardian Level Flag">
          <div class="timeline-milestone-node" style="color: var(--success-color);"><i class="fa-solid fa-flag"></i></div>
          <span class="timeline-milestone-label">Level ${lvlInfo.level}</span>
          <span class="timeline-milestone-sub">Eco-Guardian</span>
        </div>

        <!-- Milestone 3: Flame 🔥 -->
        <div class="timeline-milestone" style="left: 45%; top: 55px;" title="Activity Milestones Flame">
          <div class="timeline-milestone-node" style="color: var(--streak-color);"><i class="fa-solid fa-fire animate-pulse"></i></div>
          <span class="timeline-milestone-label">Timeline Active</span>
        </div>

        <!-- Milestone 4: Points Coin -->
        <div class="timeline-milestone" style="left: 64%; top: 10px;" title="Redeemable EcoPoints">
          <div class="timeline-milestone-node" style="color: var(--points-color);"><i class="fa-solid fa-coins"></i></div>
          <span class="timeline-milestone-label">${points} Points</span>
        </div>

        <!-- Milestone 5: Flame 🔥 2 -->
        <div class="timeline-milestone" style="left: 80%; top: 50px;" title="Streak Heat Indicator">
          <div class="timeline-milestone-node" style="color: var(--streak-color);"><i class="fa-solid fa-fire-flame-curved"></i></div>
          <span class="timeline-milestone-label">Learning Streak</span>
        </div>

        <!-- Milestone 6: Days Streak -->
        <div class="timeline-milestone" style="left: 92%; top: 10px;" title="Consecutive Active Streak">
          <div class="timeline-milestone-node" style="color: var(--xp-color);"><i class="fa-solid fa-award"></i></div>
          <span class="timeline-milestone-label">${streak} Days Streak</span>
        </div>
      </div>

      <!-- 🎯 Focus Flow (Continue Learning) Carousel -->
      <div class="glass-panel section-card" style="padding: 24px;">
        <h3 style="font-family: var(--font-title); font-size: 1.1rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.5px;">Continue Learning</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 20px;">Most recently accessed course is your login.</p>
        
        <div class="focus-flow-container" id="focus-flow-carousel-outlet">
          <div class="skeleton" style="height: 120px; width: 100%;"></div>
        </div>
      </div>

      <!-- Discovery & Recent Activity Grid Layout -->
      <div style="display: grid; grid-template-columns: 2.2fr 1fr; gap: 20px; margin-top: 10px; align-items: start;">
        
        <!-- Left: Course Discovery River (Recommended Courses) -->
        <div class="glass-panel section-card">
          <h2 style="font-family: var(--font-title); font-size: 1.35rem; font-weight: 800; color: var(--forest-color); margin-bottom: 15px;"><i class="fa-solid fa-compass"></i> Recommended Courses</h2>
          <div class="courses-grid" id="recommended-courses-outlet" style="grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 15px;">
            <div class="skeleton skeleton-card"></div>
            <div class="skeleton skeleton-card"></div>
          </div>
        </div>

        <!-- Right: Recent Activity timeline logs -->
        <div class="glass-panel section-card">
          <h2 style="font-family: var(--font-title); font-size: 1.35rem; font-weight: 800; color: var(--forest-color); margin-bottom: 15px;"><i class="fa-solid fa-chart-line"></i> Recent Activity</h2>
          <div class="recent-activity-card" id="recent-activity-feed-outlet">
            <div class="skeleton" style="height: 40px; margin-bottom: 8px;"></div>
            <div class="skeleton" style="height: 40px;"></div>
          </div>
        </div>

      </div>

    </div>
  `;
}

export async function init() {
  const { user } = authContext.getState();
  if (!user) return;

  const carouselOutlet = document.getElementById('focus-flow-carousel-outlet');
  const recommendedOutlet = document.getElementById('recommended-courses-outlet');
  const activityOutlet = document.getElementById('recent-activity-feed-outlet');

  try {
    // Refresh user profile details
    authContext.refreshProfile();

    // Fetch all courses
    const allCourses = await coursesAPI.getAll();

    const enrolledCourses = [];
    const recommendedCourses = [];

    // Separate enrolled and recommended
    for (const course of allCourses) {
      if (progressCache.isEnrolled(user.id, course.id)) {
        enrolledCourses.push(course);
      } else {
        recommendedCourses.push(course);
      }
    }

    // --- 1. RENDER FOCUS FLOW CAROUSEL ---
    if (enrolledCourses.length === 0) {
      // Fallback: If no enrolled courses, display a placeholder calling for enrollment
      const placeholderCourse = allCourses[0] || { id: 1, title: 'Climate Systems & Global Dynamics', category: 'Climate', description: 'Start your study on global climate change.' };
      
      carouselOutlet.innerHTML = `
        <!-- Left Side Card -->
        <div class="focus-card side-card" style="opacity: 0.35;">
          <div style="width: 50px; height: 40px; background: #cbd5e1; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 1rem;"><i class="fa-solid fa-leaf"></i></div>
          <div>
            <span style="font-weight: 700; font-size: 0.8rem; display: block;">Ecology 101</span>
            <span style="font-size: 0.65rem;">Locked</span>
          </div>
        </div>

        <!-- Center Active Card -->
        <div class="focus-card center-card">
          <div class="focus-card-left">
            <div style="width: 90px; height: 70px; background: var(--sidebar-active-bg); color: var(--forest-color); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 2rem;">
              <i class="fa-solid fa-leaf animate-bounce"></i>
            </div>
            <div>
              <span class="badge" style="background: rgba(16,185,129,0.1); color: var(--sidebar-active-text); margin-bottom: 4px;">Explore Subjects</span>
              <h3 style="font-family: var(--font-title); font-size: 1.15rem; margin: 4px 0;">Start Your First Course</h3>
              <p style="font-size: 0.78rem; color: var(--text-secondary);">Enroll in a course to start earning XP and tracking progress</p>
            </div>
          </div>
          <a href="#courses" class="btn btn-primary" style="padding: 10px 20px; font-size: 0.88rem; border-radius: 30px; font-weight:700;">
            <i class="fa-solid fa-compass"></i> Explore Courses
          </a>
        </div>

        <!-- Right Side Card -->
        <div class="focus-card side-card" style="opacity: 0.35;">
          <div style="width: 50px; height: 40px; background: #cbd5e1; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 1rem;"><i class="fa-solid fa-dumpster-fire"></i></div>
          <div>
            <span style="font-weight: 700; font-size: 0.8rem; display: block;">Recycling</span>
            <span style="font-size: 0.65rem;">Locked</span>
          </div>
        </div>
      `;
    } else {
      // Get the primary course to highlight in the center
      const centerCourse = enrolledCourses[0];
      
      // Calculate progress details
      let completedCount = 0;
      let totalCount = 0;
      let resumeLink = `#courses/${centerCourse.id}`;
      let activeModuleTitle = 'Module 1: Getting Started';
      
      try {
        const modules = await coursesAPI.getModules(centerCourse.id);
        for (const m of modules) {
          try {
            m.lessons = await lessonsAPI.getByModule(m.id);
            m.lessons.forEach(l => {
              totalCount++;
              const isDone = progressCache.isLessonCompleted(user.id, l.id);
              if (isDone) {
                completedCount++;
              } else if (resumeLink === `#courses/${centerCourse.id}`) {
                // Focus on the first incomplete lesson
                resumeLink = `#lessons/${l.id}`;
                activeModuleTitle = `Module ${m.module_number}: ${m.title}`;
              }
            });
          } catch (err) {
            console.error(err);
          }
        }
      } catch (e) {
        console.error(e);
      }

      const percent = totalCount > 0 ? Math.floor((completedCount / totalCount) * 100) : 0;

      // Segmented progress bar html
      const totalSegments = 10;
      const filledSegments = Math.round((percent / 100) * totalSegments);
      let segmentsHtml = '<div class="segmented-progress-container">';
      for (let i = 0; i < totalSegments; i++) {
        const isFilled = i < filledSegments;
        segmentsHtml += `<div class="progress-segment ${isFilled ? 'filled' : ''}"></div>`;
      }
      segmentsHtml += '</div>';

      // Left side card placeholder (last course or placeholder)
      let leftCardHtml = `
        <div class="focus-card side-card" onclick="window.location.hash='#courses'">
          <div style="width: 50px; height: 40px; background: rgba(2,136,209,0.1); color: #0288d1; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 1rem;"><i class="fa-solid fa-earth-americas"></i></div>
          <div>
            <span style="font-weight: 700; font-size: 0.8rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px;">Climate 101</span>
            <span style="font-size: 0.65rem; color: var(--text-secondary);">Progress: 100%</span>
          </div>
        </div>
      `;

      // Right side card placeholder (second course if enrolled, or recommended)
      let rightCardHtml = '';
      if (enrolledCourses.length > 1) {
        const nextCourse = enrolledCourses[1];
        rightCardHtml = `
          <div class="focus-card side-card" onclick="window.location.hash='#courses/${nextCourse.id}'">
            <div style="width: 50px; height: 40px; background: rgba(245,124,0,0.1); color: #f57c00; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 1rem;"><i class="fa-solid fa-recycle"></i></div>
            <div>
              <span style="font-weight: 700; font-size: 0.8rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px;">${nextCourse.title}</span>
              <span style="font-size: 0.65rem; color: var(--text-secondary);">Enrolled</span>
            </div>
          </div>
        `;
      } else {
        // Fallback mockup right side card
        rightCardHtml = `
          <div class="focus-card side-card" onclick="window.location.hash='#courses'">
            <div style="width: 50px; height: 40px; background: rgba(16,185,129,0.1); color: var(--forest-color); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 1rem;"><i class="fa-solid fa-dumpster-fire"></i></div>
            <div>
              <span style="font-weight: 700; font-size: 0.8rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100px;">Waste Solutions</span>
              <span style="font-size: 0.65rem; color: var(--text-secondary);">Progress: 30%</span>
            </div>
          </div>
        `;
      }

      let colorBg = '#0d5c3a';
      if (centerCourse.category.toLowerCase().includes('climate')) colorBg = '#0288d1';
      if (centerCourse.category.toLowerCase().includes('waste')) colorBg = '#f57c00';

      carouselOutlet.innerHTML = `
        ${leftCardHtml}

        <!-- Center Active Card -->
        <div class="focus-card center-card" style="box-shadow: 0 8px 25px rgba(13,92,58,0.06); border-left: 5px solid ${colorBg};">
          <div class="focus-card-left">
            <div style="width: 85px; height: 65px; background: ${colorBg}; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.7rem; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
              <i class="fa-solid fa-book-open"></i>
            </div>
            <div>
              <span class="badge" style="background: rgba(16,185,129,0.1); color: var(--sidebar-active-text); margin-bottom: 4px; font-weight:700;">Eco-Lens View</span>
              <h3 style="font-family: var(--font-title); font-size: 1.15rem; margin: 4px 0; font-weight: 800;">${centerCourse.title}</h3>
              <p style="font-size: 0.78rem; color: var(--text-secondary); font-weight: 600;">${activeModuleTitle}</p>
              
              <!-- Segmented blocks progress -->
              <div style="display: flex; align-items: center; gap: 12px; margin-top: 8px;">
                ${segmentsHtml}
                <span style="font-size: 0.78rem; font-weight: 800; color: var(--text-secondary);">${percent}%</span>
              </div>
            </div>
          </div>
          
          <a href="${resumeLink}" class="btn btn-primary" style="padding: 10px 22px; font-size: 0.88rem; border-radius: 30px; font-weight:700; box-shadow: 0 4px 12px rgba(16,185,129,0.25);">
            <i class="fa-solid fa-circle-play"></i> Resume Lesson
          </a>
        </div>

        ${rightCardHtml}
      `;
    }

    // --- 2. RENDER RECOMMENDED COURSES ---
    if (recommendedCourses.length === 0) {
      recommendedOutlet.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 30px;">
          <p style="font-weight: 600; color: var(--text-secondary);">🎉 Excellent! You have enrolled in all available courses!</p>
        </div>
      `;
    } else {
      recommendedOutlet.innerHTML = '';
      recommendedCourses.slice(0, 3).forEach(course => {
        let color = '#0d5c3a';
        if (course.category.toLowerCase().includes('climate')) color = '#0288d1';
        if (course.category.toLowerCase().includes('waste')) color = '#f57c00';
        
        recommendedOutlet.innerHTML += `
          <div class="course-card glass-panel" style="box-shadow: 0 4px 12px var(--shadow-color); border: 1px solid var(--panel-border);">
            <div class="course-card-header" style="background-color: ${color}; background-image: radial-gradient(circle at 20% 30%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0) 80%); height: 110px;">
              <div class="course-card-badge-row">
                <span class="badge" style="background: rgba(255,255,255,0.25); color:white;">${course.category}</span>
                <span class="badge" style="background: rgba(255,255,255,0.25); color:white;">${course.difficulty}</span>
              </div>
              <h3 style="z-index: 2; font-family: var(--font-title); font-size: 1.15rem; color: white;">${course.title}</h3>
            </div>
            <div class="course-card-body" style="padding: 16px; gap: 10px;">
              <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${course.description}</p>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px; font-size:0.8rem; color:var(--text-secondary); font-weight:600;">
                <span><i class="fa-solid fa-book"></i> ${course.total_modules} Modules</span>
                <span><i class="fa-solid fa-award"></i> ${course.total_points} XP</span>
              </div>
            </div>
            <div class="course-card-footer" style="padding: 0 16px 16px 16px;">
              <a href="#courses/${course.id}" class="btn btn-secondary" style="width: 100%; text-decoration: none; font-size: 0.82rem; padding: 8px 0; text-align: center;">View Course</a>
            </div>
          </div>
        `;
      });
    }

    // --- 3. RENDER RECENT ACTIVITY TIMELINE ---
    const progress = progressCache.get(user.id);
    const completedLessonsKeys = Object.keys(progress.completedLessons || {});
    const completedQuizzesKeys = Object.keys(progress.completedQuizzes || {});

    let activityHtml = '';
    let count = 0;

    // Load active logs
    completedQuizzesKeys.forEach(key => {
      const attempt = progress.completedQuizzes[key];
      activityHtml += `
        <div class="recent-activity-item">
          <span style="font-size: 1.15rem; margin-right: 4px;">🎉</span>
          <div>
            <span style="font-weight:700; font-size:0.85rem;">High Score: Quiz Completed</span>
            <p style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 1px;">Scored ${attempt.percentage}% and earned +${attempt.xp_earned} XP</p>
          </div>
        </div>
      `;
      count++;
    });

    completedLessonsKeys.forEach(key => {
      activityHtml += `
        <div class="recent-activity-item">
          <span style="color: var(--success-color); font-size: 0.9rem; margin-right: 6px;"><i class="fa-solid fa-circle-check"></i></span>
          <div>
            <span style="font-weight:600; font-size:0.85rem;">Completed Study Lesson</span>
            <p style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 1px;">Validated course syllabus and claimed +10 XP</p>
          </div>
        </div>
      `;
      count++;
    });

    // Fallback: If no activity has occurred yet, display mockup guidelines matching the image exactly
    if (count === 0) {
      activityHtml = `
        <div class="recent-activity-item">
          <span style="color: var(--success-color); font-size: 0.95rem; margin-right: 6px;"><i class="fa-solid fa-circle-check"></i></span>
          <div>
            <span style="font-weight:700; font-size:0.85rem;">Completed Lesson 2.3 in Biodiversity</span>
            <p style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 1px;">Awarded +10 XP on preservation metrics</p>
          </div>
        </div>
        <div class="recent-activity-item">
          <span style="font-size: 1.15rem; margin-right: 4px;">🎉</span>
          <div>
            <span style="font-weight:700; font-size:0.85rem;">High Score: Climate Quiz</span>
            <p style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 1px;">Achieved 100% correct answers!</p>
          </div>
        </div>
      `;
    }

    activityOutlet.innerHTML = activityHtml;

  } catch (error) {
    console.error('Error rendering dashboard items:', error);
  }
}
