/**
 * Progress Service
 * DATABASE-ONLY progress tracking - NO localStorage fallbacks
 * All progress operations require authentication
 * 
 * NOTE: Uses API_URL from auth-service.js (loaded first)
 */

const ProgressService = {
  /**
   * Save quiz/test score to database
   * REQUIRES AUTHENTICATION - will fail if not logged in
   * @param {string} type - 'quiz' or 'test'
   * @param {string} language - e.g. 'mandarin'
   * @param {string} level - e.g. 'level1', 'newbie', etc.
   * @param {number} score - number of correct answers
   * @param {number} total - total number of questions
   * @param {number} timeSpent - time spent in seconds
   * @returns {Promise<Object>}
   */
  async saveScore(type, language, level, score, total, timeSpent = 0) {
    console.log('=== SAVING PROGRESS TO DATABASE ===');
    console.log('Type:', type, '| Language:', language, '| Level:', level);
    console.log('Score:', `${score}/${total}`, `(${Math.round((score/total)*100)}%)`);
    console.log('Time spent:', timeSpent, 'seconds');

    // CRITICAL: Check authentication first
    if (!AuthService.isAuthenticated()) {
      const error = 'Cannot save progress: You must be logged in';
      console.error('✗', error);
      throw new Error(error);
    }

    const user = AuthService.getCurrentUser();
    console.log('Authenticated user:', user.name, `(${user.email})`);

    try {
      const response = await fetch(`${API_URL}/progress`, {
        method: 'POST',
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify({
          type,
          language,
          level,
          score,
          total,
          timeSpent
        })
      });

      console.log('API Response status:', response.status);

      // Handle specific error codes
      if (response.status === 401) {
        console.error('✗ 401 Unauthorized - Invalid or expired token');
        AuthService.handleUnauthorized(window.location.pathname + window.location.search);
        throw new Error('Unauthorized');
      }

      if (response.status === 403) {
        console.error('✗ 403 Forbidden - Access denied');
        AuthService.handleForbidden();
        throw new Error('Forbidden');
      }

      const data = await response.json();
      console.log('API Response data:', data);

      if (!response.ok || !data.success) {
        const errorMsg = data.message || 'Failed to save progress';
        console.error('✗ Save failed:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✓ Progress saved successfully to database');
      return { success: true, data: data.data };

    } catch (error) {
      console.error('✗ Error saving progress:', error.message);
      // DO NOT fall back to localStorage - throw the error
      throw error;
    }
  },

  /**
   * Get all progress for current user
   * @param {Object} filters - Optional filters {type, language, level}
   * @returns {Promise<Object>}
   */
  async getProgress(filters = {}) {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Must be logged in to view progress');
    }

    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_URL}/progress?${params}`, {
        headers: AuthService.getAuthHeaders()
      });

      if (response.status === 401) {
        AuthService.handleUnauthorized();
        throw new Error('Unauthorized');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching progress:', error);
      throw error;
    }
  },

  /**
   * Get statistics for current user
   * @returns {Promise<Object>}
   */
  async getStats() {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Must be logged in to view statistics');
    }

    try {
      const response = await fetch(`${API_URL}/progress/stats`, {
        headers: AuthService.getAuthHeaders()
      });

      if (response.status === 401) {
        AuthService.handleUnauthorized();
        throw new Error('Unauthorized');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  /**
   * Get streak information for current user
   * @returns {Promise<Object>}
   */
  async getStreak() {
    if (!AuthService.isAuthenticated()) {
      throw new Error('Must be logged in to view streak');
    }

    try {
      const response = await fetch(`${API_URL}/progress/streak`, {
        headers: AuthService.getAuthHeaders()
      });

      if (response.status === 401) {
        AuthService.handleUnauthorized();
        throw new Error('Unauthorized');
      }

      const data = await response.json();
      return data.success ? data.data : { current: 0, best: 0 };
    } catch (error) {
      console.error('Error fetching streak:', error);
      return { current: 0, best: 0 };
    }
  }
};

// Backward compatibility alias
const ProgressAPI = ProgressService;
