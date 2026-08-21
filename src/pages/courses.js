import { authContext } from '../context/authContext.js';
import { coursesAPI } from '../api/courses.js';
import { lessonsAPI } from '../api/lessons.js';
import { progressCache, formatDuration } from '../utils/helpers.js';
import { showToast } from '../components/toast.js';

export async function render(params, isMyLearningOnly = false) {
  const { user } = authContext.getState();
  const courseId = params?.id;

  // Case 1: Render Single Course Detail Page
  if (courseId) {
    return `
      <div style="display: flex; flex-direction: column; gap: 30px;">
        <!-- Course Details Hero -->
        <div id="course-detail-hero-outlet" class="glass-panel course-detail-hero">
          <div class="skeleton" style="height: 120px;"></div>
        </div>

        <!-- Modules and Lessons Accordion Grid -->
        <div class="glass-panel section-card">
          <h2 style="margin-bottom: 25px;"><i class="fa-solid fa-rectangle-list"></i> Course Curriculum</h2>
          <div id="course-modules-outlet" class="modules-list">
            <div class="skeleton" style="height: 50px; margin-bottom: 12px;"></div>
            <div class="skeleton" style="height: 50px; margin-bottom: 12px;"></div>
            <div class="skeleton" style="height: 50px;"></div>
          </div>
        </div>
      </div>
    `;
  }

  // Case 2: Render Courses Explorer Page
  const title = isMyLearningOnly ? 'My Learning Pathway' : 'Explore Subjects';
  const subtitle = isMyLearningOnly ? 'Pick up where you left off in your environmental paths' : 'Start your journey with environmental education led by world class structures';

  return `
    <div style="display: flex; flex-direction: column; gap: 30px;">
      
      <!-- Coursera Header bar style -->
      <div class="glass-panel" style="padding: 30px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
        <div style="flex: 1; min-width: 250px;">
          <h2 style="font-size: 2rem; font-family: var(--font-title); color: var(--forest-color);">${title}</h2>
          <p style="color: var(--text-secondary); margin-top: 6px; font-size: 0.95rem;">${subtitle}</p>
        </div>
        
        ${!isMyLearningOnly ? `
          <!-- Coursera-like search bar input -->
          <div style="position: relative; min-width: 320px;">
            <input type="text" id="catalog-search-input" class="form-control" placeholder="What do you want to learn today?" style="padding-left: 45px; height: 48px; border-radius: 50px;">
            <i class="fa-solid fa-magnifying-glass" style="position: absolute; left: 18px; top: 16px; color: var(--text-secondary); opacity: 0.7; font-size: 1rem;"></i>
          </div>
        ` : ''}
      </div>

      ${!isMyLearningOnly ? `
        <!-- Coursera subject filter buttons row -->
        <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;" id="catalog-subject-filters">
          <span style="font-weight: 700; font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; margin-right: 10px; letter-spacing: 1px;">Subjects:</span>
          <button class="btn btn-secondary active-filter" data-filter="all" style="padding: 8px 20px; font-size: 0.85rem; border-radius: 100px; border-color: var(--forest-color); background: var(--sidebar-active-bg); color: var(--sidebar-active-text); font-weight:600;">All Subjects</button>
          <button class="btn btn-secondary" data-filter="Climate" style="padding: 8px 20px; font-size: 0.85rem; border-radius: 100px;">Climate Change</button>
          <button class="btn btn-secondary" data-filter="Waste" style="padding: 8px 20px; font-size: 0.85rem; border-radius: 100px;">Waste & Recycling</button>
          <button class="btn btn-secondary" data-filter="Biodiversity" style="padding: 8px 20px; font-size: 0.85rem; border-radius: 100px;">Biodiversity</button>
        </div>
      ` : ''}

      <!-- Discovery Courses Grid -->
      <div class="courses-grid" id="courses-discovery-outlet">
        <div class="skeleton skeleton-card" style="height:260px;"></div>
        <div class="skeleton skeleton-card" style="height:260px;"></div>
        <div class="skeleton skeleton-card" style="height:260px;"></div>
      </div>
    </div>
  `;
}

