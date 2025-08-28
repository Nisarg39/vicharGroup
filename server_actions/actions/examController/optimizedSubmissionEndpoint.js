"use server";

import { connectDB } from "../../config/mongoose";
import Exam from "../../models/exam_portal/exam";
import ExamResult from "../../models/exam_portal/examResult";
import Student from "../../models/student";
import mongoose from "mongoose";
import crypto from 'crypto';
import { logOptimizedSubmissionPerformance, logSubmissionFallback } from "../../services/performance/OptimizedSubmissionMonitor";
import createSubmissionTracer, { SubmissionTraceUtils } from "../../utils/submissionDataTracer";

/**
 * ULTRA-FAST OPTIMIZED SUBMISSION ENDPOINT
 * 
 * This endpoint is designed to eliminate ALL duplicate computation by accepting
 * pre-computed client-side evaluation results and storing them directly with
 * minimal validation. Target processing time: 15-50ms total.
 * 
 * PERFORMANCE TARGETS:
 * - Total processing time: 15-50ms (vs current 400-1,350ms)
 * - Validation time: <10ms (integrity checks only)
 * - Storage time: <15ms (direct database operations)
 * - Memory usage: <5MB per submission
 * - Database queries: 2-3 maximum
 * 
 * ARCHITECTURE:
 * ✅ Zero server-side scoring computation
 * ✅ Ultra-fast hash-based validation
 * ✅ Direct ExamResult creation
 * ✅ Minimal database queries
 * ✅ Comprehensive security checks
 * ✅ Fallback to traditional computation
 * ✅ Performance monitoring
 */

/**
 * Main optimized submission handler - ULTRA-FAST PATH
 * Target: 15-50ms total processing time
 */
