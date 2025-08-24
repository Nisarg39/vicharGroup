"use client";

import monitoringService from './MonitoringService';

/**
 * Real-time Logging System for Critical Exam Operations
 * Tracks all critical exam events, user actions, and system state changes
 * during the exam process for safety during refactoring
 */

class ExamLogger {
  constructor() {
    this.examSessionId = null;
    this.studentId = null;
    this.examId = null;
    this.logBuffer = [];
    this.criticalOperations = new Set();
    this.operationStack = [];
    this.isExamActive = false;
    
    // Critical operations that must be logged
    this.CRITICAL_OPERATIONS = {
      EXAM_START: 'exam_start',
      EXAM_END: 'exam_end',
      EXAM_SUBMIT: 'exam_submit',
      ANSWER_SAVE: 'answer_save',
      ANSWER_CHANGE: 'answer_change',
      SUBJECT_SWITCH: 'subject_switch',
      QUESTION_NAVIGATION: 'question_navigation',
      TIMER_UPDATE: 'timer_update',
      TIMER_WARNING: 'timer_warning',
      FULLSCREEN_EXIT: 'fullscreen_exit',
      NETWORK_ERROR: 'network_error',
      AUTO_SAVE: 'auto_save',
      PROGRESS_RESTORE: 'progress_restore',
      MARKING_OPERATION: 'marking_operation',
      VALIDATION_ERROR: 'validation_error',
      SESSION_TIMEOUT: 'session_timeout'
    };
    
    // High-frequency operations that should be throttled
    this.throttledOperations = new Map();
    this.throttleInterval = 1000; // 1 second
  }

  // Initialize exam logging session
  startExamSession(examId, studentId, examData = {}) {
    this.examSessionId = `exam_${examId}_${studentId}_${Date.now()}`;
    this.examId = examId;
    this.studentId = studentId;
    this.isExamActive = true;
    this.logBuffer = [];
    this.operationStack = [];
    
    this.logCritical(this.CRITICAL_OPERATIONS.EXAM_START, {
      examId,
      studentId,
      examData: {
        examName: examData.examName,
        duration: examData.examDurationMinutes,
        totalQuestions: examData.totalQuestions,
        examAvailability: examData.examAvailability,
        stream: examData.stream
      },
      browserInfo: this.getBrowserInfo(),
      timestamp: new Date().toISOString(),
      localStorageSize: this.getLocalStorageUsage()
    });
    
    // Set up periodic log flushing
    this.setupPeriodicLogging();
    
    return this.examSessionId;
  }

  // End exam logging session
  endExamSession(reason = 'normal_completion', additionalData = {}) {
    if (!this.isExamActive) return;
    
    this.logCritical(this.CRITICAL_OPERATIONS.EXAM_END, {
      reason,
      sessionDuration: this.getSessionDuration(),
      totalOperations: this.logBuffer.length,
      criticalOperationsCount: this.criticalOperations.size,
      bufferSize: this.logBuffer.length,
      ...additionalData
    });
    
    // Flush all remaining logs
    this.flushLogs(true);
    
    this.isExamActive = false;
    this.examSessionId = null;
  }

  // Log critical exam operations
  logCritical(operation, data = {}, context = {}) {
    if (!this.isExamActive && operation !== this.CRITICAL_OPERATIONS.EXAM_START) {
      console.warn('Attempted to log operation when exam session is not active:', operation);
      return;
    }
    
    const logEntry = {
      id: this.generateLogId(),
      operation,
      timestamp: Date.now(),
      isoTimestamp: new Date().toISOString(),
      examSessionId: this.examSessionId,
      examId: this.examId,
      studentId: this.studentId,
      data: {
        ...data,
        url: typeof window !== 'undefined' ? window.location.href : null,
        stackTrace: this.captureStackTrace()
      },
      context: {
        operationStack: [...this.operationStack],
        previousOperation: this.getLastOperation(),
        ...context
      },
      severity: this.determineSeverity(operation),
      isCritical: true
    };
    
    // Add to operation stack for context tracking
    this.operationStack.push({
      operation,
      timestamp: logEntry.timestamp,
      id: logEntry.id
    });
    
    // Limit operation stack size
    if (this.operationStack.length > 50) {
      this.operationStack.shift();
    }
    
    // Add to critical operations set
    this.criticalOperations.add(logEntry.id);
    
    // Add to log buffer
    this.logBuffer.push(logEntry);
    
    // Immediate console logging for critical operations
    console.log(`[EXAM_LOG] ${operation}:`, logEntry);
    
    // Send to monitoring service
    monitoringService.trackExamOperation(operation, logEntry);
    
    // Immediate flush for very critical operations
    if (this.isImmediateFlushRequired(operation)) {
      this.flushLogs();
    }
    
    // Check for operation sequences that might indicate issues
    this.analyzeOperationSequence();
    
    return logEntry.id;
  }

