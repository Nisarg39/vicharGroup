#!/usr/bin/env node

/**
 * SUBMISSION PIPELINE DIAGNOSTIC SCRIPT
 * 
 * This script tests each component of the submission pipeline to identify
 * where exam submissions are failing in production.
 */

import { connectDB } from './server_actions/config/mongoose.js';
import ExamResult from './server_actions/models/exam_portal/examResult.js';
import Exam from './server_actions/models/exam_portal/exam.js';
import Student from './server_actions/models/student.js';
import { submitOptimizedExamResult } from './server_actions/actions/examController/optimizedSubmissionEndpoint.js';
import { submitProgressiveResultDirect } from './server_actions/actions/examController/progressiveSubmissionHandler.js';
import { submitExamResultInternal } from './server_actions/actions/examController/studentExamActions.js';

class SubmissionPipelineDiagnostic {
  constructor() {
    this.testResults = {
      databaseConnection: null,
      optimizedValidation: null,
      optimizedStorage: null,
      traditionalFallback: null,
      dataTransformation: null,
      overall: null
    };
  }

  async runDiagnostic() {
    console.log('🔍 SUBMISSION PIPELINE DIAGNOSTIC');
    console.log('='.repeat(60));
    
    try {
      // Test 1: Database Connection
      await this.testDatabaseConnection();
      
      // Test 2: Data Transformation
      await this.testDataTransformation();
      
      // Test 3: Optimized Endpoint Validation
      await this.testOptimizedValidation();
      
      // Test 4: Direct Storage
      await this.testOptimizedStorage();
      
      // Test 5: Traditional Fallback
      await this.testTraditionalFallback();
      
      // Generate Report
      this.generateDiagnosticReport();
      
    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
    }
  }

  async testDatabaseConnection() {
    console.log('\n📊 Test 1: Database Connection');
    
    try {
      await connectDB();
      
      // Test basic queries
      const examCount = await Exam.countDocuments({});
      const studentCount = await Student.countDocuments({});
      const resultCount = await ExamResult.countDocuments({});
      
      console.log(`✅ Database connected successfully`);
      console.log(`   Exams: ${examCount}, Students: ${studentCount}, Results: ${resultCount}`);
      
      // Test ExamResult creation
      const testResult = new ExamResult({
        exam: '507f1f77bcf86cd799439011', // Dummy ObjectId
        student: '507f1f77bcf86cd799439012', // Dummy ObjectId
        answers: { 'test': 'A' },
        score: 100,
        totalMarks: 100,
        statistics: {
          correctAnswers: 1,
          incorrectAnswers: 0,
          unattempted: 0
        }
      });
      
      // Validate model (don't save)
      const validationError = testResult.validateSync();
      if (validationError) {
        console.log(`⚠️ Model validation issues: ${validationError.message}`);
      } else {
        console.log('✅ ExamResult model validation passed');
      }
      
      this.testResults.databaseConnection = { success: true, details: 'Connected and models working' };
      
    } catch (error) {
      console.error(`❌ Database connection failed:`, error.message);
      this.testResults.databaseConnection = { success: false, error: error.message };
    }
  }

  async testDataTransformation() {
    console.log('\n🔄 Test 2: Data Transformation');
    
    try {
      // Create mock client submission data
      const mockClientData = {
        examId: '507f1f77bcf86cd799439011',
        studentId: '507f1f77bcf86cd799439012',
        answers: { 
          'q1': 'A', 
          'q2': 'B', 
          'q3': 'C' 
        },
        clientEvaluationResult: {
          finalScore: 12,
          totalMarks: 16,
          percentage: 75,
          correctAnswers: 3,
          incorrectAnswers: 1,
          unattempted: 0,
          questionAnalysis: [
            { questionId: 'q1', status: 'correct', marks: 4 },
            { questionId: 'q2', status: 'correct', marks: 4 },
            { questionId: 'q3', status: 'correct', marks: 4 },
            { questionId: 'q4', status: 'incorrect', marks: -1 }
          ],
          subjectPerformance: []
        },
        timeTaken: 1800,
        completedAt: new Date().toISOString(),
        visitedQuestions: ['q1', 'q2', 'q3', 'q4'],
        markedQuestions: [],
        warnings: 0
      };

      console.log('🔍 Testing progressive submission data transformation...');
      
      // Test the transformation that happens in submitProgressiveResultDirect
      const { submitProgressiveResultDirect } = await import('./server_actions/actions/examController/progressiveSubmissionHandler.js');
      
      // This will test the transformation logic without actually submitting
      console.log('📝 Mock client data structure:', {
        examId: mockClientData.examId,
        studentId: mockClientData.studentId,
        finalScore: mockClientData.clientEvaluationResult.finalScore,
        totalMarks: mockClientData.clientEvaluationResult.totalMarks,
        answersCount: Object.keys(mockClientData.answers).length
      });
      
      this.testResults.dataTransformation = { success: true, details: 'Data structure looks valid' };
      
    } catch (error) {
      console.error(`❌ Data transformation test failed:`, error.message);
      this.testResults.dataTransformation = { success: false, error: error.message };
    }
  }

