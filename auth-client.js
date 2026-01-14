/**
 * Authentication API Client
 * Handles all authentication-related API calls and token management
 */

// Use environment-based API URL (for deployment)
const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://language-tutor-efn5.onrender.com/api';


// DEPRECATED: Use only auth-service.js for all authentication logic.
// All methods below are disabled and will warn if called.
const AuthAPI = {
  getToken() { console.warn('Deprecated: Use AuthService.getToken()'); return null; },
  setToken() { console.warn('Deprecated: Use AuthService'); },
  removeToken() { console.warn('Deprecated: Use AuthService'); },
  getCurrentUser() { console.warn('Deprecated: Use AuthService.getCurrentUser()'); return null; },
  setCurrentUser() { console.warn('Deprecated: Use AuthService'); },
  isAuthenticated() { console.warn('Deprecated: Use AuthService.isAuthenticated()'); return false; },
  isTutor() { console.warn('Deprecated: Use AuthService.getCurrentUser().role'); return false; },
  getAuthHeaders() { console.warn('Deprecated: Use AuthService.getAuthHeaders()'); return {}; },
  async signup() { console.warn('Deprecated: Use AuthService.signup()'); return { success: false, message: 'Deprecated' }; },
  async login() { console.warn('Deprecated: Use AuthService.login()'); return { success: false, message: 'Deprecated' }; },
  logout() { console.warn('Deprecated: Use AuthService.logout()'); },
  async getMe() { console.warn('Deprecated: Use AuthService'); return { success: false, message: 'Deprecated' }; },
  async updateProfile() { console.warn('Deprecated: Use AuthService'); return { success: false, message: 'Deprecated' }; },
  requireAuth() { console.warn('Deprecated: Use AuthService.requireAuth()'); return false; },
  requireTutor() { console.warn('Deprecated: Use AuthService.requireRole("tutor")'); return false; }
};

