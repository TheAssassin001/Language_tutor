// Chinese Language Tutor - Core Application Logic
// Progress Tracking, Dark Mode, Analytics

// ========================================
// PROGRESS TRACKING & LOCAL STORAGE
// ========================================

const ProgressTracker = {
  saveQuizScore(language, level, score, total) {
    const key = `quiz_${language}_${level}`;
    const history = this.getScoreHistory(key);
    history.push({
      date: new Date().toISOString(),
      score: score,
      total: total,
      percentage: Math.round((score / total) * 100)
    });
    localStorage.setItem(key, JSON.stringify(history));
    this.updateStreak();
  },

  saveTestScore(language, level, score, total) {
    const key = `test_${language}_${level}`;
    const history = this.getScoreHistory(key);
    history.push({
      date: new Date().toISOString(),
      score: score,
      total: total,
      percentage: Math.round((score / total) * 100)
    });
    localStorage.setItem(key, JSON.stringify(history));
    this.updateStreak();
    
    // Check for certificate eligibility
    if (level === 'expert' && (score / total) >= 0.9) {
      this.awardCertificate(language, level);
    }
  },

  getScoreHistory(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  getBestScore(language, level, type = 'test') {
    const key = `${type}_${language}_${level}`;
    const history = this.getScoreHistory(key);
    if (history.length === 0) return null;
    return Math.max(...history.map(h => h.percentage));
  },

  getAllProgress() {
    const progress = {
      tests: {},
      quizzes: {},
      totalTests: 0,
      totalQuizzes: 0,
      averageScore: 0
    };

    const languages = ['mandarin', 'cantonese'];
    const levels = ['beginner', 'intermediate', 'expert'];

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

  updateStreak() {
    const today = new Date().toDateString();
    const streakData = JSON.parse(localStorage.getItem('studyStreak') || '{"current": 0, "best": 0, "lastDate": null, "dates": []}');
    
    if (streakData.lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (streakData.lastDate === yesterday.toDateString()) {
        streakData.current++;
      } else {
        streakData.current = 1;
      }
      
      streakData.lastDate = today;
      streakData.dates.push(today);
      streakData.best = Math.max(streakData.best, streakData.current);
      
      localStorage.setItem('studyStreak', JSON.stringify(streakData));
    }
  },

  getStreak() {
    return JSON.parse(localStorage.getItem('studyStreak') || '{"current": 0, "best": 0, "lastDate": null, "dates": []}');
  },

  awardCertificate(language, level) {
    const certificates = JSON.parse(localStorage.getItem('certificates') || '[]');
    const cert = {
      id: Date.now(),
      language: language,
      level: level,
      date: new Date().toISOString(),
      name: 'Chinese Language Proficiency'
    };
    certificates.push(cert);
    localStorage.setItem('certificates', JSON.stringify(certificates));
  },

  getCertificates() {
    return JSON.parse(localStorage.getItem('certificates') || '[]');
  }
};

// ========================================
// DARK MODE
// ========================================

const DarkMode = {
  init() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) {
      document.body.classList.add('dark-mode');
    }
    this.updateToggle();
  },

  toggle() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    this.updateToggle();
  },

  updateToggle() {
    const toggleBtn = document.getElementById('darkModeToggle');
    if (toggleBtn) {
      const isDark = document.body.classList.contains('dark-mode');
      toggleBtn.textContent = isDark ? '☀️' : '🌙';
      toggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }
};

// ========================================
// SPEECH SYNTHESIS (Audio Pronunciation)
// ========================================

const SpeechHelper = {
  speak(text, lang = 'zh-CN') {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang; // zh-CN for Mandarin, zh-HK for Cantonese
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  },

  speakChinese(text, dialect = 'mandarin') {
    const lang = dialect === 'cantonese' ? 'zh-HK' : 'zh-CN';
    this.speak(text, lang);
  }
};

// ========================================
// TIMER UTILITY
// ========================================

