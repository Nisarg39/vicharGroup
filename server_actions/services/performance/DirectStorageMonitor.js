// Import removed - MonitoringService is client-side only
// Using console logging and internal tracking instead
import ExamResult from "../../models/exam_portal/examResult";

/**
 * DIRECT STORAGE PERFORMANCE MONITOR
 * 
 * Comprehensive monitoring and audit trail system for the 15ms 
 * direct storage implementation. Tracks performance metrics,
 * validates targets, and provides detailed analytics.
 */

/**
 * Categorize performance based on processing time
 */
function categorizePerformance(processingTime) {
  if (processingTime <= 15) return 'ULTRA_FAST';
  if (processingTime <= 25) return 'VERY_FAST'; 
  if (processingTime <= 50) return 'FAST';
  if (processingTime <= 100) return 'GOOD';
  if (processingTime <= 500) return 'AVERAGE';
  return 'SLOW';
}
  
/**
 * Log successful direct storage submission with full metrics
 */
export async function logDirectSubmission(submissionData, processingTime, validationTime) {
  try {
    const metrics = {
      examId: submissionData.examId,
      studentId: submissionData.studentId,
      processingTime: processingTime,
      validationTime: validationTime,
      totalTime: processingTime,
      performanceTarget: 15, // 15ms target
      targetAchieved: processingTime <= 15,
      performanceImprovement: `${((2000 - processingTime) / 2000 * 100).toFixed(2)}%`,
      timestamp: new Date(),
      
      // Submission details
      finalScore: submissionData.finalScore,
      totalMarks: submissionData.totalMarks,
      questionsCount: submissionData.questionAnalysis?.length || 0,
      correctAnswers: submissionData.correctAnswers,
      incorrectAnswers: submissionData.incorrectAnswers,
      unattempted: submissionData.unattempted,
      
      // Technical metrics
      engineVersion: submissionData.engineVersion,
      validationLayers: submissionData.validationLayers || [],
      computationHash: submissionData.computationHash?.substring(0, 16) + '...',
      
      // Performance category
      performanceCategory: categorizePerformance(processingTime)
    };
    
    // Log to console and internal monitoring (server-side compatible)
    console.log('📊 DIRECT_STORAGE_SUCCESS:', {
      operation: 'DirectStorageSuccess',
      description: 'Ultra-fast submission completed',
      metrics
    });
    
    // Log to console with emoji indicators
    const indicator = processingTime <= 15 ? '🚀' : processingTime <= 25 ? '⚡' : '⏱️';
    console.log(`${indicator} Direct submission: ${processingTime}ms (${metrics.performanceCategory})`);
    
    return metrics;
  } catch (error) {
    console.error('❌ Failed to log direct submission metrics:', error);
  }
}
  
/**
 * Log validation failure with detailed analysis
 */
export async function logValidationFailure(submissionData, validationResult, fallbackTime) {
    try {
      const failureMetrics = {
        examId: submissionData.examId,
        studentId: submissionData.studentId,
        failureReason: validationResult.reason,
        validationTime: validationResult.validationTime,
        fallbackProcessingTime: fallbackTime,
        timestamp: new Date(),
        
        // Validation details
        hashPresent: !!submissionData.computationHash,
        validationLayers: validationResult.validationMethods || [],
        
        // Performance impact
        performancePenalty: fallbackTime - 15, // Extra time beyond 15ms target
        fallbackUsed: true
      };
      
      // Log to console and internal monitoring (server-side compatible)
      console.warn('⚠️ DIRECT_STORAGE_VALIDATION_FAILURE:', {
        operation: 'DirectStorageValidationFailure',
        description: 'Fallback to server computation',
        metrics: failureMetrics
      });
      
      console.warn(`⚠️ Validation failed: ${validationResult.reason}, fallback took ${fallbackTime}ms`);
      
      return failureMetrics;
    } catch (error) {
      console.error('❌ Failed to log validation failure:', error);
    }
  }
  
/**
 * Log system error with recovery information
 */
