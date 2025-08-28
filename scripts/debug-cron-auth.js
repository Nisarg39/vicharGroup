#!/usr/bin/env node

/**
 * DEBUG SCRIPT: Vercel Cron Authentication Analysis
 * 
 * This script helps debug cron authentication issues by:
 * 1. Testing environment variable access
 * 2. Simulating authentication header checks
 * 3. Providing debugging information for production issues
 */

import { NextRequest } from 'next/server';

console.log('🔍 Vercel Cron Authentication Debug Analysis');
console.log('='.repeat(50));

// 1. Environment Variable Analysis
console.log('\n📋 Environment Variable Analysis:');
console.log('-'.repeat(30));

const envVars = {
  'VERCEL_CRON_SECRET': process.env.VERCEL_CRON_SECRET,
  'CRON_SECRET': process.env.CRON_SECRET,
  'NODE_ENV': process.env.NODE_ENV,
  'VERCEL': process.env.VERCEL,
  'VERCEL_ENV': process.env.VERCEL_ENV
};

Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${'*'.repeat(Math.min(value.length, 8))} (length: ${value.length})`);
  } else {
    console.log(`❌ ${key}: NOT SET`);
  }
});

// 2. Expected Authentication Format Analysis
console.log('\n🔐 Authentication Format Analysis:');
console.log('-'.repeat(35));

const secrets = {
  'VERCEL_CRON_SECRET': process.env.VERCEL_CRON_SECRET,
  'CRON_SECRET': process.env.CRON_SECRET
};

Object.entries(secrets).forEach(([varName, secret]) => {
  if (secret) {
    console.log(`\n${varName}:`);
    console.log(`  Raw value length: ${secret.length}`);
    console.log(`  Expected header: "Authorization: Bearer ${secret}"`);
    console.log(`  Header comparison: authHeader === "Bearer ${secret}"`);
  }
});

// 3. Common Authentication Issues
console.log('\n⚠️  Common Authentication Issues:');
console.log('-'.repeat(32));
console.log('1. Environment Variable Name Mismatch:');
console.log('   - Vercel docs suggest CRON_SECRET');
console.log('   - Your code uses VERCEL_CRON_SECRET');
console.log('   - Solution: Try both variable names');
console.log('');
console.log('2. Header Format Issues:');
console.log('   - Expected: "Bearer <secret>"');
console.log('   - Common issue: Extra spaces or different case');
console.log('   - Solution: Trim and normalize header values');
console.log('');
console.log('3. Production vs Development:');
console.log('   - Vercel only sends headers in production');
console.log('   - Local testing may not include auth headers');
console.log('   - Solution: Test in production environment');

// 4. Authentication Check Function (for testing)
function simulateAuthCheck(authHeader, secret, varName) {
  console.log(`\n🧪 Simulating Auth Check for ${varName}:`);
  console.log(`  Auth Header: "${authHeader || 'null'}"`);
  console.log(`  Secret: "${secret || 'null'}"`);
  
  if (!secret) {
    console.log(`  ❌ Result: FAIL - ${varName} not set`);
    return false;
  }
  
  if (!authHeader) {
    console.log('  ❌ Result: FAIL - Auth header missing');
    return false;
  }
  
  const expectedHeader = `Bearer ${secret}`;
  const matches = authHeader === expectedHeader;
  
  console.log(`  Expected: "${expectedHeader}"`);
  console.log(`  Received: "${authHeader}"`);
  console.log(`  Match: ${matches ? '✅ YES' : '❌ NO'}`);
  
  if (!matches) {
    // Detailed mismatch analysis
    console.log('  🔍 Mismatch Analysis:');
    if (authHeader.length !== expectedHeader.length) {
      console.log(`    - Length diff: expected ${expectedHeader.length}, got ${authHeader.length}`);
    }
    if (!authHeader.startsWith('Bearer ')) {
      console.log(`    - Missing "Bearer " prefix`);
    }
    const receivedToken = authHeader.replace('Bearer ', '');
    if (receivedToken !== secret) {
      console.log(`    - Token mismatch: expected "${secret}", got "${receivedToken}"`);
    }
  }
  
  return matches;
}

// 5. Test Scenarios
console.log('\n🔬 Test Scenarios:');
console.log('-'.repeat(18));

// Scenario 1: VERCEL_CRON_SECRET with proper header
if (process.env.VERCEL_CRON_SECRET) {
  const testHeader1 = `Bearer ${process.env.VERCEL_CRON_SECRET}`;
  simulateAuthCheck(testHeader1, process.env.VERCEL_CRON_SECRET, 'VERCEL_CRON_SECRET');
}

// Scenario 2: CRON_SECRET (alternative)
if (process.env.CRON_SECRET) {
  const testHeader2 = `Bearer ${process.env.CRON_SECRET}`;
  simulateAuthCheck(testHeader2, process.env.CRON_SECRET, 'CRON_SECRET');
}

// Scenario 3: Missing header
simulateAuthCheck(null, process.env.VERCEL_CRON_SECRET, 'VERCEL_CRON_SECRET');

// Scenario 4: Malformed header
simulateAuthCheck('Bearer', process.env.VERCEL_CRON_SECRET, 'VERCEL_CRON_SECRET');

// 6. Recommended Solutions
console.log('\n💡 Recommended Solutions:');
console.log('-'.repeat(25));
console.log('1. IMMEDIATE FIX - Dual Variable Support:');
console.log('   Check both CRON_SECRET and VERCEL_CRON_SECRET');
console.log('   const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET;');
console.log('');
console.log('2. ENHANCED LOGGING - Debug Headers:');
console.log('   Log actual header values for production debugging');
console.log('   console.log("Auth header:", authHeader);');
console.log('   console.log("All headers:", Object.fromEntries(request.headers.entries()));');
console.log('');
console.log('3. FALLBACK AUTH - User-Agent Check:');
console.log('   Vercel cron jobs include "vercel-cron/1.0" user-agent');
console.log('   const userAgent = request.headers.get("user-agent");');
console.log('   const isVercelCron = userAgent?.includes("vercel-cron");');
console.log('');
console.log('4. ENVIRONMENT VERIFICATION - Production Check:');
console.log('   Ensure environment variables are set in production');
console.log('   vercel env ls (to list environment variables)');

// 7. Quick Fix Code
console.log('\n🛠️  Quick Fix Code:');
console.log('-'.repeat(17));
console.log(`
// Enhanced authentication check
function authenticateCronRequest(request) {
  const authHeader = request.headers.get('authorization');
  const userAgent = request.headers.get('user-agent');
  
  // Check both possible environment variable names
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET;
  
  // Log for debugging (remove in production)
  console.log('Cron auth debug:', {
    authHeader: authHeader ? 'present' : 'missing',
    userAgent: userAgent || 'missing',
    cronSecretSet: cronSecret ? 'yes' : 'no',
    expectedHeader: cronSecret ? \`Bearer \${cronSecret}\` : 'N/A'
  });
  
  if (!cronSecret) {
    console.error('No cron secret configured (check CRON_SECRET or VERCEL_CRON_SECRET)');
    return false;
  }
  
  // Primary check: Bearer token
  if (authHeader === \`Bearer \${cronSecret}\`) {
    return true;
  }
  
  // Fallback check: Vercel cron user-agent (less secure)
  if (!authHeader && userAgent?.includes('vercel-cron')) {
    console.warn('Authenticated via user-agent fallback');
    return true;
  }
  
  return false;
}
`);

console.log('\n✅ Debug analysis complete. Check the logs above for specific issues.');