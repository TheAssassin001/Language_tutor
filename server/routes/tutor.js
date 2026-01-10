const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Progress = require('../models/Progress');
const { protect, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/tutor/pending-students
 * @desc    Get all students pending approval
 * @access  Private (Tutor only)
 */
router.get('/pending-students', protect, authorize('tutor'), async (req, res) => {
  try {
    const pendingStudents = await User.find({ role: 'student', status: 'pending' })
      .select('name email createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: pendingStudents.length,
      data: pendingStudents
    });
  } catch (error) {
    console.error('Get pending students error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching pending students' 
    });
  }
});

/**
 * @route   PUT /api/tutor/approve-student/:studentId
 * @desc    Approve a pending student
 * @access  Private (Tutor only)
 */
router.put('/approve-student/:studentId', protect, authorize('tutor'), async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ 
        success: false, 
        message: 'User is not a student' 
      });
    }

    student.status = 'active';
    await student.save();

    res.json({
      success: true,
      message: 'Student approved successfully',
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
        status: student.status
      }
    });
  } catch (error) {
    console.error('Approve student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error approving student' 
    });
  }
});

/**
 * @route   PUT /api/tutor/reject-student/:studentId
 * @desc    Reject a pending student
 * @access  Private (Tutor only)
 */
router.put('/reject-student/:studentId', protect, authorize('tutor'), async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ 
        success: false, 
        message: 'User is not a student' 
      });
    }

    student.status = 'rejected';
    await student.save();

    res.json({
      success: true,
      message: 'Student rejected',
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
        status: student.status
      }
    });
  } catch (error) {
    console.error('Reject student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error rejecting student' 
    });
  }
});

/**
 * @route   GET /api/tutor/students
 * @desc    Get all students with basic info
 * @access  Private (Tutor only)
 */
router.get('/students', protect, authorize('tutor'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email createdAt lastActive status')
      .sort({ lastActive: -1 });

    // Get progress count for each student
    const studentsWithProgress = await Promise.all(
      students.map(async (student) => {
        const progressCount = await Progress.countDocuments({ userId: student._id });
        const recentProgress = await Progress.findOne({ userId: student._id })
          .sort({ completedAt: -1 })
          .select('completedAt');

        return {
          id: student._id,
          name: student.name,
          email: student.email,
          createdAt: student.createdAt,
          lastActive: student.lastActive,
          totalActivities: progressCount,
          lastActivity: recentProgress ? recentProgress.completedAt : null
        };
      })
    );

    res.json({
      success: true,
      count: studentsWithProgress.length,
      data: studentsWithProgress
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching students' 
    });
  }
});

/**
 * @route   GET /api/tutor/students/:studentId
 * @desc    Get detailed progress for a specific student
 * @access  Private (Tutor only)
 */
router.get('/students/:studentId', protect, authorize('tutor'), async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId).select('-password');
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ 
        success: false, 
        message: 'User is not a student' 
      });
    }

    // Get all progress
    const allProgress = await Progress.find({ userId: student._id })
      .sort({ completedAt: -1 });

    // Calculate detailed statistics
    const stats = {
      totalTests: 0,
      totalQuizzes: 0,
      averageScore: 0,
      bestScore: 0,
      totalTimeSpent: 0,
      byLevel: {},
      progressOverTime: []
    };

    const allScores = [];

    allProgress.forEach(item => {
      if (item.type === 'test') stats.totalTests++;
      else stats.totalQuizzes++;

      stats.totalTimeSpent += item.timeSpent;
      stats.bestScore = Math.max(stats.bestScore, item.percentage);
      allScores.push(item.percentage);

      // By level
      const levelKey = `${item.language}_${item.level}`;
      if (!stats.byLevel[levelKey]) {
        stats.byLevel[levelKey] = {
          language: item.language,
          level: item.level,
          tests: 0,
          quizzes: 0,
          bestScore: 0,
          scores: []
        };
      }

      stats.byLevel[levelKey][item.type === 'test' ? 'tests' : 'quizzes']++;
      stats.byLevel[levelKey].bestScore = Math.max(stats.byLevel[levelKey].bestScore, item.percentage);
      stats.byLevel[levelKey].scores.push(item.percentage);
    });

    // Calculate averages
    Object.values(stats.byLevel).forEach(level => {
      level.averageScore = Math.round(
        level.scores.reduce((a, b) => a + b, 0) / level.scores.length
      );
      delete level.scores;
    });

    if (allScores.length > 0) {
      stats.averageScore = Math.round(
        allScores.reduce((a, b) => a + b, 0) / allScores.length
      );
    }

    // Get streak
    const streak = await Progress.getStreak(student._id);

    // Progress over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    stats.progressOverTime = await Progress.find({ 
      userId: student._id,
      completedAt: { $gte: thirtyDaysAgo }
    })
    .sort({ completedAt: 1 })
    .select('type level percentage completedAt');

    res.json({
      success: true,
      data: {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          createdAt: student.createdAt,
          lastActive: student.lastActive
        },
        statistics: stats,
        streak: streak,
        recentActivity: allProgress.slice(0, 20) // Last 20 activities
      }
    });
  } catch (error) {
    console.error('Get student detail error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching student details' 
    });
  }
});