  // Log regular exam events (less critical, can be throttled)
  log(operation, data = {}, context = {}) {
    // Throttle high-frequency operations
    if (this.shouldThrottle(operation)) {
      return null;
    }
    
    const logEntry = {
      id: this.generateLogId(),
      operation,
      timestamp: Date.now(),
      isoTimestamp: new Date().toISOString(),
      examSessionId: this.examSessionId,
      examId: this.examId,
      studentId: this.studentId,
      data,
      context,
      severity: 'INFO',
      isCritical: false
    };
    
    this.logBuffer.push(logEntry);
    
    // Limit buffer size to prevent memory issues
    if (this.logBuffer.length > 10000) {
      this.flushLogs();
    }
    
    return logEntry.id;
  }

  // Specific logging methods for common exam operations
  logAnswerSave(questionId, answer, previousAnswer = null, method = 'user_input') {
    return this.logCritical(this.CRITICAL_OPERATIONS.ANSWER_SAVE, {
      questionId,
      answer: this.sanitizeAnswer(answer),
      previousAnswer: this.sanitizeAnswer(previousAnswer),
      method,
      answerType: this.determineAnswerType(answer),
      changeType: this.determineChangeType(previousAnswer, answer)
    });
  }

  logAnswerChange(questionId, oldAnswer, newAnswer, trigger = 'user_action') {
    return this.logCritical(this.CRITICAL_OPERATIONS.ANSWER_CHANGE, {
      questionId,
      oldAnswer: this.sanitizeAnswer(oldAnswer),
      newAnswer: this.sanitizeAnswer(newAnswer),
      trigger,
      changeSignificance: this.assessChangeSignificance(oldAnswer, newAnswer)
    });
  }

  logSubjectSwitch(fromSubject, toSubject, trigger = 'user_action', restrictions = {}) {
    return this.logCritical(this.CRITICAL_OPERATIONS.SUBJECT_SWITCH, {
      fromSubject,
      toSubject,
      trigger,
      restrictions,
      availableSubjects: restrictions.availableSubjects || [],
      lockedSubjects: restrictions.lockedSubjects || []
    });
  }

  logQuestionNavigation(fromIndex, toIndex, fromQuestionId, toQuestionId, method = 'navigation_button') {
    return this.log(this.CRITICAL_OPERATIONS.QUESTION_NAVIGATION, {
      fromIndex,
      toIndex,
      fromQuestionId,
      toQuestionId,
      method,
      direction: toIndex > fromIndex ? 'forward' : 'backward',
      jumpSize: Math.abs(toIndex - fromIndex)
    });
  }

  logTimerUpdate(timeLeft, totalTime, warnings = []) {
    return this.log(this.CRITICAL_OPERATIONS.TIMER_UPDATE, {
      timeLeft,
      totalTime,
      percentageLeft: (timeLeft / totalTime) * 100,
      warnings,
      isLowTime: timeLeft < 300000 // Less than 5 minutes
    });
  }

  logTimerWarning(warningType, timeLeft, message) {
    return this.logCritical(this.CRITICAL_OPERATIONS.TIMER_WARNING, {
      warningType,
      timeLeft,
      message,
      warningLevel: this.getWarningLevel(timeLeft)
    });
  }

  logFullscreenExit(reason = 'unknown', warningCount = 0) {
    return this.logCritical(this.CRITICAL_OPERATIONS.FULLSCREEN_EXIT, {
      reason,
      warningCount,
      documentVisibilityState: document.visibilityState,
      hasFocus: document.hasFocus(),
      isFullscreen: !!(document.fullscreenElement || document.webkitFullscreenElement)
    });
  }

  logNetworkError(operation, error, requestDetails = {}) {
    return this.logCritical(this.CRITICAL_OPERATIONS.NETWORK_ERROR, {
      operation,
      error: {
        message: error.message,
        code: error.code || error.status,
        type: error.constructor.name
      },
      requestDetails,
      networkStatus: navigator.onLine,
      retryAttempt: requestDetails.retryAttempt || 0
    });
  }

  logAutoSave(operation, success, dataSize, error = null) {
    return this.logCritical(this.CRITICAL_OPERATIONS.AUTO_SAVE, {
      operation,
      success,
      dataSize,
      error: error ? {
        message: error.message,
        type: error.constructor.name
      } : null,
      localStorageUsage: this.getLocalStorageUsage()
    });
  }