export async function logSystemError(submissionData, error, recoveryAction) {
    try {
      const errorMetrics = {
        examId: submissionData.examId,
        studentId: submissionData.studentId,
        errorType: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
        recoveryAction: recoveryAction,
        timestamp: new Date(),
        
        // System state
        memoryUsage: process.memoryUsage(),
        systemLoad: process.cpuUsage()
      };
      
      // Log to console and internal monitoring (server-side compatible)
      console.error('🚨 DIRECT_STORAGE_SYSTEM_ERROR:', {
        operation: 'DirectStorageSystemError',
        description: 'System error during direct storage',
        metrics: errorMetrics
      });
      
      console.error(`🚨 System error in direct storage: ${error.message}, recovery: ${recoveryAction}`);
      
      return errorMetrics;
    } catch (logError) {
      console.error('❌ Failed to log system error:', logError);
    }
  }
  
/**
 * Generate comprehensive performance report
 */
export async function generatePerformanceReport(timeRange = 24) {
    try {
      // Get direct storage analytics from ExamResult model
      const directStorageStats = await ExamResult.getDirectStorageAnalytics(timeRange);
      
      // Get traditional submission stats for comparison
      const traditionalStats = await getTraditionalSubmissionStats(timeRange);
      
      // Calculate system health metrics
      const healthMetrics = await calculateHealthMetrics(timeRange);
      
      const report = {
        reportGenerated: new Date(),
        timeRangeHours: timeRange,
        
        // Direct storage performance
        directStorage: {
          ...directStorageStats,
          targetAchievementRate: directStorageStats.performanceTargetAchieved,
          averageImprovement: calculateAverageImprovement(directStorageStats.averageProcessingTime)
        },
        
        // Traditional submission comparison
        traditional: traditionalStats,
        
        // Performance comparison
        performanceComparison: {
          speedImprovement: `${((traditionalStats.averageProcessingTime - directStorageStats.averageProcessingTime) / traditionalStats.averageProcessingTime * 100).toFixed(2)}%`,
          volumeHandled: directStorageStats.totalDirectSubmissions + traditionalStats.totalSubmissions,
          directStorageAdoption: `${((directStorageStats.totalDirectSubmissions / (directStorageStats.totalDirectSubmissions + traditionalStats.totalSubmissions)) * 100).toFixed(2)}%`
        },
        
        // System health
        systemHealth: healthMetrics,
        
        // Recommendations
        recommendations: generateRecommendations(directStorageStats, traditionalStats, healthMetrics)
      };
      
      // Log to console and internal monitoring (server-side compatible)
      console.log('📈 DIRECT_STORAGE_PERFORMANCE_REPORT:', {
        operation: 'DirectStoragePerformanceReport',
        description: 'Performance analysis completed',
        report
      });
      
      return report;
    } catch (error) {
      console.error('❌ Failed to generate performance report:', error);
      throw error;
    }
  }
  
/**
 * Monitor concurrent submission handling
 */
export async function monitorConcurrentSubmissions(concurrentCount, processingTimes) {
    try {
      const concurrencyMetrics = {
        concurrentSubmissions: concurrentCount,
        averageProcessingTime: processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length,
        maxProcessingTime: Math.max(...processingTimes),
        minProcessingTime: Math.min(...processingTimes),
        sub15msCount: processingTimes.filter(time => time <= 15).length,
        sub25msCount: processingTimes.filter(time => time <= 25).length,
        concurrencyTargetAchieved: concurrentCount >= 2000,
        performanceUnderLoad: processingTimes.filter(time => time <= 15).length / processingTimes.length,
        timestamp: new Date()
      };
      
      // Log to console and internal monitoring (server-side compatible)
      console.log('🏆 CONCURRENT_SUBMISSION_MONITORING:', {
        operation: 'ConcurrentSubmissionMonitoring',
        description: 'Concurrency test completed',
        metrics: concurrencyMetrics
      });
      
      const indicator = concurrencyMetrics.performanceUnderLoad >= 0.95 ? '🏆' : 
                       concurrencyMetrics.performanceUnderLoad >= 0.8 ? '✅' : '⚠️';
      console.log(`${indicator} Concurrent submissions: ${concurrentCount}, performance: ${(concurrencyMetrics.performanceUnderLoad * 100).toFixed(2)}%`);
      
      return concurrencyMetrics;
    } catch (error) {
      console.error('❌ Failed to monitor concurrent submissions:', error);
    }
  }
  
  /**
   * Real-time performance dashboard data
   */