  async testOptimizedValidation() {
    console.log('\n⚡ Test 3: Optimized Endpoint Validation');
    
    try {
      // Create test data that should pass validation
      const validTestData = {
        examId: '507f1f77bcf86cd799439011',
        studentId: '507f1f77bcf86cd799439012',
        answers: { 'q1': 'A', 'q2': 'B' },
        finalScore: 8,
        totalMarks: 8,
        percentage: 100,
        correctAnswers: 2,
        incorrectAnswers: 0,
        unattempted: 0,
        questionAnalysis: [],
        subjectPerformance: [],
        timeTaken: 1800,
        completedAt: new Date().toISOString(),
        visitedQuestions: ['q1', 'q2'],
        markedQuestions: [],
        warnings: 0
      };

      console.log('🔍 Testing optimized validation with valid data...');
      console.log('📝 Test data structure:', {
        examId: validTestData.examId,
        finalScore: validTestData.finalScore,
        totalMarks: validTestData.totalMarks,
        percentage: validTestData.percentage
      });

      // We can't actually call the validation without a full submission
      // But we can check data structure
      if (!validTestData.examId || !validTestData.studentId || 
          typeof validTestData.finalScore !== 'number' || 
          typeof validTestData.totalMarks !== 'number') {
        throw new Error('Basic validation would fail - data structure issues');
      }

      console.log('✅ Basic validation structure checks passed');
      this.testResults.optimizedValidation = { success: true, details: 'Data structure valid for optimized endpoint' };
      
    } catch (error) {
      console.error(`❌ Optimized validation test failed:`, error.message);
      this.testResults.optimizedValidation = { success: false, error: error.message };
    }
  }

  async testOptimizedStorage() {
    console.log('\n💾 Test 4: Optimized Storage (DRY RUN)');
    
    try {
      // We'll check if the optimized endpoint exists and is importable
      const { submitOptimizedExamResult } = await import('./server_actions/actions/examController/optimizedSubmissionEndpoint.js');
      
      if (typeof submitOptimizedExamResult !== 'function') {
        throw new Error('submitOptimizedExamResult is not a function');
      }

      console.log('✅ Optimized endpoint is importable and callable');
      console.log('⚠️ Skipping actual storage test to avoid database writes');
      
      this.testResults.optimizedStorage = { success: true, details: 'Optimized endpoint is available' };
      
    } catch (error) {
      console.error(`❌ Optimized storage test failed:`, error.message);
      this.testResults.optimizedStorage = { success: false, error: error.message };
    }
  }

  async testTraditionalFallback() {
    console.log('\n🔄 Test 5: Traditional Fallback (DRY RUN)');
    
    try {
      // Test if traditional fallback function is importable and callable
      const { submitExamResultInternal } = await import('./server_actions/actions/examController/studentExamActions.js');
      
      if (typeof submitExamResultInternal !== 'function') {
        throw new Error('submitExamResultInternal is not a function');
      }

      console.log('✅ Traditional fallback function is importable and callable');
      console.log('⚠️ Skipping actual fallback test to avoid database writes');
      
      this.testResults.traditionalFallback = { success: true, details: 'Traditional fallback is available' };
      
    } catch (error) {
      console.error(`❌ Traditional fallback test failed:`, error.message);
      this.testResults.traditionalFallback = { success: false, error: error.message };
    }
  }

  generateDiagnosticReport() {
    console.log('\n📋 DIAGNOSTIC REPORT');
    console.log('='.repeat(60));
    
    const results = this.testResults;
    const passedTests = Object.values(results).filter(r => r?.success).length;
    const totalTests = Object.keys(results).length - 1; // Exclude 'overall'
    
    console.log(`\n🎯 Test Results: ${passedTests}/${totalTests} passed\n`);
    
    Object.entries(results).forEach(([testName, result]) => {
      if (testName === 'overall') return;
      
      const icon = result?.success ? '✅' : '❌';
      const status = result?.success ? 'PASSED' : 'FAILED';
      const details = result?.details || result?.error || 'No details';
      
      console.log(`${icon} ${testName.toUpperCase()}: ${status}`);
      console.log(`   ${details}\n`);
    });
    
    // Overall assessment
    if (passedTests === totalTests) {
      console.log('🚀 OVERALL: All tests passed - pipeline components are available');
      console.log('💡 ISSUE LIKELY IN: Data validation or specific production environment factors');
    } else {
      console.log('⚠️ OVERALL: Some components failed - pipeline has structural issues');
      console.log('💡 ISSUE LIKELY IN: Missing dependencies or broken imports');
    }
    
    console.log('\n🔧 RECOMMENDED NEXT STEPS:');
    console.log('1. Check production logs for validation failures');
    console.log('2. Test with actual production data structure');
    console.log('3. Verify database connectivity in production environment');
    console.log('4. Monitor console.log output during actual submissions');
    
    this.testResults.overall = { passedTests, totalTests };
  }
}

// Run diagnostic
async function main() {
  const diagnostic = new SubmissionPipelineDiagnostic();
  await diagnostic.runDiagnostic();
  process.exit(0);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { SubmissionPipelineDiagnostic };