import { client } from './client.js';

export const adminAPI = {
  /**
   * Fetch admin dashboard statistics
   */
  getDashboardStats: async () => {
    return client.get('/admin/dashboard');
  },

  /**
   * Fetch all registered student accounts
   */
  getStudents: async () => {
    return client.get('/admin/students');
  },

  /**
   * Create a new course (FastAPI parameters are query parameters)
   */
  createCourse: async (courseData) => {
    const { title, description, category, difficulty } = courseData;
    const params = new URLSearchParams({
      title,
      description,
      category,
      difficulty: difficulty || 'Beginner'
    });
    return client.post(`/admin/courses?${params.toString()}`);
  },

  /**
   * Create a new module under a course (FastAPI parameters are query parameters)
   */
  createModule: async (courseId, moduleData) => {
    const { title, description, points } = moduleData;
    const params = new URLSearchParams({
      title,
      description,
      points: String(points || 50)
    });
    return client.post(`/admin/courses/${courseId}/modules?${params.toString()}`);
  },

  /**
   * Create a new lesson under a module (FastAPI parameters are query parameters)
   */
  createLesson: async (moduleId, lessonData) => {
    const { title, description, duration, points } = lessonData;
    const params = new URLSearchParams({
      title,
      description,
      duration: String(duration || 0),
      points: String(points || 10)
    });
    return client.post(`/admin/modules/${moduleId}/lessons?${params.toString()}`);
  },

  /**
   * Upload video file for a lesson
   * @param {number} lessonId 
   * @param {File} videoFile 
   */
  uploadVideo: async (lessonId, videoFile) => {
    const formData = new FormData();
    formData.append('video', videoFile);
    return client.post(`/admin/lessons/${lessonId}/video`, formData);
  },

  /**
   * Create a quiz for a course
   */
  createQuiz: async (courseId, quizData) => {
    const { title, description, points_per_question } = quizData;
    const params = new URLSearchParams({
      title,
      description: description || '',
      points_per_question: String(points_per_question || 10)
    });
    return client.post(`/admin/courses/${courseId}/quizzes?${params.toString()}`);
  },

  /**
   * Add a question to a quiz
   */
  addQuestion: async (quizId, questionData) => {
    const { question_text, option_a, option_b, option_c, option_d, correct_answer } = questionData;
    const params = new URLSearchParams({
      question_text,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer: correct_answer.toUpperCase()
    });
    return client.post(`/admin/quizzes/${quizId}/questions?${params.toString()}`);
  }
};