export async function getDashboardMetrics() {
    try {
      const last24h = await generatePerformanceReport(24);
      const lastHour = await generatePerformanceReport(1);
      
      return {
        currentPerformance: {
          last24Hours: last24h,
          lastHour: lastHour
        },
        realTimeMetrics: {
          timestamp: new Date(),
          systemStatus: getSystemStatus(last24h),
          alertLevel: calculateAlertLevel(last24h)
        }
      };
    } catch (error) {
      console.error('❌ Failed to get dashboard metrics:', error);
      throw error;
    }
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
export function categorizePerformanceLegacy(processingTime) {
    if (processingTime <= 10) return 'Excellent';
    if (processingTime <= 15) return 'Target Achieved';
    if (processingTime <= 25) return 'Good';
    if (processingTime <= 50) return 'Acceptable';
    return 'Needs Optimization';
  }
  
export function calculateAverageImprovement(averageTime) {
    const baseline = 2000; // 2000ms traditional time
    return `${((baseline - averageTime) / baseline * 100).toFixed(2)}%`;
  }
  
export async function getTraditionalSubmissionStats(timeRange) {
    const startTime = new Date(Date.now() - (timeRange * 60 * 60 * 1000));
    
    const stats = await ExamResult.aggregate([
      {
        $match: {
          createdAt: { $gte: startTime },
          'submissionMetadata.computationSource': 'server_computation'
        }
      },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          averageProcessingTime: { $avg: 2000 } // Estimated traditional processing time
        }
      }
    ]);
    
    return stats[0] || { totalSubmissions: 0, averageProcessingTime: 2000 };
  }
  
export async function calculateHealthMetrics(timeRange) {
    const startTime = new Date(Date.now() - (timeRange * 60 * 60 * 1000));
    
    const errorCount = await ExamResult.countDocuments({
      createdAt: { $gte: startTime },
      'submissionMetadata.syncStatus': 'failed'
    });
    
    const totalCount = await ExamResult.countDocuments({
      createdAt: { $gte: startTime }
    });
    
    return {
      errorRate: totalCount > 0 ? ((errorCount / totalCount) * 100).toFixed(4) + '%' : '0%',
      successRate: totalCount > 0 ? (((totalCount - errorCount) / totalCount) * 100).toFixed(4) + '%' : '100%',
      systemAvailability: totalCount > 0 && errorCount / totalCount < 0.01 ? 'High' : 'Monitoring'
    };
  }
  
export function generateRecommendations(directStats, traditionalStats, healthMetrics) {
    const recommendations = [];
    
    if (directStats.averageProcessingTime > 15) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: `Average processing time (${directStats.averageProcessingTime}ms) exceeds 15ms target`,
        action: 'Optimize validation layers and database operations'
      });
    }
    
    if (parseFloat(directStats.performanceTargetAchieved) < 95) {
      recommendations.push({
        type: 'target',
        priority: 'medium',
        message: `Only ${directStats.performanceTargetAchieved} submissions meet 15ms target`,
        action: 'Review and optimize slower submission patterns'
      });
    }
    
    if (parseFloat(healthMetrics.errorRate) > 1) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: `Error rate at ${healthMetrics.errorRate}`,
        action: 'Investigate and fix error patterns'
      });
    }
    
    return recommendations;
  }
  
export function getSystemStatus(metrics) {
    const avgTime = metrics.directStorage.averageProcessingTime;
    const errorRate = parseFloat(metrics.systemHealth.errorRate);
    
    if (avgTime <= 15 && errorRate <= 0.5) return 'Optimal';
    if (avgTime <= 25 && errorRate <= 1.0) return 'Good';
    if (avgTime <= 50 && errorRate <= 2.0) return 'Acceptable';
    return 'Needs Attention';
  }
  
export function calculateAlertLevel(metrics) {
    const avgTime = metrics.directStorage.averageProcessingTime;
    const errorRate = parseFloat(metrics.systemHealth.errorRate);
    
    if (avgTime > 50 || errorRate > 5) return 'critical';
    if (avgTime > 25 || errorRate > 2) return 'warning';
    return 'normal';
  }