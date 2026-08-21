import { client } from './client.js';

export const coursesAPI = {
  /**
   * Fetch all courses
   */
  getAll: async () => {
    return client.get('/courses/');
  },

  /**
   * Fetch single course detail
   * @param {number} courseId 
   */
  getById: async (courseId) => {
    return client.get(`/courses/${courseId}`);
  },

  /**
   * Fetch modules of a course (which includes nested lessons)
   * @param {number} courseId 
   */
  getModules: async (courseId) => {
    return client.get(`/courses/${courseId}/modules`);
  },

  /**
   * Enroll the active student in a course
   * @param {number} courseId 
   */
  enroll: async (courseId) => {
    return client.post(`/courses/${courseId}/enroll`);
  }
};
