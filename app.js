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
      { front: 'yǔ', back: 'language', audio: '语' },
      { front: 'shàngkè', back: 'go to class', audio: '上课' },
      { front: 'xiàkè', back: 'finish class', audio: '下课' },
      { front: 'kè', back: 'class', audio: '课' },
      { front: 'hěn', back: 'very', audio: '很' },
      { front: 'gāoxìng', back: 'happy', audio: '高兴' },
      { front: 'rènshi', back: 'to know', audio: '认识' },
      { front: 'nǐ hǎo', back: 'hello', audio: '你好' },
      { front: 'nǐ', back: 'you', audio: '你' },
      { front: 'hǎo', back: 'good', audio: '好' },
      { front: 'dàjiā hǎo', back: 'hello everyone', audio: '大家好' },
      { front: 'dàjiā', back: 'everyone', audio: '大家' },
      { front: 'dà', back: 'big', audio: '大' },
      { front: 'jiā', back: 'home/house/family', audio: '家' },
      { front: 'wǒ', back: 'I', audio: '我' },
      { front: 'jiào', back: 'call/asked to', audio: '叫' },
      { front: 'yě', back: 'also/too', audio: '也' },
      { front: 'pǔtōnghuà', back: 'Mandarin', audio: '普通话' },
      { front: 'pǔtōng', back: 'common', audio: '普通' },
      { front: 'huà', back: 'spoken words', audio: '话' },
      { front: 'pīnyīn', back: 'phonics', audio: '拼音' },
      { front: 'huá', back: 'China related', audio: '华' },
      { front: 'sì', back: 'four', audio: '四' },
      { front: 'shēng', back: 'sound', audio: '声' },
      { front: 'yǔfǎ', back: 'grammar', audio: '语法' },
      { front: 'yǒu', back: 'have/had/do/does/did/got', audio: '有' },
      { front: 'wèntí', back: 'question', audio: '问题' },
      { front: 'wèn', back: 'to ask', audio: '问' },
      { front: 'méiyǒu', back: 'don\'t have/didn\'t/haven\'t/hasn\'t', audio: '没有' },
      { front: 'duìfāng', back: 'opposite direction/opposite party/opponent', audio: '对方' },
      { front: 'ma', back: 'question particle for "yes-no" questions', audio: '吗' },
      { front: 'ne', back: 'question particle for subjects already mentioned (what about)', audio: '呢' },
      { front: 'nǎlǐ', back: 'where', audio: '哪里' },
      { front: 'zhù', back: 'live/stay', audio: '住' },
      { front: 'zài', back: 'at/in', audio: '在' },
      { front: 'gōngzuò', back: 'work', audio: '工作' },
      { front: 'men', back: 'plural marker for noun/pronoun', audio: '们' },
      { front: 'míngbái', back: 'understand', audio: '明白' },
      { front: 'yīdiǎn', back: 'a little/a bit', audio: '一点' },
      { front: 'zànměi', back: 'compliment', audio: '赞美' },
      { front: 'piàoliang', back: 'beautiful', audio: '漂亮' },
      { front: 'xièxiè', back: 'thank you', audio: '谢谢' },
      { front: 'bùyòng kèqì', back: 'you\'re welcome', audio: '不用客气' },
      { front: 'bù', back: 'no/don\'t', audio: '不' },
      { front: 'bùyòng', back: 'no need', audio: '不用' },
      { front: 'kèqì', back: 'polite', audio: '客气' },
      { front: 'kè', back: 'guest', audio: '客' },
      { front: 'qì', back: 'temperament/air', audio: '气' },
      { front: 'shuài', back: 'handsome', audio: '帅' },
      { front: 'kě\'ài', back: 'cute', audio: '可爱' },
      { front: 'ài', back: 'love', audio: '爱' },
      { front: 'de', back: 'possessive particle (\'s)', audio: '的' },
      { front: 'yīfú', back: 'clothes', audio: '衣服' },
      { front: 'měilì', back: 'beautiful', audio: '美丽' },
      { front: 'zǎo ān', back: 'good morning', audio: '早安' },
      { front: 'wǔ ān', back: 'good afternoon/good evening', audio: '午安' },
      { front: 'wǎn ān', back: 'good night', audio: '晚安' },
      { front: 'chī', back: 'eat', audio: '吃' },
      { front: 'le', back: 'already/anymore', audio: '了' },
      { front: 'hái', back: 'still/yet', audio: '还' },
      { front: 'wèishéme', back: 'why', audio: '为什么' },
      { front: 'wèi', back: 'for', audio: '为' },
      { front: 'shéme', back: 'what', audio: '什么' },
      { front: 'yīnwèi', back: 'because', audio: '因为' },
      { front: 'è', back: 'hungry', audio: '饿' },
      { front: 'zǎocān', back: 'breakfast', audio: '早餐' },
      { front: 'wǔcān', back: 'lunch', audio: '午餐' },
      { front: 'wǎncān', back: 'dinner', audio: '晚餐' },
      { front: 'bāshì', back: 'bus', audio: '巴士' },
      { front: 'báyá', back: 'tooth extraction', audio: '拔牙' },
      { front: 'yī bǎ dāo', back: 'a knife', audio: '一把刀' },
      { front: 'bàba', back: 'father', audio: '爸爸' },
      { front: 'bā', back: 'eight', audio: '八' },
      { front: 'bā yuè', back: 'August', audio: '八月' },
      { front: 'bāshí', back: 'eighty', audio: '八十' },
      { front: 'bābǎi', back: 'eight hundred', audio: '八百' },
      { front: 'bīzhēn', back: 'realistic', audio: '逼真' },
      { front: 'zhēn', back: 'real', audio: '真' },
      { front: 'bízi', back: 'nose', audio: '鼻子' },
      { front: 'bǐsài', back: 'competition', audio: '比赛' },
      { front: 'bìhǔ', back: 'lizard', audio: '壁虎' },
      { front: 'gāngbǐ', back: 'pen', audio: '钢笔' },
      { front: 'qiángbì', back: 'wall', audio: '墙壁' }
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
