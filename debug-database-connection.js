#!/usr/bin/env node

/**
 * DATABASE CONNECTION AND PERSISTENCE TEST
 * 
 * This script tests the actual database connection and ExamResult persistence
 * to identify the root cause of the submission database save issues.
 */

import { connectDB } from './server_actions/config/mongoose.js';
import ExamResult from './server_actions/models/exam_portal/examResult.js';
import Exam from './server_actions/models/exam_portal/exam.js';
import Student from './server_actions/models/student.js';
import mongoose from 'mongoose';

async function testDatabaseConnection() {
  console.log('🔍 TESTING DATABASE CONNECTION AND PERSISTENCE...\n');
  
  try {
    // Test 1: Database Connection
    console.log('1. Testing database connection...');
    await connectDB();
    console.log('✅ Database connection successful');
    console.log(`   Connection state: ${mongoose.connection.readyState}`);
    console.log(`   Database name: ${mongoose.connection.db.databaseName}`);
    console.log('');
    
    // Test 2: Find any existing exam and student for testing
    console.log('2. Finding test data...');
    const existingExam = await Exam.findOne().lean();
    const existingStudent = await Student.findOne().lean();
    
    if (!existingExam || !existingStudent) {
      console.log('⚠️ No existing exam or student found for testing');
      console.log('   Creating a basic test without references...');
    } else {
      console.log(`✅ Found test exam: ${existingExam.examName || existingExam._id}`);
      console.log(`✅ Found test student: ${existingStudent.email || existingStudent._id}`);
    }
    console.log('');
    
    // Test 3: Test ExamResult creation and save
    console.log('3. Testing ExamResult creation and persistence...');
    
    const testExamResultData = {
      exam: existingExam ? existingExam._id : new mongoose.Types.ObjectId(),
      student: existingStudent ? existingStudent._id : new mongoose.Types.ObjectId(),
      attemptNumber: 1,
      answers: { 'test_question_1': 'A', 'test_question_2': 'B' },
      score: 8,
      totalMarks: 16,
      timeTaken: 1800,
      completedAt: new Date(),
      warnings: 0,
      
      questionAnalysis: [
        {
          questionId: new mongoose.Types.ObjectId(),
          status: 'correct',
          marks: 4,
          userAnswer: 'A',
          correctAnswer: 'A'
        },
        {
          questionId: new mongoose.Types.ObjectId(),
          status: 'correct',
          marks: 4,
          userAnswer: 'B',
          correctAnswer: 'B'
        }
      ],
      
      statistics: {
        correctAnswers: 2,
        incorrectAnswers: 0,
        unattempted: 0,
        accuracy: 100,
        totalQuestionsAttempted: 2
      },
      
      subjectPerformance: [
        {
          subject: 'Test Subject',
          totalQuestions: 2,
          attempted: 2,
          correct: 2,
          incorrect: 0,
          unanswered: 0,
          marks: 8,
          totalMarks: 8,
          accuracy: 100
        }
      ],
      
      visitedQuestions: [0, 1],
      markedQuestions: [],
      
      negativeMarkingInfo: {
        positiveMarks: 4,
        negativeMarks: 1,
        ruleDescription: "Test rule",
        ruleSource: "exam_specific"
      },
      
      submissionMetadata: {
        isOffline: false,
        syncStatus: 'synced',
        computationSource: 'server_computation',
        processingTime: 100
      }
    };
    
    console.log('   Creating ExamResult instance...');
    const examResult = new ExamResult(testExamResultData);
    console.log(`   ✅ ExamResult instance created: ${examResult._id}`);
    
    console.log('   Attempting to save to database...');
    const startTime = Date.now();
    
    try {
      await examResult.save();
      const saveTime = Date.now() - startTime;
      console.log(`   ✅ ExamResult saved successfully in ${saveTime}ms`);
      console.log(`   📊 Saved with ID: ${examResult._id}`);
      console.log(`   📊 Database operation completed successfully`);
      
      // Test 4: Verify the saved result exists
      console.log('');
      console.log('4. Verifying saved result...');
      const verifyResult = await ExamResult.findById(examResult._id).lean();
      
      if (verifyResult) {
        console.log(`   ✅ Result found in database`);
        console.log(`   📊 Score: ${verifyResult.score}/${verifyResult.totalMarks}`);
        console.log(`   📊 Question Analysis Count: ${verifyResult.questionAnalysis.length}`);
        console.log(`   📊 Created At: ${verifyResult.createdAt}`);
      } else {
        console.log(`   ❌ CRITICAL: Result not found in database after save!`);
      }
      
      // Test 5: Clean up test data
      console.log('');
      console.log('5. Cleaning up test data...');
      await ExamResult.findByIdAndDelete(examResult._id);
      console.log('   ✅ Test data cleaned up');
      
    } catch (saveError) {
      console.log(`   ❌ CRITICAL: ExamResult save failed!`);
      console.error('   Error details:', {
        message: saveError.message,
        code: saveError.code,
        name: saveError.name,
        stack: saveError.stack.split('\n').slice(0, 5).join('\n')
      });
      
      if (saveError.errors) {
        console.log('   Validation errors:');
        for (const [field, error] of Object.entries(saveError.errors)) {
          console.log(`     - ${field}: ${error.message}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ DATABASE TEST FAILED:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack.split('\n').slice(0, 10).join('\n'));
    }
  } finally {
    console.log('');
    console.log('6. Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  }
}

// Run the test
testDatabaseConnection().catch(error => {
  console.error('FATAL ERROR:', error);
  process.exit(1);
});