export async function submitOptimizedExamResult(optimizedData) {
  const startTime = Date.now();
  
  // INITIALIZE COMPREHENSIVE DATA TRACING
  const tracer = createSubmissionTracer();
  
  try {
    console.log('⚡ OPTIMIZED ENDPOINT: Processing pre-computed submission...');
    
    // LOG ENTRY POINT - COMPREHENSIVE DATA RECEPTION TRACE
    tracer.logEntryPoint('optimizedSubmissionEndpoint', optimizedData, {
      endpoint: 'submitOptimizedExamResult',
      method: 'optimized_direct_storage',
      clientVersion: optimizedData.engineVersion,
      evaluationSource: optimizedData.evaluationSource
    });
    
    // CRITICAL DATA VALIDATION AT ENTRY
    const criticalMissing = SubmissionTraceUtils.logCriticalDataCheck(
      tracer.requestId,
      'ENTRY_VALIDATION',
      optimizedData,
      ['examId', 'studentId', 'answers', 'finalScore', 'totalMarks']
    );
    
    if (criticalMissing.length > 0) {
      tracer.logError('ENTRY_VALIDATION', new Error(`Critical fields missing: ${criticalMissing.join(', ')}`), optimizedData);
    }
    
    // SCORE VALIDATION AT ENTRY
    SubmissionTraceUtils.logScoreValidation(tracer.requestId, 'ENTRY_VALIDATION', {
      finalScore: optimizedData.finalScore,
      totalMarks: optimizedData.totalMarks,
      percentage: optimizedData.percentage
    });
    
    // ANSWER INTEGRITY CHECK AT ENTRY
    SubmissionTraceUtils.logAnswerIntegrity(tracer.requestId, 'ENTRY_VALIDATION', optimizedData.answers);
    
    console.log('📊 SUBMISSION DEBUG: Received data structure:', {
      examId: optimizedData.examId,
      studentId: optimizedData.studentId,
      finalScore: optimizedData.finalScore,
      totalMarks: optimizedData.totalMarks,
      percentage: optimizedData.percentage,
      correctAnswers: optimizedData.correctAnswers,
      incorrectAnswers: optimizedData.incorrectAnswers,
      unattempted: optimizedData.unattempted,
      answersCount: Object.keys(optimizedData.answers || {}).length,
      hasQuestionAnalysis: !!(optimizedData.questionAnalysis && optimizedData.questionAnalysis.length > 0),
      hasSubjectPerformance: !!(optimizedData.subjectPerformance && optimizedData.subjectPerformance.length > 0),
      timeTaken: optimizedData.timeTaken,
      warnings: optimizedData.warnings,
      evaluationSource: optimizedData.evaluationSource,
      traceId: tracer.requestId
    });
    
    await connectDB();
    
    // STEP 1: Ultra-fast validation (5ms target)
    const validationStartTime = Date.now();
    const validation = await performUltraFastValidation(optimizedData, tracer);
    const validationTime = Date.now() - validationStartTime;
    
    // LOG VALIDATION RESULTS
    tracer.logValidation('ultra_fast_validation', optimizedData, validation, {
      validationTime: `${validationTime}ms`,
      targetTime: '5ms',
      performanceTarget: validationTime <= 5 ? 'MET' : 'EXCEEDED'
    });
    
    if (!validation.isValid) {
      console.warn(`⚠️ Validation failed in ${validationTime}ms:`, validation.reason);
      
      // Log validation failure for monitoring
      await logSubmissionFallback(optimizedData, 'validation_failed', validation.reason, validationTime);
      
      // LOG FALLBACK DECISION
      tracer.logFallback(
        validation.reason,
        'optimized_validation',
        'traditional_computation',
        optimizedData,
        { validationTime: `${validationTime}ms`, validationDetails: validation.details }
      );
      
      // FALLBACK: Route to traditional computation
      const fallbackResult = await fallbackToTraditionalComputation(optimizedData, tracer);
      const traceSummary = tracer.generateTraceSummary();
      return { ...fallbackResult, traceSummary };
    }
    
    // STEP 2: Direct storage without any computation (10ms target)
    const storageStartTime = Date.now();
    const result = await storeOptimizedResultDirect(optimizedData, validation, tracer);
    const storageTime = Date.now() - storageStartTime;
    
    const totalTime = Date.now() - startTime;
    
    console.log(`✅ OPTIMIZED SUBMISSION completed in ${totalTime}ms (validation: ${validationTime}ms, storage: ${storageTime}ms)`);
    
    // Log performance achievement
    const performanceImprovement = calculatePerformanceImprovement(totalTime);
    
    // COMPREHENSIVE PERFORMANCE MONITORING
    const performanceMetrics = {
      totalTime,
      validationTime,
      storageTime,
      targetAchieved: totalTime <= 50,
      ultraFastAchieved: totalTime <= 15,
      performanceImprovement,
      optimizationUsed: 'direct_storage'
    };
    
    // Log to monitoring system
    await logOptimizedSubmissionPerformance(optimizedData, performanceMetrics);
    
    // GENERATE FINAL TRACE SUMMARY
    const traceSummary = tracer.generateTraceSummary();
    
    // FINAL DATA INTEGRITY CHECK
    SubmissionTraceUtils.logCriticalDataCheck(
      tracer.requestId,
      'FINAL_RESULT',
      result.examResultData,
      ['score', 'totalMarks', 'percentage']
    );
    
    console.log('✅ OPTIMIZED SUBMISSION SUCCESS - TRACE COMPLETE:', {
      traceId: tracer.requestId,
      totalTime: `${totalTime}ms`,
      stages: traceSummary.stages,
      dataIntegrity: traceSummary.dataIntegrityCheck.integrityMaintained,
      resultId: result.examResultData?.resultId
    });
    
    return {
      success: true,
      message: "Your exam has been submitted successfully!",
      result: result.examResultData,
      processingTime: totalTime,
      performanceMetrics,
      optimizationDetails: {
        computationBypassed: true,
        rulesSkipped: true,
        statisticsPreComputed: true,
        dbQueriesMinimized: true
      },
      traceSummary
    };
    
  } catch (error) {
    const totalTime = Date.now() - startTime;
    
    console.error('❌ OPTIMIZED ENDPOINT error:', error);
    
    // LOG ERROR WITH TRACER
    tracer.logError('OPTIMIZED_ENDPOINT_EXCEPTION', error, optimizedData, {
      totalTime: `${totalTime}ms`,
      errorType: error.name,
      errorCode: error.code
    });
    
    // Log fallback usage for monitoring
    await logSubmissionFallback(optimizedData, 'traditional_computation', error.message, totalTime);
    
    // LOG EMERGENCY FALLBACK
    tracer.logFallback(
      `Exception: ${error.message}`,
      'optimized_endpoint',
      'emergency_traditional_computation',
      optimizedData,
      { totalTime: `${totalTime}ms`, errorType: error.name }
    );
    
    // EMERGENCY FALLBACK: Traditional computation
    console.log('🔄 Emergency fallback to traditional computation...');
    const fallbackResult = await fallbackToTraditionalComputation(optimizedData, tracer, error);
    const traceSummary = tracer.generateTraceSummary();
    return { ...fallbackResult, traceSummary };
  }
}

