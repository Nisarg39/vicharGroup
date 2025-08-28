#!/usr/bin/env node

/**
 * ENVIRONMENT VARIABLES DEBUG SCRIPT
 * 
 * This script tests environment variable loading in different contexts
 * to identify why MONGODB_URI is undefined in server actions.
 */

console.log('🔍 DEBUGGING ENVIRONMENT VARIABLES...\n');

// Test 1: Check if environment variables are loaded
console.log('1. Environment Variables Status:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI || 'UNDEFINED'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET || 'UNDEFINED'}`);
console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'UNDEFINED'}`);
console.log(`   CRON_SECRET: ${process.env.CRON_SECRET || 'UNDEFINED'}`);
console.log('');

// Test 2: Check if we can load dotenv manually
console.log('2. Attempting to load .env.local manually...');
try {
  // Try loading dotenv
  const dotenv = await import('dotenv');
  const path = await import('path');
  
  const envPath = path.join(process.cwd(), '.env.local');
  console.log(`   Loading from: ${envPath}`);
  
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.log(`   ❌ Error loading .env.local: ${result.error.message}`);
  } else {
    console.log('   ✅ .env.local loaded successfully');
    console.log(`   MONGODB_URI after manual load: ${process.env.MONGODB_URI || 'STILL UNDEFINED'}`);
  }
} catch (error) {
  console.log(`   ❌ Failed to load dotenv: ${error.message}`);
}
console.log('');

// Test 3: Show all environment variables that start with certain prefixes
console.log('3. Relevant Environment Variables:');
const relevantKeys = Object.keys(process.env).filter(key => 
  key.includes('MONGO') || 
  key.includes('DATABASE') || 
  key.includes('JWT') ||
  key.includes('NEXTAUTH') ||
  key.includes('NODE_ENV') ||
  key.includes('CRON')
);

if (relevantKeys.length > 0) {
  relevantKeys.forEach(key => {
    console.log(`   ${key}: ${process.env[key]}`);
  });
} else {
  console.log('   ❌ No relevant environment variables found');
}
console.log('');

// Test 4: Check if we're in a Next.js context
console.log('4. Execution Context:');
console.log(`   Current working directory: ${process.cwd()}`);
console.log(`   Script directory: ${import.meta.url}`);
console.log(`   Process arguments: ${process.argv.slice(2).join(', ') || 'none'}`);
console.log('');

// Test 5: Manual environment variable setting test
console.log('5. Testing Manual Environment Variable Setting:');
process.env.TEST_VARIABLE = 'test_value';
console.log(`   TEST_VARIABLE: ${process.env.TEST_VARIABLE}`);
console.log('');

console.log('✅ Environment debug complete');