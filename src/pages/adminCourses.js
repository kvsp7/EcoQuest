import { authContext } from '../context/authContext.js';
import { adminAPI } from '../api/admin.js';
import { coursesAPI } from '../api/courses.js';
import { quizzesAPI } from '../api/quizzes.js';
import { lessonsAPI } from '../api/lessons.js';
import { showToast } from '../components/toast.js';

export async function render() {
  return `
    <div style="display: flex; flex-direction: column; gap: 30px;">
      
      <!-- Header banner -->
      <div class="glass-panel" style="padding: 24px 30px;">
        <h2 style="font-size: 1.8rem; font-family: var(--font-title);"><i class="fa-solid fa-folder-tree"></i> Course & Content Manager</h2>
        <p style="color: var(--text-secondary); margin-top: 4px;">Construct educational maps, seed quizzes, and upload lesson videos.</p>
      </div>

      <!-- Main Creator Layout -->
      <div class="creator-layout">
        
        <!-- Left Tab Selection list -->
        <div class="glass-panel" style="padding: 20px; display: flex; flex-direction: column; gap: 15px; height: fit-content;">
          <h3 style="font-size: 1.05rem; padding-bottom: 8px; border-bottom: 1px solid var(--panel-border); font-family: var(--font-title);">Content Tasks</h3>
          <div class="creator-sidebar-list" id="admin-tabs-list">
            <div class="creator-list-item selected" data-tab="course"><i class="fa-solid fa-graduation-cap"></i> 1. Create Course</div>
            <div class="creator-list-item" data-tab="module"><i class="fa-solid fa-cubes"></i> 2. Create Module</div>
            <div class="creator-list-item" data-tab="lesson"><i class="fa-solid fa-chalkboard-user"></i> 3. Create Lesson</div>
            <div class="creator-list-item" data-tab="video"><i class="fa-solid fa-file-video"></i> 4. Upload Video</div>
            <div class="creator-list-item" data-tab="quiz"><i class="fa-solid fa-circle-question"></i> 5. Add Quiz</div>
            <div class="creator-list-item" data-tab="question"><i class="fa-solid fa-circle-plus"></i> 6. Add Questions</div>
          </div>
        </div>

        <!-- Right Content Panels Wrapper -->
        <div class="glass-panel" style="padding: 40px; min-height: 480px;" id="admin-panel-content">
          <!-- Panels render dynamically here -->
        </div>

      </div>

    </div>
  `;
}

