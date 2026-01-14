/**
 * Progress API Client
 * Handles all progress-related API calls
 * NOTE: Uses API_URL from auth-service.js (loaded first)
 */

const ProgressAPI = {
  /**
   * Save quiz or test score to backend
   */
  async saveScore(type, language, level, score, total, timeSpent = 0) {
    console.log('ProgressAPI.saveScore called:', { type, language, level, score, total, timeSpent });
    
    // If not authenticated, use localStorage as fallback
    if (!AuthService.isAuthenticated()) {
      console.log('Not authenticated - saving to localStorage only');
      return ProgressTracker.saveToLocalStorage(type, language, level, score, total);
    }

    console.log('User is authenticated - saving to database');
    console.log('API URL:', API_URL);
    
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

      console.log('API response status:', response.status);
      const data = await response.json();
      console.log('API response data:', data);
      
      if (!data.success) {
        console.error('API returned success=false:', data);
      }
      
      return data;
    } catch (error) {
      console.error('Error saving progress to API:', error);
      // Fallback to localStorage
      console.log('Falling back to localStorage due to error');
      return ProgressTracker.saveToLocalStorage(type, language, level, score, total);
    }
  },

  /**
   * Get all progress for current user
   */
  async getProgress(filters = {}) {
    if (!AuthService.isAuthenticated()) {
      return ProgressTracker.getFromLocalStorage();
    }

    try {
      const params = new URLSearchParams(filters);
      const response = await fetch(`${API_URL}/progress?${params}`, {
        headers: AuthService.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching progress:', error);
      return ProgressTracker.getFromLocalStorage();
    }
  },

  /**
   * Get statistics for current user
   */
  async getStats() {
    if (!AuthService.isAuthenticated()) {
      return ProgressTracker.getStatsFromLocalStorage();
    }

    try {
      const response = await fetch(`${API_URL}/progress/stats`, {
        headers: AuthService.getAuthHeaders()
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return ProgressTracker.getStatsFromLocalStorage();
    }
  },

  /**
   * Get streak information
   */
  async getStreak() {
    if (!AuthService.isAuthenticated()) {
      return ProgressTracker.getStreakFromLocalStorage();
    }

    try {
      const response = await fetch(`${API_URL}/progress/streak`, {
        headers: AuthService.getAuthHeaders()
      });

      const data = await response.json();
      return data.success ? data.data : { current: 0, best: 0 };
    } catch (error) {
      console.error('Error fetching streak:', error);
      return ProgressTracker.getStreakFromLocalStorage();
    }
  }
};

// Update ProgressTracker to use API with localStorage fallback
// Use the global ProgressTracker defined in app.js
const ProgressTrackerOriginal = window.ProgressTracker || ProgressTracker;

Object.assign(window.ProgressTracker || ProgressTracker, {
  /**
   * Save quiz score (uses API if authenticated, localStorage as fallback)
   */
  async saveQuizScore(language, level, score, total, timeSpent = 0) {
    return await ProgressAPI.saveScore('quiz', language, level, score, total, timeSpent);
  },

  /**
   * Save test score (uses API if authenticated, localStorage as fallback)
   */
  async saveTestScore(language, level, score, total, timeSpent = 0) {
    const result = await ProgressAPI.saveScore('test', language, level, score, total, timeSpent);
    // Check for certificate eligibility
    if (level === 'expert' && (score / total) >= 0.9) {
      this.awardCertificate(language, level);
    }
    return result;
  },

  /**
   * Get all progress (API or localStorage)
   */
  async getAllProgress() {
    if (!AuthService.isAuthenticated()) {
      return this.getAllProgressFromLocalStorage();
    }
    const statsData = await ProgressAPI.getStats();
    if (statsData.success) {
      return {
        tests: {},
        quizzes: {},
        totalTests: statsData.data.totalTests,
        totalQuizzes: statsData.data.totalQuizzes,
        averageScore: statsData.data.averageScore,
        byLevel: statsData.data.byLevel
      };
    }
    return this.getAllProgressFromLocalStorage();
  },

  /**
   * Get streak (API or localStorage)
   */
  async getStreak() {
    return await ProgressAPI.getStreak();
  },

  /**
   * LocalStorage-based methods (fallback)
   */
  saveToLocalStorage(type, language, level, score, total) {
    const key = `${type}_${language}_${level}`;
    const history = this.getScoreHistory(key);
    history.push({
      date: new Date().toISOString(),
      score: score,
      total: total,
      percentage: Math.round((score / total) * 100)
    });
    localStorage.setItem(key, JSON.stringify(history));
    this.updateStreak();
    return { success: true, message: 'Saved to local storage' };
  },

  getFromLocalStorage() {
    return { success: true, data: [] };
  },

  getAllProgressFromLocalStorage() {
    const progress = {
      tests: {},
      quizzes: {},
      totalTests: 0,
      totalQuizzes: 0,
      averageScore: 0,
      byLevel: {}
    };

    const languages = ['mandarin'];
    const levels = ['newbie', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'sjkc'];

    languages.forEach(lang => {
      levels.forEach(level => {
        const testKey = `test_${lang}_${level}`;
        const quizKey = `quiz_${lang}_${level}`;
        
        const testHistory = this.getScoreHistory(testKey);
        const quizHistory = this.getScoreHistory(quizKey);
        
        if (testHistory.length > 0) {
          progress.tests[`${lang}_${level}`] = {
            attempts: testHistory.length,
            best: Math.max(...testHistory.map(h => h.percentage)),
            latest: testHistory[testHistory.length - 1].percentage
          };
          progress.totalTests += testHistory.length;
        }
        
        if (quizHistory.length > 0) {
          progress.quizzes[`${lang}_${level}`] = {
            attempts: quizHistory.length,
            best: Math.max(...quizHistory.map(h => h.percentage)),
            latest: quizHistory[quizHistory.length - 1].percentage
          };
          progress.totalQuizzes += quizHistory.length;
        }
      });
    });

    return progress;
  },

  getStatsFromLocalStorage() {
    return {
      success: true,
      data: this.getAllProgressFromLocalStorage()
    };
  },

  getStreakFromLocalStorage() {
    return JSON.parse(localStorage.getItem('studyStreak') || '{"current": 0, "best": 0, "lastDate": null, "dates": []}');
  }
});
