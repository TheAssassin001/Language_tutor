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
    newbie: {
      novice: [
        { front: 'yǔ', back: 'language', audio: '' },
        { front: 'shàngkè', back: 'go to class', audio: '' },
        { front: 'xiàkè', back: 'finish class', audio: '' },
        { front: 'kè', back: 'class', audio: '' },
        { front: 'hěn', back: 'very', audio: '' },
        { front: 'gāoxìng', back: 'happy', audio: '' },
        { front: 'rènshi', back: 'to know', audio: '' },
        { front: 'hěn', back: 'is/are/am for adjective', audio: '' },
        { front: 'hěn', back: 'adverb for adjective', audio: '' },
        { front: 'nǐ hǎo', back: 'hello', audio: '' },
        { front: 'nǐ', back: 'you', audio: '' },
        { front: 'hǎo', back: 'good', audio: '' },
        { front: 'dàjiā hǎo', back: 'hello everyone', audio: '' },
        { front: 'dàjiā', back: 'everyone', audio: '' },
        { front: 'dà', back: 'big', audio: '' },
        { front: 'jiā', back: 'home/house/family', audio: '' },
        { front: 'wǒ', back: 'I', audio: '' },
        { front: 'jiào', back: 'call/asked to', audio: '' },
        { front: 'yě', back: 'also/too', audio: '' },
        { front: 'pǔtōnghuà', back: 'Mandarin', audio: '' },
        { front: 'pǔtōng', back: 'common', audio: '' },
        { front: 'huà', back: 'spoken words', audio: '' },
        { front: 'pīnyīn', back: 'phonics', audio: '' },
        { front: 'huá', back: 'China related', audio: '' },
        { front: 'sì', back: 'four', audio: '' },
        { front: 'shēng', back: 'sound', audio: '' },
        { front: 'yǔfǎ', back: 'grammar', audio: '' },
        { front: 'yǒu', back: 'have/had/do/does/did/got', audio: '' },
        { front: 'wèntí', back: 'question', audio: '' },
        { front: 'wèn', back: 'to ask', audio: '' },
        { front: 'méiyǒu', back: 'don’t have/ didn’t/haven\'t/ hasn\'t', audio: '' },
        { front: 'duìfāng', back: 'opposite direction/opposite party/opponent', audio: '' },
        { front: 'ma', back: 'question particle for "yes-no" questions', audio: '' },
        { front: 'ne', back: 'question particle for subjects already mentioned ( what about)', audio: '' },
        { front: 'nǎlǐ', back: 'where', audio: '' },
        { front: 'zhù', back: 'live/stay', audio: '' },
        { front: 'zài', back: 'at/in', audio: '' },
        { front: 'gōngzuò', back: 'work', audio: '' },
        { front: 'men', back: 'plural marker for noun /pronoun', audio: '' }
      ],
      rookie: [
        { front: 'míngbái', back: 'understand', audio: '' },
        { front: 'yīdiǎn', back: 'a liltle/ a bit', audio: '' },
        { front: 'zànměi', back: 'compliment', audio: '' },
        { front: 'piàoliang', back: 'beautiful', audio: '' },
        { front: 'xièxiè', back: 'thank you', audio: '' },
        { front: 'bùyòng kèqì', back: 'you\'re welcome', audio: '' },
        { front: 'bù', back: 'no/don\'t (-)', audio: '' },
        { front: 'bùyòng', back: 'no need', audio: '' },
        { front: 'kèqì', back: 'polite', audio: '' },
        { front: 'kè', back: 'guest', audio: '' },
        { front: 'qì', back: 'temperament/air', audio: '' },
        { front: 'shuài', back: 'handsome', audio: '' },
        { front: 'kě\'ài', back: 'cute', audio: '' },
        { front: 'ài', back: 'love', audio: '' },
        { front: 'de', back: 'possesive particle (\'s)', audio: '' },
        { front: 'yīfú', back: 'clothes', audio: '' },
        { front: 'měilì', back: 'beautiful', audio: '' },
        { front: 'zǎo ān', back: 'good morning', audio: '' },
        { front: 'wǔ ān', back: 'good afternoon/ good evening', audio: '' },
        { front: 'wǎn ān', back: 'good night', audio: '' },
        { front: 'chī', back: 'eat', audio: '' },
        { front: 'le', back: 'already/anymore', audio: '' },
        { front: 'hái', back: 'still/yet', audio: '' },
        { front: 'wèishéme', back: 'why', audio: '' },
        { front: 'wèi', back: 'for', audio: '' },
        { front: 'shéme', back: 'what', audio: '' },
        { front: 'yīnwèi', back: 'because', audio: '' },
        { front: 'è', back: 'hungry', audio: '' },
        { front: 'zǎocān', back: 'breakfast', audio: '' },
        { front: 'wǔcān', back: 'lunch', audio: '' },
        { front: 'wǎncān', back: 'dinner', audio: '' },
        { front: 'bāshì', back: 'bus', audio: '' },
        { front: 'báyá', back: 'tooth extraction', audio: '' },
        { front: 'yī bǎ dāo', back: 'a knife', audio: '' },
        { front: 'bàba', back: 'father', audio: '' },
        { front: 'bā', back: 'eight', audio: '' },
        { front: 'bā yuè', back: 'August', audio: '' },
        { front: 'bāshí', back: 'eighty', audio: '' },
        { front: 'bābǎi', back: 'eight hundred', audio: '' },
        { front: 'bīzhēn', back: 'realistic', audio: '' },
        { front: 'zhēn', back: 'real', audio: '' },
        { front: 'bízi', back: 'nose', audio: '' },
        { front: 'bǐsài', back: 'competition', audio: '' },
        { front: 'bìhǔ', back: 'liazrd', audio: '' },
        { front: 'gāngbǐ', back: 'pen', audio: '' },
        { front: 'qiángbì', back: 'wall', audio: '' }
      ],
    },
    level1: {
      text: {
        novice: [
          { front: 'shùzì', back: 'digit', audio: '' },
          { front: 'shù', back: 'maths', audio: '' },
          { front: 'zì', back: 'word', audio: '' },
          { front: 'yī', back: 'one', audio: '' },
          { front: 'èr', back: 'two', audio: '' },
          { front: 'sān', back: 'three', audio: '' },
          { front: 'wǔ', back: 'five', audio: '' },
          { front: 'liù', back: 'six', audio: '' },
          { front: 'qī', back: 'seven', audio: '' },
          { front: 'jiǔ', back: 'nine', audio: '' },
          { front: 'shí', back: 'ten', audio: '' },
          { front: 'jǐ', back: 'how many/how much', audio: '' },
          { front: 'suì', back: 'age', audio: '' },
          { front: 'péngyǒu', back: 'friend', audio: '' },
          { front: 'shì', back: 'is/are/am for noun ; yes', audio: '' },
          { front: 'bùshì', back: 'no', audio: '' },
          { front: 'tā', back: 'he/she/it', audio: '' },
          { front: 'tóngshì', back: 'colleague', audio: '' },
          { front: 'yào', back: 'want', audio: '' },
          { front: 'huì', back: 'will/know', audio: '' },
          { front: 'zhīdào', back: 'know', audio: '' },
          { front: 'kěyǐ', back: 'can', audio: '' },
          { front: 'yuè', back: 'moon/month', audio: '' },
          { front: 'rì', back: 'sun/day', audio: '' },
          { front: 'rìběn', back: 'Japan', audio: '' },
          { front: 'yuèliàng', back: 'moon', audio: '' },
          { front: 'liàng', back: 'bright', audio: '' },
          { front: 'nián', back: 'year', audio: '' },
          { front: 'jīntiān', back: 'today', audio: '' },
          { front: 'diǎn', back: 'o\'clock', audio: '' },
          { front: 'xiànzài', back: 'now', audio: '' },
          { front: 'bàn', back: 'half', audio: '' },
          { front: 'fēn', back: 'minute', audio: '' },
          { front: 'liǎng', back: 'two of something', audio: '' }
        ],
        apprentice: [
          { front: 'shàngwǔ', back: 'morning', audio: '' },
          { front: 'zhōngwǔ', back: 'afternoon', audio: '' },
          { front: 'xiàwǔ', back: 'evening', audio: '' },
          { front: 'wǎnshàng', back: 'night', audio: '' },
          { front: 'shàng', back: 'up', audio: '' },
          { front: 'zhōng', back: 'middle', audio: '' },
          { front: 'xià', back: 'down', audio: '' },
          { front: 'zǎoshang', back: 'morning', audio: '' },
          { front: 'xiàbān', back: 'finish work', audio: '' },
          { front: 'shàngbān', back: 'go to  work', audio: '' },
          { front: 'xīngqí', back: 'week', audio: '' },
          { front: 'yīgè', back: 'a/an/ one ', audio: '' },
          { front: 'tiān', back: 'day/sky/God', audio: '' },
          { front: 'zhōngguó', back: 'China', audio: '' },
          { front: 'guójiā', back: 'country', audio: '' },
          { front: 'qù', back: 'go', audio: '' },
          { front: 'jīnrì', back: 'today', audio: '' },
          { front: 'jīn wǎn', back: 'tonight', audio: '' },
          { front: 'jīnnián', back: 'this year', audio: '' },
          { front: 'kàn', back: 'to see; to look at; to read; to watch; to visit', audio: '' },
          { front: 'dúshū', back: 'study', audio: '' },
          { front: 'diànyǐng', back: 'movie/movie theatre', audio: '' },
          { front: 'míngtiān', back: 'tomorrow', audio: '' },
          { front: 'jīnglǐ', back: 'manager', audio: '' },
          { front: 'lái', back: 'come', audio: '' },
          { front: 'jiějie', back: 'elder sister', audio: '' },
          { front: 'qùnián', back: 'last year', audio: '' },
          { front: 'wàiguó', back: 'overseas', audio: '' },
          { front: 'míngnián', back: 'next year', audio: '' },
          { front: 'shíhòu', back: 'period of time', audio: '' },
          { front: 'tǐyùguǎn', back: 'gym', audio: '' },
          { front: 'shénme shíhòu', back: 'when ( question particle)', audio: '' },
          { front: 'huí', back: 'go back/return', audio: '' },
          { front: 'méishénme', back: 'nothing', audio: '' },
          { front: 'shēngrì', back: 'birthday', audio: '' },
          { front: 'de shíhòu', back: 'When (stating about specific time)', audio: '' },
          { front: 'páshān', back: 'hiking', audio: '' },
          { front: 'yǒu shíhòu', back: 'sometimes', audio: '' },
          { front: 'jǐshí', back: 'when ( question particle)', audio: '' },
          { front: 'yǒu shí', back: 'sometimes', audio: '' }
        ],
        adept: [
          { front: 'duōshǎo', back: 'how many/how much', audio: '' },
          { front: 'duō', back: 'a lot', audio: '' },
          { front: 'shǎo', back: 'little', audio: '' },
          { front: 'qián', back: 'money', audio: '' },
          { front: 'miànbāo', back: 'bread', audio: '' },
          { front: 'lìngjí', back: 'Ringgit', audio: '' },
          { front: 'xiān', back: 'cent', audio: '' },
          { front: 'bēi', back: 'cup', audio: '' },
          { front: 'kuài', back: 'piece/ informal fro money', audio: '' },
          { front: 'mǎi', back: 'buy', audio: '' },
          { front: 'shāngdiàn', back: 'store/shop', audio: '' },
          { front: 'yīxiē', back: 'some', audio: '' },
          { front: 'záhuò', back: 'grocery', audio: '' },
          { front: 'shuǐguǒ', back: 'fruits', audio: '' },
          { front: 'hé', back: 'and/with', audio: '' },
          { front: 'kànjiàn', back: 'saw', audio: '' },
          { front: 'tán', back: 'chitchat', audio: '' },
          { front: 'fēnzhōng', back: 'minutes ( duration or intervals of time)', audio: '' },
          { front: 'xǐhuān', back: 'like', audio: '' },
          { front: 'hē', back: 'drink', audio: '' },
          { front: 'chá', back: 'tea', audio: '' },
          { front: 'jiātíng', back: 'family', audio: '' },
          { front: 'kǒu', back: 'mouth/classifier for things with mouths/classifier for bites or mouthfuls', audio: '' },
          { front: 'gēge', back: 'elder brother', audio: '' },
          { front: 'mèimei', back: 'younger sister', audio: '' },
          { front: 'dìdì', back: 'younger brother', audio: '' },
          { front: 'jiéhūn', back: 'get married', audio: '' },
          { front: 'háizi', back: 'kid/child', audio: '' },
          { front: 'érzi', back: 'son', audio: '' },
          { front: 'nǚ\'ér', back: 'daughter', audio: '' },
          { front: 'nán', back: 'male', audio: '' },
          { front: 'nǚ', back: 'female', audio: '' },
          { front: 'nánhái', back: 'boy', audio: '' },
          { front: 'nǚhái', back: 'girl', audio: '' },
          { front: 'nánrén', back: 'man', audio: '' },
          { front: 'nǚrén', back: 'woman', audio: '' },
          { front: 'chǒngwù', back: 'pets', audio: '' },
          { front: 'yǎng', back: 'to raise (animals); to bring up (children); to keep (pets)', audio: '' },
          { front: 'zhī', back: 'classifier for birds and certain animals', audio: '' },
          { front: 'māo', back: 'cat', audio: '' },
          { front: 'gōnggong', back: 'grandfather', audio: '' },
          { front: 'yěye', back: 'grandfather', audio: '' },
          { front: 'wàigōng', back: 'maternal grandfather', audio: '' },
          { front: 'nǎinai', back: 'grandmother', audio: '' },
          { front: 'táng', back: 'dad side cousin tag', audio: '' },
          { front: 'biǎo', back: 'mom side cousin tag', audio: '' },
          { front: 'yuèfù', back: 'father in law', audio: '' },
          { front: 'yuèmǔ', back: 'mother in law', audio: '' }
        ],
        virtuoso: [
          { front: 'yīshēng', back: 'doctor', audio: '' },
          { front: 'yī', back: 'to treat', audio: '' },
          { front: 'shēng', back: 'a person who /birth', audio: '' },
          { front: 'xuéshēng', back: 'student', audio: '' },
          { front: 'xiǎojiě', back: 'miss', audio: '' },
          { front: 'zhèlǐ', back: 'here', audio: '' },
          { front: 'xiānsheng', back: 'mister', audio: '' },
          { front: 'shéi', back: 'who', audio: '' },
          { front: 'jiā', back: 'classifier for building', audio: '' },
          { front: 'yīyuàn', back: 'hospital', audio: '' },
          { front: 'shūfú', back: 'comfortable', audio: '' },
          { front: 'néng', back: 'can /able to ', audio: '' },
          { front: 'jiàn', back: 'meet', audio: '' },
          { front: 'zuò', back: 'do', audio: '' },
          { front: 'zhèngzài/zài', back: 'in the process of (-ing)', audio: '' },
          { front: 'diànshì', back: 'television', audio: '' },
          { front: 'tīng', back: 'listen', audio: '' },
          { front: 'dào', back: 'reach/ verb complement denoting completion or result of an action', audio: '' },
          { front: 'zěnme', back: 'how', audio: '' },
          { front: 'dōu', back: 'all/both', audio: '' },
          { front: 'tóngxué', back: 'classmate', audio: '' },
          { front: 'zěnme yàng', back: 'How (is it like)', audio: '' },
          { front: 'nàlǐ', back: 'there', audio: '' },
          { front: 'tiānqì', back: 'weather', audio: '' },
          { front: 'lěng', back: 'cold', audio: '' },
          { front: 'rè', back: 'hot', audio: '' },
          { front: 'xià yǔ', back: 'rain', audio: '' }
        ],
        maestro: [
          { front: 'shéi de', back: 'whose', audio: '' },
          { front: 'zuòzhě', back: 'author', audio: '' },
          { front: 'tóng', back: 'same', audio: '' },
          { front: 'nà', back: 'then', audio: '' },
          { front: 'gěi', back: 'to', audio: '' },
          { front: 'shì', back: 'try', audio: '' },
          { front: 'zhège', back: 'this', audio: '' },
          { front: 'nàge', back: 'that', audio: '' },
          { front: 'diànhuà', back: 'telephone', audio: '' },
          { front: 'qǐng', back: 'please', audio: '' },
          { front: 'jì xiàlái', back: 'note it down', audio: '' },
          { front: 'dǎ diànhuà', back: 'make a phone call', audio: '' },
          { front: 'jiē', back: 'pick up', audio: '' },
          { front: 'yīcì', back: 'once', audio: '' },
          { front: 'dìng', back: 'to book', audio: '' },
          { front: 'liàng', back: 'classifier for vehicles', audio: '' },
          { front: 'chūzū chē', back: 'taxi', audio: '' },
          { front: 'chūzū', back: 'rent', audio: '' },
          { front: 'xiě', back: 'write', audio: '' },
          { front: 'tài', back: 'too', audio: '' },
          { front: 'duìbùqǐ', back: 'sorry', audio: '' },
          { front: 'ràng', back: 'let', audio: '' },
          { front: 'chóng', back: 'repeat', audio: '' },
          { front: 'bāng', back: 'help', audio: '' },
          { front: 'fēijī chǎng', back: 'airport', audio: '' },
          { front: 'fēijī', back: 'airplane', audio: '' },
          { front: 'fēi', back: 'to fly', audio: '' },
          { front: 'píngshí', back: 'usually', audio: '' },
          { front: 'píngcháng rì', back: 'weekdays', audio: '' },
          { front: 'wūzǐ', back: 'house', audio: '' },
          { front: 'qián', back: 'before', audio: '' },
          { front: 'hòu', back: 'after', audio: '' },
          { front: 'xiǎoshí', back: 'hour', audio: '' },
          { front: 'dāngrán', back: 'of course', audio: '' },
          { front: 'bāngzhù', back: 'help', audio: '' },
          { front: 'xūyào', back: 'need', audio: '' }
        ]
      hanyupinyin: {
        novice: [],
        apprentice: [],
        adept: [],
        virtuoso: [],
        maestro: []
      },
      extravocab: {
        novice: [],
        apprentice: [],
        adept: [],
        virtuoso: [],
        maestro: []
      }
    },
    level2: {
      text: [
        { front: '学校', back: 'xué xiào - School', audio: '学校' },
        { front: '图书馆', back: 'tú shū guǎn - Library', audio: '图书馆' },
        { front: '昨天', back: 'zuó tiān - Yesterday', audio: '昨天' },
        { front: '今天', back: 'jīn tiān - Today', audio: '今天' },
        { front: '明天', back: 'míng tiān - Tomorrow', audio: '明天' },
        { front: '老师', back: 'lǎo shī - Teacher', audio: '老师' },
        { front: '学生', back: 'xué sheng - Student', audio: '学生' }
      ],
      hanyupinyin: [],
      extravocab: []
    },
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