const Timer = {
  startTime: null,
  timerInterval: null,
  
  start(displayElementId) {
    this.startTime = Date.now();
    const display = document.getElementById(displayElementId);
    
    this.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      if (display) {
        display.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }, 1000);
  },
  
  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    return elapsed;
  },
  
  getElapsed() {
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
};

// ========================================
// FLASHCARD DATA
// ========================================

const FlashcardData = {
  mandarin: {
    beginner: [
      { front: '你好', back: 'nǐ hǎo - Hello', audio: '你好' },
      { front: '谢谢', back: 'xiè xiè - Thank you', audio: '谢谢' },
      { front: '再见', back: 'zài jiàn - Goodbye', audio: '再见' },
      { front: '一', back: 'yī - One', audio: '一' },
      { front: '二', back: 'èr - Two', audio: '二' },
      { front: '三', back: 'sān - Three', audio: '三' },
      { front: '水', back: 'shuǐ - Water', audio: '水' },
      { front: '好', back: 'hǎo - Good', audio: '好' },
      { front: '人', back: 'rén - Person', audio: '人' },
      { front: '大', back: 'dà - Big', audio: '大' }
    ],
    intermediate: [
      { front: '美丽', back: 'měi lì - Beautiful', audio: '美丽' },
      { front: '学习', back: 'xué xí - Study/Learn', audio: '学习' },
      { front: '朋友', back: 'péng yǒu - Friend', audio: '朋友' },
      { front: '家人', back: 'jiā rén - Family', audio: '家人' },
      { front: '工作', back: 'gōng zuò - Work', audio: '工作' },
      { front: '时间', back: 'shí jiān - Time', audio: '时间' },
      { front: '地方', back: 'dì fāng - Place', audio: '地方' },
      { front: '问题', back: 'wèn tí - Question/Problem', audio: '问题' }
    ],
    expert: [
      { front: '画蛇添足', back: 'huà shé tiān zú - To ruin something by adding unnecessary details', audio: '画蛇添足' },
      { front: '一举两得', back: 'yī jǔ liǎng dé - Kill two birds with one stone', audio: '一举两得' },
      { front: '马到成功', back: 'mǎ dào chéng gōng - Instant success', audio: '马到成功' },
      { front: '开门见山', back: 'kāi mén jiàn shān - Get straight to the point', audio: '开门见山' }
    ]
  },
  cantonese: {
    beginner: [
      { front: '你好', back: 'nei5 hou2 - Hello', audio: '你好' },
      { front: '多謝', back: 'm4 goi1 / do1 ze6 - Thank you', audio: '多謝' },
      { front: '再見', back: 'zoi3 gin3 - Goodbye', audio: '再見' },
      { front: '一', back: 'jat1 - One', audio: '一' },
      { front: '飲茶', back: 'jam2 caa4 - Drink tea/Dim sum', audio: '飲茶' }
    ],
    intermediate: [
      { front: '好靚', back: 'hou2 leng3 - Very beautiful', audio: '好靚' },
      { front: '唔該', back: 'm4 goi1 - Excuse me/Thanks', audio: '唔該' },
      { front: '食飯', back: 'sik6 faan6 - Eat rice/meal', audio: '食飯' }
    ],
    expert: [
      { front: '講嘢', back: 'gong2 je5 - To speak', audio: '講嘢' },
      { front: '冇', back: 'mou5 - Don\'t have/None', audio: '冇' }
    ]
  }
};

// ========================================
// SOCIAL SHARING
// ========================================

const SocialShare = {
  shareScore(language, level, score, total, type = 'test') {
    const percentage = Math.round((score / total) * 100);
    const text = `I just scored ${percentage}% on a ${language} ${level} ${type} at Chinese Language Tutor! 🎉`;
    const url = window.location.origin;
    
    if (navigator.share) {
      navigator.share({
        title: 'My Chinese Learning Progress',
        text: text,
        url: url
      }).catch(err => console.log('Share cancelled'));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${text}\n${url}`);
      alert('Score copied to clipboard! Share it with your friends.');
    }
  }
};

// Initialize dark mode on page load
document.addEventListener('DOMContentLoaded', () => {
  DarkMode.init();
});
