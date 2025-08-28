#!/usr/bin/env node

/**
 * CRITICAL DATABASE CONNECTION TEST
 * 
 * This script tests the basic database connection and write permissions
 * to identify if the exam submission persistence issue is related to
 * database connectivity or configuration.
 */

import { connectDB } from "./server_actions/config/mongoose.js";
import ExamResult from "./server_actions/models/exam_portal/examResult.js";
import Exam from "./server_actions/models/exam_portal/exam.js";
import Student from "./server_actions/models/student.js";

async function testDatabaseConnection() {
  console.log('🔥 CRITICAL DATABASE TEST: Starting database connection test...');
  
  try {
    // Test 1: Database Connection
    console.log('\n=== TEST 1: DATABASE CONNECTION ===');
    await connectDB();
    console.log('✅ Database connection successful');
    
    // Test 2: Read Operations
    console.log('\n=== TEST 2: READ OPERATIONS ===');
    
    const examCount = await Exam.countDocuments();
    console.log(`✅ Exam count: ${examCount}`);
    
    const studentCount = await Student.countDocuments();
    console.log(`✅ Student count: ${studentCount}`);
    
    const examResultCount = await ExamResult.countDocuments();
    console.log(`✅ ExamResult count: ${examResultCount}`);
    
    // Test 3: Find a sample exam and student for testing
    console.log('\n=== TEST 3: SAMPLE DATA RETRIEVAL ===');
    
    const sampleExam = await Exam.findOne().select('_id examName totalMarks reattempt').lean();
    if (sampleExam) {
      console.log('✅ Sample exam found:', {
        id: sampleExam._id,
        name: sampleExam.examName,
        totalMarks: sampleExam.totalMarks,
        reattempt: sampleExam.reattempt || 1
      });
    } else {
      console.log('⚠️ No exams found in database');
      return;
    }
    
    const sampleStudent = await Student.findOne().select('_id firstName lastName email').lean();
    if (sampleStudent) {
      console.log('✅ Sample student found:', {
        id: sampleStudent._id,
        name: `${sampleStudent.firstName} ${sampleStudent.lastName}`,
        email: sampleStudent.email
      });
    } else {
      console.log('⚠️ No students found in database');
      return;
    }
    
    // Test 4: Check for existing exam result for this combination
    console.log('\n=== TEST 4: EXISTING SUBMISSIONS CHECK ===');
    
    const existingResult = await ExamResult.findOne({
      exam: sampleExam._id,
      student: sampleStudent._id
    }).select('_id attemptNumber score createdAt').lean();
    
    if (existingResult) {
      console.log('⚠️ Existing submission found:', {
        id: existingResult._id,
        attemptNumber: existingResult.attemptNumber,
        score: existingResult.score,
        createdAt: existingResult.createdAt
      });
    } else {
      console.log('✅ No existing submission found - safe to test');
    }
    
    // Test 5: Write Operation Test (Create a test ExamResult)
    console.log('\n=== TEST 5: WRITE OPERATION TEST ===');
    
    const testExamResultData = {
      exam: sampleExam._id,
      student: sampleStudent._id,
      attemptNumber: existingResult ? (existingResult.attemptNumber + 1) : 1,
      answers: {
        "test_question_1": "A",
        "test_question_2": "B"
      },
      score: 8,
      totalMarks: sampleExam.totalMarks || 100,
      timeTaken: 300, // 5 minutes
      completedAt: new Date(),
      warnings: 0,
      
      statistics: {
        correctAnswers: 2,
        incorrectAnswers: 0,
        unattempted: 0,
        accuracy: 100,
        totalQuestionsAttempted: 2
      },
      
      questionAnalysis: [],
      subjectPerformance: [],
      visitedQuestions: [0, 1],
      markedQuestions: [],
      
      negativeMarkingInfo: {
        positiveMarks: 4,
        negativeMarks: 1,
        ruleDescription: "Database connection test",
        ruleSource: "exam_specific"
      },
      
      isOfflineSubmission: false
    };
    
    console.log('🔥 Attempting to create test ExamResult...');
    console.log('📦 Test data:', {
      examId: testExamResultData.exam,
      studentId: testExamResultData.student,
      attemptNumber: testExamResultData.attemptNumber,
      score: testExamResultData.score,
      totalMarks: testExamResultData.totalMarks
    });
    
    try {
      const testResult = new ExamResult(testExamResultData);
      const savedResult = await testResult.save();
      
      console.log('✅ DATABASE WRITE SUCCESS: Test ExamResult created!', {
        id: savedResult._id,
        attemptNumber: savedResult.attemptNumber,
        score: savedResult.score,
        createdAt: savedResult.createdAt
      });
      
      // Test 6: Update Exam with the new result
      console.log('\n=== TEST 6: EXAM UPDATE TEST ===');
      
      await Exam.findByIdAndUpdate(
        sampleExam._id,
        { $push: { examResults: savedResult._id } },
        { lean: true }
      );
      
      console.log('✅ Exam updated with new result successfully');
      
      // Test 7: Cleanup - Delete the test result
      console.log('\n=== TEST 7: CLEANUP ===');
      
      await ExamResult.findByIdAndDelete(savedResult._id);
      console.log('✅ Test result cleaned up successfully');
      
      await Exam.findByIdAndUpdate(
        sampleExam._id,
        { $pull: { examResults: savedResult._id } },
        { lean: true }
      );
      console.log('✅ Exam cleanup completed');
      
    } catch (writeError) {
      console.error('❌ DATABASE WRITE FAILED:', {
        error: writeError.message,
        code: writeError.code,
        name: writeError.name,
        validationErrors: writeError.errors,
        isDuplicateKey: writeError.code === 11000,
        stack: writeError.stack
      });
      throw writeError;
    }
    
    console.log('\n🎉 ALL DATABASE TESTS PASSED!');
    console.log('✅ Database connection and write permissions are working correctly');
    
  } catch (error) {
    console.error('\n❌ DATABASE TEST FAILED:', {
      error: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection()
  .then(() => {
    console.log('\n✅ Database connection test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database connection test failed:', error);
    process.exit(1);
  });