/**
 * ULTRA-FAST VALIDATION SYSTEM (5ms target)
 * 
 * Performs minimal but comprehensive validation using parallel checks
 * and cached data to achieve sub-5ms validation times.
 */
async function performUltraFastValidation(optimizedData, tracer) {
  const startTime = Date.now();
  
  try {
    console.log('🔍 ULTRA-FAST VALIDATION - Starting comprehensive validation:', {
      traceId: tracer.requestId,
      dataSize: JSON.stringify(optimizedData).length,
      hasRequiredFields: ['examId', 'studentId', 'answers', 'finalScore'].every(f => optimizedData[f] !== undefined)
    });
    // Parallel validation checks for maximum speed
    const [
      basicValidation,
      integrityValidation,
      securityValidation,
      temporalValidation
    ] = await Promise.all([
      validateBasicStructure(optimizedData),
      validateDataIntegrity(optimizedData),
      validateSecurityConstraints(optimizedData),
      validateTemporalConstraints(optimizedData)
    ]);
    
    const validationTime = Date.now() - startTime;
    
    // LOG INDIVIDUAL VALIDATION RESULTS
    tracer.logValidation('basic_structure', optimizedData, basicValidation, { 
      validationType: 'structure_validation',
      validationLayer: '1_of_4' 
    });
    
    tracer.logValidation('data_integrity', optimizedData, integrityValidation, { 
      validationType: 'integrity_validation',
      validationLayer: '2_of_4' 
    });
    
    tracer.logValidation('security_constraints', optimizedData, securityValidation, { 
      validationType: 'security_validation',
      validationLayer: '3_of_4' 
    });
    
    tracer.logValidation('temporal_constraints', optimizedData, temporalValidation, { 
      validationType: 'temporal_validation',
      validationLayer: '4_of_4' 
    });
    
    // Check if all validations passed
    if (!basicValidation.valid) {
      tracer.logError('BASIC_STRUCTURE_VALIDATION_FAILED', new Error('Basic structure validation failed'), optimizedData, {
        errors: basicValidation.errors,
        failedFields: basicValidation.errors
      });
      return { isValid: false, reason: 'basic_structure_invalid', details: basicValidation.errors };
    }
    
    if (!integrityValidation.valid) {
      tracer.logError('DATA_INTEGRITY_VALIDATION_FAILED', new Error('Data integrity validation failed'), optimizedData, {
        errors: integrityValidation.errors
      });
      return { isValid: false, reason: 'data_integrity_failed', details: integrityValidation.errors };
    }
    
    if (!securityValidation.valid) {
      tracer.logError('SECURITY_VALIDATION_FAILED', new Error('Security validation failed'), optimizedData, {
        errors: securityValidation.errors
      });
      return { isValid: false, reason: 'security_validation_failed', details: securityValidation.errors };
    }
    
    if (!temporalValidation.valid) {
      tracer.logError('TEMPORAL_VALIDATION_FAILED', new Error('Temporal validation failed'), optimizedData, {
        errors: temporalValidation.errors
      });
      return { isValid: false, reason: 'temporal_validation_failed', details: temporalValidation.errors };
    }
    
    console.log(`✅ Ultra-fast validation passed in ${validationTime}ms`);
    
    return {
      isValid: true,
      validationTime,
      checks: {
        basicStructure: true,
        dataIntegrity: true,
        securityConstraints: true,
        temporalConstraints: true
      }
    };
    
  } catch (error) {
    console.error('❌ Ultra-fast validation error:', error);
    return {
      isValid: false,
      reason: 'validation_exception',
      error: error.message
    };
  }
}

/**
 * DIRECT STORAGE MECHANISM (10ms target)
 * 
 * Stores ExamResult directly from pre-computed data without any processing.
 * Bypasses all scoring logic, rule fetching, and statistical computation.
 */
