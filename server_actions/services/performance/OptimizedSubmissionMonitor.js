"use server";

import { connectDB } from "../../config/mongoose";
import ExamResult from "../../models/exam_portal/examResult";

/**
 * OPTIMIZED SUBMISSION PERFORMANCE MONITOR
 * 
 * Comprehensive monitoring system for tracking the performance of the
 * optimized submission endpoint and ensuring 15-50ms targets are met.
 * 
 * FEATURES:
 * ✅ Real-time performance tracking
 * ✅ Target achievement monitoring
 * ✅ Fallback pattern analysis  
 * ✅ Performance regression detection
 * ✅ Bottleneck identification
 * ✅ Optimization impact measurement
 */

class OptimizedSubmissionMonitor {
  constructor() {
    this.performanceCache = new Map();
    this.alertThresholds = {
      target15ms: 15,
      target50ms: 50,
      warningThreshold: 100,
      criticalThreshold: 500
    };
  }

  /**
   * Log optimized submission performance
   */
  async logOptimizedSubmission(submissionData, performanceMetrics) {
    try {
      const logEntry = {
        timestamp: new Date(),
        examId: submissionData.examId,
        studentId: submissionData.studentId,
        totalTime: performanceMetrics.totalTime,
        validationTime: performanceMetrics.validationTime,
        storageTime: performanceMetrics.storageTime,
        target15msAchieved: performanceMetrics.totalTime <= 15,
        target50msAchieved: performanceMetrics.totalTime <= 50,
        optimizationType: performanceMetrics.optimizationUsed,
        dataSize: this.calculateDataSize(submissionData),
        questionCount: submissionData.questionAnalysis?.length || 0,
        subjectCount: submissionData.subjectPerformance?.length || 0
      };

      // Store in cache for quick access
      this.performanceCache.set(`${submissionData.examId}_${submissionData.studentId}`, logEntry);

      // Log to console for debugging
      console.log(`📊 OPTIMIZATION MONITOR: ${performanceMetrics.totalTime}ms (Target 15ms: ${logEntry.target15msAchieved ? '✅' : '❌'}, Target 50ms: ${logEntry.target50msAchieved ? '✅' : '❌'})`);

      // Check for performance regression
      await this.checkPerformanceRegression(logEntry);

      return logEntry;
    } catch (error) {
      console.error('❌ Optimization monitoring error:', error);
      return null;
    }
  }

  /**
   * Log fallback usage for analysis
   */
  async logFallbackUsage(submissionData, fallbackType, reason, processingTime) {
    try {
      const fallbackEntry = {
        timestamp: new Date(),
        examId: submissionData.examId,
        studentId: submissionData.studentId,
        fallbackType: fallbackType, // 'queue_system', 'traditional_computation', 'validation_failed'
        reason: reason,
        processingTime: processingTime,
        optimizationFailed: true,
        dataSize: this.calculateDataSize(submissionData)
      };

      console.log(`⚠️ FALLBACK MONITOR: ${fallbackType} used (${reason}) - ${processingTime}ms`);

      // Check fallback rate
      await this.analyzeFallbackRate(fallbackEntry);

      return fallbackEntry;
    } catch (error) {
      console.error('❌ Fallback monitoring error:', error);
      return null;
    }
  }

