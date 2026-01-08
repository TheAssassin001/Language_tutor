const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['quiz', 'test'],
    required: true
  },
  language: {
    type: String,
    required: true,
    default: 'mandarin'
  },
  level: {
    type: String,
    required: true,
    enum: ['newbie', 'level1', 'level2', 'level3', 'level4', 'level5', 'level6', 'sjkc']
  },
  score: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  }
});

// Index for faster queries
progressSchema.index({ userId: 1, completedAt: -1 });
progressSchema.index({ userId: 1, type: 1, language: 1, level: 1 });

// Static method to get user statistics
progressSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgScore: { $avg: '$percentage' },
        bestScore: { $max: '$percentage' },
        totalTimeSpent: { $sum: '$timeSpent' }
      }
    }
  ]);

  return stats;
};

// Static method to get streak information
progressSchema.statics.getStreak = async function(userId) {
  const activities = await this.find({ userId })
    .sort({ completedAt: -1 })
    .select('completedAt')
    .lean();

  if (activities.length === 0) {
    return { current: 0, best: 0 };
  }

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 1;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = new Date(activities[0].completedAt);
  lastActivity.setHours(0, 0, 0, 0);
  
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  // Check if streak is still active (today or yesterday)
  if (daysDiff <= 1) {
    currentStreak = 1;
    
    // Count consecutive days
    for (let i = 1; i < activities.length; i++) {
      const prevDate = new Date(activities[i - 1].completedAt);
      prevDate.setHours(0, 0, 0, 0);
      const currDate = new Date(activities[i].completedAt);
      currDate.setHours(0, 0, 0, 0);
      
      const diff = Math.floor((prevDate - currDate) / (1000 * 60 * 60 * 24));
      
      if (diff === 1) {
        currentStreak++;
        tempStreak++;
      } else if (diff === 0) {
        // Same day, continue
        tempStreak++;
      } else {
        bestStreak = Math.max(bestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }
  
  bestStreak = Math.max(bestStreak, currentStreak, tempStreak);
  
  return { current: currentStreak, best: bestStreak };
};

module.exports = mongoose.model('Progress', progressSchema);
