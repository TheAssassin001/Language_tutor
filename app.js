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
        { front: 'yǔ', back: 'language', audio: '语' },
        { front: 'shàngkè', back: 'go to class', audio: '上课' },
        { front: 'xiàkè', back: 'finish class', audio: '下课' },
        { front: 'kè', back: 'class', audio: '课' },
        { front: 'hěn', back: 'very', audio: '很' },
        { front: 'gāoxìng', back: 'happy', audio: '高兴' },
        { front: 'rènshi', back: 'to know', audio: '认识' },
        { front: 'hěn', back: 'is/are/am for adjective', audio: '很' },
        { front: 'hěn', back: 'adverb for adjective', audio: '很' },
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
        { front: 'méiyǒu', back: 'don\'t have/ didn\'t/haven\'t/ hasn\'t', audio: '没有' },
        { front: 'duìfāng', back: 'opposite direction/opposite party/opponent', audio: '对方' },
        { front: 'ma', back: 'question particle for "yes-no" questions', audio: '吗' },
        { front: 'ne', back: 'question particle for subjects already mentioned ( what about)', audio: '呢' },
        { front: 'nǎlǐ', back: 'where', audio: '哪里' },
        { front: 'zhù', back: 'live/stay', audio: '住' },
        { front: 'zài', back: 'at/in', audio: '在' },
        { front: 'gōngzuò', back: 'work', audio: '工作' },
        { front: 'men', back: 'plural marker for noun /pronoun', audio: '们' }
      ],
      rookie: [
        { front: 'míngbái', back: 'understand', audio: '明白' },
        { front: 'yīdiǎn', back: 'a little/ a bit', audio: '一点' },
        { front: 'zànměi', back: 'compliment', audio: '赞美' },
        { front: 'piàoliang', back: 'beautiful', audio: '漂亮' },
        { front: 'xièxiè', back: 'thank you', audio: '谢谢' },
        { front: 'bùyòng kèqì', back: 'you\'re welcome', audio: '不用客气' },
        { front: 'bù', back: 'no/don\'t (-)', audio: '不' },
        { front: 'bùyòng', back: 'no need', audio: '不用' },
        { front: 'kèqì', back: 'polite', audio: '客气' },
        { front: 'kè', back: 'guest', audio: '客' },
        { front: 'qì', back: 'temperament/air', audio: '气' },
        { front: 'shuài', back: 'handsome', audio: '帅' },
        { front: 'kě\'ài', back: 'cute', audio: '可爱' },
        { front: 'ài', back: 'love', audio: '爱' },
        { front: 'de', back: 'possesive particle (\'s)', audio: '的' },
        { front: 'yīfú', back: 'clothes', audio: '衣服' },
        { front: 'měilì', back: 'beautiful', audio: '美丽' },
        { front: 'zǎo ān', back: 'good morning', audio: '早安' },
        { front: 'wǔ ān', back: 'good afternoon/ good evening', audio: '午安' },
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
      ]
    },
    level1: {
      text: {
        novice: [
          { front: 'shùzì', back: 'digit', audio: '数字' },
          { front: 'shù', back: 'maths', audio: '数' },
          { front: 'zì', back: 'word', audio: '字' },
          { front: 'yī', back: 'one', audio: '一' },
          { front: 'èr', back: 'two', audio: '二' },
          { front: 'sān', back: 'three', audio: '三' },
          { front: 'wǔ', back: 'five', audio: '五' },
          { front: 'liù', back: 'six', audio: '六' },
          { front: 'qī', back: 'seven', audio: '七' },
          { front: 'jiǔ', back: 'nine', audio: '九' },
          { front: 'shí', back: 'ten', audio: '十' },
          { front: 'jǐ', back: 'how many/how much', audio: '几' },
          { front: 'suì', back: 'age', audio: '岁' },
          { front: 'péngyǒu', back: 'friend', audio: '朋友' },
          { front: 'shì', back: 'is/are/am for noun ; yes', audio: '是' },
          { front: 'bùshì', back: 'no', audio: '不是' },
          { front: 'tā', back: 'he/she/it', audio: '他' },
          { front: 'tóngshì', back: 'colleague', audio: '同事' },
          { front: 'yào', back: 'want', audio: '要' },
          { front: 'huì', back: 'will/know', audio: '会' },
          { front: 'zhīdào', back: 'know', audio: '知道' },
          { front: 'kěyǐ', back: 'can', audio: '可以' },
          { front: 'yuè', back: 'moon/month', audio: '月' },
          { front: 'rì', back: 'sun/day', audio: '日' },
          { front: 'rìběn', back: 'Japan', audio: '日本' },
          { front: 'yuèliàng', back: 'moon', audio: '月亮' },
          { front: 'liàng', back: 'bright', audio: '亮' },
          { front: 'nián', back: 'year', audio: '年' },
          { front: 'jīntiān', back: 'today', audio: '今天' },
          { front: 'diǎn', back: "o'clock", audio: '点' },
          { front: 'xiànzài', back: 'now', audio: '现在' },
          { front: 'bàn', back: 'half', audio: '半' },
          { front: 'fēn', back: 'minute', audio: '分' },
          { front: 'liǎng', back: 'two of something', audio: '两' }
        ],
        apprentice: [
          { front: 'shàngwǔ', back: 'morning', audio: '上午' },
          { front: 'zhōngwǔ', back: 'afternoon', audio: '中午' },
          { front: 'xiàwǔ', back: 'evening', audio: '下午' },
          { front: 'wǎnshàng', back: 'night', audio: '晚上' },
          { front: 'shàng', back: 'up', audio: '上' },
          { front: 'zhōng', back: 'middle', audio: '中' },
          { front: 'xià', back: 'down', audio: '下' },
          { front: 'zǎoshang', back: 'morning', audio: '早上' },
          { front: 'xiàbān', back: 'finish work', audio: '下班' },
          { front: 'shàngbān', back: 'go to work', audio: '上班' },
          { front: 'xīngqí', back: 'week', audio: '星期' },
          { front: 'yīgè', back: 'a/an/one', audio: '一个' },
          { front: 'tiān', back: 'day/sky/God', audio: '天' },
          { front: 'zhōngguó', back: 'China', audio: '中国' },
          { front: 'guójiā', back: 'country', audio: '国家' },
          { front: 'qù', back: 'go', audio: '去' },
          { front: 'jīnrì', back: 'today', audio: '今日' },
          { front: 'jīn wǎn', back: 'tonight', audio: '今晚' },
          { front: 'jīnnián', back: 'this year', audio: '今年' },
          { front: 'kàn', back: 'to see; to look at; to read; to watch; to visit', audio: '看' },
          { front: 'dúshū', back: 'study', audio: '读书' },
          { front: 'diànyǐng', back: 'movie/movie theatre', audio: '电影' },
          { front: 'míngtiān', back: 'tomorrow', audio: '明天' },
          { front: 'jīnglǐ', back: 'manager', audio: '经理' },
          { front: 'lái', back: 'come', audio: '来' },
          { front: 'jiějie', back: 'elder sister', audio: '姐姐' },
          { front: 'qùnián', back: 'last year', audio: '去年' },
          { front: 'wàiguó', back: 'overseas', audio: '外国' },
          { front: 'míngnián', back: 'next year', audio: '明年' },
          { front: 'shíhòu', back: 'period of time', audio: '时候' },
          { front: 'tǐyùguǎn', back: 'gym', audio: '体育馆' },
          { front: 'shénme shíhòu', back: 'when ( question particle)', audio: '什么时候' },
          { front: 'huí', back: 'go back/return', audio: '回' },
          { front: 'méishénme', back: 'nothing', audio: '没什么' },
          { front: 'shēngrì', back: 'birthday', audio: '生日' },
          { front: 'de shíhòu', back: 'When (stating about specific time)', audio: '的时候' },
          { front: 'páshān', back: 'hiking', audio: '爬山' },
          { front: 'yǒu shíhòu', back: 'sometimes', audio: '有时候' },
          { front: 'jǐshí', back: 'when ( question particle)', audio: '几时' },
          { front: 'yǒu shí', back: 'sometimes', audio: '有时' }
        ],
        adept: [
          { front: 'duōshǎo', back: 'how many/how much', audio: '多少' },
          { front: 'duō', back: 'a lot', audio: '多' },
          { front: 'shǎo', back: 'little', audio: '少' },
          { front: 'qián', back: 'money', audio: '钱' },
          { front: 'miànbāo', back: 'bread', audio: '面包' },
          { front: 'lìngjí', back: 'Ringgit', audio: '令吉' },
          { front: 'xiān', back: 'cent', audio: '仙' },
          { front: 'bēi', back: 'cup', audio: '杯' },
          { front: 'kuài', back: 'piece/ informal fro money', audio: '块' },
          { front: 'mǎi', back: 'buy', audio: '买' },
          { front: 'shāngdiàn', back: 'store/shop', audio: '商店' },
          { front: 'yīxiē', back: 'some', audio: '一些' },
          { front: 'záhuò', back: 'grocery', audio: '杂货' },
          { front: 'shuǐguǒ', back: 'fruits', audio: '水果' },
          { front: 'hé', back: 'and/with', audio: '和' },
          { front: 'kànjiàn', back: 'saw', audio: '看见' },
          { front: 'tán', back: 'chitchat', audio: '谈' },
          { front: 'fēnzhōng', back: 'minutes ( duration or intervals of time)', audio: '分钟' },
          { front: 'xǐhuān', back: 'like', audio: '喜欢' },
          { front: 'hē', back: 'drink', audio: '喝' },
          { front: 'chá', back: 'tea', audio: '茶' },
          { front: 'jiātíng', back: 'family', audio: '家庭' },
          { front: 'kǒu', back: 'mouth/ classifier for things with mouths /classifier for bites or mouthfuls', audio: '口' },
          { front: 'gēge', back: 'elder brother', audio: '哥哥' },
          { front: 'mèimei', back: 'younger sister', audio: '妹妹' },
          { front: 'dìdì', back: 'younger brother', audio: '弟弟' },
          { front: 'jiéhūn', back: 'get married', audio: '结婚' },
          { front: 'háizi', back: 'kid/child', audio: '孩子' },
          { front: 'érzi', back: 'son', audio: '儿子' },
          { front: "nǚ'ér", back: 'daughter', audio: '女儿' },
          { front: 'nán', back: 'male', audio: '男' },
          { front: 'nǚ', back: 'female', audio: '女' },
          { front: 'nánhái', back: 'boy', audio: '男孩' },
          { front: 'nǚhái', back: 'girl', audio: '女孩' },
          { front: 'nánrén', back: 'man', audio: '男人' },
          { front: 'nǚrén', back: 'woman', audio: '女人' },
          { front: 'chǒngwù', back: 'pets', audio: '宠物' },
          { front: 'yǎng', back: 'to raise (animals); to bring up (children); to keep (pets)', audio: '养' },
          { front: 'zhī', back: 'classifier for birds and certain animals', audio: '只' },
          { front: 'māo', back: 'cat', audio: '猫' },
          { front: 'gōnggong', back: 'grandfather', audio: '公公' },
          { front: 'yěye', back: 'grandfather', audio: '爷爷' }
        ],
        virtuoso: [
          { front: 'yīshēng', back: 'doctor', audio: '医生' },
          { front: 'yī', back: 'to treat', audio: '医' },
          { front: 'shēng', back: 'a person who /birth', audio: '生' },
          { front: 'xuéshēng', back: 'student', audio: '学生' },
          { front: 'xiǎojiě', back: 'miss', audio: '小姐' },
          { front: 'zhèlǐ', back: 'here', audio: '这里' },
          { front: 'xiānsheng', back: 'mister', audio: '先生' },
          { front: 'shéi', back: 'who', audio: '谁' },
          { front: 'jiā', back: 'classifier for building', audio: '家' },
          { front: 'yīyuàn', back: 'hospital', audio: '医院' },
          { front: 'shūfú', back: 'comfortable', audio: '舒服' },
          { front: 'néng', back: 'can /able to ', audio: '能' },
          { front: 'jiàn', back: 'meet', audio: '见' },
          { front: 'zuò', back: 'do', audio: '做' },
          { front: 'zhèngzài/zài', back: 'in the process of (-ing)', audio: '正在/在' },
          { front: 'diànshì', back: 'television', audio: '电视' },
          { front: 'tīng', back: 'listen', audio: '听' },
          { front: 'dào', back: 'reach/ verb complement denoting completion or result of an action', audio: '到' },
          { front: 'zěnme', back: 'how', audio: '怎么' },
          { front: 'dōu', back: 'all/both', audio: '都' },
          { front: 'tóngxué', back: 'classmate', audio: '同学' },
          { front: 'zěnme yàng', back: 'How (is it like)', audio: '怎么样' },
          { front: 'nàlǐ', back: 'there', audio: '那里' },
          { front: 'tiānqì', back: 'weather', audio: '天气' },
          { front: 'lěng', back: 'cold', audio: '冷' },
          { front: 'rè', back: 'hot', audio: '热' },
          { front: 'xià yǔ', back: 'rain', audio: '下雨' }
        ],
        maestro: [
          { front: 'shéi de', back: 'whose', audio: '谁的' },
          { front: 'zuòzhě', back: 'author', audio: '作者' },
          { front: 'tóng', back: 'same', audio: '同' },
          { front: 'nà', back: 'then', audio: '那' },
          { front: 'gěi', back: 'to', audio: '给' },
          { front: 'shì', back: 'try', audio: '试' },
          { front: 'zhège', back: 'this', audio: '这个' },
          { front: 'nàge', back: 'that', audio: '那个' },
          { front: 'diànhuà', back: 'telephone', audio: '电话' },
          { front: 'qǐng', back: 'please', audio: '请' },
          { front: 'jì xiàlái', back: 'note it down', audio: '记下来' },
          { front: 'dǎ diànhuà', back: 'make a phone call', audio: '打电话' },
          { front: 'jiē', back: 'pick up', audio: '接' },
          { front: 'yīcì', back: 'once', audio: '一次' },
          { front: 'dìng', back: 'to book', audio: '订' },
          { front: 'liàng', back: 'classifier for vehicles', audio: '辆' },
          { front: 'chūzū chē', back: 'taxi', audio: '出租车' },
          { front: 'chūzū', back: 'rent', audio: '出租' },
          { front: 'xiě', back: 'write', audio: '写' },
          { front: 'tài', back: 'too', audio: '太' },
          { front: 'duìbùqǐ', back: 'sorry', audio: '对不起' },
          { front: 'ràng', back: 'let', audio: '让' },
          { front: 'chóng', back: 'repeat', audio: '重' },
          { front: 'bāng', back: 'help', audio: '帮' },
          { front: 'fēijī chǎng', back: 'airport', audio: '飞机场' },
          { front: 'fēijī', back: 'airplane', audio: '飞机' },
          { front: 'fēi', back: 'to fly', audio: '飞' },
          { front: 'píngshí', back: 'usually', audio: '平时' },
          { front: 'píngcháng rì', back: 'weekdays', audio: '平常日' },
          { front: 'wūzǐ', back: 'house', audio: '屋子' },
          { front: 'qián', back: 'before', audio: '前' },
          { front: 'hòu', back: 'after', audio: '后' },
          { front: 'xiǎoshí', back: 'hour', audio: '小时' },
          { front: 'dāngrán', back: 'of course', audio: '当然' },
          { front: 'bāngzhù', back: 'help', audio: '帮助' },
          { front: 'xūyào', back: 'need', audio: '需要' }
        ]
      },
      hanyupinyin: {
        novice: [
          { front: 'pā zài dìshàng', back: 'lie on the ground' },
          { front: 'pā', back: 'to lie' },
          { front: 'dìshàng', back: 'on the ground' },
          { front: 'dì', back: 'ground' },
          { front: 'shàng', back: 'on' },
          { front: 'pá', back: 'to climb' },
          { front: 'pà', back: 'afraid' },
          { front: 'páshǒu', back: 'pickpocket' },
          { front: 'píngguǒ', back: 'apple' },
          { front: 'yī pǐ mǎ', back: 'a horse' },
          { front: 'pífū', back: 'skin' },
          { front: 'piào', back: 'ticket' },
          { front: 'piàn', back: 'lie/cheat' },
          { front: 'shānpō', back: 'hillside' },
          { front: 'shān', back: 'hill/mountain' },
          { front: 'wàipó', back: 'maternal grandmother' },
          { front: 'wài', back: 'out' },
          { front: 'pópo', back: 'grandmother' },
          { front: 'pǒcè', back: 'unpredictable' },
          { front: 'dǎpò', back: 'break' },
          { front: 'pòhuài', back: 'destroy/damage' }
        ],
        apprentice: [
          { front: 'pū kè', back: 'poker' },
          { front: 'pú tao', back: 'grapes' },
          { front: 'pùbù', back: 'waterfall' },
          { front: 'gē pǔ', back: 'songsheet' },
          { front: 'gōngpú', back: 'public servant' },
          { front: 'mā ma', back: 'mother' },
          { front: 'mádài', back: 'sack' },
          { front: 'mǎyǐ', back: 'ants' },
          { front: 'mà jià', back: 'scoldings' },
          { front: 'hào mǎ', back: 'number' },
          { front: 'mǎláixīyà', back: 'Malaysia' },
          { front: 'xiǎo māomī', back: 'kitten sound' },
          { front: 'mílù', back: 'lost' },
          { front: 'lù', back: 'road' },
          { front: 'báimǐ', back: 'white rice' },
          { front: 'fēngmì', back: 'honey' },
          { front: 'mìfēng', back: 'bee' },
          { front: 'yībǎi mǐ', back: 'one hundred meter' },
          { front: 'mìmì', back: 'secret' }
        ],
        adept: [
          { front: 'mōtóu', back: 'touch head' },
          { front: 'mō', back: 'to touch' },
          { front: 'mógū', back: 'mushroom' },
          { front: 'mǒ bù', back: 'cleaning rag' },
          { front: 'mǒ', back: 'to wipe' },
          { front: 'mòzhī', back: 'ink' },
          { front: 'mòyú', back: 'cuttlefish' },
          { front: 'zhōumò', back: 'weekend' },
          { front: 'múyàng', back: 'appearance' },
          { front: 'mǔqīn', back: 'mother (formal)' },
          { front: 'mǔzhǐ', back: 'thumb' },
          { front: 'mùbǎn', back: 'board' },
          { front: 'mù', back: 'wood' },
          { front: 'mùbiāo', back: 'aims/Target/ Goal' },
          { front: 'fāshāo', back: 'fever' },
          { front: 'fá zhàn', back: 'stand penalty' },
          { front: 'fá', back: 'to punish' },
          { front: 'zhàn', back: 'stand/staion' },
          { front: 'fǎguān', back: 'judge' },
          { front: 'fàlà', back: 'hairwax' },
          { front: 'làzhú', back: 'candle/wax' },
          { front: 'tóufa', back: 'hair' },
          { front: 'fā měng', back: 'dazed' },
          { front: 'fā mèng', back: 'dream' }
        ],
        virtuoso: [
          { front: 'fó jiào', back: 'Buddhism' },
          { front: 'jiào', back: 'teach' },
          { front: 'jiàoshī', back: 'teacher' },
          { front: 'fójīng', back: 'Buddhism scriptures' },
          { front: 'niànfó', back: 'chant the name of Buddha' },
          { front: 'niàn', back: 'to read multiple times to memorise' },
          { front: 'fó', back: 'Buddha' },
          { front: 'nóngfū', back: 'farmer' },
          { front: 'fútī', back: 'escalator' },
          { front: 'lóutī', back: 'stairs' },
          { front: 'fǔtóu', back: 'axe' },
          { front: 'fùqīn', back: 'father (formal)' },
          { front: 'yúfū', back: 'fisherman' },
          { front: 'biānfú', back: 'bat' },
          { front: 'fù qián', back: 'pay money' },
          { front: 'dā bāshì', back: 'take bus' },
          { front: 'dàodá', back: 'arrive' },
          { front: 'dǎsǎo', back: 'clean' },
          { front: 'dà hǎn', back: 'shout loudly' },
          { front: 'huídá', back: 'reply' }
        ],
        maestro: [
          { front: 'Dē dē shēng', back: 'sound of running horse' },
          { front: 'dé jiǎng', back: 'win a prize' },
          { front: 'dé', back: 'get' },
          { front: 'jiǎng', back: 'trophy' },
          { front: 'dàodé', back: 'moral' },
          { front: 'shuǐdī', back: 'water droplets' },
          { front: 'dízi', back: 'flute' },
          { front: 'hǎidǐ', back: 'seabed' },
          { front: 'dǐ', back: 'low' },
          { front: 'dìqiú', back: 'earth' },
          { front: 'dírén', back: 'enemy' },
          { front: "dá'àn", back: 'answer' },
          { front: 'dūshì', back: 'urban city' },
          { front: 'dú', back: 'poison' },
          { front: 'dǔchē', back: 'traffic jam' },
          { front: 'dùzǐ', back: 'abdomen' },
          { front: 'dùlún', back: 'ferry' }
        ]
      },

      extravocab: {
        novice: [
          { front: 'xuéxiào', back: 'school' },
          { front: 'yóuyǒng', back: 'swimming' },
          { front: 'chànggē', back: 'singging' },
          { front: 'chàng', back: 'to sing' },
          { front: 'gē', back: 'song' },
          { front: 'shūběn', back: 'book' },
          { front: 'shǒujī', back: 'handphone' },
          { front: 'shǒu', back: 'hand' },
          { front: 'jī', back: 'device/machine' },
          { front: 'qiānbǐ', back: 'pencil' },
          { front: 'yīngyǔ', back: 'English' },
          { front: 'fǔdǎo', back: 'guide' },
          { front: 'chúguì', back: 'cupboard' },
          { front: 'shìpín', back: 'video' },
          { front: 'shì', back: 'sight' },
          { front: 'kèběn', back: 'textbook' },
          { front: 'tàiyáng', back: 'sun' },
          { front: 'báibǎn', back: 'whiteboard' },
          { front: 'chēchuāng', back: 'car window' },
          { front: 'shǒuzhǐ', back: 'finger' },
          { front: 'diànnǎo', back: 'computer' },
          { front: 'kēxué', back: 'science' },
          { front: 'bǎobèi', back: 'baby/ a precious one' },
          { front: 'máobǐ', back: 'brush pen' },
          { front: 'hēibǎn', back: 'blackboard' }
        ],
        apprentice: [
          { front: 'kǎoshì', back: 'exam' },
          { front: 'bào zhǐ', back: 'newspaper' },
          { front: 'bào', back: 'to report' },
          { front: 'zhǐ', back: 'paper' },
          { front: 'gōng sī', back: 'company' },
          { front: 'huǒ chē', back: 'train' },
          { front: 'huǒ', back: 'fire' },
          { front: 'kuài lè', back: 'happy' },
          { front: 'kuài', back: 'fast' },
          { front: 'jiè shào', back: 'introduce' },
          { front: 'gǒu', back: 'dog' },
          { front: 'shēn tǐ', back: 'body' },
          { front: 'shí jiān', back: 'time' },
          { front: 'shǒu biǎo', back: 'watch' },
          { front: 'nǔlì', back: 'hardworking' },
          { front: 'shǒuzhuó', back: 'bangle' },
          { front: 'shuǐpíng', back: 'water bottle' },
          { front: 'chīkǔ', back: 'suffer' },
          { front: 'kǔ', back: 'bitter' },
          { front: 'zhuōzǐ', back: 'table' },
          { front: 'zhuānyè', back: 'profession/professional' },
          { front: 'rìlì', back: 'calendar' },
          { front: 'xuéxí', back: 'learn' },
          { front: 'yìsi', back: 'meaning' },
          { front: 'zhōng', back: 'clock' }
        ],
        adept: [
          { front: 'shíwù', back: 'food' },
          { front: 'mǐfàn', back: 'rice' },
          { front: 'shūcài', back: 'vegetables' },
          { front: 'yúròu', back: 'meat of fish' },
          { front: 'hǎixiān', back: 'seafood' },
          { front: 'bīngqílín', back: 'ice cream' },
          { front: 'gālí', back: 'curry' },
          { front: 'jīdàn', back: 'chicken egg' },
          { front: 'Xiā', back: 'prawn' },
          { front: 'miàntiáo', back: 'noodles' },
          { front: 'chǎofàn', back: 'fried rice' },
          { front: 'qiǎokèlì', back: 'chocolate' },
          { front: 'bǐnggān', back: 'biscuit' },
          { front: 'zhá jī', back: 'fried chicken' },
          { front: 'yǐnliào', back: 'beverage' },
          { front: 'niúnǎi', back: 'cow milk' },
          { front: 'lǜchá', back: 'green tea' },
          { front: 'shuǐ', back: 'water' },
          { front: 'guǒzhī', back: 'fruit juice' },
          { front: 'kāfēi', back: 'coffee' },
          { front: 'pí jiǔ', back: 'beer' },
          { front: 'jiǔ', back: 'alcohol' },
          { front: 'sū dǎ', back: 'soda' },
          { front: 'kě lè', back: 'cola' },
          { front: 'hóng chá', back: 'black tea' },
          { front: 'dìfāng', back: 'place' },
          { front: 'kāfēi diàn', back: 'café' },
          { front: 'jiǔbā', back: 'bar' },
          { front: 'chāojí shìchǎng', back: 'supermarket' },
          { front: 'záhuò diàn', back: 'grocery shop' },
          { front: 'fàndiàn', back: 'restaurant' },
          { front: 'gòuwù zhōng xīn', back: 'shopping mall' },
          { front: 'hǎitān', back: 'beach' },
          { front: 'shìchǎng', back: 'market' },
          { front: 'miànbāo fáng', back: 'bakery' }
        ],
        virtuoso: [
          { front: 'rìjì', back: 'diary' },
          { front: 'jì', back: 'to note down' },
          { front: 'lǎorén', back: 'old people' },
          { front: 'xīnqíng', back: 'mood' },
          { front: 'xīn', back: 'heart' },
          { front: 'qíngkuàng', back: 'situation' },
          { front: 'tèbié', back: 'special' },
          { front: 'xiàozhǎng', back: 'haedmaster' },
          { front: 'xiàng jī', back: 'camera' },
          { front: 'fùxí', back: 'revise' },
          { front: 'dàxué', back: 'college/university' },
          { front: 'zhōngxué', back: 'middle school/secondary school' },
          { front: 'xiǎoxué', back: 'primary school' },
          { front: 'xiǎo', back: 'small' },
          { front: 'shítáng', back: 'canteen' },
          { front: 'lǐtáng', back: 'hall' },
          { front: 'huānyíng', back: 'welcome' },
          { front: 'yǐzǐ', back: 'chair' },
          { front: 'wénjù', back: 'stationery' },
          { front: 'tiàowǔ', back: 'dance' },
          { front: 'tiào', back: 'to jump' },
          { front: 'cǎochǎng', back: 'field' },
          { front: 'cǎo', back: 'grass' },
          { front: 'shǒupà', back: 'handkerchief' },
          { front: 'làbǐ', back: 'crayon' },
          { front: 'rìqí', back: 'date' },
          { front: 'húdié', back: 'butterfly' },
          { front: 'cídiǎn', back: 'dictionary' },
          { front: 'zuòyè', back: 'exercise book' }
        ],
        maestro: [
          { front: 'yánsè', back: 'color' },
          { front: 'hóngsè', back: 'red color' },
          { front: 'chéngsè', back: 'orange color' },
          { front: 'chéng', back: 'orange (fruit)' },
          { front: 'huángsè', back: 'yellow color' },
          { front: 'qīngsè', back: 'green color' },
          { front: 'lán sè', back: 'blue color' },
          { front: 'diànsè', back: 'indigo color' },
          { front: 'zǐsè', back: 'purple color' },
          { front: 'lǜsè', back: 'dark green color' },
          { front: 'hēisè', back: 'black color' },
          { front: 'báisè', back: 'white color' },
          { front: 'hésè', back: 'brown color' },
          { front: 'hé', back: 'box' },
          { front: 'huīsè', back: 'grey color' },
          { front: 'fěnhóng sè', back: 'pink color' },
          { front: 'zuǒ', back: 'left' },
          { front: 'zuǒbiān', back: 'leftside' },
          { front: 'qiánmiàn', back: 'front' },
          { front: 'yòu', back: 'right' },
          { front: 'yòubiān', back: 'rightside' },
          { front: 'hòumiàn', back: 'behind' },
          { front: 'lǐmiàn', back: 'in' },
          { front: 'zhuōzi', back: 'table' }
        ]
      }
    },
    level2: {
      text: {
        novice: [
          { front: 'nín', back: 'you (formal/respectfully)' },
          { front: 'hǎojiǔ bùjiàn', back: 'long time no see' },
          { front: 'hǎo', back: 'Emphasize more or longer or greater; Very / so ~/ really' },
          { front: 'jiǔ', back: 'long (time)' },
          { front: 'xìng', back: 'surname' },
          { front: 'míng', back: 'measure word for person or standing in a competition' },
          { front: 'láizì', back: 'come from' },
          { front: 'měiguó', back: 'America' },
          { front: 'fàguó', back: 'France' },
          { front: 'wèi', back: 'quantifier used for people, especially to express respect or position' },
          { front: 'méi wèntí', back: 'no problem' },
          { front: 'chēngzàn', back: 'compliment' },
          { front: 'chuān', back: 'wear' },
          { front: 'kùzǐ', back: 'pants' },
          { front: 'qúnzǐ', back: 'skirt' },
          { front: 'kàn qǐlái', back: 'Looks like /seems' },
          { front: 'bǎo', back: 'full ( food)' },
          { front: 'yāoqǐng', back: 'invite' },
          { front: 'zuò xiàlái', back: 'sit down' },
          { front: 'zuò', back: 'sit' },
          { front: 'dài', back: 'bring' },
          { front: 'gāodiǎn', back: 'pastry' },
          { front: 'nǎ kěyǐ', back: 'how can' },
          { front: 'duìbùqǐ', back: 'sorry' },
          { front: 'jìdé', back: 'remember' },
          { front: 'xiǎng', back: 'would like to /think' },
          { front: 'dì yī', back: 'first' },
          { front: 'jié', back: 'section, length (measure word of class, sections of an article, etc.)' },
          { front: 'cháng', back: 'long  length)' },
          { front: 'tímù', back: 'topic' },
          { front: 'wàngjì', back: 'forget' },
          { front: 'méiguānxì', back: 'its ok' },
          { front: 'huíyì', back: 'recall/memories' },
          { front: 'yī xià', back: '(used after a verb) give it a go' },
          { front: 'zài yīqǐ', back: 'together /be together' },
          { front: 'lǚyóu', back: 'travel /vacation' },
          { front: 'lùshàng', back: 'on the road' },
          { front: 'suǒyǐ', back: 'therefore;so' },
          { front: 'zhàogù', back: 'take care' },
          { front: 'qíshí', back: 'actually' },
          { front: 'yǐjīng', back: 'already' },
          { front: 'nà jiù hǎo', back: "that's good" },
          { front: 'xiǎngniàn', back: 'miss someone/ something' },
          { front: 'qǐchuáng', back: 'wake up' },
          { front: 'qǐ', back: 'to rise' },
          { front: 'chuáng', back: 'bed' },
          { front: 'měitiān', back: 'everyday' },
          { front: 'dàgài', back: 'roughly; probably;  approximate;' },
          { front: 'xiān', back: 'first' },
          { front: 'shuāyá', back: 'brush teeth' },
          { front: 'xǐliǎn', back: 'wash face' },
          { front: 'ránhòu', back: 'after; then (afterwards); after that; afterwards' },
          { front: 'yùndòng', back: 'exercise' },
          { front: 'duàn liàn', back: 'to engage in physical exercise; to work out' },
          { front: 'duō', back: 'Used in interrogative sentences to inquire about degree or quantity, it is equivalent to "how much".' },
          { front: 'zhǐ', back: 'only' },
          { front: 'zuǒyòu', back: 'around;about' },
          { front: 'yīdìng', back: 'must' },
          { front: 'jiànkāng', back: 'healthy' },
          { front: 'bàngwǎn', back: 'at dusk' },
          { front: 'wǎn', back: 'late' },
          { front: 'lèi', back: 'tired' },
          { front: 'yǎn shuì', back: 'sleepy' },
          { front: 'xiūxí', back: 'rest' },
          { front: 'dōngxī', back: 'thing' },
          { front: 'shénme', back: 'anything' },
          { front: 'rènhé', back: 'anything' },
          { front: 'xiǎoshuì', back: 'take a nap' },
          { front: 'yīhuǐ\'er', back: 'a while' },
          { front: 'xǐng', back: 'awake' }
        ],
        apprentice: [
          { front: 'gōnggòng jiàqī', back: 'public holiday' },
          { front: 'gōnggòng', back: 'public' },
          { front: 'jiàqī', back: 'holiday' },
          { front: 'chūqù', back: 'go out' },
          { front: 'chū', back: 'out' },
          { front: 'xiézi', back: 'shoe' },
          { front: 'rènwéi', back: 'think ( to express or hold a certain opinion about a person or thing, or to make a certain judgment)' },
          { front: 'cānguǎn', back: 'food court' },
          { front: 'mǎn', back: 'full' },
          { front: 'shì yī jiān', back: 'fitting room' },
          { front: 'páiduì', back: 'to queue' },
          { front: 'rúguǒ', back: 'if' },
          { front: 'zhèyàng', back: 'like that' },
          { front: 'guǐ', back: 'ghost' },
          { front: 'kāixīn', back: 'happy' },
          { front: 'yǒuqù', back: 'interesting' },
          { front: 'cuòguò', back: 'miss' },
          { front: 'guò', back: 'past' },
          { front: 'yùbào', back: 'forecast' },
          { front: 'qíngtiān', back: 'sunny' },
          { front: 'fēng', back: 'wind' },
          { front: 'wēndù', back: 'temperature' },
          { front: 'xiàtiān', back: 'summer' },
          { front: 'guòqù', back: 'past' },
          { front: 'qiūtiān', back: 'autumn' },
          { front: 'wéifēng', back: 'breeze' },
          { front: 'kōngqì', back: 'air' },
          { front: 'bàng', back: 'great' },
          { front: 'yèzǐ', back: 'leaf' },
          { front: 'gèng', back: 'more' },
          { front: 'zǎo', back: 'early' },
          { front: 'yībān', back: 'generally' },
          { front: 'cái', back: 'then only' },
          { front: 'děng', back: 'wait' },
          { front: 'zài', back: 'again' },
          { front: 'yīcì', back: 'one time' },
          { front: 'niánjí', back: 'grade' },
          { front: 'kèshì', back: 'classroom' },
          { front: 'jìnxíng', back: 'conduct' },
          { front: 'jǐ', back: 'few' },
          { front: 'línjū', back: 'neighbour' },
          { front: 'cóng', back: 'from' },
          { front: 'bìxū', back: 'must be' },
          { front: 'dài', back: 'to put on or wear (glasses, hat, gloves etc)' },
          { front: 'diàn chí', back: 'battery' },
          { front: 'chū mén', back: 'to go out; to leave home; to go on a journey;' },
          { front: 'chōngdiàn', back: 'to recharge (a battery)' },
          { front: 'bié', back: 'do not; must not' },
          { front: 'dānxīn', back: 'worried ; anxious' },
          { front: 'shàng cì', back: 'last time' },
          { front: 'xià cì', back: 'next time' },
          { front: 'màn', back: 'slow' },
          { front: 'zhěnggè', back: 'whole' },
          { front: 'shàngwǎng', back: 'go online' },
          { front: 'zhǎo', back: 'find/search' },
          { front: 'pángbiān', back: 'beside' },
          { front: 'cāntīng', back: 'fine dining restaurant' },
          { front: 'fúwùyuán', back: 'waiter' },
          { front: 'fúwù', back: 'service' },
          { front: 'gàosù', back: 'tell' },
          { front: 'zhékòu', back: 'discount' },
          { front: 'yǐqián', back: 'back then' },
          { front: 'dǎsuàn', back: 'plan;decision' },
          { front: 'jìhuà', back: 'plan' },
          { front: 'kěnéng', back: 'maybe' },
          { front: 'yǔ', back: 'with' },
          { front: 'guīmì', back: 'best friend (girl)' },
          { front: 'zhàopiàn', back: 'picture' },
          { front: 'zhe', back: '(-ing)' },
          { front: 'xiǎngshòu', back: 'enjoy' }
        ],
        adept: [],
        virtuoso: [],
        maestro: []
      },
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
      // Skip service worker registration on localhost during development
      const isLocalHost = (location.hostname === 'localhost' || location.hostname === '127.0.0.1');
      const forceSW = (new URLSearchParams(location.search).get('forceSW') === '1') || (localStorage.getItem('forceSW') === '1');
      if (isLocalHost && !forceSW) {
        console.log('Skipping service worker registration on local development host');
        console.log('To force registration for testing, add ?forceSW=1 to the URL or run in console: localStorage.setItem("forceSW","1")');
        return;
      }
      if (isLocalHost && forceSW) {
        console.log('Force-registering service worker on local host (forceSW enabled)');
      }
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
      
      // Install button logic removed
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