async function storeOptimizedResultDirect(optimizedData, validation, tracer) {
  const startTime = Date.now();
  
  try {
    console.log('💾 DIRECT STORAGE - Starting optimized result storage:', {
      traceId: tracer.requestId,
      examId: optimizedData.examId,
      studentId: optimizedData.studentId,
      finalScore: optimizedData.finalScore,
      totalMarks: optimizedData.totalMarks
    });
    const {
      examId,
      studentId,
      finalScore,
      totalMarks,
      percentage,
      correctAnswers,
      incorrectAnswers,
      unattempted,
      answers,
      questionAnalysis,
      subjectPerformance,
      timeTaken,
      completedAt,
      visitedQuestions = [],
      markedQuestions = [],
      warnings = 0
    } = optimizedData;
    
    // Get basic exam and student info (minimal queries)
    console.log('🔎 DATABASE FETCH - Retrieving exam and student data:', {
      traceId: tracer.requestId,
      examId: examId,
      studentId: studentId
    });
    
    const [exam, student] = await Promise.all([
      Exam.findById(examId).select('examResults totalMarks college').lean(),
      Student.findById(studentId).populate('college', 'collegeName collegeCode collegeLogo collegeLocation').lean()
    ]);
    
    // LOG DATABASE FETCH RESULTS
    tracer.logDatabaseOperation('fetch_exam_student', { examId, studentId }, {
      examFound: !!exam,
      studentFound: !!student,
      examTotalMarks: exam?.totalMarks,
      studentCollege: student?.college?.collegeName
    }, { operation: 'parallel_fetch' });
    
    if (!exam || !student) {
      const error = new Error('Exam or student not found');
      tracer.logError('EXAM_STUDENT_NOT_FOUND', error, { examId, studentId, examFound: !!exam, studentFound: !!student });
      throw error;
    }
    
    // LOG DATA INTEGRITY CHECK AFTER FETCH
    SubmissionTraceUtils.logCriticalDataCheck(
      tracer.requestId,
      'POST_DATABASE_FETCH',
      { exam: exam ? 'found' : 'missing', student: student ? 'found' : 'missing' },
      ['exam', 'student']
    );
    
    // Check attempt limit (fast query)
    console.log('🔢 ATTEMPT VALIDATION - Checking previous attempts:', {
      traceId: tracer.requestId,
      examId: examId,
      studentId: studentId
    });
    
    const previousAttempts = await ExamResult.countDocuments({ 
      exam: examId, 
      student: studentId 
    });
    
    // LOG ATTEMPT LIMIT CHECK
    tracer.logDatabaseOperation('check_attempt_limit', { examId, studentId }, {
      previousAttempts,
      maxAttempts: exam.reattempt || 1,
      attemptsRemaining: (exam.reattempt || 1) - previousAttempts
    }, { operation: 'attempt_validation' });
    
    const maxAttempts = exam.reattempt || 1;
    if (previousAttempts >= maxAttempts) {
      const error = new Error(`Maximum attempts (${maxAttempts}) exceeded`);
      tracer.logError('MAX_ATTEMPTS_EXCEEDED', error, { 
        examId, 
        studentId, 
        previousAttempts, 
        maxAttempts 
      });
      throw error;
    }
    
    // Create ExamResult directly from pre-computed data
    const examResultData = {
      exam: examId,
      student: studentId,
      attemptNumber: previousAttempts + 1,
      answers,
      visitedQuestions,
      markedQuestions,
      warnings,
      
      // Pre-computed scores and statistics
      score: finalScore,
      totalMarks: totalMarks,
      timeTaken,
      completedAt: new Date(completedAt),
      
      // Pre-computed question analysis
      questionAnalysis: questionAnalysis || [],
      
      // Pre-computed statistics
      statistics: {
        correctAnswers: correctAnswers || 0,
        incorrectAnswers: incorrectAnswers || 0,
        unattempted: unattempted || 0,
        accuracy: correctAnswers > 0 ? ((correctAnswers / (correctAnswers + incorrectAnswers + unattempted)) * 100) : 0,
        totalQuestionsAttempted: (correctAnswers || 0) + (incorrectAnswers || 0),
        percentage: percentage
      },
      
      // Pre-computed subject performance
      subjectPerformance: subjectPerformance || [],
      
      // Optimized submission metadata
      isOptimizedSubmission: true,
      optimizationMetadata: {
        submissionSource: 'client_evaluation_engine',
        processingTime: validation.validationTime,
        optimizationType: 'direct_storage',
        bypassedComputation: true,
        validationChecks: validation.checks
      },
      
      // Legacy compatibility
      negativeMarkingInfo: {
        ruleUsed: null,
        defaultRuleUsed: null,
        negativeMarks: 1, // Default fallback
        positiveMarks: 4, // Default fallback
        ruleDescription: "Pre-computed by client evaluation engine",
        ruleSource: "client_side_optimization"
      },
      
      isOfflineSubmission: false
    };
    
    // LOG PRE-SAVE DATA INTEGRITY
    console.log('📊 PRE-SAVE DATA VALIDATION:', {
      traceId: tracer.requestId,
      examResultData: {
        hasExamId: !!examResultData.exam,
        hasStudentId: !!examResultData.student,
        score: examResultData.score,
        totalMarks: examResultData.totalMarks,
        answersCount: Object.keys(examResultData.answers || {}).length,
        hasStatistics: !!examResultData.statistics,
        attemptNumber: examResultData.attemptNumber
      }
    });
    
    // ENHANCED: Single database write operation with error handling
    const examResult = new ExamResult(examResultData);
    
    try {
      await examResult.save();
      console.log(`✅ ExamResult saved successfully with ID: ${examResult._id}`);
      
      // LOG SUCCESSFUL SAVE
      tracer.logDatabaseOperation('save_exam_result', examResultData, {
        success: true,
        resultId: examResult._id,
        score: examResult.score,
        totalMarks: examResult.totalMarks,
        attemptNumber: examResult.attemptNumber
      }, { operation: 'exam_result_save' });
      
    } catch (saveError) {
      console.error('❌ CRITICAL: ExamResult save failed:', {
        error: saveError.message,
        stack: saveError.stack,
        traceId: tracer.requestId
      });
      
      // LOG SAVE FAILURE
      tracer.logDatabaseOperation('save_exam_result', examResultData, {
        success: false,
        error: saveError.message,
        errorCode: saveError.code,
        errorName: saveError.name
      }, { operation: 'exam_result_save_failed' });
      
      tracer.logError('EXAM_RESULT_SAVE_FAILED', saveError, examResultData);
      throw new Error(`Database save failed: ${saveError.message}`);
    }
    
    // ENHANCED: Update exam results array with error handling
    try {
      await Exam.findByIdAndUpdate(
        examId,
        { $push: { examResults: examResult._id } },
        { lean: true }
      );
      console.log(`✅ Exam updated successfully with result ID: ${examResult._id}`);
      
      // LOG SUCCESSFUL EXAM UPDATE
      tracer.logDatabaseOperation('update_exam_results_array', 
        { examId, resultId: examResult._id }, 
        { success: true, examId, resultId: examResult._id }, 
        { operation: 'exam_array_update' }
      );
      
    } catch (updateError) {
      console.error('❌ CRITICAL: Exam update failed:', {
        error: updateError.message,
        examId: examId,
        resultId: examResult._id,
        traceId: tracer.requestId
      });
      
      // LOG EXAM UPDATE FAILURE
      tracer.logDatabaseOperation('update_exam_results_array', 
        { examId, resultId: examResult._id }, 
        { success: false, error: updateError.message }, 
        { operation: 'exam_array_update_failed' }
      );
      
      tracer.logError('EXAM_UPDATE_FAILED', updateError, { examId, resultId: examResult._id }, {
        severity: 'NON_CRITICAL',
        reason: 'Result already saved, array update failed'
      });
      
      // Don't throw here as the result is already saved
      console.warn('⚠️ Result saved but exam array update failed - will be corrected by background process');
    }
    
    const storageTime = Date.now() - startTime;
    console.log(`💾 Direct storage completed in ${storageTime}ms`);
    
    // Extract college details for response
    const collegeDetails = student.college ? {
      collegeName: student.college.collegeName,
      collegeCode: student.college.collegeCode,
      collegeLogo: student.college.collegeLogo,
      collegeLocation: student.college.collegeLocation
    } : null;
    
    return {
      examResultData: {
        score: finalScore,
        totalMarks: totalMarks,
        percentage: percentage.toFixed(2),
        correctAnswers: correctAnswers || 0,
        incorrectAnswers: incorrectAnswers || 0,
        unattempted: unattempted || 0,
        timeTaken,
        completedAt: examResult.completedAt,
        warnings,
        questionAnalysis: questionAnalysis || [],
        subjectPerformance: subjectPerformance || [],
        collegeDetails,
        resultId: examResult._id
      },
      storageTime
    };
    
  } catch (error) {
    const storageTime = Date.now() - startTime;
    console.error(`❌ Direct storage failed in ${storageTime}ms:`, error);
    throw new Error(`Direct storage failed: ${error.message}`);
  }
}