export async function init(params, isMyLearningOnly = false) {
  const { user } = authContext.getState();
  if (!user) return;

  const courseId = params?.id;

  // Case 1: Initialize Course Detail Page
  if (courseId) {
    const heroOutlet = document.getElementById('course-detail-hero-outlet');
    const modulesOutlet = document.getElementById('course-modules-outlet');
    
    try {
      // Fetch course info
      const course = await coursesAPI.getById(courseId);
      const isEnrolled = progressCache.isEnrolled(user.id, course.id);
      
      // Award first discovery achievement
      if (window.ecoquestGamification) {
        window.ecoquestGamification.unlockAchievement('first_discovery', 'First Discovery', `Opened details for: ${course.title}!`, 50);
      }
      
      // Fetch modules
      const modules = await coursesAPI.getModules(courseId);
      
      // Explicitly fetch lessons for each module
      for (const mod of modules) {
        try {
          mod.lessons = await lessonsAPI.getByModule(mod.id);
        } catch (e) {
          console.error(`Error loading lessons for module ${mod.id}:`, e);
          mod.lessons = [];
        }
      }

      // Calculate overall progress if enrolled
      let completedLessons = 0;
      let totalLessons = 0;
      
      modules.forEach(mod => {
        mod.lessons.forEach(les => {
          totalLessons++;
          if (progressCache.isLessonCompleted(user.id, les.id)) {
            completedLessons++;
          }
        });
      });

      const percent = totalLessons > 0 ? Math.floor((completedLessons / totalLessons) * 100) : 0;

      // Color mapping
      let color = '#0d5c3a';
      if (course.category.toLowerCase().includes('climate')) color = '#0288d1';
      if (course.category.toLowerCase().includes('waste')) color = '#f57c00';

      // Render Hero Details
      heroOutlet.style.backgroundColor = color;
      heroOutlet.style.backgroundImage = 'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.5) 90%)';
      heroOutlet.style.color = 'white';
      
      heroOutlet.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 20px; z-index: 2; position: relative;">
          <div style="flex: 2; min-width: 300px;">
            <div style="display: flex; gap: 8px; margin-bottom: 15px;">
              <span class="badge" style="background: rgba(255,255,255,0.2); color: white;">${course.category}</span>
              <span class="badge" style="background: rgba(255,255,255,0.2); color: white;">${course.difficulty}</span>
            </div>
            <h2 style="font-size: 2.2rem; color: white; margin-bottom: 12px; font-family: var(--font-title);">${course.title}</h2>
            <p style="opacity: 0.9; max-width: 700px; font-size: 0.95rem; line-height:1.6;">${course.description}</p>
            
            ${isEnrolled ? `
              <!-- Progress Indicator -->
              <div style="margin-top: 30px; max-width: 400px;">
                <div style="display: flex; justify-content: space-between; font-weight: 600; font-size: 0.85rem; margin-bottom: 6px;">
                  <span>Course Progress</span>
                  <span>${percent}% Completed (${completedLessons}/${totalLessons} lessons)</span>
                </div>
                <div class="progress-bar-track" style="background: rgba(255,255,255,0.2);">
                  <div class="progress-bar-fill" style="width: ${percent}%; background: white;"></div>
                </div>
              </div>
            ` : ''}
          </div>

          <div style="flex: 1; min-width: 180px; text-align: right; display: flex; flex-direction: column; align-items: flex-end; gap: 15px;">
            <div style="font-size: 0.9rem; font-weight: 600; opacity: 0.85;">
              <i class="fa-solid fa-award"></i> Earn Up To ${course.total_points} XP
            </div>
            
            ${isEnrolled ? `
              <span class="badge" style="background: rgba(255,255,255,0.25); padding: 8px 16px; font-weight:700;"><i class="fa-solid fa-circle-check"></i> Enrolled</span>
            ` : `
              <button id="btn-enroll-course" class="btn" style="background: white; color: ${color}; font-weight:700; box-shadow: 0 4px 15px rgba(0,0,0,0.15);">
                <i class="fa-solid fa-user-plus"></i> Enroll Now
              </button>
            `}
          </div>
        </div>
      `;

      // Bind enroll button
      const enrollBtn = document.getElementById('btn-enroll-course');
      if (enrollBtn) {
        enrollBtn.onclick = async () => {
          enrollBtn.disabled = true;
          enrollBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enrolling...';
          
          try {
            await coursesAPI.enroll(course.id);
            // Save in local enrollment cache
            progressCache.enrollInCourse(user.id, course.id);
            showToast(`Successfully enrolled in ${course.title}! Let's learn! 🌱`, 'success');
            // Re-render course details
            init(params);
          } catch (error) {
            showToast(error.message || 'Enrollment failed. Please try again.', 'error');
            enrollBtn.disabled = false;
            enrollBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Enroll Now';
          }
        };
      }

      // Render Modules & Lessons curriculum list
      if (modules.length === 0) {
        modulesOutlet.innerHTML = `
          <div style="text-align: center; padding: 30px;">
            <p style="color: var(--text-secondary); font-weight:600;">No learning modules have been added to this course yet.</p>
          </div>
        `;
      } else {
        modulesOutlet.innerHTML = '';
        modules.forEach((mod, index) => {
          const modLessons = mod.lessons || [];
          
          // Render Module accordion container
          const accItem = document.createElement('div');
          accItem.className = `module-accordion-item glass-card ${index === 0 ? 'open' : ''}`;
          
          accItem.innerHTML = `
            <div class="module-accordion-header">
              <div class="module-header-title">
                <span class="module-header-num">${String(mod.module_number).padStart(2, '0')}</span>
                <div>
                  <h3 style="font-size: 1.15rem; font-family: var(--font-title);">${mod.title}</h3>
                  <span style="font-size: 0.8rem; color: var(--text-secondary);">${mod.description || 'Module details'}</span>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 0.85rem; font-weight:600; color: var(--text-secondary);"><i class="fa-solid fa-circle-play"></i> ${modLessons.length} Lessons</span>
                <i class="fa-solid fa-chevron-down accordion-arrow" style="transition: transform 0.3s ease;"></i>
              </div>
            </div>
            
            <div class="module-accordion-content">
              <ul class="lessons-list">
                ${modLessons.map(les => {
                  const isDone = progressCache.isLessonCompleted(user.id, les.id);
                  let iconHtml = '<i class="fa-solid fa-circle-play lesson-status-icon incomplete"></i>';
                  let itemClass = '';
                  
                  if (!isEnrolled) {
                    iconHtml = '<i class="fa-solid fa-lock lesson-status-icon locked"></i>';
                    itemClass = 'locked';
                  } else if (isDone) {
                    iconHtml = '<i class="fa-solid fa-circle-check lesson-status-icon complete"></i>';
                  }
                  
                  return `
                    <li class="lesson-item ${itemClass}" data-lesson-id="${les.id}">
                      <div class="lesson-meta-left">
                        ${iconHtml}
                        <div>
                          <span style="font-weight: 600; font-size: 0.95rem;">${les.lesson_number}. ${les.title}</span>
                          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top:2px;">${les.description || ''}</p>
                        </div>
                      </div>
                      
                      <div style="display: flex; align-items: center; gap: 15px; font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);">
                        <span><i class="fa-regular fa-clock"></i> ${formatDuration(les.duration)}</span>
                        <span style="color: var(--xp-color);"><i class="fa-solid fa-star"></i> +${les.points} XP</span>
                      </div>
                    </li>
                  `;
                }).join('')}
              </ul>
            </div>
          `;

          // Handle expand/collapse logic
          const header = accItem.querySelector('.module-accordion-header');
          header.onclick = () => {
            accItem.classList.toggle('open');
            const arrow = header.querySelector('.accordion-arrow');
            if (arrow) {
              arrow.style.transform = accItem.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';
            }
          };

          // Handle lesson click routing
          accItem.querySelectorAll('.lesson-item').forEach(item => {
            item.onclick = (e) => {
              if (item.classList.contains('locked')) {
                showToast('Please enroll in the course first to unlock lessons!', 'warning');
                return;
              }
              const id = item.getAttribute('data-lesson-id');
              window.location.hash = `#lessons/${id}`;
            };
          });

          modulesOutlet.appendChild(accItem);
        });
      }

    } catch (error) {
      console.error('Error loading course details page:', error);
      heroOutlet.innerHTML = `<p style="color: var(--danger-color); padding: 20px;">Could not load course headers: ${error.message}</p>`;
      modulesOutlet.innerHTML = `<p style="color: var(--danger-color);">Error loading curriculum: ${error.message}</p>`;
    }
    return;
  }

  // Case 2: Initialize Courses Explorer Catalog / My Learning list
  const catalogOutlet = document.getElementById('courses-discovery-outlet');
  try {
    const coursesList = await coursesAPI.getAll();
    
    // Filter if showing My Learning only
    const filteredBase = isMyLearningOnly 
      ? coursesList.filter(c => progressCache.isEnrolled(user.id, c.id))
      : coursesList;

    let activeFilter = 'all';
    let activeQuery = '';

    // Cache module calculations to avoid re-fetching on filter keys
    const courseStats = {};
    for (const c of coursesList) {
      courseStats[c.id] = { total: 0, completed: 0 };
      try {
        const modules = await coursesAPI.getModules(c.id);
        for (const m of modules) {
          try {
            const lessons = await lessonsAPI.getByModule(m.id);
            lessons.forEach(l => {
              courseStats[c.id].total++;
              if (progressCache.isLessonCompleted(user.id, l.id)) {
                courseStats[c.id].completed++;
              }
            });
          } catch (err) {
            console.error(err);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    /**
     * Filters courses list in real time and renders DOM
     */
    function renderFilteredCourses() {
      let result = [...filteredBase];
      
      // Apply search query filter
      if (activeQuery) {
        result = result.filter(c => 
          c.title.toLowerCase().includes(activeQuery) || 
          c.description.toLowerCase().includes(activeQuery) ||
          c.category.toLowerCase().includes(activeQuery)
        );
      }

      // Apply subject filter
      if (activeFilter !== 'all') {
        result = result.filter(c => c.category.toLowerCase().includes(activeFilter.toLowerCase()));
      }

      if (result.length === 0) {
        catalogOutlet.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
            <div style="font-size: 3rem; color: var(--text-secondary); opacity: 0.3; margin-bottom: 15px;">
              <i class="fa-solid fa-circle-question"></i>
            </div>
            <p style="font-weight: 600; color: var(--text-secondary);">No courses match your subject filters.</p>
          </div>
        `;
        return;
      }

      catalogOutlet.innerHTML = '';
      result.forEach(course => {
        const enrolled = progressCache.isEnrolled(user.id, course.id);
        const stats = courseStats[course.id] || { total: 0, completed: 0 };
        const percent = stats.total > 0 ? Math.floor((stats.completed / stats.total) * 100) : 0;

        let color = '#0d5c3a'; // Coursera premium green accent
        if (course.category.toLowerCase().includes('climate')) color = '#0288d1';
        if (course.category.toLowerCase().includes('waste')) color = '#f57c00';

        // Rating stars placeholder for Coursera aesthetic
        const ratings = ['4.8 ★★★★★ (420 reviews)', '4.9 ★★★★★ (312 reviews)', '4.7 ★★★★★ (180 reviews)'];
        const randomRating = ratings[course.id % ratings.length];

        catalogOutlet.innerHTML += `
          <div class="course-card glass-panel tilt-card spotlight-card" style="box-shadow: 0 4px 16px var(--shadow-color); border: 1px solid var(--panel-border);">
            <div class="course-card-header" style="background-color: ${color}; background-image: radial-gradient(circle at 10% 20%, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0) 80%); height: 140px;">
              <div class="course-card-badge-row">
                <span class="badge" style="background: rgba(255,255,255,0.25); color:white;">${course.category}</span>
                <span class="badge" style="background: rgba(255,255,255,0.25); color:white;">${course.difficulty}</span>
              </div>
              <h3 style="z-index: 2; font-family: var(--font-title); font-size: 1.2rem; color: white;">${course.title}</h3>
            </div>
            
            <div class="course-card-body" style="padding: 24px; gap: 15px;">
              <span style="font-size: 0.75rem; font-weight: 600; color: #f59e0b; display: flex; align-items: center; gap: 4px;">
                <i class="fa-solid fa-star"></i> ${randomRating}
              </span>
              <p style="font-size: 0.88rem; color: var(--text-secondary); line-height:1.5;">${course.description}</p>
              
              ${enrolled ? `
                <!-- Progress bar -->
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:700; margin-bottom:4px; color: var(--text-secondary);">
                    <span>Lessons Completed</span>
                    <span>${percent}%</span>
                  </div>
                  <div class="progress-bar-track" style="height: 6px;">
                    <div class="progress-bar-fill" style="width: ${percent}%;"></div>
                  </div>
                </div>
              ` : `
                <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:var(--text-secondary); font-weight:600;">
                  <span><i class="fa-solid fa-book"></i> ${course.total_modules} Modules</span>
                  <span><i class="fa-solid fa-award"></i> ${course.total_points} XP</span>
                </div>
              `}
            </div>

            <div class="course-card-footer" style="padding: 0 24px 24px 24px;">
              <a href="#courses/${course.id}" class="btn ${enrolled ? 'btn-primary' : 'btn-secondary'}" style="width: 100%; text-decoration: none; font-size: 0.85rem; padding: 10px 0;">
                ${enrolled ? '<i class="fa-solid fa-play"></i> Continue Learning' : 'View Course details'}
              </a>
            </div>
          </div>
        `;
      });
    }

    renderFilteredCourses();

    // Bind real-time search inputs
    const search = document.getElementById('catalog-search-input');
    if (search) {
      search.oninput = (e) => {
        activeQuery = e.target.value.toLowerCase().trim();
        renderFilteredCourses();
      };
    }

    // Bind category button filters
    const filters = document.getElementById('catalog-subject-filters');
    if (filters) {
      filters.onclick = (e) => {
        const btn = e.target.closest('button');
        if (btn) {
          // Remove active styles from siblings
          filters.querySelectorAll('button').forEach(b => {
            b.style.background = '';
            b.style.color = '';
            b.style.borderColor = '';
            b.style.fontWeight = '';
          });

          // Highlight selected button
          btn.style.background = 'var(--sidebar-active-bg)';
          btn.style.color = 'var(--sidebar-active-text)';
          btn.style.borderColor = 'var(--forest-color)';
          btn.style.fontWeight = '600';

          activeFilter = btn.getAttribute('data-filter');
          renderFilteredCourses();
        }
      };
    }

  } catch (error) {
    console.error('Error fetching courses list:', error);
    catalogOutlet.innerHTML = `<p style="color: var(--danger-color);">Error fetching environmental courses: ${error.message}</p>`;
  }
}