  logProgressRestore(restoredData, success, error = null) {
    return this.logCritical(this.CRITICAL_OPERATIONS.PROGRESS_RESTORE, {
      success,
      dataKeys: Object.keys(restoredData || {}),
      answersCount: restoredData?.answers ? Object.keys(restoredData.answers).length : 0,
      restoredTimestamp: restoredData?.lastSaved || null,
      error: error ? {
        message: error.message,
        type: error.constructor.name
      } : null
    });
  }

  logValidationError(validationType, details, severity = 'HIGH') {
    return this.logCritical(this.CRITICAL_OPERATIONS.VALIDATION_ERROR, {
      validationType,
      details,
      severity,
      currentState: this.getCurrentExamState()
    });
  }

  // Analysis and monitoring methods
  analyzeOperationSequence() {
    const recentOps = this.operationStack.slice(-10);
    
    // Check for suspicious patterns
    const patterns = this.detectSuspiciousPatterns(recentOps);
    
    if (patterns.length > 0) {
      patterns.forEach(pattern => {
        monitoringService.alert('SUSPICIOUS_PATTERN', `Detected suspicious operation pattern: ${pattern.type}`, {
          pattern,
          recentOperations: recentOps
        });
      });
    }
  }

  detectSuspiciousPatterns(operations) {
    const patterns = [];
    
    // Pattern 1: Rapid answer changes (possible cheating or system glitch)
    const answerChanges = operations.filter(op => 
      op.operation === this.CRITICAL_OPERATIONS.ANSWER_CHANGE
    );
    if (answerChanges.length > 5) {
      patterns.push({
        type: 'RAPID_ANSWER_CHANGES',
        count: answerChanges.length,
        timespan: operations[operations.length - 1].timestamp - operations[0].timestamp
      });
    }
    
    // Pattern 2: Repeated fullscreen exits
    const fullscreenExits = operations.filter(op => 
      op.operation === this.CRITICAL_OPERATIONS.FULLSCREEN_EXIT
    );
    if (fullscreenExits.length > 3) {
      patterns.push({
        type: 'REPEATED_FULLSCREEN_EXITS',
        count: fullscreenExits.length
      });
    }
    
    // Pattern 3: Multiple network errors
    const networkErrors = operations.filter(op => 
      op.operation === this.CRITICAL_OPERATIONS.NETWORK_ERROR
    );
    if (networkErrors.length > 2) {
      patterns.push({
        type: 'MULTIPLE_NETWORK_ERRORS',
        count: networkErrors.length
      });
    }
    
    return patterns;
  }

  // Utility methods
  shouldThrottle(operation) {
    const now = Date.now();
    const lastLogged = this.throttledOperations.get(operation);
    
    if (!lastLogged || (now - lastLogged) > this.throttleInterval) {
      this.throttledOperations.set(operation, now);
      return false;
    }
    
    return true;
  }

  isImmediateFlushRequired(operation) {
    const immediateFlushOps = [
      this.CRITICAL_OPERATIONS.EXAM_START,
      this.CRITICAL_OPERATIONS.EXAM_SUBMIT,
      this.CRITICAL_OPERATIONS.EXAM_END,
      this.CRITICAL_OPERATIONS.NETWORK_ERROR,
      this.CRITICAL_OPERATIONS.VALIDATION_ERROR
    ];
    
    return immediateFlushOps.includes(operation);
  }

  determineSeverity(operation) {
    const severityMap = {
      [this.CRITICAL_OPERATIONS.EXAM_START]: 'INFO',
      [this.CRITICAL_OPERATIONS.EXAM_END]: 'INFO',
      [this.CRITICAL_OPERATIONS.EXAM_SUBMIT]: 'INFO',
      [this.CRITICAL_OPERATIONS.ANSWER_SAVE]: 'INFO',
      [this.CRITICAL_OPERATIONS.TIMER_WARNING]: 'WARNING',
      [this.CRITICAL_OPERATIONS.FULLSCREEN_EXIT]: 'WARNING',
      [this.CRITICAL_OPERATIONS.NETWORK_ERROR]: 'ERROR',
      [this.CRITICAL_OPERATIONS.VALIDATION_ERROR]: 'ERROR',
      [this.CRITICAL_OPERATIONS.SESSION_TIMEOUT]: 'CRITICAL'
    };
    
    return severityMap[operation] || 'INFO';
  }

