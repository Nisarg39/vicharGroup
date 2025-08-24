import { submitProgressiveResultDirect } from "../../actions/examController/progressiveSubmissionHandler";
import { monitorConcurrentSubmissions, generatePerformanceReport } from "../../services/performance/DirectStorageMonitor";
import { connectDB } from "../../config/mongoose";

/**
 * CONCURRENT SUBMISSION TEST SUITE
 * 
 * Comprehensive testing system for validating the 2000+ concurrent user capacity
 * and 15ms response time target under load conditions.
 */

export class ConcurrentSubmissionTest {
  
  /**
   * Test 2000+ concurrent submissions with performance validation
   */
  static async testConcurrentCapacity(concurrentUsers = 2000, testDuration = 30000) {
    console.log(`🚀 Starting concurrent submission test: ${concurrentUsers} users over ${testDuration/1000}s`);
    
    try {
      await connectDB();
      
      const testResults = {
        testConfig: {
          concurrentUsers: concurrentUsers,
          testDurationMs: testDuration,
          targetResponseTime: 15,
          startTime: new Date()
        },
        results: {
          totalSubmissions: 0,
          successfulSubmissions: 0,
          failedSubmissions: 0,
          processingTimes: [],
          sub15msCount: 0,
          sub25msCount: 0,
          averageResponseTime: 0,
          maxResponseTime: 0,
          minResponseTime: 0,
          errorRate: 0,
          throughputPerSecond: 0
        },
        performanceBreakdown: {
          excellent: 0,    // <= 10ms
          target: 0,       // <= 15ms  
          good: 0,         // <= 25ms
          acceptable: 0,   // <= 50ms
          needsWork: 0     // > 50ms
        },
        systemHealth: {
          memoryUsage: [],
          cpuUsage: [],
          errorPatterns: []
        }
      };
      
      // Generate test data for concurrent submissions
      const testSubmissions = this.generateTestSubmissionData(concurrentUsers);
      
      // Execute concurrent submissions
      const submissionPromises = testSubmissions.map(async (submission, index) => {
        const startTime = Date.now();
        
        try {
          // Add slight jitter to simulate real-world conditions
          await this.sleep(Math.random() * 100);
          
          const result = await submitProgressiveResultDirect(submission);
          const processingTime = Date.now() - startTime;
          
          return {
            success: true,
            processingTime: processingTime,
            submissionId: `test_${index}`,
            result: result
          };
        } catch (error) {
          const processingTime = Date.now() - startTime;
          
          return {
            success: false,
            processingTime: processingTime,
            submissionId: `test_${index}`,
            error: error.message
          };
        }
      });
      
      // Wait for all submissions with timeout
      const submissionResults = await this.executeWithTimeout(
        Promise.allSettled(submissionPromises), 
        testDuration
      );
      
      // Process results
      this.processTestResults(submissionResults, testResults);
      
      // Log comprehensive monitoring data
      await monitorConcurrentSubmissions(
        concurrentUsers, 
        testResults.results.processingTimes
      );
      
      // Generate performance report
      const performanceReport = await generatePerformanceReport(1);
      
      testResults.endTime = new Date();
      testResults.performanceReport = performanceReport;
      
      console.log(`✅ Concurrent test completed: ${testResults.results.successfulSubmissions}/${concurrentUsers} successful`);
      console.log(`📊 Average response: ${testResults.results.averageResponseTime}ms, Target achieved: ${((testResults.results.sub15msCount / testResults.results.totalSubmissions) * 100).toFixed(2)}%`);
      
      return testResults;
      
    } catch (error) {
      console.error('❌ Concurrent submission test failed:', error);
      throw error;
    }
  }
  
  /**
   * Load test with gradually increasing concurrent users
   */
  static async performLoadTest(startUsers = 100, maxUsers = 2500, incrementSize = 250) {
    console.log(`🔄 Starting load test: ${startUsers} to ${maxUsers} users (increment: ${incrementSize})`);
    
    const loadTestResults = {
      testConfig: {
        startUsers: startUsers,
        maxUsers: maxUsers,
        incrementSize: incrementSize,
        startTime: new Date()
      },
      stageResults: [],
      performanceThresholds: {
        responseTime: 15,
        successRate: 95,
        maxAcceptableErrorRate: 5
      }
    };
    
    for (let currentUsers = startUsers; currentUsers <= maxUsers; currentUsers += incrementSize) {
      console.log(`📈 Testing ${currentUsers} concurrent users...`);
      
      const stageResult = await this.testConcurrentCapacity(currentUsers, 15000); // 15 second test per stage
      
      stageResult.stageInfo = {
        userCount: currentUsers,
        stageNumber: Math.floor((currentUsers - startUsers) / incrementSize) + 1
      };
      
      loadTestResults.stageResults.push(stageResult);
      
      // Check if system is degrading beyond acceptable limits
      if (stageResult.results.errorRate > 5 || stageResult.results.averageResponseTime > 50) {
        console.warn(`⚠️ Performance degradation detected at ${currentUsers} users`);
        loadTestResults.performanceDegradationPoint = currentUsers;
        break;
      }
      
      // Brief pause between stages to allow system recovery
      await this.sleep(2000);
    }
    
    loadTestResults.endTime = new Date();
    loadTestResults.recommendation = this.generateLoadTestRecommendation(loadTestResults);
    
    console.log(`🏁 Load test completed. Maximum stable capacity: ${this.findMaxStableCapacity(loadTestResults)} users`);
    
    return loadTestResults;
  }
  
