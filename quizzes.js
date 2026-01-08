/**
 * Quiz and Exercise Handler
 * Handles user interactions for quizzes and practice exercises
 */

/**
 * Switch between Quiz and Exercise tabs
 * @param {string} tabName - The tab to show ('quizzes' or 'exercises')
 */
function switchTab(tabName) {
  // legacy: kept for in-page tabs if used elsewhere
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(tab => tab.classList.remove('active'));
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  const el = document.getElementById(tabName);
  if (el) el.classList.add('active');
}

/**
 * Check multiple choice quiz answers
 * @param {number} quizNumber - The quiz ID
 * @param {string} answer - 'right' or 'wrong'
 */
/**
 * Level-aware checkAnswer
 * @param {string} level - 'beginner'|'intermediate'|'expert'
 * @param {number} quizNumber
 * @param {string} answer - 'right'|'wrong'
 */
function checkAnswer(level, quizNumber, answer) {
  const id = `result-${level}-${quizNumber}`;
  const resultElement = document.getElementById(id);
  if (!resultElement) return;
  if (answer === 'right') {
    resultElement.textContent = '✅ Correct! Great job!';
    resultElement.className = 'feedback success';
  } else {
    resultElement.textContent = '❌ Not quite right. Try again!';
    resultElement.className = 'feedback error';
  }
}

/**
 * Check text-based exercise answers
 * @param {number} exerciseNumber - The exercise ID
 * @param {string} correctAnswer - The correct answer
 */


/**
 * Normalize answers for comparison.
 * - lowercases
 * - removes pinyin diacritics (unicode combining marks)
 * - removes tone numbers
 * - removes whitespace
 */
function normalizeAnswer(str) {
  if (typeof str !== 'string') return String(str);
  let s = str.trim().toLowerCase();
  // Remove diacritics (e.g., nǐ -> ni)
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  // remove digits (tone numbers) and whitespace
  s = s.replace(/[0-9]/g, '').replace(/\s+/g, '');
  return s;
}

/**
 * Check text-based exercise answers (supports single string or array of acceptable answers)
 * @param {number} exerciseNumber
 * @param {string|Array<string>} correctAnswer
 */
/**
 * Level-aware checkExercise
 * @param {string} level
 * @param {number} exerciseNumber
 * @param {string|Array<string>} correctAnswer
 */
function checkExercise(level, exerciseNumber, correctAnswer) {
  const inputId = `ex-${level}-${exerciseNumber}`;
  const resultId = `ex-result-${level}-${exerciseNumber}`;
  const inputElement = document.getElementById(inputId);
  const resultElement = document.getElementById(resultId);
  if (!inputElement || !resultElement) return;
  const userRaw = inputElement.value.trim();

  if (userRaw === '') {
    resultElement.textContent = '⚠️ Please enter your answer';
    resultElement.className = 'feedback warning';
    return;
  }

  const userAnswer = normalizeAnswer(userRaw);
  const correctList = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
  const normalizedCorrects = correctList.map(c => normalizeAnswer(String(c)));
  const isCorrect = normalizedCorrects.some(c => c === userAnswer || c === normalizeAnswer(String(userRaw)));

  if (isCorrect) {
    resultElement.textContent = '✅ Correct! Well done!';
    resultElement.className = 'feedback success';
  } else {
    const display = Array.isArray(correctAnswer) ? correctAnswer.join(' or ') : correctAnswer;
    resultElement.textContent = `❌ Not quite. The answer could be: ${display}`;
    resultElement.className = 'feedback error';
  }
}

/**
 * Switch visible quiz level on quizzes.html
 */
function switchQuizLevel(level) {
  const sections = document.querySelectorAll('.quiz-levels .level-section');
  sections.forEach(s => s.classList.toggle('active', s.dataset.level === level));
  const buttons = document.querySelectorAll('.level-tabs .level-btn');
  buttons.forEach(b => b.classList.toggle('active', b.textContent.toLowerCase() === level));
}

/**
 * Switch visible exercise level on exercises.html
 */
function switchExerciseLevel(level) {
  const sections = document.querySelectorAll('.exercise-levels .level-section');
  sections.forEach(s => s.classList.toggle('active', s.dataset.level === level));
  const buttons = document.querySelectorAll('.level-tabs .level-btn');
  buttons.forEach(b => b.classList.toggle('active', b.textContent.toLowerCase() === level));
}

/**
 * Filter quizzes by language on quizzes.html
 */
function filterQuizByLanguage(lang) {
  const cards = document.querySelectorAll('.quiz-levels .card');
  cards.forEach(card => {
    if (lang === 'all' || card.dataset.language === lang) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
  const buttons = document.querySelectorAll('.language-filter .lang-btn');
  buttons.forEach(b => b.classList.toggle('active', b.textContent.toLowerCase() === lang || (lang === 'all' && b.textContent === 'All Languages')));
}

/**
 * Filter exercises by language on exercises.html
 */
function filterExerciseByLanguage(lang) {
  const cards = document.querySelectorAll('.exercise-levels .card');
  cards.forEach(card => {
    if (lang === 'all' || card.dataset.language === lang) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
  const buttons = document.querySelectorAll('.language-filter .lang-btn');
  buttons.forEach(b => b.classList.toggle('active', b.textContent.toLowerCase() === lang || (lang === 'all' && b.textContent === 'All Languages')));
}
