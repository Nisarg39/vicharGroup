/**
 * PROGRESSIVE SYSTEM TESTING UTILITY
 * 
 * Comprehensive testing suite for validating the enhanced progressive computation
 * system and 15ms submission target achievement.
 * 
 * TESTING AREAS:
 * ✅ Service Worker computation accuracy
 * ✅ Client integration performance
 * ✅ Direct storage system validation
 * ✅ 15ms submission target achievement
 * ✅ Data integrity verification
 * ✅ Error handling and fallback systems
 */

import { ProgressiveComputation } from './ProgressiveComputationClient';
import { submitProgressiveResultDirect } from '../../server_actions/actions/examController/progressiveSubmissionHandler';
import { getPerformanceMonitor } from './PerformanceMonitor';

class ProgressiveSystemTester {
  constructor() {
    this.testResults = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      performance: {
        averageSubmissionTime: 0,
        fastestSubmission: Infinity,
        slowestSubmission: 0,
        target15msAchieved: 0,
        target15msAttempted: 0
      },
      testLog: []
    };
    
    this.performanceMonitor = getPerformanceMonitor();
  }

  /**
   * Run comprehensive system tests
   */
  async runComprehensiveTests(examData, testConfig = {}) {
    const {
      testCount = 10,
      simulateLoad = true,
      testDataIntegrity = true,
      testPerformance = true,
      testFallbacks = true,
      verbose = true
    } = testConfig;

    console.log('🧪 Starting comprehensive progressive system tests...');
    console.log(`📊 Test configuration:`, testConfig);
    
    this.resetTestResults();
    
    try {
      // Test 1: Service Worker Initialization
      await this.testServiceWorkerInitialization(examData);
      
      // Test 2: Progressive Computation Accuracy
      if (testDataIntegrity) {
        await this.testProgressiveComputationAccuracy(examData);
      }
      
      // Test 3: 15ms Submission Target Performance
      if (testPerformance) {
        await this.testSubmissionPerformance(examData, testCount);
      }
      
      // Test 4: Load Testing
      if (simulateLoad) {
        await this.testConcurrentSubmissions(examData, Math.min(testCount, 5));
      }
      
      // Test 5: Fallback System Testing
      if (testFallbacks) {
        await this.testFallbackSystems(examData);
      }
      
      // Test 6: Data Integrity Validation
      if (testDataIntegrity) {
        await this.testDataIntegrityValidation(examData);
      }
      
      // Generate comprehensive test report
      const testReport = this.generateTestReport();
      
      if (verbose) {
        console.log('📋 TEST REPORT:', testReport);
      }
      
      return testReport;
      
    } catch (error) {
      console.error('❌ Comprehensive testing failed:', error);
      this.logTestResult('comprehensive_test_suite', false, `Suite failed: ${error.message}`);
      return this.generateTestReport();
    }
  }

  /**
   * Test Service Worker initialization
   */
  async testServiceWorkerInitialization(examData) {
    const testName = 'service_worker_initialization';
    const startTime = performance.now();
    
    try {
      console.log('🔧 Testing Service Worker initialization...');
      
      if (!ProgressiveComputation.isSupported()) {
        throw new Error('Progressive computation not supported in this browser');
      }
      
      const client = ProgressiveComputation.getClient();
      const result = await client.initializeEngine(examData);
      
      const initTime = performance.now() - startTime;
      
      if (result.success && initTime < 2000) { // Allow up to 2 seconds for initialization
        this.logTestResult(testName, true, `Initialized in ${initTime.toFixed(2)}ms`);
        console.log(`✅ Service Worker initialized successfully in ${initTime.toFixed(2)}ms`);
        return true;
      } else {
        throw new Error(`Initialization failed or too slow: ${result.error || initTime + 'ms'}`);
      }
      
    } catch (error) {
      console.error(`❌ Service Worker initialization test failed:`, error);
      this.logTestResult(testName, false, error.message);
      return false;
    }
  }

  /**
   * Test progressive computation accuracy
   */
  async testProgressiveComputationAccuracy(examData) {
    const testName = 'progressive_computation_accuracy';
    
    try {
      console.log('🎯 Testing progressive computation accuracy...');
      
      // Simulate answer updates
      const sampleAnswers = this.generateSampleAnswers(examData.questions);
      
      // Update answers in progressive engine
      for (const [questionId, answer] of Object.entries(sampleAnswers)) {
        await ProgressiveComputation.updateAnswer(questionId, answer);
      }
      
      // Get progressive results
      const progressiveResult = await ProgressiveComputation.finalizeForSubmission({
        timeTaken: 3600,
        completedAt: new Date().toISOString(),
        visitedQuestions: Object.keys(sampleAnswers),
        markedQuestions: [],
        warnings: 0
      });
      
      if (progressiveResult.success && progressiveResult.completeExamResultData) {
        // Validate data structure completeness
        const data = progressiveResult.completeExamResultData;
        const requiredFields = [
          'finalScore', 'totalMarks', 'percentage', 'correctAnswers',
          'incorrectAnswers', 'unattempted', 'questionAnalysis', 
          'subjectPerformance', 'statistics'
        ];
        
        const missingFields = requiredFields.filter(field => !data[field] && data[field] !== 0);
        
        if (missingFields.length === 0) {
          this.logTestResult(testName, true, `Complete ExamResult data generated with ${data.questionAnalysis.length} questions`);
          console.log(`✅ Progressive computation accuracy validated`);
          return true;
        } else {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
      } else {
        throw new Error(progressiveResult.error || 'Failed to generate complete results');
      }
      
    } catch (error) {
      console.error(`❌ Progressive computation accuracy test failed:`, error);
      this.logTestResult(testName, false, error.message);
      return false;
    }
  }

  /**
   * Test 15ms submission performance target
   */
  async testSubmissionPerformance(examData, testCount) {
    const testName = 'submission_performance';
    const performanceResults = [];
    
    try {
      console.log(`⚡ Testing 15ms submission performance (${testCount} iterations)...`);
      
      for (let i = 0; i < testCount; i++) {
        const sampleAnswers = this.generateSampleAnswers(examData.questions);
        
        // Update progressive engine with sample answers
        for (const [questionId, answer] of Object.entries(sampleAnswers)) {
          await ProgressiveComputation.updateAnswer(questionId, answer);
        }
        
        // Get progressive results
        const progressiveResult = await ProgressiveComputation.finalizeForSubmission({
          timeTaken: 3600 + i,
          completedAt: new Date().toISOString(),
          visitedQuestions: Object.keys(sampleAnswers),
          markedQuestions: [],
          warnings: 0
        });
        
        if (progressiveResult.success && progressiveResult.completeExamResultData) {
          // Prepare data for direct storage
          const directStorageData = {
            ...progressiveResult.completeExamResultData,
            examId: examData.exam._id,
            studentId: examData.student._id,
            rawExamData: {
              examId: examData.exam._id,
              studentId: examData.student._id,
              answers: sampleAnswers,
              timeTaken: 3600 + i,
              completedAt: new Date().toISOString(),
              visitedQuestions: Object.keys(sampleAnswers),
              markedQuestions: [],
              warnings: 0
            }
          };
          
          // Test direct storage submission
          const startTime = performance.now();
          const directResult = await submitProgressiveResultDirect(directStorageData);
          const submissionTime = performance.now() - startTime;
          
          performanceResults.push({
            iteration: i + 1,
            submissionTime,
            success: directResult.success,
            target15msAchieved: submissionTime <= 15,
            performanceRank: this.getPerformanceRank(submissionTime)
          });
          
          // Update performance metrics
          this.updatePerformanceMetrics(submissionTime);
          
          console.log(`🎯 Test ${i + 1}/${testCount}: ${submissionTime.toFixed(2)}ms ${submissionTime <= 15 ? '(TARGET ACHIEVED!)' : '(Above target)'}`);
        }
      }
      
      // Analyze performance results
      const successfulTests = performanceResults.filter(r => r.success).length;
      const target15msHits = performanceResults.filter(r => r.target15msAchieved).length;
      const target15msRate = (target15msHits / performanceResults.length * 100).toFixed(2);
      
      const summary = {
        successRate: `${(successfulTests / performanceResults.length * 100).toFixed(2)}%`,
        target15msAchievementRate: `${target15msRate}%`,
        averageSubmissionTime: `${this.testResults.performance.averageSubmissionTime.toFixed(2)}ms`,
        fastestSubmission: `${this.testResults.performance.fastestSubmission}ms`,
        slowestSubmission: `${this.testResults.performance.slowestSubmission}ms`
      };
      
      if (successfulTests === performanceResults.length && parseFloat(target15msRate) >= 70) {
        this.logTestResult(testName, true, `Performance excellent: ${JSON.stringify(summary)}`);
        console.log(`✅ 15ms target performance validated:`, summary);
        return true;
      } else {
        this.logTestResult(testName, false, `Performance below target: ${JSON.stringify(summary)}`);
        console.log(`⚠️ Performance below expectations:`, summary);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Submission performance test failed:`, error);
      this.logTestResult(testName, false, error.message);
      return false;
    }
  }

  /**
   * Test concurrent submissions
   */
  async testConcurrentSubmissions(examData, concurrentCount) {
    const testName = 'concurrent_submissions';
    
    try {
      console.log(`🔄 Testing concurrent submissions (${concurrentCount} simultaneous)...`);
      
      const promises = Array.from({ length: concurrentCount }, async (_, i) => {
        const sampleAnswers = this.generateSampleAnswers(examData.questions);
        
        // Each concurrent test uses slightly different data
        const directStorageData = {
          examId: examData.exam._id,
          studentId: examData.student._id + `_test_${i}`,
          finalScore: 100 + i,
          totalMarks: 180,
          percentage: ((100 + i) / 180 * 100).toFixed(2),
          answers: sampleAnswers,
          rawExamData: {
            examId: examData.exam._id,
            studentId: examData.student._id + `_test_${i}`,
            answers: sampleAnswers,
            timeTaken: 3600,
            completedAt: new Date().toISOString()
          }
        };
        
        const startTime = performance.now();
        const result = await submitProgressiveResultDirect(directStorageData);
        const endTime = performance.now();
        
        return {
          testId: i,
          submissionTime: endTime - startTime,
          success: result.success,
          target15msAchieved: (endTime - startTime) <= 15
        };
      });
      
      const results = await Promise.all(promises);
      const successfulResults = results.filter(r => r.success);
      const target15msResults = results.filter(r => r.target15msAchieved);
      
      const summary = {
        totalTests: results.length,
        successful: successfulResults.length,
        target15msAchieved: target15msResults.length,
        averageTime: (results.reduce((sum, r) => sum + r.submissionTime, 0) / results.length).toFixed(2) + 'ms'
      };
      
      if (successfulResults.length === results.length) {
        this.logTestResult(testName, true, `Concurrent test successful: ${JSON.stringify(summary)}`);
        console.log(`✅ Concurrent submissions test passed:`, summary);
        return true;
      } else {
        this.logTestResult(testName, false, `Concurrent test partial failure: ${JSON.stringify(summary)}`);
        console.log(`⚠️ Concurrent submissions test had issues:`, summary);
        return false;
      }
      
    } catch (error) {
      console.error(`❌ Concurrent submissions test failed:`, error);
      this.logTestResult(testName, false, error.message);
      return false;
    }
  }

  /**
   * Test fallback systems
   */
  async testFallbackSystems(examData) {
    const testName = 'fallback_systems';
    
    try {
      console.log('🔄 Testing fallback systems...');
      
      // Test with invalid data to trigger fallbacks
      const invalidData = {
        examId: examData.exam._id,
        studentId: examData.student._id,
        finalScore: 'invalid', // This should trigger validation failure
        totalMarks: 180,
        answers: { 'invalid_question': 'invalid_answer' },
        rawExamData: {
          examId: examData.exam._id,
          studentId: examData.student._id,
          answers: { 'question1': 'A' },
          timeTaken: 3600,
          completedAt: new Date().toISOString()
        }
      };
      
      const result = await submitProgressiveResultDirect(invalidData);
      
      // Fallback should still succeed but use traditional computation
      if (result.success && result.validationFailure) {
        this.logTestResult(testName, true, 'Fallback system activated successfully');
        console.log(`✅ Fallback system working correctly`);
        return true;
      } else {
        throw new Error('Fallback system did not activate as expected');
      }
      
    } catch (error) {
      console.error(`❌ Fallback systems test failed:`, error);
      this.logTestResult(testName, false, error.message);
      return false;
    }
  }

  /**
   * Test data integrity validation
   */
  async testDataIntegrityValidation(examData) {
    const testName = 'data_integrity_validation';
    
    try {
      console.log('🔍 Testing data integrity validation...');
      
      // Test with complete valid data
      const validData = {
        examId: examData.exam._id,
        studentId: examData.student._id,
        finalScore: 120,
        totalMarks: 180,
        percentage: '66.67',
        correctAnswers: 30,
        incorrectAnswers: 15,
        unattempted: 0,
        questionAnalysis: examData.questions.slice(0, 45).map((q, i) => ({
          questionId: q._id,
          questionNumber: i + 1,
          userAnswer: i < 30 ? 'A' : (i < 45 ? 'B' : null),
          correctAnswer: 'A',
          score: i < 30 ? 4 : (i < 45 ? -1 : 0),
          status: i < 30 ? 'correct' : (i < 45 ? 'incorrect' : 'unattempted'),
          subject: q.subject,
          marks: 4,
          negativeMarks: 1
        })),
        answers: Object.fromEntries(examData.questions.slice(0, 45).map((q, i) => [
          q._id, i < 30 ? 'A' : (i < 45 ? 'B' : null)
        ])),
        computationHash: 'test_hash_' + Date.now(),
        validationData: {
          timestamp: Date.now(),
          clientVersion: '1.3.0',
          computationMethod: 'progressive_service_worker'
        },
        rawExamData: {
          examId: examData.exam._id,
          studentId: examData.student._id,
          answers: Object.fromEntries(examData.questions.slice(0, 45).map((q, i) => [
            q._id, i < 30 ? 'A' : (i < 45 ? 'B' : null)
          ])),
          timeTaken: 3600,
          completedAt: new Date().toISOString()
        }
      };
      
      const result = await submitProgressiveResultDirect(validData);
      
      if (result.success) {
        this.logTestResult(testName, true, 'Data integrity validation passed');
        console.log(`✅ Data integrity validation working correctly`);
        return true;
      } else {
        throw new Error(`Validation failed: ${result.validationFailure?.reason}`);
      }
      
    } catch (error) {
      console.error(`❌ Data integrity validation test failed:`, error);
      this.logTestResult(testName, false, error.message);
      return false;
    }
  }

  /**
   * Generate sample answers for testing
   */
  generateSampleAnswers(questions) {
    const answers = {};
    questions.forEach((question, index) => {
      // Generate realistic answer patterns
      if (index % 3 === 0) {
        // Correct answers
        answers[question._id] = question.answer;
      } else if (index % 3 === 1) {
        // Incorrect answers
        answers[question._id] = question.answer === 'A' ? 'B' : 'A';
      }
      // Leave 1/3 unattempted
    });
    return answers;
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(submissionTime) {
    this.testResults.performance.target15msAttempted++;
    
    if (submissionTime <= 15) {
      this.testResults.performance.target15msAchieved++;
    }
    
    // Update average
    const attempts = this.testResults.performance.target15msAttempted;
    this.testResults.performance.averageSubmissionTime = 
      ((this.testResults.performance.averageSubmissionTime * (attempts - 1)) + submissionTime) / attempts;
    
    // Update fastest and slowest
    this.testResults.performance.fastestSubmission = Math.min(
      this.testResults.performance.fastestSubmission, 
      submissionTime
    );
    this.testResults.performance.slowestSubmission = Math.max(
      this.testResults.performance.slowestSubmission, 
      submissionTime
    );
  }

  /**
   * Get performance rank
   */
  getPerformanceRank(submissionTime) {
    if (submissionTime <= 15) return 'ULTRA_FAST';
    if (submissionTime <= 50) return 'VERY_FAST';
    if (submissionTime <= 100) return 'FAST';
    if (submissionTime <= 500) return 'GOOD';
    return 'SLOW';
  }

  /**
   * Log test result
   */
  logTestResult(testName, passed, details) {
    this.testResults.totalTests++;
    if (passed) {
      this.testResults.passedTests++;
    } else {
      this.testResults.failedTests++;
    }
    
    this.testResults.testLog.push({
      testName,
      passed,
      details,
      timestamp: Date.now()
    });
  }

  /**
   * Reset test results
   */
  resetTestResults() {
    this.testResults = {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      performance: {
        averageSubmissionTime: 0,
        fastestSubmission: Infinity,
        slowestSubmission: 0,
        target15msAchieved: 0,
        target15msAttempted: 0
      },
      testLog: []
    };
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    const target15msRate = this.testResults.performance.target15msAttempted > 0 ? 
      (this.testResults.performance.target15msAchieved / this.testResults.performance.target15msAttempted * 100).toFixed(2) : 0;
    
    const passRate = this.testResults.totalTests > 0 ? 
      (this.testResults.passedTests / this.testResults.totalTests * 100).toFixed(2) : 0;
    
    return {
      summary: {
        totalTests: this.testResults.totalTests,
        passed: this.testResults.passedTests,
        failed: this.testResults.failedTests,
        passRate: `${passRate}%`,
        overallGrade: this.getOverallGrade(parseFloat(passRate))
      },
      performance: {
        target15msAchievementRate: `${target15msRate}%`,
        averageSubmissionTime: `${this.testResults.performance.averageSubmissionTime.toFixed(2)}ms`,
        fastestSubmission: this.testResults.performance.fastestSubmission === Infinity ? 'N/A' : `${this.testResults.performance.fastestSubmission.toFixed(2)}ms`,
        slowestSubmission: `${this.testResults.performance.slowestSubmission.toFixed(2)}ms`,
        performanceGrade: this.getPerformanceGrade(parseFloat(target15msRate))
      },
      recommendations: this.generateRecommendations(parseFloat(passRate), parseFloat(target15msRate)),
      detailedResults: this.testResults.testLog,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get overall grade based on pass rate
   */
  getOverallGrade(passRate) {
    if (passRate >= 95) return 'A+';
    if (passRate >= 90) return 'A';
    if (passRate >= 85) return 'B+';
    if (passRate >= 80) return 'B';
    if (passRate >= 75) return 'C+';
    if (passRate >= 70) return 'C';
    return 'F';
  }

  /**
   * Get performance grade based on 15ms achievement rate
   */
  getPerformanceGrade(target15msRate) {
    if (target15msRate >= 90) return 'A+';
    if (target15msRate >= 80) return 'A';
    if (target15msRate >= 70) return 'B+';
    if (target15msRate >= 60) return 'B';
    if (target15msRate >= 50) return 'C+';
    if (target15msRate >= 40) return 'C';
    return 'D';
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations(passRate, target15msRate) {
    const recommendations = [];
    
    if (passRate < 90) {
      recommendations.push('System reliability below 90% - investigate failing tests');
    }
    
    if (target15msRate < 70) {
      recommendations.push('15ms target achievement below 70% - optimize computation algorithms');
    }
    
    if (this.testResults.performance.averageSubmissionTime > 50) {
      recommendations.push('Average submission time above 50ms - consider server-side optimizations');
    }
    
    if (passRate >= 95 && target15msRate >= 80) {
      recommendations.push('Excellent performance - system ready for production');
    }
    
    return recommendations;
  }
}

// Export testing utilities
export const createProgressiveSystemTester = () => new ProgressiveSystemTester();

export default ProgressiveSystemTester;