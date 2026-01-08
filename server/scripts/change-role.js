/**
 * Script to change a user's role
 * Usage: node scripts/change-role.js
 */

const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function changeUserRole() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Get user email
    const email = await question('Enter user email: ');
    
    if (!email) {
      console.error('❌ Email is required!');
      process.exit(1);
    }

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
      process.exit(1);
    }

    console.log('\n=== Current User ===');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Current Role:', user.role);
    console.log('');

    // Get new role
    const newRole = await question('Enter new role (student/tutor): ');
    
    if (!['student', 'tutor'].includes(newRole)) {
      console.error('❌ Invalid role! Must be "student" or "tutor"');
      process.exit(1);
    }

    if (user.role === newRole) {
      console.log(`⚠️ User already has role: ${newRole}`);
      process.exit(0);
    }

    // Confirm change
    const confirm = await question(`\nChange ${user.name}'s role from "${user.role}" to "${newRole}"? (yes/no): `);
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Operation cancelled');
      process.exit(0);
    }

    // Update role
    user.role = newRole;
    await user.save();

    console.log('\n✅ Role updated successfully!');
    console.log('───────────────────────────────');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('New Role:', user.role);
    console.log('───────────────────────────────');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    process.exit(0);
  }
}

changeUserRole();
