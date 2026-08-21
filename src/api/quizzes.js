import { client } from './client.js';

export const quizzesAPI = {
  /**
   * Fetch all quizzes
   */
  getAll: async () => {
    return client.get('/quizzes/');
  },

  /**
   * Fetch quiz details and questions list (without answers)
   * @param {number} quizId 
   */
  getById: async (quizId) => {
    return client.get(`/quizzes/${quizId}`);
  },

  /**
   * Submit quiz answers
   * @param {number} quizId 
   * @param {Object} answers - Key-value pair of question IDs and answers: e.g. {"15": "B", "16": "A"}
   */
  submit: async (quizId, answers) => {
    return client.post(`/quizzes/${quizId}/submit`, answers);
  },

  /**
   * Get leaderboard stats for a specific quiz
   * @param {number} quizId 
   */
  getLeaderboard: async (quizId) => {
    return client.get(`/quizzes/${quizId}/leaderboard`);
  }
};
