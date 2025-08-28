/**
 * COMPREHENSIVE SUBMISSION DATA TRACER
 * 
 * Provides safe, structured logging for exam submission data flow.
 * Designed to trace data from frontend through all backend processing stages
 * while ensuring no sensitive data exposure in production logs.
 */

import crypto from 'crypto';

/**
 * Safe data sanitizer - removes sensitive fields but preserves structure
 */
function sanitizeDataForLogging(data, options = {}) {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'hash',
    'studentPassword', 'adminPassword', 'authorization',
    ...(options.excludeFields || [])
  ];
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      sanitized[key] = `[REDACTED_${key.toUpperCase()}]`;
    } else if (Array.isArray(value)) {
      sanitized[key] = {
        type: 'array',
        length: value.length,
        firstItem: value.length > 0 ? sanitizeDataForLogging(value[0], options) : null,
        sample: value.length > 5 ? value.slice(0, 3).map(item => sanitizeDataForLogging(item, options)) : value.map(item => sanitizeDataForLogging(item, options))
      };
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeDataForLogging(value, options);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}

/**
 * Generate unique request identifier for tracing
 */
function generateRequestId(prefix = 'EXAM_SUB') {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Format data size for logging
 */
function formatDataSize(data) {
  if (!data) return '0B';
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  const bytes = Buffer.byteLength(str, 'utf8');
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

/**
 * Create data integrity fingerprint for tracking corruption
 */
function createDataFingerprint(data) {
  try {
    if (!data || typeof data !== 'object') return null;
    
    // Create fingerprint from key fields
    const keyFields = {
      examId: data.examId,
      studentId: data.studentId,
      finalScore: data.finalScore,
      totalMarks: data.totalMarks,
      answersCount: data.answers ? Object.keys(data.answers).length : 0,
      timestamp: data.completedAt || data.timestamp
    };
    
    const fingerprintStr = JSON.stringify(keyFields, Object.keys(keyFields).sort());
    return crypto.createHash('sha256').update(fingerprintStr).digest('hex').substring(0, 16);
  } catch (error) {
    return `ERROR_${Date.now()}`;
  }
}

/**
 * Main submission data tracer class
 */
export class SubmissionDataTracer {
  constructor(requestId = null) {
    this.requestId = requestId || generateRequestId();
    this.startTime = Date.now();
    this.tracePoints = [];
    this.dataFingerprints = new Map();
  }

  /**
   * Log entry point data reception
   */
  logEntryPoint(endpoint, requestData, context = {}) {
    const sanitizedData = sanitizeDataForLogging(requestData);
    const fingerprint = createDataFingerprint(requestData);
    const dataSize = formatDataSize(requestData);
    
    this.dataFingerprints.set('entry', fingerprint);
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
      stage: 'ENTRY_POINT',
      endpoint,
      context,
      dataIntegrity: {
        fingerprint,
        dataSize,
        hasRequiredFields: this._checkRequiredFields(requestData),
        fieldCounts: this._getFieldCounts(requestData)
      },
      receivedData: sanitizedData
    };
    
    this.tracePoints.push(logEntry);
    
    console.log('🚀 SUBMISSION TRACE - ENTRY POINT:', {
      requestId: this.requestId,
      endpoint,
      dataSize,
      fingerprint: fingerprint?.substring(0, 8) || 'N/A',
      hasExamId: !!requestData?.examId,
      hasStudentId: !!requestData?.studentId,
      hasFinalScore: typeof requestData?.finalScore === 'number',
      hasTotalMarks: typeof requestData?.totalMarks === 'number',
      hasAnswers: !!requestData?.answers && Object.keys(requestData.answers || {}).length > 0,
      answersCount: Object.keys(requestData?.answers || {}).length,
      context
    });
    
    return logEntry;
  }

  /**
   * Log data transformation
   */
  logTransformation(transformationName, beforeData, afterData, context = {}) {
    const beforeFingerprint = createDataFingerprint(beforeData);
    const afterFingerprint = createDataFingerprint(afterData);
    const beforeSize = formatDataSize(beforeData);
    const afterSize = formatDataSize(afterData);
    
    this.dataFingerprints.set(`before_${transformationName}`, beforeFingerprint);
    this.dataFingerprints.set(`after_${transformationName}`, afterFingerprint);
    
    const dataCorruption = this._detectDataCorruption(beforeData, afterData);
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
      stage: 'TRANSFORMATION',
      transformationName,
      context,
      dataIntegrity: {
        beforeFingerprint,
        afterFingerprint,
        beforeSize,
        afterSize,
        dataCorruption,
        fieldChanges: this._getFieldChanges(beforeData, afterData)
      },
      beforeData: sanitizeDataForLogging(beforeData),
      afterData: sanitizeDataForLogging(afterData)
    };
    
    this.tracePoints.push(logEntry);
    
    console.log('🔄 SUBMISSION TRACE - TRANSFORMATION:', {
      requestId: this.requestId,
      transformationName,
      beforeFingerprint: beforeFingerprint?.substring(0, 8) || 'N/A',
      afterFingerprint: afterFingerprint?.substring(0, 8) || 'N/A',
      sizeChange: `${beforeSize} → ${afterSize}`,
      dataCorruption: dataCorruption.detected,
      corruptionDetails: dataCorruption.details,
      context
    });
    
    // Alert on data corruption
    if (dataCorruption.detected) {
      console.error('🚨 DATA CORRUPTION DETECTED:', {
        requestId: this.requestId,
        transformation: transformationName,
        corruption: dataCorruption
      });
    }
    
    return logEntry;
  }

  /**
   * Log validation steps
   */
  logValidation(validationType, data, validationResult, context = {}) {
    const dataFingerprint = createDataFingerprint(data);
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
      stage: 'VALIDATION',
      validationType,
      context,
      dataIntegrity: {
        fingerprint: dataFingerprint,
        dataSize: formatDataSize(data)
      },
      validationResult,
      inputData: sanitizeDataForLogging(data)
    };
    
    this.tracePoints.push(logEntry);
    
    console.log('🔍 SUBMISSION TRACE - VALIDATION:', {
      requestId: this.requestId,
      validationType,
      isValid: validationResult?.isValid || validationResult?.valid || false,
      fingerprint: dataFingerprint?.substring(0, 8) || 'N/A',
      errors: validationResult?.errors || validationResult?.reason || null,
      context
    });
    
    return logEntry;
  }

  /**
   * Log database operations
   */
  logDatabaseOperation(operation, data, result, context = {}) {
    const dataFingerprint = createDataFingerprint(data);
    const isSuccess = result && !result.error;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
      stage: 'DATABASE_OPERATION',
      operation,
      context,
      dataIntegrity: {
        fingerprint: dataFingerprint,
        dataSize: formatDataSize(data)
      },
      success: isSuccess,
      result: sanitizeDataForLogging(result),
      inputData: sanitizeDataForLogging(data)
    };
    
    this.tracePoints.push(logEntry);
    
    console.log('💾 SUBMISSION TRACE - DATABASE:', {
      requestId: this.requestId,
      operation,
      success: isSuccess,
      fingerprint: dataFingerprint?.substring(0, 8) || 'N/A',
      resultId: result?._id || result?.id || 'N/A',
      error: result?.error || null,
      context
    });
    
    if (!isSuccess) {
      console.error('🚨 DATABASE OPERATION FAILED:', {
        requestId: this.requestId,
        operation,
        error: result?.error || 'Unknown error',
        data: sanitizeDataForLogging(data, { 
          excludeFields: ['answers', 'questionAnalysis'] // Exclude large fields for error logs
        })
      });
    }
    
    return logEntry;
  }

  /**
   * Log errors and exceptions
   */
  logError(stage, error, data = null, context = {}) {
    const dataFingerprint = data ? createDataFingerprint(data) : null;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
      stage: 'ERROR',
      errorStage: stage,
      context,
      error: {
        message: error?.message || error,
        stack: error?.stack,
        name: error?.name,
        code: error?.code
      },
      dataIntegrity: dataFingerprint ? {
        fingerprint: dataFingerprint,
        dataSize: formatDataSize(data)
      } : null,
      inputData: data ? sanitizeDataForLogging(data, { 
        excludeFields: ['answers', 'questionAnalysis'] 
      }) : null
    };
    
    this.tracePoints.push(logEntry);
    
    console.error('❌ SUBMISSION TRACE - ERROR:', {
      requestId: this.requestId,
      errorStage: stage,
      errorMessage: error?.message || error,
      fingerprint: dataFingerprint?.substring(0, 8) || 'N/A',
      context
    });
    
    return logEntry;
  }

  /**
   * Log fallback path execution
   */
  logFallback(fallbackReason, fromStage, toStage, data, context = {}) {
    const dataFingerprint = createDataFingerprint(data);
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
      stage: 'FALLBACK',
      fallbackReason,
      fromStage,
      toStage,
      context,
      dataIntegrity: {
        fingerprint: dataFingerprint,
        dataSize: formatDataSize(data)
      },
      inputData: sanitizeDataForLogging(data)
    };
    
    this.tracePoints.push(logEntry);
    
    console.warn('🔄 SUBMISSION TRACE - FALLBACK:', {
      requestId: this.requestId,
      reason: fallbackReason,
      fallbackPath: `${fromStage} → ${toStage}`,
      fingerprint: dataFingerprint?.substring(0, 8) || 'N/A',
      context
    });
    
    return logEntry;
  }

  /**
   * Generate final trace summary
   */
  generateTraceSummary() {
    const endTime = Date.now();
    const totalTime = endTime - this.startTime;
    
    const summary = {
      requestId: this.requestId,
      totalProcessingTime: `${totalTime}ms`,
      tracePointCount: this.tracePoints.length,
      stages: this.tracePoints.map(tp => tp.stage),
      dataIntegrityCheck: this._performFinalIntegrityCheck(),
      firstFingerprint: this.dataFingerprints.get('entry'),
      lastFingerprint: Array.from(this.dataFingerprints.values()).pop(),
      errors: this.tracePoints.filter(tp => tp.stage === 'ERROR').length,
      fallbacks: this.tracePoints.filter(tp => tp.stage === 'FALLBACK').length
    };
    
    console.log('📊 SUBMISSION TRACE - SUMMARY:', summary);
    
    return {
      ...summary,
      fullTrace: this.tracePoints
    };
  }

  /**
   * Helper methods for data analysis
   */
  _checkRequiredFields(data) {
    const requiredFields = ['examId', 'studentId', 'answers'];
    const scoringFields = ['finalScore', 'totalMarks'];
    
    return {
      hasAllRequired: requiredFields.every(field => data?.[field] !== undefined && data?.[field] !== null),
      hasScoring: scoringFields.every(field => typeof data?.[field] === 'number'),
      missingFields: requiredFields.filter(field => data?.[field] === undefined || data?.[field] === null),
      fieldTypes: Object.fromEntries(
        Object.entries(data || {}).map(([key, value]) => [key, typeof value])
      )
    };
  }

  _getFieldCounts(data) {
    if (!data || typeof data !== 'object') return {};
    
    return {
      totalFields: Object.keys(data).length,
      answersCount: data.answers ? Object.keys(data.answers).length : 0,
      questionAnalysisCount: Array.isArray(data.questionAnalysis) ? data.questionAnalysis.length : 0,
      subjectPerformanceCount: Array.isArray(data.subjectPerformance) ? data.subjectPerformance.length : 0
    };
  }

  _detectDataCorruption(beforeData, afterData) {
    const corruption = {
      detected: false,
      details: []
    };
    
    try {
      // Check for score corruption
      if (typeof beforeData?.finalScore === 'number' && typeof afterData?.finalScore === 'number') {
        if (beforeData.finalScore !== afterData.finalScore) {
          corruption.detected = true;
          corruption.details.push({
            type: 'score_change',
            before: beforeData.finalScore,
            after: afterData.finalScore
          });
        }
      }
      
      // Check for total marks corruption
      if (typeof beforeData?.totalMarks === 'number' && typeof afterData?.totalMarks === 'number') {
        if (beforeData.totalMarks !== afterData.totalMarks) {
          corruption.detected = true;
          corruption.details.push({
            type: 'total_marks_change',
            before: beforeData.totalMarks,
            after: afterData.totalMarks
          });
        }
      }
      
      // Check for answers corruption
      if (beforeData?.answers && afterData?.answers) {
        const beforeCount = Object.keys(beforeData.answers).length;
        const afterCount = Object.keys(afterData.answers).length;
        if (beforeCount !== afterCount) {
          corruption.detected = true;
          corruption.details.push({
            type: 'answers_count_change',
            before: beforeCount,
            after: afterCount
          });
        }
      }
      
      // Check for essential field loss
      const essentialFields = ['examId', 'studentId'];
      for (const field of essentialFields) {
        if (beforeData?.[field] && !afterData?.[field]) {
          corruption.detected = true;
          corruption.details.push({
            type: 'essential_field_lost',
            field,
            beforeValue: beforeData[field]
          });
        }
      }
      
    } catch (error) {
      corruption.detected = true;
      corruption.details.push({
        type: 'corruption_check_error',
        error: error.message
      });
    }
    
    return corruption;
  }

  _getFieldChanges(beforeData, afterData) {
    const changes = {};
    
    try {
      const allKeys = new Set([
        ...Object.keys(beforeData || {}),
        ...Object.keys(afterData || {})
      ]);
      
      for (const key of allKeys) {
        const beforeVal = beforeData?.[key];
        const afterVal = afterData?.[key];
        
        if (beforeVal !== afterVal) {
          changes[key] = {
            before: typeof beforeVal,
            after: typeof afterVal,
            changed: true
          };
        }
      }
    } catch (error) {
      changes.error = error.message;
    }
    
    return changes;
  }

  _performFinalIntegrityCheck() {
    const fingerprints = Array.from(this.dataFingerprints.entries());
    
    return {
      totalFingerprints: fingerprints.length,
      uniqueFingerprints: new Set(fingerprints.map(([, fp]) => fp)).size,
      integrityMaintained: fingerprints.length > 0 && 
                          fingerprints.every(([, fp]) => fp && fp !== 'ERROR'),
      fingerprintChain: fingerprints.map(([stage, fp]) => ({
        stage,
        fingerprint: fp?.substring(0, 8) || 'N/A'
      }))
    };
  }
}

