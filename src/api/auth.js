import { client } from './client.js';

export const authAPI = {
  /**
   * Log in user
   * @param {string} username 
   * @param {string} password 
   */
  login: async (username, password) => {
    return client.post('/auth/login', { username, password });
  },

  /**
   * Register a new student
   * @param {Object} userData 
   */
  register: async (userData) => {
    // userData contains: username, email, password, full_name, college, course, year
    return client.post('/auth/register', userData);
  },

  /**
   * Register a new admin (utilizes query parameters as per FastAPI routes schema)
   * @param {Object} adminData 
   */
  registerAdmin: async (adminData) => {
    const { username, email, password, full_name, college, admin_key } = adminData;
    const params = new URLSearchParams({
      username,
      email,
      password,
      full_name,
      college,
      admin_key
    });
    return client.post(`/auth/admin/register?${params.toString()}`);
  }
};
