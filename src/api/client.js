// Centralized API Client Layer for EcoQuest

// Fallback to localhost backend, but allow window level configuration
const BASE_URL = window.ECOQUEST_API_URL || 'http://127.0.0.1:8000';

/**
 * Custom request wrapper for secure API communications
 */
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  
  // Set up default headers
  const headers = {
    ...options.headers,
  };

  // Get token from localStorage
  const token = localStorage.getItem('ecoquest_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Determine if this is a multipart form upload (like video files)
  const isMultipart = options.body instanceof FormData;
  
  // If not multipart and body exists, set JSON content header
  if (!isMultipart && options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const fetchOptions = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, fetchOptions);
    
    // Automatically intercept 401 Unauthorized errors (expired/invalid token)
    if (response.status === 401) {
      localStorage.removeItem('ecoquest_token');
      localStorage.removeItem('ecoquest_user');
      // Dispatch custom event to notify router to redirect
      window.dispatchEvent(new CustomEvent('auth-expired'));
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Session expired. Please login again.');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${options.method || 'GET'} ${path}]:`, error);
    throw error;
  }
}

export const client = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => request(path, { ...options, method: 'PUT', body }),
  delete: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
  baseUrl: BASE_URL
};
