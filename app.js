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
    newbie: [
      { front: '语', back: 'yǔ - language', audio: '语' },
      { front: '上课', back: 'shàngkè - go to class', audio: '上课' },
      { front: '下课', back: 'xiàkè - finish class', audio: '下课' },
      { front: '课', back: 'kè - class', audio: '课' },
      { front: '很', back: 'hěn - very', audio: '很' },
      { front: '高兴', back: 'gāoxìng - happy', audio: '高兴' },
      { front: '认识', back: 'rènshi - to know', audio: '认识' },
      { front: '你好', back: 'nǐ hǎo - hello', audio: '你好' },
      { front: '你', back: 'nǐ - you', audio: '你' },
      { front: '好', back: 'hǎo - good', audio: '好' },
      { front: '大家好', back: 'dàjiā hǎo - hello everyone', audio: '大家好' },
      { front: '大家', back: 'dàjiā - everyone', audio: '大家' },
      { front: '大', back: 'dà - big', audio: '大' },
      { front: '家', back: 'jiā - home/house/family', audio: '家' },
      { front: '我', back: 'wǒ - I', audio: '我' },
      { front: '叫', back: 'jiào - call/asked to', audio: '叫' },
      { front: '也', back: 'yě - also/too', audio: '也' },
      { front: '普通话', back: 'pǔtōnghuà - Mandarin', audio: '普通话' },
      { front: '普通', back: 'pǔtōng - common', audio: '普通' },
      { front: '话', back: 'huà - spoken words', audio: '话' },
      { front: '拼音', back: 'pīnyīn - phonics', audio: '拼音' },
      { front: '华', back: 'huá - China related', audio: '华' },
      { front: '四', back: 'sì - four', audio: '四' },
      { front: '声', back: 'shēng - sound', audio: '声' },
      { front: '语法', back: 'yǔfǎ - grammar', audio: '语法' },
      { front: '有', back: 'yǒu - have/had/do/does/did/got', audio: '有' },
      { front: '问题', back: 'wèntí - question', audio: '问题' },
      { front: '问', back: 'wèn - to ask', audio: '问' },
      { front: '没有', back: 'méiyǒu - don\'t have/didn\'t/haven\'t/hasn\'t', audio: '没有' },
      { front: '对方', back: 'duìfāng - opposite direction/opposite party/opponent', audio: '对方' },
      { front: '吗', back: 'ma - question particle for "yes-no" questions', audio: '吗' },
      { front: '呢', back: 'ne - question particle for subjects already mentioned (what about)', audio: '呢' },
      { front: '哪里', back: 'nǎlǐ - where', audio: '哪里' },
      { front: '住', back: 'zhù - live/stay', audio: '住' },
      { front: '在', back: 'zài - at/in', audio: '在' },
      { front: '工作', back: 'gōngzuò - work', audio: '工作' },
      { front: '们', back: 'men - plural marker for noun/pronoun', audio: '们' },
      { front: '明白', back: 'míngbái - understand', audio: '明白' },
      { front: '一点', back: 'yīdiǎn - a little/a bit', audio: '一点' },
      { front: '赞美', back: 'zànměi - compliment', audio: '赞美' },
      { front: '漂亮', back: 'piàoliang - beautiful', audio: '漂亮' },
      { front: '谢谢', back: 'xièxiè - thank you', audio: '谢谢' },
      { front: '不用客气', back: 'bùyòng kèqì - you\'re welcome', audio: '不用客气' },
      { front: '不', back: 'bù - no/don\'t', audio: '不' },
      { front: '不用', back: 'bùyòng - no need', audio: '不用' },
      { front: '客气', back: 'kèqì - polite', audio: '客气' },
      { front: '客', back: 'kè - guest', audio: '客' },
      { front: '气', back: 'qì - temperament/air', audio: '气' },
      { front: '帅', back: 'shuài - handsome', audio: '帅' },
      { front: '可爱', back: 'kě\'ài - cute', audio: '可爱' },
      { front: '爱', back: 'ài - love', audio: '爱' },
      { front: '的', back: 'de - possessive particle (\'s)', audio: '的' },
      { front: '衣服', back: 'yīfú - clothes', audio: '衣服' },
      { front: '美丽', back: 'měilì - beautiful', audio: '美丽' },
      { front: '早安', back: 'zǎo ān - good morning', audio: '早安' },
      { front: '午安', back: 'wǔ ān - good afternoon/good evening', audio: '午安' },
      { front: '晚安', back: 'wǎn ān - good night', audio: '晚安' },
      { front: '吃', back: 'chī - eat', audio: '吃' },
      { front: '了', back: 'le - already/anymore', audio: '了' },
      { front: '还', back: 'hái - still/yet', audio: '还' },
      { front: '为什么', back: 'wèishéme - why', audio: '为什么' },
      { front: '为', back: 'wèi - for', audio: '为' },
      { front: '什么', back: 'shéme - what', audio: '什么' },
      { front: '因为', back: 'yīnwèi - because', audio: '因为' },
      { front: '饿', back: 'è - hungry', audio: '饿' },
      { front: '早餐', back: 'zǎocān - breakfast', audio: '早餐' },
      { front: '午餐', back: 'wǔcān - lunch', audio: '午餐' },
      { front: '晚餐', back: 'wǎncān - dinner', audio: '晚餐' },
      { front: '巴士', back: 'bāshì - bus', audio: '巴士' },
      { front: '拔牙', back: 'báyá - tooth extraction', audio: '拔牙' },
      { front: '一把刀', back: 'yī bǎ dāo - a knife', audio: '一把刀' },
      { front: '爸爸', back: 'bàba - father', audio: '爸爸' },
      { front: '八', back: 'bā - eight', audio: '八' },
      { front: '八月', back: 'bā yuè - August', audio: '八月' },
      { front: '八十', back: 'bāshí - eighty', audio: '八十' },
      { front: '八百', back: 'bābǎi - eight hundred', audio: '八百' },
      { front: '逼真', back: 'bīzhēn - realistic', audio: '逼真' },
      { front: '真', back: 'zhēn - real', audio: '真' },
      { front: '鼻子', back: 'bízi - nose', audio: '鼻子' },
      { front: '比赛', back: 'bǐsài - competition', audio: '比赛' },
      { front: '壁虎', back: 'bìhǔ - lizard', audio: '壁虎' },
      { front: '钢笔', back: 'gāngbǐ - pen', audio: '钢笔' },
      { front: '墙壁', back: 'qiángbì - wall', audio: '墙壁' }
    ],
    level1: [
      { front: '美丽', back: 'měi lì - Beautiful', audio: '美丽' },
      { front: '学习', back: 'xué xí - Study/Learn', audio: '学习' },
      { front: '朋友', back: 'péng yǒu - Friend', audio: '朋友' },
      { front: '家人', back: 'jiā rén - Family', audio: '家人' },
      { front: '工作', back: 'gōng zuò - Work', audio: '工作' },
      { front: '时间', back: 'shí jiān - Time', audio: '时间' },
      { front: '地方', back: 'dì fāng - Place', audio: '地方' },
      { front: '问题', back: 'wèn tí - Question/Problem', audio: '问题' }
    ],
    level2: [
      { front: '学校', back: 'xué xiào - School', audio: '学校' },
      { front: '图书馆', back: 'tú shū guǎn - Library', audio: '图书馆' },
      { front: '昨天', back: 'zuó tiān - Yesterday', audio: '昨天' },
      { front: '今天', back: 'jīn tiān - Today', audio: '今天' },
      { front: '明天', back: 'míng tiān - Tomorrow', audio: '明天' },
      { front: '老师', back: 'lǎo shī - Teacher', audio: '老师' },
      { front: '学生', back: 'xué sheng - Student', audio: '学生' }
    ],
    level3: [
      { front: '画蛇添足', back: 'huà shé tiān zú - To ruin something by adding unnecessary details', audio: '画蛇添足' },
      { front: '一举两得', back: 'yī jǔ liǎng dé - Kill two birds with one stone', audio: '一举两得' },
      { front: '马到成功', back: 'mǎ dào chéng gōng - Instant success', audio: '马到成功' },
      { front: '开门见山', back: 'kāi mén jiàn shān - Get straight to the point', audio: '开门见山' }
    ],
    level4: [],
    level5: [],
    level6: [],
    sjkc: [
      { front: '华文', back: 'huá wén - Chinese language', audio: '华文' },
      { front: '勤劳', back: 'qín láo - Hardworking/Diligent', audio: '勤劳' },
      { front: '一石二鸟', back: 'yī shí èr niǎo - Kill two birds with one stone', audio: '一石二鸟' },
      { front: '国家', back: 'guó jiā - Country/Nation', audio: '国家' },
      { front: '辆', back: 'liàng - Measure word for vehicles', audio: '辆' },
      { front: '成语', back: 'chéng yǔ - Chinese idiom', audio: '成语' }
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
    const url = `${window.location.origin}/progress.html`;
    
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
  MobileOptimizations.init();
});