  /**
   * Stress test to find system breaking point
   */
  static async performStressTest(maxUsers = 5000, aggressiveIncrement = 500) {
    console.log(`⚡ Starting stress test to find system limits (max: ${maxUsers} users)`);
    
    const stressTestResults = {
      testConfig: {
        maxUsers: maxUsers,
        increment: aggressiveIncrement,
        startTime: new Date()
      },
      breakingPoint: null,
      stageResults: [],
      systemLimits: {
        maxSuccessfulConcurrency: 0,
        criticalFailurePoint: null,
        recoveryTime: null
      }
    };
    
    let currentUsers = 1000; // Start high for stress testing
    let consecutiveFailures = 0;
    
    while (currentUsers <= maxUsers && consecutiveFailures < 3) {
      console.log(`💥 Stress testing ${currentUsers} concurrent users...`);
      
      try {
        const stageResult = await this.testConcurrentCapacity(currentUsers, 10000); // 10 second bursts
        
        stageResult.stageInfo = {
          userCount: currentUsers,
          isStressTest: true
        };
        
        stressTestResults.stageResults.push(stageResult);
        
        // Check for system failure indicators
        if (stageResult.results.errorRate > 20 || stageResult.results.averageResponseTime > 100) {
          consecutiveFailures++;
          
          if (consecutiveFailures === 1) {
            stressTestResults.breakingPoint = currentUsers;
            console.warn(`🚨 Breaking point identified at ${currentUsers} concurrent users`);
          }
        } else {
          consecutiveFailures = 0;
          stressTestResults.systemLimits.maxSuccessfulConcurrency = currentUsers;
        }
        
        currentUsers += aggressiveIncrement;
        
      } catch (error) {
        console.error(`💥 System failure at ${currentUsers} users:`, error);
        stressTestResults.systemLimits.criticalFailurePoint = currentUsers;
        break;
      }
      
      // Brief recovery pause
      await this.sleep(1000);
    }
    
    stressTestResults.endTime = new Date();
    console.log(`🎯 Stress test completed. Breaking point: ${stressTestResults.breakingPoint} users`);
    
    return stressTestResults;
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  static generateTestSubmissionData(count) {
    const submissions = [];
    
    for (let i = 0; i < count; i++) {
      submissions.push({
        examId: "test_exam_" + Math.floor(i / 100), // Spread across multiple exams
        studentId: "test_student_" + i,
        finalScore: Math.floor(Math.random() * 180) + 20, // 20-200 range
        totalMarks: 200,
        correctAnswers: Math.floor(Math.random() * 40) + 10,
        incorrectAnswers: Math.floor(Math.random() * 20) + 5,
        unattempted: Math.floor(Math.random() * 10) + 2,
        timeTaken: Math.floor(Math.random() * 7200) + 1800, // 30min to 2hr
        completedAt: new Date(),
        computedAt: new Date(),
        
        // Mock progressive computation data
        questionAnalysis: this.generateMockQuestionAnalysis(50),
        subjectPerformance: this.generateMockSubjectPerformance(),
        answers: this.generateMockAnswers(50),
        
        // Progressive computation metadata
        engineVersion: "1.3.0",
        computationHash: this.generateMockHash(),
        validationLayers: ["hash", "statistical", "spot_check", "security", "temporal"],
        
        // Test metadata
        isTestSubmission: true,
        testBatchId: "concurrent_test_" + Date.now(),
        
        // Raw exam data for fallback
        rawExamData: {
          examId: "test_exam_" + Math.floor(i / 100),
          studentId: "test_student_" + i,
          answers: this.generateMockAnswers(50),
          timeTaken: Math.floor(Math.random() * 7200) + 1800,
          completedAt: new Date()
        }
      });
    }
    
    return submissions;
  }
  
  static generateMockQuestionAnalysis(questionCount) {
    const analysis = [];
    for (let i = 0; i < questionCount; i++) {
      analysis.push({
        questionId: `mock_question_${i}`,
        status: ['correct', 'incorrect', 'unattempted'][Math.floor(Math.random() * 3)],
        marks: Math.random() > 0.7 ? 4 : Math.random() > 0.9 ? -1 : 0,
        userAnswer: Math.random() > 0.2 ? ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)] : null,
        correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]
      });
    }
    return analysis;
  }
  
  static generateMockSubjectPerformance() {
    const subjects = ['Physics', 'Chemistry', 'Mathematics'];
    return subjects.map(subject => ({
      subject: subject,
      totalQuestions: Math.floor(Math.random() * 20) + 15,
      attempted: Math.floor(Math.random() * 18) + 12,
      correct: Math.floor(Math.random() * 15) + 8,
      incorrect: Math.floor(Math.random() * 8) + 2,
      unanswered: Math.floor(Math.random() * 5) + 1,
      marks: Math.floor(Math.random() * 60) + 20,
      totalMarks: 80,
      accuracy: Math.floor(Math.random() * 40) + 60
    }));
  }
  
  static generateMockAnswers(questionCount) {
    const answers = {};
    for (let i = 0; i < questionCount; i++) {
      if (Math.random() > 0.2) { // 80% attempted
        answers[`mock_question_${i}`] = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
      }
    }
    return answers;
  }
  
  static generateMockHash() {
    return Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
  
  static async executeWithTimeout(promise, timeoutMs) {
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Test timeout after ${timeoutMs}ms`)), timeoutMs)
    );
    
    return Promise.race([promise, timeout]);
  }
  
  static processTestResults(submissionResults, testResults) {
    for (const result of submissionResults) {
      testResults.results.totalSubmissions++;
      
      if (result.status === 'fulfilled' && result.value.success) {
        testResults.results.successfulSubmissions++;
        const time = result.value.processingTime;
        testResults.results.processingTimes.push(time);
        
        // Performance breakdown
        if (time <= 10) testResults.performanceBreakdown.excellent++;
        else if (time <= 15) testResults.performanceBreakdown.target++;
        else if (time <= 25) testResults.performanceBreakdown.good++;
        else if (time <= 50) testResults.performanceBreakdown.acceptable++;
        else testResults.performanceBreakdown.needsWork++;
        
        // Target counters
        if (time <= 15) testResults.results.sub15msCount++;
        if (time <= 25) testResults.results.sub25msCount++;
      } else {
        testResults.results.failedSubmissions++;
        if (result.value && result.value.processingTime) {
          testResults.results.processingTimes.push(result.value.processingTime);
        }
      }
    }
    
    // Calculate aggregates
    const times = testResults.results.processingTimes;
    if (times.length > 0) {
      testResults.results.averageResponseTime = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
      testResults.results.maxResponseTime = Math.max(...times);
      testResults.results.minResponseTime = Math.min(...times);
    }
    
    testResults.results.errorRate = ((testResults.results.failedSubmissions / testResults.results.totalSubmissions) * 100).toFixed(2);
    testResults.results.throughputPerSecond = Math.round(testResults.results.totalSubmissions / 30); // Assuming 30s test
  }
  
  static findMaxStableCapacity(loadTestResults) {
    let maxCapacity = 0;
    
    for (const stage of loadTestResults.stageResults) {
      if (stage.results.errorRate <= 2 && stage.results.averageResponseTime <= 25) {
        maxCapacity = stage.stageInfo.userCount;
      } else {
        break;
      }
    }
    
    return maxCapacity;
  }
  
  static generateLoadTestRecommendation(loadTestResults) {
    const maxStable = this.findMaxStableCapacity(loadTestResults);
    const recommendations = [];
    
    if (maxStable >= 2000) {
      recommendations.push({
        type: 'success',
        message: `System successfully handles 2000+ concurrent users (tested up to ${maxStable})`
      });
    } else {
      recommendations.push({
        type: 'optimization',
        message: `Maximum stable capacity is ${maxStable} users. Consider optimization for 2000+ target.`
      });
    }
    
    const lastStage = loadTestResults.stageResults[loadTestResults.stageResults.length - 1];
    if (lastStage && lastStage.results.averageResponseTime > 15) {
      recommendations.push({
        type: 'performance',
        message: `Response time exceeds 15ms target at high loads. Current: ${lastStage.results.averageResponseTime}ms`
      });
    }
    
    return recommendations;
  }
  
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ConcurrentSubmissionTest;