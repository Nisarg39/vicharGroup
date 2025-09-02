/**
 * PROGRESSIVE COMPUTATION PERFORMANCE MONITOR
 * 
 * Real-time performance monitoring system for tracking 15ms submission targets
 * and comprehensive progressive computation metrics.
 * 
 * FEATURES:
 * ✅ 15ms submission target monitoring
 * ✅ Service Worker performance tracking
 * ✅ Client integration performance metrics
 * ✅ Direct storage validation timing
 * ✅ Real-time dashboard updates
 * ✅ Comprehensive audit trails
 */

class ProgressivePerformanceMonitor {
  constructor() {
    this.metrics = {
      // Core submission metrics
      submissions: {
        total: 0,
        successful: 0,
        failed: 0,
        directStorage: 0,
        fallback: 0
      },
      
      // Performance timing
      timing: {
        averageSubmissionTime: 0,
        fastestSubmission: Infinity,
        slowestSubmission: 0,
        target15msAchieved: 0,
        target15msAttempted: 0
      },
      
      // Service Worker performance
      serviceWorker: {
        initializationTime: 0,
        averageComputationTime: 0,
        totalComputations: 0,
        cacheHitRate: 0,
        errorRate: 0
      },
      
      // Direct storage performance
      directStorage: {
        validationTime: 0,
        storageTime: 0,
        validationFailures: 0,
        successRate: 0
      },
      
      // Browser compatibility
      compatibility: {
        serviceWorkerSupported: false,
        progressiveComputationSupported: false,
        directStorageSupported: false
      },
      
      // Session tracking
      session: {
        startTime: Date.now(),
        examId: null,
        studentId: null,
        examType: null,
        browserInfo: this.getBrowserInfo()
      }
    };
    
    this.performanceLog = [];
    this.listeners = new Map();
    
    // Initialize compatibility check
    this.checkCompatibility();
  }

  /**
   * Initialize performance monitoring for an exam session
   */
  initializeSession(examId, studentId, examType) {
    this.metrics.session.examId = examId;
    this.metrics.session.studentId = studentId;
    this.metrics.session.examType = examType;
    this.metrics.session.startTime = Date.now();
    
    console.log('📈 Progressive performance monitoring initialized', {
      examId,
      studentId,
      examType,
      browserSupport: this.metrics.compatibility
    });
    
    this.logEvent('session_initialized', {
      examId,
      studentId,
      examType,
      timestamp: Date.now()
    });
  }

  /**
   * Log a submission attempt and track 15ms target
   */
  logSubmissionAttempt(submissionData, startTime) {
    const endTime = Date.now();
    const submissionTime = endTime - startTime;
    
    // Update submission counts
    this.metrics.submissions.total++;
    this.metrics.timing.target15msAttempted++;
    
    if (submissionData.success) {
      this.metrics.submissions.successful++;
      
      if (submissionData.computationSource === 'progressive_direct') {
        this.metrics.submissions.directStorage++;
        
        // Track direct storage specific metrics
        if (submissionData.performanceMetrics) {
          this.metrics.directStorage.validationTime = submissionData.performanceMetrics.validationTime;
          this.metrics.directStorage.storageTime = submissionData.performanceMetrics.storageTime;
          this.updateDirectStorageSuccessRate();
        }
      } else {
        this.metrics.submissions.fallback++;
      }
      
      // Update timing metrics
      this.updateTimingMetrics(submissionTime);
      
      // Check 15ms target achievement
      if (submissionTime <= 15) {
        this.metrics.timing.target15msAchieved++;
        console.log(`🎯 15ms TARGET ACHIEVED! Submission completed in ${submissionTime}ms`);
      }
      
    } else {
      this.metrics.submissions.failed++;
      
      if (submissionData.validationFailure) {
        this.metrics.directStorage.validationFailures++;
      }
    }
    
    // Log detailed performance event
    this.logEvent('submission_completed', {
      success: submissionData.success,
      submissionTime: submissionTime,
      target15msAchieved: submissionTime <= 15,
      computationSource: submissionData.computationSource,
      validationMethod: submissionData.validationMethod,
      performanceImprovement: submissionData.performanceImprovement,
      timestamp: endTime
    });
    
    // Trigger performance update listeners
    this.triggerListeners('performance_update', this.getPerformanceSummary());
    
    return {
      submissionTime,
      target15msAchieved: submissionTime <= 15,
      performanceRank: this.getPerformanceRank(submissionTime)
    };
  }

  /**
   * Log Service Worker performance metrics
   */
  logServiceWorkerPerformance(swMetrics) {
    this.metrics.serviceWorker = {
      ...this.metrics.serviceWorker,
      ...swMetrics
    };
    
    this.logEvent('service_worker_performance', swMetrics);
  }

