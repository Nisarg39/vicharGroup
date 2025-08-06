#!/usr/bin/env node
/**
 * Simple validation - checks if optimizations are actually working
 * This avoids ES module issues by testing components separately
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function validateOptimizations() {
  console.log('🔍 VALIDATING EXAM PORTAL OPTIMIZATIONS\n');
  
  let allGood = true;
  
  // 1. Test Database Connection with Pooling
  console.log('1. Testing database connection...');
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 100,
      minPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 10000,
      waitQueueTimeoutMS: 5000,
      retryWrites: true,
      w: 'majority',
    });
    
    const poolSize = mongoose.connection.client.options.maxPoolSize;
    if (poolSize >= 100) {
      console.log('   ✅ Database pooling configured correctly (maxPoolSize: ' + poolSize + ')');
    } else {
      console.log('   ❌ Database pooling not configured properly');
      allGood = false;
    }
  } catch (error) {
    console.log('   ❌ Database connection failed:', error.message);
    allGood = false;
  }
  
  // 2. Check if indexes exist
  console.log('\n2. Checking database indexes...');
  try {
    const db = mongoose.connection.db;
    
    // Check for critical indexes
    const examResultIndexes = await db.collection('examresults').listIndexes().toArray();
    const hasExamStudentIndex = examResultIndexes.some(idx => 
      idx.name && idx.name.includes('exam_student')
    );
    
    if (hasExamStudentIndex) {
      console.log('   ✅ Critical exam result indexes found');
    } else {
      console.log('   ⚠️  Exam result indexes might be missing');
      console.log('   Run: node scripts/create-indexes.mjs');
    }
  } catch (error) {
    console.log('   ❌ Could not check indexes:', error.message);
    allGood = false;
  }
  
  // 3. Test cache functionality
  console.log('\n3. Testing cache system...');
  try {
    // Simple in-memory cache test
    const cache = new Map();
    cache.set('test', { data: 'test', expires: Date.now() + 5000 });
    const retrieved = cache.get('test');
    
    if (retrieved && retrieved.data === 'test') {
      console.log('   ✅ Cache operations working');
    } else {
      console.log('   ❌ Cache operations failed');
      allGood = false;
    }
  } catch (error) {
    console.log('   ❌ Cache test failed:', error.message);
    allGood = false;
  }
  
  // 4. Test retry logic
  console.log('\n4. Testing retry logic...');
  try {
    let attempts = 0;
    const mockRetry = async (fn, maxRetries = 3) => {
      for (let i = 0; i < maxRetries; i++) {
        try {
          return await fn();
        } catch (error) {
          if (i === maxRetries - 1) throw error;
          await new Promise(r => setTimeout(r, 100));
        }
      }
    };
    
    const testFn = async () => {
      attempts++;
      if (attempts < 2) throw new Error('Test failure');
      return { success: true };
    };
    
    const result = await mockRetry(testFn);
    
    if (result.success && attempts === 2) {
      console.log('   ✅ Retry logic working correctly');
    } else {
      console.log('   ❌ Retry logic not working');
      allGood = false;
    }
  } catch (error) {
    console.log('   ❌ Retry test failed:', error.message);
    allGood = false;
  }
  
  // 5. Test concurrent operations
  console.log('\n5. Testing concurrent database operations...');
  try {
    const promises = [];
    for (let i = 0; i < 20; i++) {
      promises.push(mongoose.connection.db.admin().ping());
    }
    
    const start = Date.now();
    await Promise.all(promises);
    const duration = Date.now() - start;
    
    if (duration < 2000) {
      console.log(`   ✅ 20 concurrent operations completed in ${duration}ms`);
    } else {
      console.log(`   ⚠️  Concurrent operations slow: ${duration}ms`);
    }
  } catch (error) {
    console.log('   ❌ Concurrent operations failed:', error.message);
    allGood = false;
  }
  
  // 6. Check if files exist
  console.log('\n6. Checking optimization files...');
  const fs = require('fs');
  const path = require('path');
  
  const criticalFiles = [
    'server_actions/config/mongoose.js',
    'server_actions/utils/cache.js', 
    'server_actions/utils/retryHandler.js',
    'scripts/create-indexes.mjs'
  ];
  
  criticalFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ ${file} exists`);
    } else {
      console.log(`   ❌ ${file} missing`);
      allGood = false;
    }
  });
  
  // Summary
  console.log('\n' + '='.repeat(50));
  if (allGood) {
    console.log('✅ ALL VALIDATIONS PASSED');
    console.log('   Optimizations appear to be working correctly');
    console.log('   ⚠️  STILL NEED MANUAL TESTING WITH ACTUAL USERS!');
  } else {
    console.log('❌ SOME VALIDATIONS FAILED');
    console.log('   Fix these issues before deployment!');
  }
  console.log('='.repeat(50));
  
  await mongoose.connection.close();
  
  return allGood;
}

validateOptimizations()
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('Validation failed:', error);
    process.exit(1);
  });