// ========================================
// MOBILE OPTIMIZATIONS
// ========================================

const MobileOptimizations = {
  init() {
    this.registerServiceWorker();
    this.setupPWA();
    this.preventZoom();
    this.setupTouchFeedback();
    this.optimizeKeyboard();
    this.preventPullToRefresh();
  },

  // Register service worker for offline functionality
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(reg => console.log('Service Worker registered'))
          .catch(err => console.log('Service Worker registration failed:', err));
      });
    }
  },

  // PWA install prompt
  setupPWA() {
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install button if needed
      const installBtn = document.getElementById('installBtn');
      if (installBtn) {
        installBtn.style.display = 'block';
        installBtn.addEventListener('click', () => {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the install prompt');
            }
            deferredPrompt = null;
          });
        });
      }
    });
  },

  // Prevent accidental zoom on double tap
  preventZoom() {
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
  },

  // Add visual feedback for touch interactions
  setupTouchFeedback() {
    const addTouchFeedback = (element) => {
      element.addEventListener('touchstart', function() {
        this.style.opacity = '0.7';
      }, { passive: true });
      
      element.addEventListener('touchend', function() {
        setTimeout(() => {
          this.style.opacity = '1';
        }, 100);
      }, { passive: true });
    };

    // Apply to all interactive elements
    document.querySelectorAll('.btn, .option-btn, .card, .tab-btn').forEach(addTouchFeedback);
  },

  // Optimize keyboard behavior on mobile
  optimizeKeyboard() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea');
    
    inputs.forEach(input => {
      // Scroll into view when focused
      input.addEventListener('focus', function() {
        setTimeout(() => {
          this.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300); // Wait for keyboard animation
      });
      
      // Add done button behavior for iOS
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && this.tagName !== 'TEXTAREA') {
          this.blur();
        }
      });
    });
  },

  // Prevent pull-to-refresh on iOS
  preventPullToRefresh() {
    let startY = 0;
    
    document.addEventListener('touchstart', (e) => {
      startY = e.touches[0].pageY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
      const y = e.touches[0].pageY;
      // Only prevent if scrolled to the top
      if (window.scrollY === 0 && y > startY) {
        e.preventDefault();
      }
    }, { passive: false });
  },

  // Check if running as PWA
  isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  },

  // Vibrate feedback for mobile (if available)
  vibrate(pattern = 10) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
};

// Add vibration feedback to buttons
document.addEventListener('click', (e) => {
  if (e.target.matches('.btn, .option-btn, .tab-btn')) {
    MobileOptimizations.vibrate(10);
  }
}, true);

// Handle orientation changes
window.addEventListener('orientationchange', () => {
  // Close mobile menu on orientation change
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu && mobileMenu.classList.contains('active')) {
    mobileMenu.classList.remove('active');
  }
  
  // Re-adjust layout after orientation change
  setTimeout(() => {
    window.scrollTo(0, window.scrollY);
  }, 100);
});
