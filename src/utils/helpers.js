// 🛠️ EcoQuest Shared Helper Utilities & Local Progress Cache

/**
 * Format duration from seconds to readable text
 * @param {number} seconds 
 */
export function formatDuration(seconds) {
  if (!seconds) return '0 min';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) {
    return `${mins} min${mins !== 1 ? 's' : ''}`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMins} min`;
}

/**
 * Calculates level and progress percentage based on total XP
 * Each level requires 100 XP
 * @param {number} xp 
 */
export function calculateLevel(xp) {
  const xpPerLevel = 100;
  const level = Math.floor(xp / xpPerLevel) + 1;
  const currentXP = xp % xpPerLevel;
  return {
    level,
    currentXP,
    nextLevelXP: xpPerLevel,
    progressPercent: Math.min(100, Math.floor((currentXP / xpPerLevel) * 100))
  };
}

/**
 * Local progress store helpers to supplement backend state
 */
export const progressCache = {
  /**
   * Get progress object for a specific user
   */
  get: (userId) => {
    if (!userId) return { enrolledCourses: [], completedLessons: [], completedQuizzes: {} };
    const key = `ecoquest_progress_${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : { enrolledCourses: [], completedLessons: [], completedQuizzes: {} };
  },

  /**
   * Set progress object for a specific user
   */
  set: (userId, progress) => {
    if (!userId) return;
    const key = `ecoquest_progress_${userId}`;
    localStorage.setItem(key, JSON.stringify(progress));
  },

  /**
   * Add course enrollment
   */
  enrollInCourse: (userId, courseId) => {
    const progress = progressCache.get(userId);
    const id = Number(courseId);
    if (!progress.enrolledCourses.includes(id)) {
      progress.enrolledCourses.push(id);
      progressCache.set(userId, progress);
    }
  },

  /**
   * Check if user is enrolled in course
   */
  isEnrolled: (userId, courseId) => {
    const progress = progressCache.get(userId);
    return progress.enrolledCourses.includes(Number(courseId));
  },

  /**
   * Mark lesson completed
   */
  completeLesson: (userId, lessonId) => {
    const progress = progressCache.get(userId);
    const id = Number(lessonId);
    if (!progress.completedLessons.includes(id)) {
      progress.completedLessons.push(id);
      progressCache.set(userId, progress);
    }
  },

  /**
   * Check if lesson is completed
   */
  isLessonCompleted: (userId, lessonId) => {
    const progress = progressCache.get(userId);
    return progress.completedLessons.includes(Number(lessonId));
  },

  /**
   * Save quiz attempt
   */
  saveQuizAttempt: (userId, quizId, attemptData) => {
    const progress = progressCache.get(userId);
    progress.completedQuizzes[String(quizId)] = attemptData;
    progressCache.set(userId, progress);
  },

  /**
   * Get quiz attempt data
   */
  getQuizAttempt: (userId, quizId) => {
    const progress = progressCache.get(userId);
    return progress.completedQuizzes[String(quizId)] || null;
  }
};
