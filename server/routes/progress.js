const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Progress = require('../models/Progress');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/progress
 * @desc    Save quiz or test score
 * @access  Private
 */
router.post('/', protect, [
  body('type').isIn(['quiz', 'test']).withMessage('Type must be quiz or test'),
  body('language').notEmpty().withMessage('Language is required'),
  body('level').isIn(['newbie', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'sjkc']).withMessage('Invalid level'),
  body('score').isInt({ min: 0 }).withMessage('Score must be a positive number'),
  body('total').isInt({ min: 1 }).withMessage('Total must be greater than 0'),
  body('timeSpent').optional().isInt({ min: 0 }).withMessage('Time spent must be positive')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { type, language, level, score, total, timeSpent } = req.body;
    const percentage = Math.round((score / total) * 100);

    const progress = await Progress.create({
      userId: req.user._id,
      type,
      language,
      level,
      score,
      total,
      percentage,
      timeSpent: timeSpent || 0
    });

    res.status(201).json({
      success: true,
      message: 'Progress saved successfully',
      data: progress
    });
  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error saving progress' 
    });
  }
});

/**
 * @route   GET /api/progress
 * @desc    Get all progress for current user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const { type, language, level, limit } = req.query;
    
    const query = { userId: req.user._id };
    if (type) query.type = type;
    if (language) query.language = language;
    if (level) query.level = level;

    const progress = await Progress.find(query)
      .sort({ completedAt: -1 })
      .limit(limit ? parseInt(limit) : 100);

    res.json({
      success: true,
      count: progress.length,
      data: progress
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching progress' 
    });
  }
});

/**
 * @route   GET /api/progress/stats
 * @desc    Get statistics for current user
 * @access  Private
 */
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all progress records
    const allProgress = await Progress.find({ userId });

    // Calculate statistics
    const stats = {
      totalTests: 0,
      totalQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
      totalTimeSpent: 0,
      byLevel: {},
      recentActivity: []
    };

    const testScores = [];
    const quizScores = [];

    allProgress.forEach(item => {
      if (item.type === 'test') {
        stats.totalTests++;
        testScores.push(item.percentage);
      } else {
        stats.totalQuizzes++;
        quizScores.push(item.percentage);
      }

      stats.totalTimeSpent += item.timeSpent;
      stats.bestScore = Math.max(stats.bestScore, item.percentage);

      // By level
      const levelKey = `${item.language}_${item.level}`;
      if (!stats.byLevel[levelKey]) {
        stats.byLevel[levelKey] = {
          language: item.language,
          level: item.level,
          tests: 0,
          quizzes: 0,
          bestScore: 0,
          averageScore: 0,
          scores: []
        };
      }

      stats.byLevel[levelKey][item.type === 'test' ? 'tests' : 'quizzes']++;
      stats.byLevel[levelKey].bestScore = Math.max(stats.byLevel[levelKey].bestScore, item.percentage);
      stats.byLevel[levelKey].scores.push(item.percentage);
    });

    // Calculate averages for each level
    Object.values(stats.byLevel).forEach(level => {
      level.averageScore = Math.round(
        level.scores.reduce((a, b) => a + b, 0) / level.scores.length
      );
      delete level.scores; // Remove raw scores from response
    });

    // Overall average
    const allScores = [...testScores, ...quizScores];
    if (allScores.length > 0) {
      stats.averageScore = Math.round(
        allScores.reduce((a, b) => a + b, 0) / allScores.length
      );
    }

    // Recent activity (last 10)
    stats.recentActivity = await Progress.find({ userId })
      .sort({ completedAt: -1 })
      .limit(10)
      .select('type language level score total percentage completedAt');

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error calculating statistics' 
    });
  }
});

/**
 * @route   GET /api/progress/streak
 * @desc    Get study streak information
 * @access  Private
 */
router.get('/streak', protect, async (req, res) => {
  try {
    const streak = await Progress.getStreak(req.user._id);
    
    res.json({
      success: true,
      data: streak
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error calculating streak' 
    });
  }
});

module.exports = router;
