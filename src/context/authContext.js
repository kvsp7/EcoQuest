import { authAPI } from '../api/auth.js';
import { client } from '../api/client.js';

// Global reactive authentication state store
let authState = {
  token: localStorage.getItem('ecoquest_token') || null,
  user: null,
  isAuthenticated: false,
  isLoading: true
};

// Subscriptions list for state updates
const subscribers = new Set();

function notifySubscribers() {
  subscribers.forEach(callback => callback({ ...authState }));
}

export const authContext = {
  /**
   * Subscribe to auth state updates
   */
  subscribe: (callback) => {
    subscribers.add(callback);
    // Execute immediately for initial state
    callback({ ...authState });
    return () => subscribers.delete(callback);
  },

  /**
   * Get current auth state snapshot
   */
  getState: () => ({ ...authState }),

  /**
   * Initialize state from localStorage and verify session validity with backend
   */
  initialize: async () => {
    authState.isLoading = true;
    notifySubscribers();

    if (authState.token) {
      try {
        // Fetch current user details
        const profile = await client.get('/users/me');
        authState.user = profile;
        authState.isAuthenticated = true;
        // Save profile copy in localStorage
        localStorage.setItem('ecoquest_user', JSON.stringify(profile));
      } catch (error) {
        console.error('Session validation failed on start:', error);
        // Clear broken token
        authContext.clearSession();
      }
    }

    authState.isLoading = false;
    notifySubscribers();
  },

  /**
   * Log in user
   */
  login: async (username, password) => {
    const data = await authAPI.login(username, password);
    
    // Store token
    localStorage.setItem('ecoquest_token', data.access_token);
    authState.token = data.access_token;
    
    // Fetch full profile info (source of truth)
    try {
      const profile = await client.get('/users/me');
      localStorage.setItem('ecoquest_user', JSON.stringify(profile));
      authState.user = profile;
      authState.isAuthenticated = true;
    } catch (e) {
      // Fallback to basic details if profile endpoint fails
      authState.user = data.user;
      authState.isAuthenticated = true;
      localStorage.setItem('ecoquest_user', JSON.stringify(data.user));
    }

    notifySubscribers();
    return authState.user;
  },

  /**
   * Register a new student
   */
  register: async (userData) => {
    return authAPI.register(userData);
  },

  /**
   * Clear session details
   */
  clearSession: () => {
    localStorage.removeItem('ecoquest_token');
    localStorage.removeItem('ecoquest_user');
    authState.token = null;
    authState.user = null;
    authState.isAuthenticated = false;
  },

  /**
   * Log out active session
   */
  logout: () => {
    authContext.clearSession();
    notifySubscribers();
    window.location.hash = '#login';
  },

  /**
   * Update cached profile details
   */
  refreshProfile: async () => {
    if (!authState.token) return;
    try {
      const profile = await client.get('/users/me');
      localStorage.setItem('ecoquest_user', JSON.stringify(profile));
      authState.user = profile;
      notifySubscribers();
    } catch (error) {
      console.error('Could not refresh user profile:', error);
    }
  }
};

// Listen for global auth expired events triggered by API client
window.addEventListener('auth-expired', () => {
  authContext.clearSession();
  notifySubscribers();
  window.location.hash = '#login';
});
