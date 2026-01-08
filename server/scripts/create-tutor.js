/**
 * Script to create a tutor account
 * Usage: node scripts/create-tutor.js
 */

const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

// Import User model
const User = require('../models/User');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createTutor() {
  try {
    // Connect to database
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Get tutor details
    console.log('\n=== Create Tutor Account ===\n');
    
    const name = await question('Tutor Name: ');
    const email = await question('Tutor Email: ');
    const password = await question('Password (min 6 characters): ');

    // Validate inputs
    if (!name || !email || !password) {
      console.error('❌ All fields are required!');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('❌ Password must be at least 6 characters!');
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error(`❌ User with email ${email} already exists!`);
      process.exit(1);
    }

    // Create tutor
    const tutor = await User.create({
      name,
      email,
      password, // Will be hashed by the User model pre-save hook
      role: 'tutor'
    });

    console.log('\n✅ Tutor account created successfully!');
    console.log('\nAccount Details:');
    console.log('───────────────────────────────');
    console.log('Name:', tutor.name);
    console.log('Email:', tutor.email);
    console.log('Role:', tutor.role);
    console.log('ID:', tutor._id);
    console.log('───────────────────────────────');
    console.log('\nThe tutor can now login at:');
    console.log('https://language-tutor-lyhk.vercel.app/login.html');

  } catch (error) {
    console.error('❌ Error creating tutor:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
    process.exit(0);
  }
}

createTutor();