  sanitizeAnswer(answer) {
    if (answer === null || answer === undefined) return null;
    
    // Remove sensitive information but keep structure
    if (Array.isArray(answer)) {
      return answer.map(a => typeof a === 'string' ? a.substring(0, 100) : a);
    }
    
    if (typeof answer === 'string') {
      return answer.substring(0, 100);
    }
    
    return answer;
  }

  determineAnswerType(answer) {
    if (answer === null || answer === undefined) return 'null';
    if (Array.isArray(answer)) return 'multiple_choice';
    if (typeof answer === 'number') return 'numerical';
    if (typeof answer === 'string') return 'text';
    return 'unknown';
  }

  determineChangeType(oldAnswer, newAnswer) {
    if (!oldAnswer && newAnswer) return 'new_answer';
    if (oldAnswer && !newAnswer) return 'cleared';
    if (oldAnswer && newAnswer) return 'modified';
    return 'no_change';
  }

  assessChangeSignificance(oldAnswer, newAnswer) {
    if (!oldAnswer && newAnswer) return 'high'; // New answer
    if (oldAnswer && !newAnswer) return 'high'; // Cleared answer
    
    if (Array.isArray(oldAnswer) && Array.isArray(newAnswer)) {
      const oldSet = new Set(oldAnswer);
      const newSet = new Set(newAnswer);
      const intersection = new Set([...oldSet].filter(x => newSet.has(x)));
      const similarity = intersection.size / Math.max(oldSet.size, newSet.size);
      return similarity < 0.5 ? 'high' : 'medium';
    }
    
    return oldAnswer === newAnswer ? 'none' : 'medium';
  }

  getWarningLevel(timeLeft) {
    if (timeLeft < 30000) return 'CRITICAL'; // Less than 30 seconds
    if (timeLeft < 60000) return 'HIGH'; // Less than 1 minute
    if (timeLeft < 300000) return 'MEDIUM'; // Less than 5 minutes
    return 'LOW';
  }

  getCurrentExamState() {
    return {
      isActive: this.isExamActive,
      sessionDuration: this.getSessionDuration(),
      operationsCount: this.logBuffer.length,
      lastOperation: this.getLastOperation(),
      localStorageUsage: this.getLocalStorageUsage()
    };
  }

  getSessionDuration() {
    if (!this.examSessionId || !this.logBuffer.length) return 0;
    const firstLog = this.logBuffer.find(log => log.operation === this.CRITICAL_OPERATIONS.EXAM_START);
    return firstLog ? Date.now() - firstLog.timestamp : 0;
  }

  getLastOperation() {
    return this.operationStack.length > 0 ? this.operationStack[this.operationStack.length - 1] : null;
  }

  getBrowserInfo() {
    if (typeof window === 'undefined') return {};
    
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      viewport: `${window.innerWidth}x${window.innerHeight}`
    };
  }

  getLocalStorageUsage() {
    if (typeof localStorage === 'undefined') return null;
    
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      return null;
    }
  }

  captureStackTrace() {
    try {
      throw new Error();
    } catch (e) {
      return e.stack ? e.stack.split('\n').slice(2, 5) : null; // Get relevant stack frames
    }
  }

  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  }

  // Log management
  setupPeriodicLogging() {
    // Flush logs every 30 seconds during exam
    this.flushInterval = setInterval(() => {
      if (this.isExamActive && this.logBuffer.length > 0) {
        this.flushLogs();
      }
    }, 30000);
  }

  flushLogs(force = false) {
    if (this.logBuffer.length === 0) return;
    
    const logsToFlush = [...this.logBuffer];
    
    // Clear buffer
    this.logBuffer = [];
    
    // Send to monitoring service for processing
    monitoringService.recordPerformanceMetric('exam_logs_batch', {
      logsCount: logsToFlush.length,
      criticalLogsCount: logsToFlush.filter(log => log.isCritical).length,
      examSessionId: this.examSessionId,
      logs: force ? logsToFlush : logsToFlush.slice(-100) // Limit size unless forced
    });
    
    console.log(`[EXAM_LOGGER] Flushed ${logsToFlush.length} logs`);
  }

  // Export methods
  exportLogs() {
    return {
      examSessionId: this.examSessionId,
      examId: this.examId,
      studentId: this.studentId,
      sessionDuration: this.getSessionDuration(),
      logs: [...this.logBuffer],
      criticalOperations: [...this.criticalOperations],
      operationStack: [...this.operationStack]
    };
  }

  cleanup() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flushLogs(true); // Final flush
  }
}

// Create singleton instance
const examLogger = new ExamLogger();

export default examLogger;
export { ExamLogger };