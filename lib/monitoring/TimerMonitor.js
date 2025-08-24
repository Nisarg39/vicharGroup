"use client";

import monitoringService from './MonitoringService';
import examLogger from './ExamLogger';
import featureFlags from './FeatureFlags';

/**
 * Timer Validation and Monitoring System
 * Monitors exam timers for discrepancies, validates time calculations, and detects timing attacks
 * Critical for maintaining exam integrity during refactoring
 */

class TimerMonitor {
  constructor() {
    this.timerInstances = new Map();
    this.discrepancyHistory = [];
    this.calibrationOffset = 0;
    this.lastServerSync = null;
    this.syncInterval = null;
    this.validationInterval = null;
    this.isMonitoring = false;
    
    // Thresholds for different types of discrepancies
    this.thresholds = {
      minor: 1000,      // 1 second - log but don't alert
      moderate: 5000,   // 5 seconds - alert
      major: 15000,     // 15 seconds - critical alert
      critical: 60000   // 1 minute - exam integrity compromised
    };
    
    // Detection patterns for timing attacks
    this.suspiciousPatterns = {
      rapidTimeJumps: [],
      clockManipulation: [],
      browserTabSwitching: [],
      systemTimeChanges: []
    };
    
    this.init();
  }

  init() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.setupServerTimeSync();
    this.setupTimerValidation();
    this.setupSuspiciousActivityDetection();
    