/**
 * @route   GET /api/tutor/analytics
 * @desc    Get overall analytics for all students
 * @access  Private (Tutor only)
 */
router.get('/analytics', protect, authorize('tutor'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalProgress = await Progress.countDocuments();
    
    // Active students (activity in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeStudents = await Progress.distinct('userId', {
      completedAt: { $gte: sevenDaysAgo }
    });

    // Average scores across all students
    const avgScores = await Progress.aggregate([
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$percentage' },
          averageTestScore: { 
            $avg: { $cond: [{ $eq: ['$type', 'test'] }, '$percentage', null] }
          },
          averageQuizScore: { 
            $avg: { $cond: [{ $eq: ['$type', 'quiz'] }, '$percentage', null] }
          }
        }
      }
    ]);

    // Most popular levels
    const popularLevels = await Progress.aggregate([
      {
        $group: {
          _id: { language: '$language', level: '$level' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        activeStudents: activeStudents.length,
        totalActivities: totalProgress,
        averageScore: avgScores[0] ? Math.round(avgScores[0].averageScore) : 0,
        averageTestScore: avgScores[0] ? Math.round(avgScores[0].averageTestScore) : 0,
        averageQuizScore: avgScores[0] ? Math.round(avgScores[0].averageQuizScore) : 0,
        popularLevels: popularLevels.map(l => ({
          language: l._id.language,
          level: l._id.level,
          activities: l.count
        }))
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching analytics' 
    });
  }
});

/**
 * @route   DELETE /api/tutor/students/:studentId/reset-progress
 * @desc    Reset (delete) all progress for a specific student
 * @access  Private (Tutor only)
 */
router.delete('/students/:studentId/reset-progress', protect, authorize('tutor'), async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot reset progress for non-student users' 
      });
    }

    // Delete all progress for this student
    const result = await Progress.deleteMany({ userId: student._id });

    console.log(`✓ Tutor ${req.user.name} reset progress for student ${student.name} (${result.deletedCount} records deleted)`);

    res.json({
      success: true,
      message: `Progress reset for ${student.name}`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Reset progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error resetting student progress' 
    });
  }
});

/**
 * @route   DELETE /api/tutor/students/:studentId
 * @desc    Delete a student account and all their progress
 * @access  Private (Tutor only)
 */
router.delete('/students/:studentId', protect, authorize('tutor'), async (req, res) => {
  try {
    const student = await User.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    if (student.role !== 'student') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete non-student users' 
      });
    }

    // Delete all progress first
    const progressResult = await Progress.deleteMany({ userId: student._id });

    // Delete the user
    await User.findByIdAndDelete(student._id);

    console.log(`✓ Tutor ${req.user.name} deleted student ${student.name} (${progressResult.deletedCount} progress records deleted)`);

    res.json({
      success: true,
      message: `Student ${student.name} deleted successfully`,
      progressDeleted: progressResult.deletedCount
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting student' 
    });
  }
});

module.exports = router;
