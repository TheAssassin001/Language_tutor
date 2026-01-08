/**
 * Script to list all users and their roles
 * Usage: node scripts/list-users.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function listUsers() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const users = await User.find({}).select('name email role createdAt').sort({ createdAt: -1 });

    console.log('=== ALL USERS ===\n');
    console.log(`Total Users: ${users.length}\n`);

    if (users.length === 0) {
      console.log('No users found.');
    } else {
      users.forEach((user, index) => {
        const roleIcon = user.role === 'tutor' ? '👨‍🏫' : '👨‍🎓';
        console.log(`${index + 1}. ${roleIcon} ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${new Date(user.createdAt).toLocaleDateString()}`);
        console.log(`   ID: ${user._id}`);
        console.log('');
      });

      const tutorCount = users.filter(u => u.role === 'tutor').length;
      const studentCount = users.filter(u => u.role === 'student').length;
      
      console.log('───────────────────────────────');
      console.log(`👨‍🏫 Tutors: ${tutorCount}`);
      console.log(`👨‍🎓 Students: ${studentCount}`);
      console.log('───────────────────────────────');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

listUsers();