    monitoringService.log('INFO', 'TimerMonitor initialized');
  }

  // Server time synchronization
  setupServerTimeSync() {
    // Initial sync
    this.syncWithServer();
    
    // Periodic sync every 5 minutes
    this.syncInterval = setInterval(() => {
      this.syncWithServer();
    }, 300000);
  }

  async syncWithServer() {
    try {
      const startTime = Date.now();
      
      // Use a fast endpoint to get server time
      const response = await fetch('/api/monitoring/server-time', {
        method: 'GET',
        cache: 'no-cache'
      });
      
      const endTime = Date.now();
      const roundTripTime = endTime - startTime;
      
      if (response.ok) {
        const serverData = await response.json();
        const serverTime = new Date(serverData.timestamp).getTime();
        const clientTime = startTime + (roundTripTime / 2); // Adjust for network latency
        
        const offset = serverTime - clientTime;
        
        // Update calibration offset
        this.calibrationOffset = offset;
        this.lastServerSync = Date.now();
        
        monitoringService.recordPerformanceMetric('server_time_sync', {
          offset,
          roundTripTime,
          serverTime,
          clientTime,
          previousOffset: this.calibrationOffset
        });
        
        // Alert on significant clock drift
        if (Math.abs(offset) > 30000) { // 30 seconds
          monitoringService.alert('SIGNIFICANT_CLOCK_DRIFT', 
            `Client clock is ${Math.round(offset / 1000)}s off from server`, {
            offset,
            roundTripTime,
            threshold: 30000
          });
        }
        
      }
    } catch (error) {
      console.error('Server time sync failed:', error);
      monitoringService.captureError(error, 'TIMER', 'Server time sync failed');
    }
  }

  // Get calibrated time (adjusted for server drift)
  getCalibratedTime() {
    const rawTime = Date.now();
    return rawTime + this.calibrationOffset;
  }

  // Setup timer validation
  setupTimerValidation() {
    this.validationInterval = setInterval(() => {
      this.validateAllTimers();
    }, 10000); // Every 10 seconds
  }

  setupSuspiciousActivityDetection() {
    // Monitor visibility changes
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });
    
    // Monitor focus changes
    window.addEventListener('focus', () => {
      this.handleFocusChange(true);
    });
    
    window.addEventListener('blur', () => {
      this.handleFocusChange(false);
    });
    
    // Monitor system time changes
    this.setupSystemTimeMonitoring();
  }

  setupSystemTimeMonitoring() {
    let lastSystemTime = Date.now();
    
    setInterval(() => {
      const currentSystemTime = Date.now();
      const expectedInterval = 1000; // 1 second interval
      const actualInterval = currentSystemTime - lastSystemTime;
      const discrepancy = Math.abs(actualInterval - expectedInterval);
      
      if (discrepancy > 2000) { // More than 2 seconds off
        this.detectSystemTimeManipulation(actualInterval, expectedInterval, discrepancy);
      }
      
      lastSystemTime = currentSystemTime;
    }, 1000);
  }

  // Timer registration and tracking
  registerTimer(timerId, examId, studentId, initialTime, examDuration, timerType = 'exam') {
    const timerData = {
      id: timerId,
      examId,
      studentId,
      timerType, // 'exam', 'subject', 'question'
      startTime: this.getCalibratedTime(),
      initialTime,
      examDuration,
      lastValidation: this.getCalibratedTime(),
      discrepancies: [],
      suspiciousEvents: [],
      isActive: true,
      expectedEndTime: this.getCalibratedTime() + examDuration * 60 * 1000
    };
    
    this.timerInstances.set(timerId, timerData);
    
    // Log timer registration
    examLogger.log('timer_registered', {
      timerId,
      examId,
      studentId,
      initialTime,
      examDuration,
      timerType
    });
    
    monitoringService.log('INFO', `Timer registered: ${timerId}`, timerData);
    
    return timerData;
  }

  // Update timer with current value
  updateTimer(timerId, currentTime, clientTimestamp = null) {
    const timer = this.timerInstances.get(timerId);
    if (!timer || !timer.isActive) return null;
    
    const now = clientTimestamp || this.getCalibratedTime();
    const elapsedSinceStart = now - timer.startTime;
    const expectedRemainingTime = timer.initialTime - elapsedSinceStart;
    
    // Calculate discrepancy
    const discrepancy = Math.abs(currentTime - expectedRemainingTime);
    
    // Update timer data
    timer.lastValidation = now;
    timer.currentTime = currentTime;
    timer.expectedTime = expectedRemainingTime;
    timer.lastDiscrepancy = discrepancy;
    
    // Record discrepancy if significant
    if (discrepancy > this.thresholds.minor) {
      this.recordDiscrepancy(timer, discrepancy, 'timer_update');
    }
    
    // Validate timer integrity
    this.validateTimer(timer);
    
    return {
      timerId,
      currentTime,
      expectedTime: expectedRemainingTime,
      discrepancy,
      isValid: discrepancy < this.thresholds.major
    };
  }

  // Validate individual timer
  validateTimer(timer) {
    const discrepancy = timer.lastDiscrepancy || 0;
    const severity = this.getDiscrepancySeverity(discrepancy);
    
    if (severity === 'critical') {
      this.handleCriticalTimerIssue(timer);
    } else if (severity === 'major') {
      this.handleMajorTimerIssue(timer);
    } else if (severity === 'moderate') {
      this.handleModerateTimerIssue(timer);
    }
    
    // Check for suspicious patterns
    this.analyzeTimerPatterns(timer);
  }

  // Validate all active timers
  validateAllTimers() {
    this.timerInstances.forEach((timer, timerId) => {
      if (timer.isActive) {
        this.validateTimer(timer);
      }
    });
  }

  // Record timer discrepancy
  recordDiscrepancy(timer, discrepancy, source) {
    const discrepancyRecord = {
      id: this.generateDiscrepancyId(),
      timerId: timer.id,
      examId: timer.examId,
      studentId: timer.studentId,
      discrepancy,
      source,
      timestamp: this.getCalibratedTime(),
      currentTime: timer.currentTime,
      expectedTime: timer.expectedTime,
      severity: this.getDiscrepancySeverity(discrepancy),
      context: this.getTimerContext(timer)
    };
    
    // Add to timer's discrepancy history
    timer.discrepancies.push(discrepancyRecord);
    
    // Add to global history
    this.discrepancyHistory.push(discrepancyRecord);
    
    // Limit history size
    if (this.discrepancyHistory.length > 1000) {
      this.discrepancyHistory.shift();
    }
    
    // Log discrepancy
    examLogger.logTimerWarning('timer_discrepancy', timer.currentTime || 0, 
      `Timer discrepancy: ${discrepancy}ms`);
    
    monitoringService.trackTimerDiscrepancy(
      timer.expectedTime || 0, 
      timer.currentTime || 0, 
      {
        timerId: timer.id,
        examId: timer.examId,
        severity: discrepancyRecord.severity,
        source
      }
    );
    
    return discrepancyRecord;
  }

  // Get discrepancy severity level
  getDiscrepancySeverity(discrepancy) {
    if (discrepancy >= this.thresholds.critical) return 'critical';
    if (discrepancy >= this.thresholds.major) return 'major';
    if (discrepancy >= this.thresholds.moderate) return 'moderate';
    return 'minor';
  }

  // Handle different severity levels
  handleCriticalTimerIssue(timer) {
    const alertData = {
      timerId: timer.id,
      examId: timer.examId,
      studentId: timer.studentId,
      discrepancy: timer.lastDiscrepancy,
      timerData: { ...timer },
      timestamp: this.getCalibratedTime()
    };
    
    monitoringService.alert('CRITICAL_TIMER_DISCREPANCY', 
      `Critical timer discrepancy: ${timer.lastDiscrepancy}ms`, alertData);
    
    // Log critical issue
    examLogger.logCritical('critical_timer_issue', {
      timerId: timer.id,
      discrepancy: timer.lastDiscrepancy,
      severity: 'critical',
      examIntegrity: 'compromised'
    });
    
    // Consider pausing the exam or taking corrective action
    this.suggestCorrectiveAction(timer, 'critical');
  }

  handleMajorTimerIssue(timer) {
    monitoringService.alert('MAJOR_TIMER_DISCREPANCY', 
      `Major timer discrepancy: ${timer.lastDiscrepancy}ms`, {
      timerId: timer.id,
      examId: timer.examId,
      discrepancy: timer.lastDiscrepancy
    });
    
    examLogger.logTimerWarning('major_timer_issue', timer.currentTime || 0,
      `Major timer discrepancy detected`);
  }

  handleModerateTimerIssue(timer) {
    monitoringService.alert('MODERATE_TIMER_DISCREPANCY', 
      `Moderate timer discrepancy: ${timer.lastDiscrepancy}ms`, {
      timerId: timer.id,
      examId: timer.examId,
      discrepancy: timer.lastDiscrepancy
    });
  }

  // Analyze timer patterns for suspicious activity
  analyzeTimerPatterns(timer) {
    // Check for rapid time jumps
    this.checkRapidTimeJumps(timer);
    
    // Check for clock manipulation patterns
    this.checkClockManipulation(timer);
    
    // Check for consistent negative drift (time going backwards)
    this.checkTimeReversals(timer);
  }

  checkRapidTimeJumps(timer) {
    const recentDiscrepancies = timer.discrepancies.slice(-5);
    if (recentDiscrepancies.length < 3) return;
    
    const hasRapidJumps = recentDiscrepancies.some((disc, index) => {
      if (index === 0) return false;
      const prev = recentDiscrepancies[index - 1];
      const timeDiff = disc.timestamp - prev.timestamp;
      const discrepancyChange = Math.abs(disc.discrepancy - prev.discrepancy);
      
      // Large discrepancy change in short time
      return timeDiff < 5000 && discrepancyChange > 30000;
    });
    
    if (hasRapidJumps) {
      this.recordSuspiciousActivity(timer, 'rapid_time_jumps', {
        recentDiscrepancies: recentDiscrepancies.slice(-3)
      });
    }
  }

  checkClockManipulation(timer) {
    const discrepancies = timer.discrepancies.slice(-10);
    if (discrepancies.length < 5) return;
    
    // Check for systematic time manipulation (consistent large positive/negative drift)
    const avgDiscrepancy = discrepancies.reduce((sum, d) => sum + d.discrepancy, 0) / discrepancies.length;
    const isSystematic = Math.abs(avgDiscrepancy) > 10000 && // Average > 10 seconds
      discrepancies.every(d => Math.sign(d.discrepancy) === Math.sign(avgDiscrepancy));
    
    if (isSystematic) {
      this.recordSuspiciousActivity(timer, 'systematic_clock_manipulation', {
        avgDiscrepancy,
        pattern: avgDiscrepancy > 0 ? 'time_acceleration' : 'time_deceleration',
        discrepancies: discrepancies.slice(-5)
      });
    }
  }

  checkTimeReversals(timer) {
    const recent = timer.discrepancies.slice(-3);
    const hasReversals = recent.some(d => d.expectedTime > d.currentTime && 
      Math.abs(d.expectedTime - d.currentTime) > 5000);
    
    if (hasReversals) {
      this.recordSuspiciousActivity(timer, 'time_reversals', {
        reversals: recent.filter(d => d.expectedTime > d.currentTime)
      });
    }
  }

  // Record suspicious activity
  recordSuspiciousActivity(timer, activityType, details) {
    const activity = {
      id: this.generateActivityId(),
      timerId: timer.id,
      examId: timer.examId,
      studentId: timer.studentId,
      activityType,
      details,
      timestamp: this.getCalibratedTime(),
      severity: this.getSuspiciousActivitySeverity(activityType)
    };
    
    timer.suspiciousEvents.push(activity);
    
    // Store in pattern tracking
    if (!this.suspiciousPatterns[activityType]) {
      this.suspiciousPatterns[activityType] = [];
    }
    this.suspiciousPatterns[activityType].push(activity);
    
    // Alert on suspicious activity
    monitoringService.alert('SUSPICIOUS_TIMER_ACTIVITY', 
      `Suspicious timer activity: ${activityType}`, activity);
    
    // Log to exam logger
    examLogger.logCritical('suspicious_timer_activity', {
      activityType,
      timerId: timer.id,
      details,
      severity: activity.severity
    });
  }

  getSuspiciousActivitySeverity(activityType) {
    const severityMap = {
      'rapid_time_jumps': 'high',
      'systematic_clock_manipulation': 'critical',
      'time_reversals': 'high',
      'browser_tab_switching': 'medium',
      'system_time_changes': 'high'
    };
    return severityMap[activityType] || 'medium';
  }

  // Handle visibility and focus changes
  handleVisibilityChange() {
    const isHidden = document.hidden;
    const timestamp = this.getCalibratedTime();
    
    // Track visibility changes for all active timers
    this.timerInstances.forEach(timer => {
      if (timer.isActive) {
        timer.suspiciousEvents.push({
          type: 'visibility_change',
          hidden: isHidden,
          timestamp
        });
        
        if (isHidden) {
          examLogger.logFullscreenExit('visibility_change');
        }
      }
    });
  }

  handleFocusChange(hasFocus) {
    const timestamp = this.getCalibratedTime();
    
    this.timerInstances.forEach(timer => {
      if (timer.isActive) {
        timer.suspiciousEvents.push({
          type: 'focus_change',
          hasFocus,
          timestamp
        });
      }
    });
  }

  detectSystemTimeManipulation(actualInterval, expectedInterval, discrepancy) {
    const manipulation = {
      id: this.generateActivityId(),
      type: 'system_time_manipulation',
      actualInterval,
      expectedInterval,
      discrepancy,
      timestamp: this.getCalibratedTime(),
      severity: discrepancy > 5000 ? 'high' : 'medium'
    };
    
    this.suspiciousPatterns.systemTimeChanges.push(manipulation);
    
    monitoringService.alert('SYSTEM_TIME_MANIPULATION', 
      `System time manipulation detected: ${discrepancy}ms discrepancy`, manipulation);
      
    // Log for all active exams
    this.timerInstances.forEach(timer => {
      if (timer.isActive) {
        this.recordSuspiciousActivity(timer, 'system_time_changes', manipulation);
      }
    });
  }

  // Corrective action suggestions
  suggestCorrectiveAction(timer, severity) {
    const suggestions = {
      critical: [
        'Consider pausing the exam immediately',
        'Verify exam integrity with student',
        'Check for system time manipulation',
        'Review exam environment security'
      ],
      major: [
        'Monitor timer closely',
        'Verify student device time',
        'Check network stability',
        'Consider time adjustment if confirmed'
      ],
      moderate: [
        'Log discrepancy for review',
        'Monitor for pattern continuation',
        'Verify server time synchronization'
      ]
    };
    
    const actions = suggestions[severity] || suggestions.moderate;
    
    monitoringService.log('WARN', `Timer issue corrective actions for ${timer.id}:`, {
      timerId: timer.id,
      severity,
      suggestedActions: actions
    });
    
    return actions;
  }

  // Timer lifecycle management
  pauseTimer(timerId) {
    const timer = this.timerInstances.get(timerId);
    if (timer) {
      timer.isActive = false;
      timer.pausedAt = this.getCalibratedTime();
      
      examLogger.log('timer_paused', { timerId });
    }
  }

  resumeTimer(timerId) {
    const timer = this.timerInstances.get(timerId);
    if (timer && timer.pausedAt) {
      const pauseDuration = this.getCalibratedTime() - timer.pausedAt;
      timer.startTime += pauseDuration; // Adjust start time to account for pause
      timer.isActive = true;
      delete timer.pausedAt;
      
      examLogger.log('timer_resumed', { timerId, pauseDuration });
    }
  }

  stopTimer(timerId) {
    const timer = this.timerInstances.get(timerId);
    if (timer) {
      timer.isActive = false;
      timer.endTime = this.getCalibratedTime();
      
      examLogger.log('timer_stopped', { 
        timerId, 
        duration: timer.endTime - timer.startTime 
      });
    }
  }

  // Analytics and reporting
  getTimerAnalytics(timerId = null) {
    if (timerId) {
      const timer = this.timerInstances.get(timerId);
      return timer ? this.getTimerStats(timer) : null;
    }
    
    // Return aggregate stats for all timers
    const stats = {
      totalTimers: this.timerInstances.size,
      activeTimers: Array.from(this.timerInstances.values()).filter(t => t.isActive).length,
      totalDiscrepancies: this.discrepancyHistory.length,
      suspiciousActivities: Object.values(this.suspiciousPatterns).flat().length,
      averageDiscrepancy: 0,
      severityBreakdown: { minor: 0, moderate: 0, major: 0, critical: 0 }
    };
    
    // Calculate averages and breakdowns
    this.discrepancyHistory.forEach(disc => {
      stats.severityBreakdown[disc.severity]++;
    });
    
    if (this.discrepancyHistory.length > 0) {
      stats.averageDiscrepancy = this.discrepancyHistory.reduce((sum, d) => 
        sum + d.discrepancy, 0) / this.discrepancyHistory.length;
    }
    
    return stats;
  }

  getTimerStats(timer) {
    return {
      id: timer.id,
      examId: timer.examId,
      studentId: timer.studentId,
      isActive: timer.isActive,
      runtime: this.getCalibratedTime() - timer.startTime,
      discrepancyCount: timer.discrepancies.length,
      suspiciousEventCount: timer.suspiciousEvents.length,
      averageDiscrepancy: timer.discrepancies.length > 0 ? 
        timer.discrepancies.reduce((sum, d) => sum + d.discrepancy, 0) / timer.discrepancies.length : 0,
      lastDiscrepancy: timer.lastDiscrepancy || 0,
      lastValidation: timer.lastValidation
    };
  }

  // Get timer context for logging
  getTimerContext(timer) {
    return {
      isVisible: !document.hidden,
      hasFocus: document.hasFocus(),
      serverSyncAge: this.lastServerSync ? this.getCalibratedTime() - this.lastServerSync : null,
      calibrationOffset: this.calibrationOffset,
      timerRuntime: this.getCalibratedTime() - timer.startTime
    };
  }

  // Utility methods
  generateDiscrepancyId() {
    return `disc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  generateActivityId() {
    return `act_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  // Export and cleanup
  exportTimerData() {
    return {
      timers: Object.fromEntries(this.timerInstances),
      discrepancies: [...this.discrepancyHistory],
      suspiciousPatterns: { ...this.suspiciousPatterns },
      analytics: this.getTimerAnalytics(),
      calibration: {
        offset: this.calibrationOffset,
        lastSync: this.lastServerSync
      },
      timestamp: this.getCalibratedTime()
    };
  }

  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    if (this.validationInterval) {
      clearInterval(this.validationInterval);
    }
    
    this.isMonitoring = false;
    
    monitoringService.log('INFO', 'TimerMonitor cleanup completed');
  }
}

// Create singleton instance
const timerMonitor = new TimerMonitor();

export default timerMonitor;
export { TimerMonitor };