export function init() {
  const tabsList = document.getElementById('admin-tabs-list');
  const panelOutlet = document.getElementById('admin-panel-content');

  // Active state repositories
  let cachedCourses = [];
  let cachedModules = [];
  let cachedLessons = [];
  let cachedQuizzes = [];

  /**
   * Refreshes active lists from APIs
   */
  async function refreshDataCache() {
    try {
      cachedCourses = await coursesAPI.getAll();
      cachedQuizzes = await quizzesAPI.getAll();
      
      // Flatten modules and lessons for selector nodes
      cachedModules = [];
      cachedLessons = [];
      
      for (const course of cachedCourses) {
        try {
          const courseModules = await coursesAPI.getModules(course.id);
          cachedModules.push(...courseModules.map(m => ({ ...m, courseTitle: course.title })));
          
          for (const mod of courseModules) {
            try {
              const modLessons = await lessonsAPI.getByModule(mod.id);
              cachedLessons.push(...modLessons.map(l => ({ ...l, moduleTitle: mod.title })));
            } catch (e) {
              console.error(`Error loading lessons for module ${mod.id}:`, e);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    } catch (error) {
      console.error('Error seeding caches:', error);
    }
  }

  /**
   * Switch between tab views
   */
  function switchTab(tabKey) {
    // Update active highlight style
    document.querySelectorAll('.creator-list-item').forEach(item => {
      if (item.getAttribute('data-tab') === tabKey) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });

    // Render correct editor form
    switch (tabKey) {
      case 'course':
        renderCourseForm();
        break;
      case 'module':
        renderModuleForm();
        break;
      case 'lesson':
        renderLessonForm();
        break;
      case 'video':
        renderVideoForm();
        break;
      case 'quiz':
        renderQuizForm();
        break;
      case 'question':
        renderQuestionForm();
        break;
    }
  }

  // Bind tab click triggers
  if (tabsList) {
    tabsList.onclick = (e) => {
      const item = e.target.closest('.creator-list-item');
      if (item) {
        const tab = item.getAttribute('data-tab');
        switchTab(tab);
      }
    };
  }

  /* ==========================================================================
     Tab 1: Create Course Form
     ========================================================================== */
  function renderCourseForm() {
    panelOutlet.innerHTML = `
      <h3 style="font-size: 1.4rem; margin-bottom: 25px;"><i class="fa-solid fa-graduation-cap"></i> Step 1: Create Environmental Course</h3>
      
      <form id="admin-course-form">
        <div class="form-group">
          <label class="form-label">Course Title</label>
          <input type="text" id="course-title" class="form-control" placeholder="e.g. Climate Change Mitigation" required>
        </div>
        
        <div class="form-group">
          <label class="form-label">Description / Overview</label>
          <textarea id="course-description" class="form-control" rows="4" placeholder="Brief explanation of what the course covers..." required style="resize:none;"></textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Category</label>
            <input type="text" id="course-category" class="form-control" placeholder="e.g. Climate, Waste, Water" required>
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Difficulty Level</label>
            <select id="course-difficulty" class="form-control" style="appearance: auto;">
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-circle-check"></i> Create Course</button>
      </form>
    `;

    const form = document.getElementById('admin-course-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

      const courseData = {
        title: document.getElementById('course-title').value.trim(),
        description: document.getElementById('course-description').value.trim(),
        category: document.getElementById('course-category').value.trim(),
        difficulty: document.getElementById('course-difficulty').value
      };

      try {
        await adminAPI.createCourse(courseData);
        showToast('Course created successfully! 🎓', 'success');
        form.reset();
        await refreshDataCache();
        switchTab('module'); // Direct to next step
      } catch (error) {
        showToast(error.message || 'Could not create course.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Create Course';
      }
    };
  }

  /* ==========================================================================
     Tab 2: Create Module Form
     ========================================================================== */
  function renderModuleForm() {
    panelOutlet.innerHTML = `
      <h3 style="font-size: 1.4rem; margin-bottom: 25px;"><i class="fa-solid fa-cubes"></i> Step 2: Add Curriculum Module</h3>
      
      <form id="admin-module-form">
        <div class="form-group">
          <label class="form-label">Select Parent Course</label>
          <select id="module-course-select" class="form-control" style="appearance: auto;" required>
            <option value="">-- Choose Course --</option>
            ${cachedCourses.map(c => `<option value="${c.id}">${c.title} (${c.category})</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Module Title</label>
          <input type="text" id="module-title" class="form-control" placeholder="e.g. Introduction to Renewable Energies" required>
        </div>

        <div class="form-group">
          <label class="form-label">Description / Subtitle</label>
          <input type="text" id="module-description" class="form-control" placeholder="Brief outline of module chapters...">
        </div>

        <div class="form-group" style="margin-bottom: 30px;">
          <label class="form-label">Module Completion Points</label>
          <input type="number" id="module-points" class="form-control" value="50" min="10" max="200" required>
        </div>

        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-circle-check"></i> Add Module</button>
      </form>
    `;

    const form = document.getElementById('admin-module-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const courseId = document.getElementById('module-course-select').value;
      if (!courseId) {
        showToast('Please select a valid parent course.', 'warning');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

      const moduleData = {
        title: document.getElementById('module-title').value.trim(),
        description: document.getElementById('module-description').value.trim() || null,
        points: Number(document.getElementById('module-points').value)
      };

      try {
        await adminAPI.createModule(courseId, moduleData);
        showToast('Module created successfully! 📦', 'success');
        form.reset();
        await refreshDataCache();
        switchTab('lesson'); // Move to next step
      } catch (error) {
        showToast(error.message || 'Could not create module.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Add Module';
      }
    };
  }

  /* ==========================================================================
     Tab 3: Create Lesson Form
     ========================================================================== */
  function renderLessonForm() {
    panelOutlet.innerHTML = `
      <h3 style="font-size: 1.4rem; margin-bottom: 25px;"><i class="fa-solid fa-chalkboard-user"></i> Step 3: Add Lesson Topic</h3>
      
      <form id="admin-lesson-form">
        <div class="form-group">
          <label class="form-label">Select Parent Module</label>
          <select id="lesson-module-select" class="form-control" style="appearance: auto;" required>
            <option value="">-- Choose Module --</option>
            ${cachedModules.map(m => `<option value="${m.id}">${m.courseTitle} • M${m.module_number}: ${m.title}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Lesson Title</label>
          <input type="text" id="lesson-title" class="form-control" placeholder="e.g. Solar Photovoltaic Basics" required>
        </div>

        <div class="form-group">
          <label class="form-label">Description / Summary</label>
          <textarea id="lesson-description" class="form-control" rows="3" placeholder="Brief outline of lesson contents..." style="resize:none;"></textarea>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Duration (in seconds)</label>
            <input type="number" id="lesson-duration" class="form-control" value="300" min="60" step="60" required>
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Completion XP Points</label>
            <input type="number" id="lesson-points" class="form-control" value="10" min="5" step="5" required>
          </div>
        </div>

        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-circle-check"></i> Add Lesson</button>
      </form>
    `;

    const form = document.getElementById('admin-lesson-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const moduleId = document.getElementById('lesson-module-select').value;
      if (!moduleId) {
        showToast('Please select a parent module.', 'warning');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

      const lessonData = {
        title: document.getElementById('lesson-title').value.trim(),
        description: document.getElementById('lesson-description').value.trim() || null,
        duration: Number(document.getElementById('lesson-duration').value),
        points: Number(document.getElementById('lesson-points').value)
      };

      try {
        await adminAPI.createLesson(moduleId, lessonData);
        showToast('Lesson created successfully! 📚', 'success');
        form.reset();
        await refreshDataCache();
        switchTab('video'); // Move to video uploading
      } catch (error) {
        showToast(error.message || 'Could not create lesson.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Add Lesson';
      }
    };
  }

  /* ==========================================================================
     Tab 4: Upload Video Form
     ========================================================================== */
  function renderVideoForm() {
    panelOutlet.innerHTML = `
      <h3 style="font-size: 1.4rem; margin-bottom: 25px;"><i class="fa-solid fa-file-video"></i> Step 4: Upload Lesson Video</h3>
      
      <form id="admin-video-form" enctype="multipart/form-data">
        <div class="form-group">
          <label class="form-label">Select Lesson Target</label>
          <select id="video-lesson-select" class="form-control" style="appearance: auto;" required>
            <option value="">-- Choose Lesson --</option>
            ${cachedLessons.map(l => `<option value="${l.id}">${l.moduleTitle} • L${l.lesson_number}: ${l.title} ${l.video_path ? '(Has Video ✓)' : '(No Video)'}</option>`).join('')}
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 25px;">
          <label class="form-label">Choose MP4/WEBM Video File</label>
          <div class="upload-zone" id="upload-drag-zone">
            <i class="fa-solid fa-cloud-arrow-up" style="font-size: 3rem; color: var(--forest-color); margin-bottom: 12px;"></i>
            <p style="font-weight:600; margin-bottom:4px;">Drag and drop video file here</p>
            <p style="font-size:0.75rem; color:var(--text-secondary);">Supports MP4, WEBM, MOV, MKV formats up to 100MB</p>
            <input type="file" id="video-file-input" accept="video/*" required style="display:none;">
            <span id="selected-filename" class="badge badge-difficulty" style="margin-top: 15px; display: none;">No file selected</span>
          </div>
        </div>

        <!-- Progress bar container -->
        <div id="upload-progress-outlet" style="display: none; margin-bottom: 25px;">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; font-weight:600; margin-bottom:6px;">
            <span>Uploading data...</span>
            <span id="upload-percent-text">0%</span>
          </div>
          <div class="progress-ring-container">
            <div class="progress-ring-fill" id="upload-progress-bar"></div>
          </div>
        </div>

        <button type="submit" class="btn btn-primary" id="btn-video-submit"><i class="fa-solid fa-cloud-arrow-up"></i> Start Upload</button>
      </form>
    `;

    const form = document.getElementById('admin-video-form');
    const dragZone = document.getElementById('upload-drag-zone');
    const fileInput = document.getElementById('video-file-input');
    const filenameBadge = document.getElementById('selected-filename');
    const progressOutlet = document.getElementById('upload-progress-outlet');
    const progressBar = document.getElementById('upload-progress-bar');
    const percentText = document.getElementById('upload-percent-text');

    // Trigger file chooser
    if (dragZone && fileInput) {
      dragZone.onclick = () => fileInput.click();
      
      fileInput.onchange = () => {
        if (fileInput.files.length > 0) {
          filenameBadge.textContent = fileInput.files[0].name;
          filenameBadge.style.display = 'inline-block';
        }
      };
    }

    form.onsubmit = async (e) => {
      e.preventDefault();
      const lessonId = document.getElementById('video-lesson-select').value;
      const file = fileInput.files[0];

      if (!lessonId || !file) {
        showToast('Please select both a lesson and a video file.', 'warning');
        return;
      }

      const submitBtn = document.getElementById('btn-video-submit');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';
      progressOutlet.style.display = 'block';

      // Simulation progress bar visual (since native fetch upload progress hooks require complex XHR logic)
      let progressVal = 0;
      const progressTimer = setInterval(() => {
        if (progressVal < 90) {
          progressVal += Math.floor(Math.random() * 8) + 2;
          progressBar.style.width = `${progressVal}%`;
          percentText.textContent = `${progressVal}%`;
        }
      }, 300);

      try {
        await adminAPI.uploadVideo(lessonId, file);
        
        // Finalize progress ring
        clearInterval(progressTimer);
        progressBar.style.width = '100%';
        percentText.textContent = '100%';
        
        showToast('Video uploaded and linked successfully! 🎥', 'success');
        form.reset();
        filenameBadge.style.display = 'none';
        
        setTimeout(() => {
          progressOutlet.style.display = 'none';
          refreshDataCache().then(() => switchTab('quiz'));
        }, 1000);
        
      } catch (error) {
        clearInterval(progressTimer);
        progressOutlet.style.display = 'none';
        showToast(error.message || 'Video upload failed.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up"></i> Start Upload';
      }
    };
  }

  /* ==========================================================================
     Tab 5: Create Quiz Form
     ========================================================================== */
  function renderQuizForm() {
    panelOutlet.innerHTML = `
      <h3 style="font-size: 1.4rem; margin-bottom: 25px;"><i class="fa-solid fa-clipboard-question"></i> Step 5: Create Course Quiz</h3>
      
      <form id="admin-quiz-form">
        <div class="form-group">
          <label class="form-label">Select target Course</label>
          <select id="quiz-course-select" class="form-control" style="appearance: auto;" required>
            <option value="">-- Choose Course --</option>
            ${cachedCourses.map(c => `<option value="${c.id}">${c.title}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Quiz Title</label>
          <input type="text" id="quiz-title" class="form-control" placeholder="e.g. Climate Basics Assessment" required>
        </div>

        <div class="form-group">
          <label class="form-label">Description / Subtitle</label>
          <input type="text" id="quiz-description" class="form-control" placeholder="e.g. Test your understanding of greenhouse effects.">
        </div>

        <div class="form-group" style="margin-bottom: 30px;">
          <label class="form-label">XP Awarded per Question</label>
          <input type="number" id="quiz-points" class="form-control" value="10" min="5" max="50" required>
        </div>

        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-circle-check"></i> Create Quiz</button>
      </form>
    `;

    const form = document.getElementById('admin-quiz-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const courseId = document.getElementById('quiz-course-select').value;
      if (!courseId) {
        showToast('Please select a course.', 'warning');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

      const quizData = {
        title: document.getElementById('quiz-title').value.trim(),
        description: document.getElementById('quiz-description').value.trim() || '',
        points_per_question: Number(document.getElementById('quiz-points').value)
      };

      try {
        await adminAPI.createQuiz(courseId, quizData);
        showToast('Quiz created successfully! 📝', 'success');
        form.reset();
        await refreshDataCache();
        switchTab('question'); // Next step: add questions
      } catch (error) {
        showToast(error.message || 'Could not create quiz.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Create Quiz';
      }
    };
  }

  /* ==========================================================================
     Tab 6: Add Question Form
     ========================================================================== */
  function renderQuestionForm() {
    panelOutlet.innerHTML = `
      <h3 style="font-size: 1.4rem; margin-bottom: 25px;"><i class="fa-solid fa-circle-plus"></i> Step 6: Add Quiz Questions</h3>
      
      <form id="admin-question-form">
        <div class="form-group">
          <label class="form-label">Select Target Quiz</label>
          <select id="question-quiz-select" class="form-control" style="appearance: auto;" required>
            <option value="">-- Choose Quiz --</option>
            ${cachedQuizzes.map(q => `<option value="${q.id}">${q.title} (${q.total_questions} Questions)</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Question Text</label>
          <input type="text" id="quest-text" class="form-control" placeholder="What causes the greenhouse effect?" required>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Option A</label>
            <input type="text" id="quest-opt-a" class="form-control" placeholder="Option A description" required>
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Option B</label>
            <input type="text" id="quest-opt-b" class="form-control" placeholder="Option B description" required>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px;">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Option C</label>
            <input type="text" id="quest-opt-c" class="form-control" placeholder="Option C description" required>
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Option D</label>
            <input type="text" id="quest-opt-d" class="form-control" placeholder="Option D description" required>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 30px;">
          <label class="form-label">Select Correct Option Answer</label>
          <select id="quest-correct" class="form-control" style="appearance: auto;" required>
            <option value="">-- Select Answer --</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>

        <button type="submit" class="btn btn-primary"><i class="fa-solid fa-plus"></i> Add Question to Quiz</button>
      </form>
    `;

    const form = document.getElementById('admin-question-form');
    form.onsubmit = async (e) => {
      e.preventDefault();
      const quizId = document.getElementById('question-quiz-select').value;
      if (!quizId) {
        showToast('Please select a quiz.', 'warning');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

      const questionData = {
        question_text: document.getElementById('quest-text').value.trim(),
        option_a: document.getElementById('quest-opt-a').value.trim(),
        option_b: document.getElementById('quest-opt-b').value.trim(),
        option_c: document.getElementById('quest-opt-c').value.trim(),
        option_d: document.getElementById('quest-opt-d').value.trim(),
        correct_answer: document.getElementById('quest-correct').value
      };

      try {
        await adminAPI.addQuestion(quizId, questionData);
        showToast('Question added successfully! ➕', 'success');
        
        // Reset question values but keep the selected Quiz for quick adding
        document.getElementById('quest-text').value = '';
        document.getElementById('quest-opt-a').value = '';
        document.getElementById('quest-opt-b').value = '';
        document.getElementById('quest-opt-c').value = '';
        document.getElementById('quest-opt-d').value = '';
        document.getElementById('quest-correct').value = '';
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Question to Quiz';
        
        await refreshDataCache();
        
        // Update selector list counts
        const select = document.getElementById('question-quiz-select');
        const selectedIndex = select.selectedIndex;
        const currentOptionText = select.options[selectedIndex].text;
        
        // Quick update count in selector text
        const matches = currentOptionText.match(/(\d+) Questions/);
        if (matches) {
          const nextCount = Number(matches[1]) + 1;
          select.options[selectedIndex].text = currentOptionText.replace(/\d+ Questions/, `${nextCount} Questions`);
        }
      } catch (error) {
        showToast(error.message || 'Could not add question.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Question to Quiz';
      }
    };
  }

  // Seeding cache data initially
  refreshDataCache().then(() => {
    // Default initial rendering
    renderCourseForm();
  });
}
