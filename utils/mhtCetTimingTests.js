/**
 * Comprehensive Test Suite for MHT-CET Subject Locking Fix
 * Tests both getSubjectUnlockSchedule() and shouldUnlockSubjects() functions
 * Validates all edge cases and scenarios identified in the analysis
 */

import { getSubjectUnlockSchedule } from './examDurationHelpers.js';
import { shouldUnlockSubjects } from './examTimingUtils.js';

// Test data setup
const createMHTCETExam = (examAvailability = 'practice', startTime = null, endTime = null, duration = 180) => ({
  _id: 'test-exam-id',
  stream: 'MHT-CET',
  examAvailability,
  startTime,
  endTime,
  examDurationMinutes: duration
});

const createNEETExam = () => ({
  _id: 'neet-exam-id',
  stream: 'NEET',
  examAvailability: 'practice',
  examDurationMinutes: 200
});

const createJEEExam = () => ({
  _id: 'jee-exam-id',
  stream: 'JEE Main',
  examAvailability: 'practice',
  examDurationMinutes: 180
});

// Utility functions
const formatTime = (ms) => {
  const minutes = Math.floor(ms / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${minutes}m ${seconds}s`;
};

const logTestResult = (testName, passed, details = '') => {
  console.log(`${passed ? '✅' : '❌'} ${testName} ${details}`);
};

// Test Suite
export function runMHTCETTimingTests() {
  console.log('\n🧪 MHT-CET SUBJECT LOCKING TESTS - COMPREHENSIVE VALIDATION\n');
  console.log('=' * 80);
  
  let totalTests = 0;
  let passedTests = 0;
  
  const runTest = (testName, testFn) => {
    totalTests++;
    try {
      const result = testFn();
      if (result) {
        passedTests++;
        logTestResult(testName, true);
      } else {
        logTestResult(testName, false, '- FAILED');
      }
    } catch (error) {
      logTestResult(testName, false, `- ERROR: ${error.message}`);
    }
  };

  // ==================== SCHEDULED EXAM TESTS ====================
  console.log('\n🕒 SCHEDULED EXAM TESTS');
  console.log('-'.repeat(50));

  // Test 1: Normal Flow - Student starts on time
  runTest('Scheduled Exam - Normal Flow (On Time Start)', () => {
    const now = new Date();
    const examStart = new Date(now.getTime() - 30 * 60 * 1000); // Started 30 min ago
    const examEnd = new Date(now.getTime() + 150 * 60 * 1000); // Ends in 150 min
    const studentStart = examStart; // Student started on time
    
    const exam = createMHTCETExam('scheduled', examStart.toISOString(), examEnd.toISOString());
    
    // Test with getSubjectUnlockSchedule (used by ExamInterface)
    const unlockSchedule = getSubjectUnlockSchedule(exam, studentStart);
    
    // Biology and Maths should be locked (150 min > 90 min remaining)
    const biologyLocked = unlockSchedule.subjectAccess?.Biology?.isLocked;
    const mathsLocked = unlockSchedule.subjectAccess?.Maths?.isLocked;
    const physicsLocked = unlockSchedule.subjectAccess?.Physics?.isLocked;
    
    console.log(`    Time remaining: ${formatTime(150 * 60 * 1000)}`);
    console.log(`    Biology locked: ${biologyLocked}, Maths locked: ${mathsLocked}, Physics locked: ${physicsLocked}`);
    
    return biologyLocked === true && mathsLocked === true && physicsLocked === false;
  });

  // Test 2: Unlock Threshold - 90 minutes exactly
  runTest('Scheduled Exam - Unlock at 90min Threshold', () => {
    const now = new Date();
    const examStart = new Date(now.getTime() - 90 * 60 * 1000); // Started 90 min ago
    const examEnd = new Date(now.getTime() + 90 * 60 * 1000); // Ends in exactly 90 min
    const studentStart = examStart;
    
    const exam = createMHTCETExam('scheduled', examStart.toISOString(), examEnd.toISOString());
    const unlockSchedule = getSubjectUnlockSchedule(exam, studentStart);
    
    // Biology and Maths should be unlocked (exactly 90 min remaining)
    const biologyLocked = unlockSchedule.subjectAccess?.Biology?.isLocked;
    const mathsLocked = unlockSchedule.subjectAccess?.Maths?.isLocked;
    
    console.log(`    Time remaining: ${formatTime(90 * 60 * 1000)} (threshold)`);
    console.log(`    Biology locked: ${biologyLocked}, Maths locked: ${mathsLocked}`);
    
    return biologyLocked === false && mathsLocked === false;
  });

  // Test 3: Late Start - Student starts with <90min remaining
  runTest('Scheduled Exam - Late Start (<90min remaining)', () => {
    const now = new Date();
    const examStart = new Date(now.getTime() - 120 * 60 * 1000); // Exam started 120 min ago
    const examEnd = new Date(now.getTime() + 60 * 60 * 1000); // Ends in 60 min
    const studentStart = new Date(now.getTime() - 5 * 60 * 1000); // Student started 5 min ago (late)
    
    const exam = createMHTCETExam('scheduled', examStart.toISOString(), examEnd.toISOString());
    const unlockSchedule = getSubjectUnlockSchedule(exam, studentStart);
    
    // Biology and Maths should be unlocked immediately (60 min < 90 min)
    const biologyLocked = unlockSchedule.subjectAccess?.Biology?.isLocked;
    const mathsLocked = unlockSchedule.subjectAccess?.Maths?.isLocked;
    
    console.log(`    Time remaining: ${formatTime(60 * 60 * 1000)} (late start)`);
    console.log(`    Biology locked: ${biologyLocked}, Maths locked: ${mathsLocked}`);
    
    return biologyLocked === false && mathsLocked === false;
  });

  // Test 4: Cross-midnight exam
  runTest('Scheduled Exam - Cross-midnight Timing', () => {
    const now = new Date();
    // Create an exam that starts before midnight and ends after midnight
    const examStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 0); // 11 PM today
    const examEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 2, 0); // 2 AM tomorrow
    const studentStart = examStart;
    
    // Simulate current time as 1:30 AM (30 min before end)
    const mockNow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 1, 30);
    
    const exam = createMHTCETExam('scheduled', examStart.toISOString(), examEnd.toISOString());
    
    // Mock Date.now() for this test
    const originalNow = Date.now;
    Date.now = () => mockNow.getTime();
    
    const unlockSchedule = getSubjectUnlockSchedule(exam, studentStart);
    
    // Restore Date.now()
    Date.now = originalNow;
    
    // Should be unlocked (30 min < 90 min)
    const biologyLocked = unlockSchedule.subjectAccess?.Biology?.isLocked;
    
    console.log(`    Cross-midnight exam (30min remaining)`);
    console.log(`    Biology locked: ${biologyLocked}`);
    
    return biologyLocked === false;
  });

  // Test 5: Interrupted exam (pause/resume) - should base on end time, not elapsed
  runTest('Scheduled Exam - Interrupted/Resumed', () => {
    const now = new Date();
    const examStart = new Date(now.getTime() - 60 * 60 * 1000); // Exam started 60 min ago
    const examEnd = new Date(now.getTime() + 120 * 60 * 1000); // Ends in 120 min
    const studentStart = new Date(now.getTime() - 30 * 60 * 1000); // Student started 30 min ago (resumed after interruption)
    
    const exam = createMHTCETExam('scheduled', examStart.toISOString(), examEnd.toISOString());
    const unlockSchedule = getSubjectUnlockSchedule(exam, studentStart);
    
    // Should be locked because 120 min > 90 min remaining (ignores student elapsed time)
    const biologyLocked = unlockSchedule.subjectAccess?.Biology?.isLocked;
    
    console.log(`    Time remaining: ${formatTime(120 * 60 * 1000)} (after interruption)`);
    console.log(`    Biology locked: ${biologyLocked}`);
    
    return biologyLocked === true;
  });

  // ==================== PRACTICE EXAM TESTS ====================
  console.log('\n📚 PRACTICE EXAM TESTS');
  console.log('-'.repeat(50));

  // Test 6: Practice exam - Normal flow
  runTest('Practice Exam - Normal Flow (90min elapsed)', () => {
    const now = new Date();
    const studentStart = new Date(now.getTime() - 90 * 60 * 1000); // Started 90 min ago
    
    const exam = createMHTCETExam('practice', null, null, 180);
    const unlockSchedule = getSubjectUnlockSchedule(exam, studentStart);
    
    // Should be unlocked after 90 min elapsed
    const biologyLocked = unlockSchedule.subjectAccess?.Biology?.isLocked;
    
    console.log(`    Time elapsed: ${formatTime(90 * 60 * 1000)}`);
    console.log(`    Biology locked: ${biologyLocked}`);
    
    return biologyLocked === false;
  });

  // Test 7: Practice exam - Before unlock
  runTest('Practice Exam - Before 90min Threshold', () => {
    const now = new Date();
    const studentStart = new Date(now.getTime() - 60 * 60 * 1000); // Started 60 min ago
    
    const exam = createMHTCETExam('practice', null, null, 180);
    const unlockSchedule = getSubjectUnlockSchedule(exam, studentStart);
    
    // Should be locked (60 min < 90 min)
    const biologyLocked = unlockSchedule.subjectAccess?.Biology?.isLocked;
    
    console.log(`    Time elapsed: ${formatTime(60 * 60 * 1000)}`);
    console.log(`    Biology locked: ${biologyLocked}`);
    
    return biologyLocked === true;
  });

  // Test 8: Practice exam - Variable duration (120min total)
  runTest('Practice Exam - Variable Duration (120min)', () => {
    const now = new Date();
    const studentStart = new Date(now.getTime() - 90 * 60 * 1000); // Started 90 min ago
    
    const exam = createMHTCETExam('practice', null, null, 120); // 120 min total
    const unlockSchedule = getSubjectUnlockSchedule(exam, studentStart);
    
    // Should be unlocked after 90 min regardless of total duration
    const biologyLocked = unlockSchedule.subjectAccess?.Biology?.isLocked;
    
    console.log(`    Time elapsed: ${formatTime(90 * 60 * 1000)} (120min exam)`);
    console.log(`    Biology locked: ${biologyLocked}`);
    
    return biologyLocked === false;
  });

  // ==================== EDGE CASE TESTS ====================
  console.log('\n⚠️  EDGE CASE TESTS');
  console.log('-'.repeat(50));

  // Test 9: Exam already ended
  runTest('Edge Case - Exam Already Ended', () => {
    const now = new Date();
    const examStart = new Date(now.getTime() - 200 * 60 * 1000); // Started 200 min ago
    const examEnd = new Date(now.getTime() - 20 * 60 * 1000); // Ended 20 min ago
    const studentStart = examStart;
    
    const exam = createMHTCETExam('scheduled', examStart.toISOString(), examEnd.toISOString());
    const unlockSchedule = getSubjectUnlockSchedule(exam, studentStart);
    
    // Everything should be unlocked if exam ended
    const biologyLocked = unlockSchedule.subjectAccess?.Biology?.isLocked;
    
    console.log(`    Exam ended 20min ago`);
    console.log(`    Biology locked: ${biologyLocked}`);
    
    return biologyLocked === false;
  });

  // Test 10: Clock synchronization issues
  runTest('Edge Case - Future Start Time (Clock Issues)', () => {
    const now = new Date();
    const futureStart = new Date(now.getTime() + 10 * 60 * 1000); // Start time in future
    
    const exam = createMHTCETExam('practice', null, null, 180);
    const unlockSchedule = getSubjectUnlockSchedule(exam, futureStart);
    
    // Should handle gracefully and keep locked
    const biologyLocked = unlockSchedule.subjectAccess?.Biology?.isLocked;
    
    console.log(`    Start time in future (clock issue)`);
    console.log(`    Biology locked: ${biologyLocked}`);
    
    return biologyLocked === true; // Should remain locked due to negative elapsed time
  });

  // ==================== STREAM COMPATIBILITY TESTS ====================
  console.log('\n🎯 STREAM COMPATIBILITY TESTS');
  console.log('-'.repeat(50));

  // Test 11: NEET exam - no restrictions
  runTest('NEET Exam - No Subject Restrictions', () => {
    const now = new Date();
    const studentStart = new Date(now.getTime() - 30 * 60 * 1000); // Started 30 min ago
    
    const exam = createNEETExam();
    const unlockSchedule = getSubjectUnlockSchedule(exam, studentStart);
    
    // NEET should have all subjects unlocked always
    const allUnlocked = unlockSchedule.allUnlocked;
    
    console.log(`    All subjects unlocked: ${allUnlocked}`);
    
    return allUnlocked === true;
  });

  // Test 12: JEE exam - no restrictions
  runTest('JEE Exam - No Subject Restrictions', () => {
    const now = new Date();
    const studentStart = new Date(now.getTime() - 30 * 60 * 1000);
    
    const exam = createJEEExam();
    const unlockSchedule = getSubjectUnlockSchedule(exam, studentStart);
    
    // JEE should have all subjects unlocked always
    const allUnlocked = unlockSchedule.allUnlocked;
    
    console.log(`    All subjects unlocked: ${allUnlocked}`);
    
    return allUnlocked === true;
  });

  // ==================== FUNCTION CONSISTENCY TESTS ====================
  console.log('\n🔄 FUNCTION CONSISTENCY TESTS');
  console.log('-'.repeat(50));

  // Test 13: shouldUnlockSubjects vs getSubjectUnlockSchedule consistency
  runTest('Function Consistency - Scheduled Exam', () => {
    const timeLeft = 60 * 60; // 60 minutes left in seconds
    const now = new Date();
    const examEnd = new Date(now.getTime() + timeLeft * 1000);
    const studentStart = new Date(now.getTime() - 90 * 60 * 1000); // Started 90 min ago
    
    const exam = createMHTCETExam('scheduled', null, examEnd.toISOString());
    
    // Test shouldUnlockSubjects
    const shouldUnlock = shouldUnlockSubjects(exam, timeLeft);
    
    // Test getSubjectUnlockSchedule
    const unlockSchedule = getSubjectUnlockSchedule(exam, studentStart);
    const biologyUnlocked = !unlockSchedule.subjectAccess?.Biology?.isLocked;
    
    console.log(`    shouldUnlockSubjects: ${shouldUnlock}`);
    console.log(`    getSubjectUnlockSchedule (Biology): ${biologyUnlocked}`);
    
    return shouldUnlock === biologyUnlocked;
  });

  // Test 14: Function consistency - Practice exam
  runTest('Function Consistency - Practice Exam', () => {
    const timeLeft = 90 * 60; // 90 minutes left in seconds
    const totalDuration = 180 * 60; // 180 minutes total
    const elapsedTime = totalDuration - timeLeft; // 90 minutes elapsed
    
    const now = new Date();
    const studentStart = new Date(now.getTime() - elapsedTime * 1000);
    
    const exam = createMHTCETExam('practice', null, null, 180);
    
    // Test shouldUnlockSubjects
    const shouldUnlock = shouldUnlockSubjects(exam, timeLeft);
    
    // Test getSubjectUnlockSchedule
    const unlockSchedule = getSubjectUnlockSchedule(exam, studentStart);
    const biologyUnlocked = !unlockSchedule.subjectAccess?.Biology?.isLocked;
    
    console.log(`    shouldUnlockSubjects: ${shouldUnlock}`);
    console.log(`    getSubjectUnlockSchedule (Biology): ${biologyUnlocked}`);
    
    return shouldUnlock === biologyUnlocked;
  });

  // ==================== FINAL RESULTS ====================
  console.log('\n' + '='.repeat(80));
  console.log(`📊 TEST RESULTS: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED! MHT-CET subject locking is working correctly.');
  } else {
    console.log(`❌ ${totalTests - passedTests} tests failed. Please check the implementation.`);
  }
  
  console.log('='.repeat(80));
  
  return {
    totalTests,
    passedTests,
    success: passedTests === totalTests
  };
}

// Export individual test functions for debugging
export {
  createMHTCETExam,
  createNEETExam,
  createJEEExam,
  formatTime,
  logTestResult
};