  /**
   * Get real-time performance dashboard data
   */
  async getPerformanceDashboard(timeRange = 1) { // timeRange in hours
    try {
      await connectDB();

      const startTime = new Date(Date.now() - (timeRange * 60 * 60 * 1000));

      // Get optimization statistics
      const optimizedStats = await ExamResult.aggregate([
        {
          $match: {
            'submissionMetadata.directStorageUsed': true,
            createdAt: { $gte: startTime }
          }
        },
        {
          $group: {
            _id: null,
            totalOptimizedSubmissions: { $sum: 1 },
            averageProcessingTime: { $avg: '$submissionMetadata.processingTime' },
            maxProcessingTime: { $max: '$submissionMetadata.processingTime' },
            minProcessingTime: { $min: '$submissionMetadata.processingTime' },
            target15msAchieved: {
              $sum: {
                $cond: [
                  { $lte: ['$submissionMetadata.processingTime', 15] },
                  1, 0
                ]
              }
            },
            target50msAchieved: {
              $sum: {
                $cond: [
                  { $lte: ['$submissionMetadata.processingTime', 50] },
                  1, 0
                ]
              }
            }
          }
        }
      ]);

      // Get total submissions for comparison
      const totalSubmissions = await ExamResult.countDocuments({
        createdAt: { $gte: startTime }
      });

      // Get traditional submissions
      const traditionalSubmissions = await ExamResult.countDocuments({
        'submissionMetadata.directStorageUsed': { $ne: true },
        createdAt: { $gte: startTime }
      });

      const optimizedData = optimizedStats[0] || {
        totalOptimizedSubmissions: 0,
        averageProcessingTime: 0,
        maxProcessingTime: 0,
        minProcessingTime: 0,
        target15msAchieved: 0,
        target50msAchieved: 0
      };

      // Calculate performance metrics
      const optimizationRate = totalSubmissions > 0 
        ? (optimizedData.totalOptimizedSubmissions / totalSubmissions) * 100 
        : 0;

      const target15msRate = optimizedData.totalOptimizedSubmissions > 0
        ? (optimizedData.target15msAchieved / optimizedData.totalOptimizedSubmissions) * 100
        : 0;

      const target50msRate = optimizedData.totalOptimizedSubmissions > 0
        ? (optimizedData.target50msAchieved / optimizedData.totalOptimizedSubmissions) * 100
        : 0;

      // Estimated time savings
      const avgTraditionalTime = 1200; // Estimated 1200ms for traditional computation
      const timeSavedPerSubmission = avgTraditionalTime - (optimizedData.averageProcessingTime || 0);
      const totalTimeSaved = (timeSavedPerSubmission * optimizedData.totalOptimizedSubmissions) / 1000; // Convert to seconds

      return {
        success: true,
        timeRange: `${timeRange} hour${timeRange !== 1 ? 's' : ''}`,
        timestamp: new Date(),
        
        // Overall statistics
        overview: {
          totalSubmissions,
          optimizedSubmissions: optimizedData.totalOptimizedSubmissions,
          traditionalSubmissions,
          optimizationRate: `${optimizationRate.toFixed(1)}%`
        },

        // Performance metrics
        performance: {
          averageProcessingTime: `${(optimizedData.averageProcessingTime || 0).toFixed(1)}ms`,
          minProcessingTime: `${optimizedData.minProcessingTime || 0}ms`,
          maxProcessingTime: `${optimizedData.maxProcessingTime || 0}ms`,
          target15msRate: `${target15msRate.toFixed(1)}%`,
          target50msRate: `${target50msRate.toFixed(1)}%`
        },

        // Impact analysis
        impact: {
          estimatedTimeSavedPerSubmission: `${timeSavedPerSubmission.toFixed(0)}ms`,
          totalTimeSaved: `${totalTimeSaved.toFixed(1)} seconds`,
          performanceImprovement: `${((timeSavedPerSubmission / avgTraditionalTime) * 100).toFixed(1)}%`
        },

        // Health indicators
        health: {
          status: this.getHealthStatus(target15msRate, target50msRate, optimizationRate),
          recommendations: this.getHealthRecommendations(target15msRate, target50msRate, optimizationRate)
        }
      };

    } catch (error) {
      console.error('❌ Performance dashboard error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get detailed performance breakdown by exam or time period
   */
  async getDetailedPerformanceAnalysis(examId = null, timeRange = 24) {
    try {
      await connectDB();

      const startTime = new Date(Date.now() - (timeRange * 60 * 60 * 1000));
      
      const matchCriteria = {
        'submissionMetadata.directStorageUsed': true,
        createdAt: { $gte: startTime }
      };

      if (examId) {
        matchCriteria.exam = examId;
      }

      const performanceBreakdown = await ExamResult.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: '$exam',
            examName: { $first: '$examName' },
            submissionCount: { $sum: 1 },
            averageProcessingTime: { $avg: '$submissionMetadata.processingTime' },
            minProcessingTime: { $min: '$submissionMetadata.processingTime' },
            maxProcessingTime: { $max: '$submissionMetadata.processingTime' },
            ultraFastSubmissions: {
              $sum: {
                $cond: [{ $lte: ['$submissionMetadata.processingTime', 15] }, 1, 0]
              }
            },
            fastSubmissions: {
              $sum: {
                $cond: [
                  { $and: [
                    { $gt: ['$submissionMetadata.processingTime', 15] },
                    { $lte: ['$submissionMetadata.processingTime', 50] }
                  ]},
                  1, 0
                ]
              }
            },
            slowSubmissions: {
              $sum: {
                $cond: [{ $gt: ['$submissionMetadata.processingTime', 50] }, 1, 0]
              }
            }
          }
        },
        { $sort: { submissionCount: -1 } }
      ]);

      return {
        success: true,
        analysis: performanceBreakdown.map(exam => ({
          examId: exam._id,
          examName: exam.examName,
          metrics: {
            totalSubmissions: exam.submissionCount,
            averageTime: `${exam.averageProcessingTime.toFixed(1)}ms`,
            minTime: `${exam.minProcessingTime}ms`,
            maxTime: `${exam.maxProcessingTime}ms`,
            ultraFastRate: `${((exam.ultraFastSubmissions / exam.submissionCount) * 100).toFixed(1)}%`,
            fastRate: `${((exam.fastSubmissions / exam.submissionCount) * 100).toFixed(1)}%`,
            slowRate: `${((exam.slowSubmissions / exam.submissionCount) * 100).toFixed(1)}%`
          },
          performanceDistribution: {
            ultraFast: exam.ultraFastSubmissions, // ≤15ms
            fast: exam.fastSubmissions, // 16-50ms
            slow: exam.slowSubmissions // >50ms
          }
        })),
        timeRange: `${timeRange} hours`,
        timestamp: new Date()
      };

    } catch (error) {
      console.error('❌ Detailed performance analysis error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Check for performance regression patterns
   */
  async checkPerformanceRegression(logEntry) {
    try {
      // Simple regression check - compare with recent average
      const recentEntries = Array.from(this.performanceCache.values())
        .filter(entry => entry.timestamp > new Date(Date.now() - 15 * 60 * 1000))
        .slice(-10); // Last 10 entries in 15 minutes

      if (recentEntries.length >= 5) {
        const recentAverage = recentEntries.reduce((sum, entry) => sum + entry.totalTime, 0) / recentEntries.length;
        
        if (logEntry.totalTime > recentAverage * 2) {
          console.warn(`⚠️ PERFORMANCE REGRESSION: Current submission (${logEntry.totalTime}ms) is 2x slower than recent average (${recentAverage.toFixed(1)}ms)`);
        }
      }
    } catch (error) {
      console.error('❌ Regression check error:', error);
    }
  }

  /**
   * Analyze fallback usage patterns
   */
  async analyzeFallbackRate(fallbackEntry) {
    try {
      // Count recent fallbacks
      const recentSubmissions = Array.from(this.performanceCache.values())
        .filter(entry => entry.timestamp > new Date(Date.now() - 60 * 60 * 1000)); // Last hour

      const fallbackCount = recentSubmissions.filter(entry => entry.optimizationFailed).length;
      const fallbackRate = recentSubmissions.length > 0 ? (fallbackCount / recentSubmissions.length) * 100 : 0;

      if (fallbackRate > 10) { // More than 10% fallback rate is concerning
        console.warn(`⚠️ HIGH FALLBACK RATE: ${fallbackRate.toFixed(1)}% of submissions using fallback methods`);
      }
    } catch (error) {
      console.error('❌ Fallback analysis error:', error);
    }
  }

  /**
   * Utility functions
   */
  calculateDataSize(submissionData) {
    try {
      return JSON.stringify(submissionData).length;
    } catch {
      return 0;
    }
  }

  getHealthStatus(target15msRate, target50msRate, optimizationRate) {
    if (target15msRate >= 80 && optimizationRate >= 90) return 'Excellent';
    if (target50msRate >= 90 && optimizationRate >= 80) return 'Good';
    if (target50msRate >= 70 && optimizationRate >= 60) return 'Fair';
    return 'Needs Attention';
  }

  getHealthRecommendations(target15msRate, target50msRate, optimizationRate) {
    const recommendations = [];

    if (target15msRate < 50) {
      recommendations.push('Ultra-fast performance (≤15ms) needs improvement');
    }

    if (target50msRate < 80) {
      recommendations.push('Fast performance (≤50ms) target not consistently met');
    }

    if (optimizationRate < 70) {
      recommendations.push('Low optimization rate - check client evaluation implementation');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is optimal');
    }

    return recommendations;
  }

  /**
   * Generate performance alerts
   */
  async generatePerformanceAlert(metrics) {
    try {
      const alerts = [];

      if (metrics.averageProcessingTime > this.alertThresholds.criticalThreshold) {
        alerts.push({
          level: 'CRITICAL',
          message: `Average processing time (${metrics.averageProcessingTime}ms) exceeds critical threshold`,
          threshold: this.alertThresholds.criticalThreshold,
          action: 'Immediate investigation required'
        });
      } else if (metrics.averageProcessingTime > this.alertThresholds.warningThreshold) {
        alerts.push({
          level: 'WARNING',
          message: `Average processing time (${metrics.averageProcessingTime}ms) exceeds warning threshold`,
          threshold: this.alertThresholds.warningThreshold,
          action: 'Monitor closely and investigate if trend continues'
        });
      }

      return alerts;
    } catch (error) {
      console.error('❌ Alert generation error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const optimizedSubmissionMonitor = new OptimizedSubmissionMonitor();

/**
 * Convenience functions for easy import and usage
 */
export async function logOptimizedSubmissionPerformance(submissionData, performanceMetrics) {
  return await optimizedSubmissionMonitor.logOptimizedSubmission(submissionData, performanceMetrics);
}

export async function logSubmissionFallback(submissionData, fallbackType, reason, processingTime) {
  return await optimizedSubmissionMonitor.logFallbackUsage(submissionData, fallbackType, reason, processingTime);
}

export async function getOptimizationDashboard(timeRange = 1) {
  return await optimizedSubmissionMonitor.getPerformanceDashboard(timeRange);
}

export async function getPerformanceAnalysis(examId = null, timeRange = 24) {
  return await optimizedSubmissionMonitor.getDetailedPerformanceAnalysis(examId, timeRange);
}