  /**
   * Log validation performance
   */
  logValidationPerformance(validationTime, validationLayers, success) {
    this.metrics.directStorage.validationTime = validationTime;
    
    if (!success) {
      this.metrics.directStorage.validationFailures++;
    }
    
    this.logEvent('validation_performance', {
      validationTime,
      validationLayers,
      success,
      timestamp: Date.now()
    });
  }

  /**
   * Update timing metrics with new submission time
   */
  updateTimingMetrics(submissionTime) {
    // Update average
    const totalSuccessful = this.metrics.submissions.successful;
    this.metrics.timing.averageSubmissionTime = 
      ((this.metrics.timing.averageSubmissionTime * (totalSuccessful - 1)) + submissionTime) / totalSuccessful;
    
    // Update fastest and slowest
    this.metrics.timing.fastestSubmission = Math.min(this.metrics.timing.fastestSubmission, submissionTime);
    this.metrics.timing.slowestSubmission = Math.max(this.metrics.timing.slowestSubmission, submissionTime);
  }

  /**
   * Update direct storage success rate
   */
  updateDirectStorageSuccessRate() {
    const totalDirectStorage = this.metrics.submissions.directStorage;
    const failures = this.metrics.directStorage.validationFailures;
    
    this.metrics.directStorage.successRate = totalDirectStorage > 0 ? 
      ((totalDirectStorage - failures) / totalDirectStorage * 100).toFixed(2) : 0;
  }

  /**
   * Get performance rank based on submission time
   */
  getPerformanceRank(submissionTime) {
    if (submissionTime <= 15) return 'ULTRA_FAST';
    if (submissionTime <= 50) return 'VERY_FAST';
    if (submissionTime <= 100) return 'FAST';
    if (submissionTime <= 500) return 'GOOD';
    if (submissionTime <= 1000) return 'AVERAGE';
    return 'SLOW';
  }

  /**
   * Check browser compatibility
   */
  checkCompatibility() {
    this.metrics.compatibility.serviceWorkerSupported = 'serviceWorker' in navigator;
    this.metrics.compatibility.progressiveComputationSupported = 
      'serviceWorker' in navigator && 'MessageChannel' in window;
    this.metrics.compatibility.directStorageSupported = 
      this.metrics.compatibility.progressiveComputationSupported && 'indexedDB' in window;
  }

  /**
   * Get browser information
   */
  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    const browserName = this.getBrowserName(userAgent);
    