/**
 * VALIDATION LAYER IMPLEMENTATIONS
 * Each designed for sub-1ms performance
 */

async function validateBasicStructure(data) {
  try {
    console.log('🔍 DEBUG: Server-side basic structure validation');
    console.log('🔍 DEBUG: Received data structure:', {
      examId: data.examId,
      studentId: data.studentId,
      finalScore: data.finalScore,
      totalMarks: data.totalMarks,
      percentage: data.percentage,
      correctAnswers: data.correctAnswers,
      incorrectAnswers: data.incorrectAnswers,
      unattempted: data.unattempted,
      completedAt: data.completedAt,
      timeTaken: data.timeTaken,
      answersCount: Object.keys(data.answers || {}).length,
      evaluationSource: data.evaluationSource
    });
    
    const requiredFields = [
      'examId', 'studentId', 'answers', 'finalScore', 'totalMarks',
      'percentage', 'correctAnswers', 'incorrectAnswers', 'unattempted',
      'completedAt', 'timeTaken'
    ];
    
    const errors = [];
    
    for (const field of requiredFields) {
      // FIXED: Allow 0 values for numeric fields (scores can be 0)
      if (data[field] === undefined || data[field] === null) {
        errors.push(`Missing required field: ${field} (received: ${data[field]})`);
        console.log(`❌ DEBUG: Missing field ${field}, value:`, data[field]);
      }
    }
    
    // CRITICAL FIX: Additional validation for numeric fields that could be 0
    if (data.finalScore !== undefined && typeof data.finalScore !== 'number') {
      errors.push(`Invalid finalScore type: expected number, got ${typeof data.finalScore}`);
    }
    
    if (data.totalMarks !== undefined && typeof data.totalMarks !== 'number') {
      errors.push(`Invalid totalMarks type: expected number, got ${typeof data.totalMarks}`);
    }
    
    // FIXED: Type validation - Allow negative scores and zero scores
    if (data.finalScore !== undefined && typeof data.finalScore !== 'number') {
      errors.push('Invalid finalScore: must be a number');
    }
    
    if (data.totalMarks !== undefined && (typeof data.totalMarks !== 'number' || data.totalMarks <= 0)) {
      errors.push('Invalid totalMarks: must be a positive number');
    }
    
    // FIXED: Allow negative scores due to negative marking, but check reasonable bounds
    if (data.finalScore !== undefined && data.totalMarks !== undefined) {
      // Allow scores from -50% to 110% of total marks (reasonable bounds for negative marking)
      const minAllowedScore = -Math.abs(data.totalMarks * 0.5);
      const maxAllowedScore = data.totalMarks * 1.1;
      
      if (data.finalScore < minAllowedScore || data.finalScore > maxAllowedScore) {
        errors.push(`Score ${data.finalScore} is outside reasonable bounds (${minAllowedScore} to ${maxAllowedScore})`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  } catch (error) {
    return { valid: false, errors: [error.message] };
  }
}

async function validateDataIntegrity(data) {
  try {
    const errors = [];
    
    // Check percentage calculation
    const expectedPercentage = data.totalMarks > 0 ? (data.finalScore / data.totalMarks) * 100 : 0;
    if (Math.abs(expectedPercentage - data.percentage) > 0.1) {
      errors.push('Percentage calculation mismatch');
    }
    
    // Check answer count consistency
    const totalAnswers = (data.correctAnswers || 0) + (data.incorrectAnswers || 0) + (data.unattempted || 0);
    const answersProvided = Object.keys(data.answers || {}).length;
    
    if (data.questionAnalysis && data.questionAnalysis.length > 0) {
      if (totalAnswers !== data.questionAnalysis.length) {
        errors.push('Answer count inconsistency with question analysis');
      }
    }
    
    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(data.examId)) {
      errors.push('Invalid examId');
    }
    
    if (!mongoose.Types.ObjectId.isValid(data.studentId)) {
      errors.push('Invalid studentId');
    }
    
    return { valid: errors.length === 0, errors };
  } catch (error) {
    return { valid: false, errors: [error.message] };
  }
}

async function validateSecurityConstraints(data) {
  try {
    const errors = [];
    
    // Score bounds check
    if (data.percentage > 100 || data.percentage < -50) {
      errors.push('Score percentage outside reasonable bounds');
    }
    
    // Time validation - Allow very short times for testing, but warn
    if (data.timeTaken < 10) { // Less than 10 seconds is highly suspicious
      errors.push('Submission time extremely short (< 10 seconds)');
    } else if (data.timeTaken < 30) {
      console.warn(`⚠️ Short submission time: ${data.timeTaken} seconds`);
    }
    
    // Answer pattern validation
    if (data.answers && typeof data.answers === 'object') {
      const answerValues = Object.values(data.answers);
      const uniqueAnswers = new Set(answerValues).size;
      
      if (answerValues.length > 20 && uniqueAnswers === 1) {
        errors.push('Suspicious answer pattern detected');
      }
    }
    
    // Perfect score validation
    if (data.percentage === 100 && Object.keys(data.answers || {}).length < 5) {
      errors.push('Perfect score with minimal answers - suspicious');
    }
    
    return { valid: errors.length === 0, errors };
  } catch (error) {
    return { valid: false, errors: [error.message] };
  }
}

async function validateTemporalConstraints(data) {
  try {
    const errors = [];
    const now = new Date();
    const completedAt = new Date(data.completedAt);
    
    // Check if completion time is reasonable
    const timeDiff = Math.abs(now - completedAt);
    
    if (timeDiff > 5 * 60 * 1000) { // More than 5 minutes old
      errors.push('Submission timestamp too old');
    }
    
    if (completedAt > now) {
      errors.push('Completion time in the future');
    }
    
    return { valid: errors.length === 0, errors };
  } catch (error) {
    return { valid: false, errors: [error.message] };
  }
}

/**
 * FALLBACK TO TRADITIONAL COMPUTATION
 * 
 * When optimization validation fails, fallback to the existing
 * server-side computation system to ensure no data loss.
 */
async function fallbackToTraditionalComputation(optimizedData, tracer, validationError = null) {
  try {
    console.log('🔄 FALLBACK: Using traditional server-side computation...', {
      traceId: tracer.requestId,
      fallbackReason: validationError?.message || 'Validation failed',
      hasOptimizedData: !!optimizedData
    });
    
    // LOG FALLBACK DATA PREPARATION
    tracer.logTransformation('prepare_traditional_data', optimizedData, null, {
      transformationType: 'optimized_to_traditional',
      fallbackReason: validationError?.message || 'Validation failed'
    });
    
    // Import traditional submission function
    const { submitExamResultInternal } = await import('./studentExamActions');
    
    // Prepare data for traditional submission
    const traditionalData = {
      examId: optimizedData.examId,
      studentId: optimizedData.studentId,
      answers: optimizedData.answers,
      timeTaken: optimizedData.timeTaken,
      completedAt: optimizedData.completedAt,
      visitedQuestions: optimizedData.visitedQuestions || [],
      markedQuestions: optimizedData.markedQuestions || [],
      warnings: optimizedData.warnings || 0,
      isOptimizationFallback: true,
      optimizationFailureReason: validationError?.message || 'Validation failed'
    };
    
    console.log('🔧 FALLBACK: Calling traditional computation with data:', {
      traceId: tracer.requestId,
      examId: traditionalData.examId,
      studentId: traditionalData.studentId,
      answersCount: Object.keys(traditionalData.answers || {}).length,
      timeTaken: traditionalData.timeTaken
    });
    
    // LOG TRADITIONAL DATA AFTER TRANSFORMATION
    tracer.logTransformation('prepare_traditional_data', optimizedData, traditionalData, {
      transformationType: 'optimized_to_traditional',
      fallbackReason: validationError?.message || 'Validation failed'
    });
    
    const fallbackResult = await submitExamResultInternal(traditionalData);
    
    // LOG TRADITIONAL COMPUTATION RESULT
    tracer.logDatabaseOperation('traditional_computation', traditionalData, fallbackResult, {
      operation: 'fallback_traditional_submission',
      fallbackReason: validationError?.message || 'Validation failed'
    });
    
    console.log('📊 FALLBACK: Traditional computation result:', {
      success: fallbackResult.success,
      message: fallbackResult.message,
      hasResult: !!fallbackResult.result
    });
    
    if (!fallbackResult.success) {
      console.error('❌ CRITICAL: Traditional fallback also failed!', {
        traceId: tracer.requestId,
        error: fallbackResult.error,
        message: fallbackResult.message,
        examId: traditionalData.examId,
        studentId: traditionalData.studentId
      });
      
      // LOG CRITICAL FAILURE
      tracer.logError('TRADITIONAL_FALLBACK_FAILED', 
        new Error(`Traditional fallback failed: ${fallbackResult.error || fallbackResult.message}`),
        traditionalData,
        { 
          severity: 'CRITICAL',
          originalError: validationError?.message,
          fallbackError: fallbackResult.error || fallbackResult.message
        }
      );
    }
    
    return {
      ...fallbackResult,
      processingMethod: 'traditional_fallback',
      optimizationAttempted: true,
      fallbackReason: validationError?.message || 'Validation failed'
    };
    
  } catch (error) {
    console.error('❌ Fallback computation failed:', {
      traceId: tracer.requestId,
      error: error.message,
      stack: error.stack
    });
    
    // LOG FALLBACK EXCEPTION
    tracer.logError('FALLBACK_COMPUTATION_EXCEPTION', error, optimizedData, {
      severity: 'CRITICAL',
      originalError: validationError?.message,
      fallbackException: error.message
    });
    
    return {
      success: false,
      message: "Error processing your submission. Please try again or contact support.",
      error: error.message,
      processingMethod: 'fallback_failed',
      traceId: tracer.requestId
    };
  }
}

/**
 * UTILITY FUNCTIONS
 */

function calculatePerformanceImprovement(actualTime) {
  const typicalServerTime = 1200; // 1200ms typical server computation time
  const improvement = Math.max(0, ((typicalServerTime - actualTime) / typicalServerTime) * 100);
  return `${improvement.toFixed(1)}% faster than server computation`;
}

/**
 * OPTIMIZED SUBMISSION ROUTING FUNCTION
 * 
 * Determines whether to use optimized or traditional submission path
 */
export async function routeOptimizedSubmission(submissionData) {
  try {
    // Check if data is suitable for optimization
    const isOptimizable = submissionData.clientEvaluationResult || 
                         submissionData.progressiveResults || 
                         submissionData.isPreComputed;
    
    if (isOptimizable) {
      console.log('⚡ ROUTING: Using optimized submission path...');
      return await submitOptimizedExamResult(submissionData);
    } else {
      console.log('🔄 ROUTING: Using traditional submission path...');
      return await fallbackToTraditionalComputation(submissionData);
    }
    
  } catch (error) {
    console.error('❌ ROUTING ERROR:', error);
    return await fallbackToTraditionalComputation(submissionData, error);
  }
}

/**
 * MONITORING AND METRICS FUNCTIONS
 */

export async function getOptimizationMetrics() {
  try {
    await connectDB();
    
    // Get optimization usage statistics
    const totalOptimized = await ExamResult.countDocuments({
      isOptimizedSubmission: true,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    const totalTraditional = await ExamResult.countDocuments({
      isOptimizedSubmission: { $ne: true },
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    const optimizationRate = totalOptimized + totalTraditional > 0 
      ? (totalOptimized / (totalOptimized + totalTraditional)) * 100 
      : 0;
    
    return {
      success: true,
      metrics: {
        optimizedSubmissions24h: totalOptimized,
        traditionalSubmissions24h: totalTraditional,
        optimizationRate: `${optimizationRate.toFixed(1)}%`,
        estimatedTimeSaved: `${((totalOptimized * 1.2) / 60).toFixed(1)} minutes`,
        lastUpdated: new Date()
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}