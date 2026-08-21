import { client } from './client.js';

export const lessonsAPI = {
  /**
   * Fetch single lesson details
   * @param {number} lessonId 
   */
  getById: async (lessonId) => {
    return client.get(`/lessons/${lessonId}`);
  },

  /**
   * Fetch lessons inside a specific module
   * @param {number} moduleId 
   */
  getByModule: async (moduleId) => {
    return client.get(`/lessons/module/${moduleId}`);
  },

  /**
   * Complete a lesson and earn XP/points
   * @param {number} lessonId 
   */
  complete: async (lessonId) => {
    return client.post(`/lessons/${lessonId}/complete`);
  }
};