/**
 * Static utility functions for quick logging
 */
export const SubmissionTraceUtils = {
  /**
   * Quick log for critical data loss detection
   */
  logCriticalDataCheck(requestId, stage, data, expectedFields = []) {
    const missing = expectedFields.filter(field => 
      data?.[field] === undefined || data?.[field] === null
    );
    
    if (missing.length > 0) {
      console.error('🚨 CRITICAL DATA LOSS DETECTED:', {
        requestId,
        stage,
        missingFields: missing,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : []
      });
    }
    
    return missing;
  },

  /**
   * Quick log for score validation
   */
  logScoreValidation(requestId, stage, scores) {
    const issues = [];
    
    if (typeof scores?.finalScore !== 'number') {
      issues.push('finalScore not a number');
    }
    if (typeof scores?.totalMarks !== 'number') {
      issues.push('totalMarks not a number');
    }
    if (scores?.finalScore > scores?.totalMarks) {
      issues.push('finalScore exceeds totalMarks');
    }
    
    if (issues.length > 0) {
      console.warn('⚠️ SCORE VALIDATION ISSUES:', {
        requestId,
        stage,
        issues,
        scores: {
          finalScore: scores?.finalScore,
          totalMarks: scores?.totalMarks,
          percentage: scores?.percentage
        }
      });
    }
    
    return issues;
  },

  /**
   * Quick log for answer integrity
   */
  logAnswerIntegrity(requestId, stage, answers) {
    const integrity = {
      hasAnswers: !!answers,
      answerCount: answers ? Object.keys(answers).length : 0,
      hasValidStructure: answers && typeof answers === 'object',
      isEmpty: !answers || Object.keys(answers).length === 0
    };
    
    console.log('📝 ANSWER INTEGRITY CHECK:', {
      requestId,
      stage,
      ...integrity
    });
    
    return integrity;
  }
};

/**
 * Export default tracer factory
 */
export default function createSubmissionTracer(requestId = null) {
  return new SubmissionDataTracer(requestId);
}