    return {
      name: browserName,
      version: this.getBrowserVersion(userAgent, browserName),
      userAgent: userAgent,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown'
    };
  }

  /**
   * Get browser name from user agent
   */
  getBrowserName(userAgent) {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  /**
   * Get browser version
   */
  getBrowserVersion(userAgent, browserName) {
    const regex = new RegExp(`${browserName}[\\s\\/](\\d+(?:\\.\\d+)*)`);
    const match = userAgent.match(regex);
    return match ? match[1] : 'Unknown';
  }

  /**
   * Log performance event
   */
  logEvent(eventType, data) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      data: data
    };
    
    this.performanceLog.push(event);
    
    // Keep only last 100 events to prevent memory issues
    if (this.performanceLog.length > 100) {
      this.performanceLog.shift();
    }
    
    // Console log for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📈 Performance Event: ${eventType}`, data);
    }
  }

  /**
   * Add performance listener
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove performance listener
   */
  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Trigger event listeners
   */
  triggerListeners(event, data) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`❌ Performance listener error for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get comprehensive performance summary
   */
  getPerformanceSummary() {
    const target15msRate = this.metrics.timing.target15msAttempted > 0 ? 
      (this.metrics.timing.target15msAchieved / this.metrics.timing.target15msAttempted * 100).toFixed(2) : 0;
    
    const successRate = this.metrics.submissions.total > 0 ? 
      (this.metrics.submissions.successful / this.metrics.submissions.total * 100).toFixed(2) : 0;
    
    const directStorageRate = this.metrics.submissions.successful > 0 ? 
      (this.metrics.submissions.directStorage / this.metrics.submissions.successful * 100).toFixed(2) : 0;
    
    return {
      // Summary statistics
      summary: {
        target15msAchievementRate: `${target15msRate}%`,
        overallSuccessRate: `${successRate}%`,
        directStorageUsageRate: `${directStorageRate}%`,
        averageSubmissionTime: `${this.metrics.timing.averageSubmissionTime.toFixed(2)}ms`,
        fastestSubmission: this.metrics.timing.fastestSubmission === Infinity ? 'N/A' : `${this.metrics.timing.fastestSubmission}ms`,
        slowestSubmission: `${this.metrics.timing.slowestSubmission}ms`
      },
      
      // Detailed metrics
      detailed: this.metrics,
      
      // Performance grade
      performanceGrade: this.calculatePerformanceGrade(parseFloat(target15msRate)),
      
      // Recommendations
      recommendations: this.generateRecommendations(),
      
      // Browser compatibility
      compatibility: this.metrics.compatibility,
      
      // Session info
      session: this.metrics.session
    };
  }

  /**
   * Calculate overall performance grade
   */
  calculatePerformanceGrade(target15msRate) {
    if (target15msRate >= 90) return 'A+';
    if (target15msRate >= 80) return 'A';
    if (target15msRate >= 70) return 'B+';
    if (target15msRate >= 60) return 'B';
    if (target15msRate >= 50) return 'C+';
    if (target15msRate >= 40) return 'C';
    return 'D';
  }

  /**
   * Generate performance recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const target15msRate = this.metrics.timing.target15msAttempted > 0 ? 
      (this.metrics.timing.target15msAchieved / this.metrics.timing.target15msAttempted * 100) : 0;
    
    if (target15msRate < 50) {
      recommendations.push('Consider optimizing Service Worker computation algorithms');
      recommendations.push('Implement more aggressive result caching');
    }
    
    if (this.metrics.directStorage.validationFailures > 2) {
      recommendations.push('Review validation logic for potential improvements');
    }
    
    if (!this.metrics.compatibility.serviceWorkerSupported) {
      recommendations.push('Browser does not support Service Workers - progressive computation unavailable');
    }
    
    if (this.metrics.timing.averageSubmissionTime > 100) {
      recommendations.push('Average submission time above 100ms - consider server-side optimizations');
    }
    
    return recommendations;
  }

  /**
   * Export performance data for analysis
   */
  exportPerformanceData() {
    return {
      summary: this.getPerformanceSummary(),
      events: [...this.performanceLog],
      exportedAt: new Date().toISOString(),
      sessionDuration: Date.now() - this.metrics.session.startTime
    };
  }

  /**
   * Reset performance metrics
   */
  reset() {
    this.metrics = {
      submissions: { total: 0, successful: 0, failed: 0, directStorage: 0, fallback: 0 },
      timing: { averageSubmissionTime: 0, fastestSubmission: Infinity, slowestSubmission: 0, target15msAchieved: 0, target15msAttempted: 0 },
      serviceWorker: { initializationTime: 0, averageComputationTime: 0, totalComputations: 0, cacheHitRate: 0, errorRate: 0 },
      directStorage: { validationTime: 0, storageTime: 0, validationFailures: 0, successRate: 0 },
      compatibility: { serviceWorkerSupported: false, progressiveComputationSupported: false, directStorageSupported: false },
      session: { startTime: Date.now(), examId: null, studentId: null, examType: null, browserInfo: this.getBrowserInfo() }
    };
    
    this.performanceLog = [];
    this.checkCompatibility();
    
    console.log('🔄 Performance metrics reset');
  }

  /**
   * BUG #3 FIX: Comprehensive cleanup for all event listeners and references
   */
  cleanup() {
    try {
      // BUG #3 FIX: Trigger cleanup callback for all registered listeners before clearing
      if (this.listeners.has('cleanup')) {
        const cleanupCallbacks = this.listeners.get('cleanup');
        cleanupCallbacks.forEach(callback => {
          try {
            callback({ type: 'performance_monitor_cleanup', timestamp: Date.now() });
          } catch (error) {
            console.error('❌ Performance monitor cleanup callback error:', error);
          }
        });
      }
      
      // BUG #3 FIX: Clear all event listeners with detailed cleanup
      for (const [event, callbacks] of this.listeners.entries()) {
        callbacks.length = 0; // Clear array contents
      }
      this.listeners.clear();
      
      // BUG #3 FIX: Comprehensive performance log cleanup
      if (this.performanceLog) {
        this.performanceLog.length = 0; // Clear array contents
        this.performanceLog = null;
      }
      
      // BUG #3 FIX: Deep reset metrics to prevent stale references
      this.metrics = null;
      
      // BUG #3 FIX: Nullify all instance references
      this.listeners = null;
      
      console.log('🧹 Performance monitor comprehensive cleanup completed');
    } catch (error) {
      console.error('❌ Performance monitor cleanup error:', error);
    }
  }
}

// Create singleton instance
let performanceMonitorInstance = null;

export function getPerformanceMonitor() {
  if (!performanceMonitorInstance) {
    performanceMonitorInstance = new ProgressivePerformanceMonitor();
  }
  return performanceMonitorInstance;
}

export default ProgressivePerformanceMonitor;