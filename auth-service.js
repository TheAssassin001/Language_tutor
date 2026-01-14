/**
 * Authentication Service
 * Strict JWT-based authentication - NO localStorage fallbacks
 * All protected actions require valid JWT token
 */

const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api' 
  : 'https://language-tutor-efn5.onrender.com/api';

const AuthService = {
  /**
   * Get JWT token from localStorage
   * @returns {string|null}
   */
  getToken() {
    // Always use unified key
    const authToken = localStorage.getItem('authToken');
    console.log('TOKEN:', authToken);
    return authToken;
  },

  /**
   * Get current user data
   * @returns {Object|null}
   */
  getCurrentUser() {
    // Always use unified key
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      if (user && user.role) console.log('USER:', user.role);
      return user;
    } catch (e) {
      console.error('Failed to parse user data');
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * NOTE: This only checks if token exists. Backend validates the token.
   * @returns {boolean}
   */
  isAuthenticated() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  },

  /**
   * Check if current user has a specific role
   * @param {string} role - 'student' or 'tutor'
   * @returns {boolean}
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  },

  /**
   * Get Authorization headers for API requests
   * @returns {Object}
   * @throws {Error} If no token found
   */
  getAuthHeaders() {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  },

  /**
   * Handle 401 Unauthorized - force logout
   * @param {string} redirectUrl - Optional URL to redirect back to after login
   */
  handleUnauthorized(redirectUrl = null) {
    console.warn('401 Unauthorized - Session expired or invalid token');
    this.logout();
    const params = new URLSearchParams();
    params.set('error', 'session_expired');
    params.set('message', 'Your session has expired. Please login again.');
    if (redirectUrl) {
      params.set('redirect', redirectUrl);
    }
    window.location.href = `login.html?${params.toString()}`;
  },

  /**
   * Handle 403 Forbidden - access denied
   */
  handleForbidden() {
    alert('Access Denied: You do not have permission to perform this action.');
  },

  /**
   * Login user
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>}
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('✓ Login successful:', data.user?.name, `(${data.user?.role})`);
        console.log('TOKEN:', data.token);
        console.log('USER:', data.user?.role);
        // Redirect after login
        if (data.user?.role === 'tutor') {
          window.location.href = 'tutor-dashboard.html';
        } else {
          window.location.href = 'progress.html';
        }
        return { success: true, user: data.user };
      } else {
        console.error('✗ Login failed:', data.message);
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('✗ Login error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  /**
   * Signup new user
   * @param {string} name
   * @param {string} email
   * @param {string} password
   * @param {string} role - 'student' or 'tutor'
   * @returns {Promise<Object>}
   */
  async signup(name, email, password, role = 'student') {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('✓ Signup successful:', data.user?.name, `(${data.user?.role})`);
        console.log('TOKEN:', data.token);
        console.log('USER:', data.user?.role);
        // Redirect after signup
        if (data.user?.role === 'tutor') {
          window.location.href = 'tutor-dashboard.html';
        } else {
          window.location.href = 'progress.html';
        }
        return { success: true, user: data.user };
      } else {
        console.error('✗ Signup failed:', data.message);
        return { success: false, message: data.message || 'Signup failed' };
      }
    } catch (error) {
      console.error('✗ Signup error:', error);
      return { success: false, message: 'Network error. Please check your connection.' };
    }
  },

  /**
   * Logout user - clear all auth data
   */
  logout() {
    // Remove only unified keys
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    console.log('✓ User logged out');
  },

  /**
   * Require authentication - redirect to login if not authenticated
   * @param {string} redirectUrl - URL to return to after login
   */
  requireAuth(redirectUrl = null) {
    if (!this.isAuthenticated()) {
      const params = new URLSearchParams();
      params.set('error', 'auth_required');
      params.set('message', 'You must be logged in to access this page.');
      if (redirectUrl) {
        params.set('redirect', redirectUrl);
      }
      window.location.href = `login.html?${params.toString()}`;
    }
  },

  /**
   * Require specific role - redirect if user doesn't have the role
   * @param {string} requiredRole - 'student' or 'tutor'
   */
  requireRole(requiredRole) {
    const token = this.getToken();
    const user = this.getCurrentUser();
    if (!token || !user || !user.role) {
      this.requireAuth();
      return;
    }
    // Case-insensitive check for student role
    if (requiredRole.toLowerCase() === 'student') {
      if (String(user.role).toLowerCase() !== 'student') {
        alert('Access Denied: This page is only accessible to students.');
        window.location.href = 'login.html';
      }
    } else if (user.role !== requiredRole) {
      alert(`Access Denied: This page is only accessible to ${requiredRole}s.`);
      window.location.href = 'login.html';
    }
  }
};

// Ensure global
window.AuthService = AuthService;
