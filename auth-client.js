/**
 * Authentication API Client
 * Handles all authentication-related API calls and token management
 */

// Use environment-based API URL (for deployment)
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://language-tutor-efn5.onrender.com/api';

const AuthAPI = {
  /**
   * Get auth token from localStorage
   */
  getToken() {
    return localStorage.getItem('authToken');
  },

  /**
   * Save auth token to localStorage
   */
  setToken(token) {
    localStorage.setItem('authToken', token);
  },

  /**
   * Remove auth token from localStorage
   */
  removeToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Save current user to localStorage
   */
  setCurrentUser(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Check if current user is a tutor
   */
  isTutor() {
    const user = this.getCurrentUser();
    return user && user.role === 'tutor';
  },

  /**
   * Get auth headers for API requests
   */
  getAuthHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  },

  /**
   * Sign up a new user
   */
  async signup(name, email, password, role = 'student') {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await response.json();

      if (data.success) {
        this.setToken(data.token);
        this.setCurrentUser(data.user);
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  /**
   * Login user
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        this.setToken(data.token);
        this.setCurrentUser(data.user);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  /**
   * Logout user
   */
  logout() {
    this.removeToken();
    window.location.href = 'login.html';
  },

  /**
   * Get current user from server
   */
  async getMe() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        this.setCurrentUser(data.user);
      } else {
        this.removeToken();
      }

      return data;
    } catch (error) {
      console.error('Get me error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (data.success) {
        this.setCurrentUser(data.user);
      }

      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Network error' };
    }
  },

  /**
   * Require authentication - redirect to login if not authenticated
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  /**
   * Require tutor role - redirect if not tutor
   */
  requireTutor() {
    if (!this.requireAuth()) return false;
    
    if (!this.isTutor()) {
      alert('Access denied. This page is for tutors only.');
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthAPI;
}
