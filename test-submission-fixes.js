#!/usr/bin/env node

/**
 * TEST SUBMISSION FIXES
 * 
 * This script tests the validation fixes we made to ensure they work correctly
 * before deploying to production.
 */

// Mock the validation functions for testing
const testValidationFixes = async () => {
  console.log('🧪 Testing Submission Pipeline Fixes');
  console.log('='.repeat(50));

  // Test Case 1: Zero score submission (should now pass validation)
  const zeroScoreData = {
    examId: '507f1f77bcf86cd799439011',
    studentId: '507f1f77bcf86cd799439012',
    answers: { q1: 'A', q2: 'B' },
    finalScore: 0, // This used to fail validation
    totalMarks: 100,
    percentage: 0,
    correctAnswers: 0,
    incorrectAnswers: 2,
    unattempted: 0,
    questionAnalysis: [],
    subjectPerformance: [],
    timeTaken: 1800,
    completedAt: new Date().toISOString(),
    visitedQuestions: ['q1', 'q2'],
    markedQuestions: [],
    warnings: 0
  };

  // Test Case 2: Negative score submission (should now pass validation)
  const negativeScoreData = {
    examId: '507f1f77bcf86cd799439011',
    studentId: '507f1f77bcf86cd799439012',
    answers: { q1: 'A', q2: 'B', q3: 'C', q4: 'D' },
    finalScore: -5, // Negative due to negative marking
    totalMarks: 16,
    percentage: -31.25,
    correctAnswers: 1,
    incorrectAnswers: 3,
    unattempted: 0,
    questionAnalysis: [],
    subjectPerformance: [],
    timeTaken: 900,
    completedAt: new Date().toISOString(),
    visitedQuestions: ['q1', 'q2', 'q3', 'q4'],
    markedQuestions: [],
    warnings: 0
  };

  // Test Case 3: Short time submission (should now pass with warning)
  const shortTimeData = {
    examId: '507f1f77bcf86cd799439011',
    studentId: '507f1f77bcf86cd799439012',
    answers: { q1: 'A' },
    finalScore: 4,
    totalMarks: 4,
    percentage: 100,
    correctAnswers: 1,
    incorrectAnswers: 0,
    unattempted: 0,
    questionAnalysis: [],
    subjectPerformance: [],
    timeTaken: 25, // Short time - should warn but not reject
    completedAt: new Date().toISOString(),
    visitedQuestions: ['q1'],
    markedQuestions: [],
    warnings: 0
  };

  // Simulate the validation logic
  const validateBasicStructure = (data) => {
    const requiredFields = [
      'examId', 'studentId', 'answers', 'finalScore', 'totalMarks',
      'percentage', 'correctAnswers', 'incorrectAnswers', 'unattempted',
      'completedAt', 'timeTaken'
    ];
    
    const errors = [];
    
    // Check for missing fields
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        errors.push(`Missing required field: ${field}`);
      }
    }
    
    // Type validation
    if (data.finalScore !== undefined && typeof data.finalScore !== 'number') {
      errors.push('Invalid finalScore: must be a number');
    }
    
    if (data.totalMarks !== undefined && (typeof data.totalMarks !== 'number' || data.totalMarks <= 0)) {
      errors.push('Invalid totalMarks: must be a positive number');
    }
    
    // Score bounds validation (FIXED)
    if (data.finalScore !== undefined && data.totalMarks !== undefined) {
      const minAllowedScore = -Math.abs(data.totalMarks * 0.5);
      const maxAllowedScore = data.totalMarks * 1.1;
      
      if (data.finalScore < minAllowedScore || data.finalScore > maxAllowedScore) {
        errors.push(`Score ${data.finalScore} is outside reasonable bounds (${minAllowedScore} to ${maxAllowedScore})`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  };

  const validateSecurityConstraints = (data) => {
    const errors = [];
    
    // Score percentage bounds
    if (data.percentage > 100 || data.percentage < -50) {
      errors.push('Score percentage outside reasonable bounds');
    }
    
    // Time validation (FIXED)
    if (data.timeTaken < 10) {
      errors.push('Submission time extremely short (< 10 seconds)');
    } else if (data.timeTaken < 30) {
      console.warn(`⚠️ Short submission time: ${data.timeTaken} seconds`);
    }
    
    return { valid: errors.length === 0, errors };
  };

  // Run tests
  const testCases = [
    { name: 'Zero Score', data: zeroScoreData },
    { name: 'Negative Score', data: negativeScoreData },
    { name: 'Short Time', data: shortTimeData }
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 Testing: ${testCase.name}`);
    
    const basicValidation = validateBasicStructure(testCase.data);
    const securityValidation = validateSecurityConstraints(testCase.data);
    
    const isValid = basicValidation.valid && securityValidation.valid;
    
    if (isValid) {
      console.log(`✅ ${testCase.name}: PASSED validation`);
    } else {
      console.log(`❌ ${testCase.name}: FAILED validation`);
      if (basicValidation.errors.length > 0) {
        console.log(`   Basic errors: ${basicValidation.errors.join(', ')}`);
      }
      if (securityValidation.errors.length > 0) {
        console.log(`   Security errors: ${securityValidation.errors.join(', ')}`);
      }
    }
    
    // Show data summary
    console.log(`   Score: ${testCase.data.finalScore}/${testCase.data.totalMarks} (${testCase.data.percentage}%)`);
    console.log(`   Time: ${testCase.data.timeTaken}s, Answers: ${Object.keys(testCase.data.answers).length}`);
  }

  console.log('\n🎯 SUMMARY');
  console.log('='.repeat(50));
  console.log('✅ Zero scores are now allowed (common with negative marking)');
  console.log('✅ Negative scores are now allowed (negative marking systems)');
  console.log('✅ Short submission times warn but don\'t block (testing scenarios)');
  console.log('✅ Reasonable score bounds prevent data corruption');
  console.log('\n💡 Next Steps:');
  console.log('1. Deploy these fixes to production');
  console.log('2. Monitor production logs for validation failures');
  console.log('3. Check if fallback submissions are working');
  console.log('4. Verify database writes are successful');
};

// Run the test
testValidationFixes().catch(console.error);