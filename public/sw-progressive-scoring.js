/**
 * PROGRESSIVE SCORING SERVICE WORKER ENGINE
 * 
 * High-performance background computation engine for real-time exam scoring.
 * Handles progressive score calculation, negative marking, and multiple answer
 * support without blocking the main React thread.
 * 
 * FEATURES:
 * ✅ Background progressive score calculation
 * ✅ Negative marking and multiple answer support  
 * ✅ Security hash generation
 * ✅ Real-time computation without React state conflicts
 * ✅ Comprehensive question analysis
 * ✅ Subject-wise performance tracking
 * ✅ Fallback-ready design
 * 
 * TARGET: 2000ms → 10ms submission time (99.5% improvement)
 * CONCURRENCY: Support 500+ simultaneous users
 */

const ENGINE_VERSION = '1.2.0';
const CACHE_NAME = 'progressive-scoring-cache-v1';

// Global state for scoring engine
let examData = null;
let markingScheme = null;
let questionData = null;
let currentAnswers = {};
let computationResults = null;
let securityContext = null;

// Performance metrics
let computationStats = {
  totalComputations: 0,
  averageTime: 0,
  lastUpdateTime: null
};

/**
 * Service Worker Installation & Activation
 */
self.addEventListener('install', (event) => {
  console.log('🔧 Progressive Scoring Service Worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🚀 Progressive Scoring Service Worker activated');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  return self.clients.claim();
});

/**
 * Message Handler - Main API for React communication
 */
self.addEventListener('message', async (event) => {
  const { type, data, messageId } = event.data;
  
  console.log(`📨 SW received message: ${type}`);
  
  try {
    let response = null;
    
    switch (type) {
      case 'INITIALIZE_ENGINE':
        response = await initializeEngine(data);
        break;
        
      case 'UPDATE_ANSWER':
        response = await updateAnswer(data);
        break;
        
      case 'GET_PROGRESSIVE_RESULTS':
        response = await getProgressiveResults(data);
        break;
        
      case 'FINALIZE_COMPUTATION':
        response = await finalizeComputation(data);
        break;
        
      case 'CLEAR_ENGINE_DATA':
        response = await clearEngineData();
        break;
        
      case 'GET_ENGINE_STATUS':
        response = getEngineStatus();
        break;
        
      default:
        response = { success: false, error: `Unknown message type: ${type}` };
    }
    
    // Send response back to main thread
    event.ports[0]?.postMessage({
      messageId,
      success: response.success !== false,
      data: response,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error(`❌ SW error handling ${type}:`, error);
    
    event.ports[0]?.postMessage({
      messageId,
      success: false,
      error: error.message,
      timestamp: Date.now()
    });
  }
});

/**
 * Initialize the Progressive Scoring Engine
 */
async function initializeEngine({ examId, studentId, exam, questions, markingRules, securityData }) {
  try {
    console.log('🔄 Initializing Progressive Scoring Engine...');
    
    const startTime = performance.now();
    
    // FIXED: Store complete exam data including totalMarks
    examData = {
      _id: examId,
      totalMarks: exam?.totalMarks || 0,
      title: exam?.title,
      duration: exam?.duration,
      ...exam
    };
    
    // Store marking scheme
    markingScheme = markingRules;
    
    // Process and store question data with answers
    questionData = questions.map(question => ({
      _id: question._id,
      questionType: question.questionType,
      subject: question.subject,
      marks: question.marks || 4,
      answer: question.answer,
      multipleAnswer: question.multipleAnswer,
      isMultipleAnswer: question.isMultipleAnswer,
      section: question.section,
      questionNumber: question.questionNumber
    }));
    
    // Initialize security context
    securityContext = {
      examId,
      studentId,
      initializeTime: Date.now(),
      schemeHash: securityData?.schemeHash,
      expectedQuestionCount: questions.length
    };
    
    // Initialize computation results structure
    computationResults = {
      finalScore: 0,
      totalMarks: calculateTotalMarks(),
      correctAnswers: 0,
      incorrectAnswers: 0,
      unattempted: questionData.length,
      questionAnalysis: questionData.map(question => ({
        questionId: question._id,
        status: 'unattempted',
        marks: 0,
        userAnswer: null,
        isCorrect: false,
        subject: question.subject,
        questionType: question.questionType
      })),
      subjectPerformance: calculateSubjectPerformance([]),
      lastUpdated: Date.now()
    };
    
    // Clear previous answers
    currentAnswers = {};
    
    const initTime = performance.now() - startTime;
    console.log(`✅ Progressive Engine initialized in ${initTime.toFixed(2)}ms`);
    
    return {
      success: true,
      message: 'Progressive scoring engine initialized successfully',
      initializationTime: initTime,
      questionCount: questionData.length,
      markingRulesCount: Object.keys(markingScheme).length,
      engineVersion: ENGINE_VERSION
    };
    
  } catch (error) {
    console.error('❌ Engine initialization error:', error);
    return {
      success: false,
      error: error.message,
      fallbackRequired: true
    };
  }
}

/**
 * Update answer and recalculate scores progressively
 */
async function updateAnswer({ questionId, answer, timestamp }) {
  try {
    if (!questionData || !markingScheme) {
      throw new Error('Engine not initialized');
    }
    
    const startTime = performance.now();
    
    // Update current answers
    if (answer === null || answer === undefined || 
        (Array.isArray(answer) && answer.length === 0)) {
      delete currentAnswers[questionId];
    } else {
      currentAnswers[questionId] = answer;
    }
    
    // Find the question
    const question = questionData.find(q => q._id === questionId);
    if (!question) {
      throw new Error(`Question ${questionId} not found`);
    }
    
    // Calculate score for this question
    const questionScore = calculateQuestionScore(question, answer);
    
    // Update question analysis
    const analysisIndex = computationResults.questionAnalysis.findIndex(
      qa => qa.questionId === questionId
    );
    
    if (analysisIndex >= 0) {
      computationResults.questionAnalysis[analysisIndex] = {
        ...computationResults.questionAnalysis[analysisIndex],
        status: questionScore.status,
        marks: questionScore.marks,
        userAnswer: answer,
        isCorrect: questionScore.status === 'correct',
        updatedAt: timestamp || Date.now()
      };
    }
    
    // Recalculate overall statistics
    await recalculateOverallResults();
    
    const updateTime = performance.now() - startTime;
    
    // Update performance stats
    computationStats.totalComputations++;
    computationStats.averageTime = 
      ((computationStats.averageTime * (computationStats.totalComputations - 1)) + updateTime) / 
      computationStats.totalComputations;
    computationStats.lastUpdateTime = Date.now();
    
    console.log(`✅ Answer updated for ${questionId} in ${updateTime.toFixed(2)}ms`);
    
    return {
      success: true,
      questionId,
      score: questionScore,
      overallResults: {
        finalScore: computationResults.finalScore,
        correctAnswers: computationResults.correctAnswers,
        incorrectAnswers: computationResults.incorrectAnswers,
        unattempted: computationResults.unattempted
      },
      performanceMetrics: {
        updateTime: updateTime,
        averageTime: computationStats.averageTime
      }
    };
    
  } catch (error) {
    console.error('❌ Answer update error:', error);
    return {
      success: false,
      error: error.message,
      questionId
    };
  }
}

/**
 * Get current progressive computation results
 */
async function getProgressiveResults({ includeAnalysis = false }) {
  try {
    if (!computationResults) {
      throw new Error('No computation results available');
    }
    
    const results = {
      finalScore: computationResults.finalScore,
      totalMarks: computationResults.totalMarks,
      correctAnswers: computationResults.correctAnswers,
      incorrectAnswers: computationResults.incorrectAnswers,
      unattempted: computationResults.unattempted,
      subjectPerformance: computationResults.subjectPerformance,
      lastUpdated: computationResults.lastUpdated,
      answerCount: Object.keys(currentAnswers).length,
      completionPercentage: ((computationResults.correctAnswers + computationResults.incorrectAnswers) / questionData.length) * 100
    };
    
    if (includeAnalysis) {
      results.questionAnalysis = computationResults.questionAnalysis;
    }
    
    return {
      success: true,
      results,
      performanceStats: computationStats
    };
    
  } catch (error) {
    console.error('❌ Get results error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Finalize computation and generate COMPLETE ExamResult data structure
 * Enhanced for direct storage system compatibility (50ms target)
 */
async function finalizeComputation({ submissionMetadata }) {
  try {
    if (!computationResults || !securityContext) {
      throw new Error('Engine not properly initialized');
    }
    
    console.log('🔒 Finalizing computation with complete ExamResult generation...');
    
    const startTime = performance.now();
    
    // Ensure all results are up-to-date
    await recalculateOverallResults();
    
    // Calculate comprehensive statistics
    const statistics = calculateComprehensiveStatistics();
    
    // Generate COMPLETE ExamResult-compatible data structure
    const completeExamResultData = {
      // Core identification
      examId: securityContext.examId,
      studentId: securityContext.studentId,
      answers: { ...currentAnswers },
      
      // Primary score data
      finalScore: computationResults.finalScore,
      totalMarks: computationResults.totalMarks,
      percentage: computationResults.totalMarks > 0 ? 
        ((computationResults.finalScore / computationResults.totalMarks) * 100).toFixed(2) : 0,
      
      // Answer statistics
      correctAnswers: computationResults.correctAnswers,
      incorrectAnswers: computationResults.incorrectAnswers,
      unattempted: computationResults.unattempted,
      
      // COMPLETE question analysis with enhanced data
      questionAnalysis: computationResults.questionAnalysis.map((qa, index) => {
        const question = questionData.find(q => q._id === qa.questionId);
        const userAnswer = currentAnswers[qa.questionId];
        const correctAnswer = question?.answer;
        
        return {
          questionId: qa.questionId,
          questionNumber: question?.questionNumber || (index + 1),
          userAnswer: userAnswer || null,
          correctAnswer: correctAnswer,
          score: qa.marks,
          status: qa.status,
          subject: qa.subject,
          questionType: qa.questionType,
          marks: question?.marks || 4,
          negativeMarks: getMarkingRule(question)?.negativeMarks || 1,
          timeTaken: submissionMetadata?.questionTimings?.[qa.questionId] || 0,
          isCorrect: qa.isCorrect,
          section: question?.section || 'General',
          difficulty: question?.difficulty || 'Medium'
        };
      }),
      
      // COMPLETE subject-wise performance with enhanced metrics
      subjectPerformance: enhanceSubjectPerformance(computationResults.subjectPerformance),
      
      // COMPREHENSIVE statistics
      statistics: {
        correctAnswers: computationResults.correctAnswers,
        incorrectAnswers: computationResults.incorrectAnswers,
        unattempted: computationResults.unattempted,
        accuracy: statistics.accuracy,
        completionRate: statistics.completionRate,
        timeEfficiency: statistics.timeEfficiency,
        totalTimeTaken: submissionMetadata?.timeTaken || 0,
        averageTimePerQuestion: statistics.averageTimePerQuestion,
        strongSubjects: statistics.strongSubjects,
        weakSubjects: statistics.weakSubjects,
        recommendedFocus: statistics.recommendedFocus
      },
      
      // Submission timing and metadata
      timeTaken: submissionMetadata?.timeTaken || 0,
      completedAt: submissionMetadata?.completedAt || new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      visitedQuestions: submissionMetadata?.visitedQuestions || [],
      markedQuestions: submissionMetadata?.markedQuestions || [],
      warnings: submissionMetadata?.warnings || 0,
      
      // Progressive computation metadata
      isPreComputed: true,
      computationSource: 'progressive_service_worker',
      engineVersion: ENGINE_VERSION,
      computedAt: new Date().toISOString(),
      
      // Performance metrics
      computationStats: {
        totalComputations: computationStats.totalComputations,
        averageUpdateTime: computationStats.averageTime,
        initializationTime: securityContext.initializeTime,
        finalizationTime: 0 // Will be set below
      },
      
      // Security validation data
      computationHash: '', // Will be generated below
      validationData: {
        timestamp: Date.now(),
        clientVersion: ENGINE_VERSION,
        computationMethod: 'progressive_service_worker',
        questionCount: questionData.length,
        answersProcessed: Object.keys(currentAnswers).length
      }
    };
    
    // Generate security validation hash
    completeExamResultData.computationHash = await generateEnhancedValidationHash(completeExamResultData);
    
    // Legacy compatibility hash
    completeExamResultData.validationHash = await generateValidationHash({
      examId: completeExamResultData.examId,
      studentId: completeExamResultData.studentId,
      finalScore: completeExamResultData.finalScore,
      totalMarks: completeExamResultData.totalMarks,
      correctAnswers: completeExamResultData.correctAnswers,
      incorrectAnswers: completeExamResultData.incorrectAnswers,
      answerHash: await hashAnswers(completeExamResultData.answers),
      engineVersion: ENGINE_VERSION
    });
    
    const finalizationTime = performance.now() - startTime;
    completeExamResultData.computationStats.finalizationTime = finalizationTime;
    
    console.log(`✅ Complete ExamResult data generated in ${finalizationTime.toFixed(2)}ms`);
    console.log(`📊 Final Score: ${completeExamResultData.finalScore}/${completeExamResultData.totalMarks} (${completeExamResultData.percentage}%)`);
    
    return {
      success: true,
      completeExamResultData,
      finalizationTime,
      dataStructure: 'complete_exam_result',
      directStorageReady: true,
      securityValidation: {
        hashGenerated: true,
        questionsProcessed: computationResults.questionAnalysis.length,
        answersCount: Object.keys(currentAnswers).length,
        validationLayers: 5
      }
    };
    
  } catch (error) {
    console.error('❌ Complete ExamResult generation error:', error);
    return {
      success: false,
      error: error.message,
      fallbackRequired: true
    };
  }
}

/**
 * Clear all engine data
 */
async function clearEngineData() {
  try {
    markingScheme = null;
    questionData = null;
    currentAnswers = {};
    computationResults = null;
    securityContext = null;
    
    computationStats = {
      totalComputations: 0,
      averageTime: 0,
      lastUpdateTime: null
    };
    
    console.log('🧹 Engine data cleared');
    
    return {
      success: true,
      message: 'Engine data cleared successfully'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get engine status
 */
function getEngineStatus() {
  return {
    success: true,
    status: {
      isInitialized: !!(markingScheme && questionData),
      questionCount: questionData?.length || 0,
      answerCount: Object.keys(currentAnswers).length,
      markingRulesLoaded: !!markingScheme,
      securityContextLoaded: !!securityContext,
      performanceStats: computationStats,
      engineVersion: ENGINE_VERSION,
      memoryUsage: {
        markingSchemeSize: markingScheme ? JSON.stringify(markingScheme).length : 0,
        questionDataSize: questionData ? JSON.stringify(questionData).length : 0,
        answersSize: JSON.stringify(currentAnswers).length
      }
    }
  };
}

/**
 * Calculate score for a single question
 */
function calculateQuestionScore(question, answer) {
  try {
    // Handle unattempted questions
    if (!answer || (Array.isArray(answer) && answer.length === 0)) {
      return {
        marks: 0,
        status: 'unattempted',
        isCorrect: false
      };
    }
    
    // Get marking rule for this question
    const markingRule = getMarkingRule(question);
    
    if (question.isMultipleAnswer) {
      // Multiple Choice Multiple Answer (MCMA) logic
      return calculateMCMAScore(question, answer, markingRule);
    } else {
      // Single Choice Answer (SCA) logic
      return calculateSCAScore(question, answer, markingRule);
    }
    
  } catch (error) {
    console.error('Question scoring error:', error);
    return {
      marks: 0,
      status: 'error',
      isCorrect: false
    };
  }
}

/**
 * Calculate score for Multiple Choice Multiple Answer questions
 */
function calculateMCMAScore(question, answer, markingRule) {
  const correctAnswers = question.multipleAnswer || [];
  const userSelections = Array.isArray(answer) ? answer : [answer];
  
  // Count correct and wrong selections
  const correctSelected = userSelections.filter(ans => 
    correctAnswers.includes(ans)
  ).length;
  
  const wrongSelected = userSelections.filter(ans => 
    !correctAnswers.includes(ans)
  ).length;
  
  // Apply scoring logic based on marking rule
  if (wrongSelected > 0) {
    // Any wrong selection = negative marks
    return {
      marks: -Math.abs(markingRule.negativeMarks),
      status: 'incorrect',
      isCorrect: false
    };
  } else if (correctSelected === correctAnswers.length) {
    // All correct selections = full marks
    return {
      marks: markingRule.positiveMarks,
      status: 'correct',
      isCorrect: true
    };
  } else if (correctSelected > 0) {
    // Partial correct selections
    if (markingRule.partialMarkingEnabled) {
      const partialMarks = Math.floor(
        (correctSelected / correctAnswers.length) * markingRule.positiveMarks
      );
      return {
        marks: partialMarks,
        status: 'partially_correct',
        isCorrect: false
      };
    } else {
      // No partial marking = zero marks
      return {
        marks: 0,
        status: 'incorrect',
        isCorrect: false
      };
    }
  }
  
  // Shouldn't reach here, but handle edge case
  return {
    marks: 0,
    status: 'unattempted',
    isCorrect: false
  };
}

/**
 * Calculate score for Single Choice Answer questions
 */
function calculateSCAScore(question, answer, markingRule) {
  // Normalize answers for comparison
  const correctAnswer = String(question.answer).toLowerCase().trim();
  const userAnswer = String(answer).toLowerCase().trim();
  
  const isCorrect = userAnswer === correctAnswer;
  
  return {
    marks: isCorrect ? markingRule.positiveMarks : -Math.abs(markingRule.negativeMarks),
    status: isCorrect ? 'correct' : 'incorrect',
    isCorrect: isCorrect
  };
}

/**
 * Get marking rule for a question (with fallback hierarchy)
 */
function getMarkingRule(question) {
  if (!markingScheme) {
    // Fallback default rule
    return {
      positiveMarks: question.marks || 4,
      negativeMarks: 1,
      partialMarkingEnabled: false
    };
  }
  
  // Priority hierarchy for rule selection:
  // 1. Question-specific rules
  if (markingScheme.questionSpecific && markingScheme.questionSpecific[question._id]) {
    return markingScheme.questionSpecific[question._id];
  }
  
  // 2. Subject + Type combination rules
  const subjectTypeKey = `${question.subject}_${question.questionType}`;
  if (markingScheme.subjectType && markingScheme.subjectType[subjectTypeKey]) {
    return markingScheme.subjectType[subjectTypeKey];
  }
  
  // 3. Question type rules
  if (markingScheme.typeRules && markingScheme.typeRules[question.questionType]) {
    return markingScheme.typeRules[question.questionType];
  }
  
  // 4. Subject-wide rules
  if (markingScheme.subjectRules && markingScheme.subjectRules[question.subject]) {
    return markingScheme.subjectRules[question.subject];
  }
  
  // 5. Exam default
  if (markingScheme.examDefault) {
    return markingScheme.examDefault;
  }
  
  // 6. Fallback default
  return {
    positiveMarks: question.marks || 4,
    negativeMarks: 1,
    partialMarkingEnabled: false
  };
}

/**
 * Recalculate overall results based on current answers
 */
async function recalculateOverallResults() {
  if (!computationResults || !questionData) return;
  
  let finalScore = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;
  
  // Process each question analysis
  for (const analysis of computationResults.questionAnalysis) {
    switch (analysis.status) {
      case 'correct':
        correctCount++;
        finalScore += analysis.marks;
        break;
      case 'incorrect':
        incorrectCount++;
        finalScore += analysis.marks; // Already negative
        break;
      case 'partially_correct':
        incorrectCount++; // Count as attempted
        finalScore += analysis.marks;
        break;
      case 'unattempted':
      default:
        unattemptedCount++;
        break;
    }
  }
  
  // Update results
  computationResults.finalScore = finalScore;
  computationResults.correctAnswers = correctCount;
  computationResults.incorrectAnswers = incorrectCount;
  computationResults.unattempted = unattemptedCount;
  computationResults.lastUpdated = Date.now();
  
  // Recalculate subject performance
  computationResults.subjectPerformance = calculateSubjectPerformance(
    computationResults.questionAnalysis
  );
}

/**
 * Calculate total possible marks for the exam
 */
function calculateTotalMarks() {
  // FIXED: Use exam's predefined total marks instead of summing all question marks
  // This prevents incorrect total calculation for multi-subject exams
  if (examData && examData.totalMarks) {
    return examData.totalMarks;
  }
  
  // Fallback: Calculate from questions only if exam.totalMarks not available
  if (!questionData) return 0;
  
  return questionData.reduce((total, question) => {
    const markingRule = getMarkingRule(question);
    return total + markingRule.positiveMarks;
  }, 0);
}

/**
 * Calculate subject-wise performance analysis
 */
function calculateSubjectPerformance(questionAnalysis) {
  const subjectStats = {};
  
  for (const analysis of questionAnalysis) {
    const subject = analysis.subject;
    
    if (!subjectStats[subject]) {
      subjectStats[subject] = {
        totalQuestions: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        score: 0,
        maxPossibleScore: 0
      };
    }
    
    const stats = subjectStats[subject];
    stats.totalQuestions++;
    
    // Find the question to get marking rule
    const question = questionData.find(q => q._id === analysis.questionId);
    if (question) {
      const markingRule = getMarkingRule(question);
      stats.maxPossibleScore += markingRule.positiveMarks;
    }
    
    if (analysis.status !== 'unattempted') {
      stats.attempted++;
      stats.score += analysis.marks;
      
      if (analysis.status === 'correct') {
        stats.correct++;
      } else {
        stats.incorrect++;
      }
    }
  }
  
  // Calculate percentages
  Object.keys(subjectStats).forEach(subject => {
    const stats = subjectStats[subject];
    stats.attemptedPercentage = (stats.attempted / stats.totalQuestions) * 100;
    stats.accuracyPercentage = stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0;
    stats.scorePercentage = stats.maxPossibleScore > 0 ? (stats.score / stats.maxPossibleScore) * 100 : 0;
  });
  
  return subjectStats;
}

/**
 * Generate enhanced validation hash with comprehensive data integrity
 */
async function generateEnhancedValidationHash(examResultData) {
  try {
    const hashInput = {
      examId: examResultData.examId,
      studentId: examResultData.studentId,
      finalScore: examResultData.finalScore,
      totalMarks: examResultData.totalMarks,
      percentage: examResultData.percentage,
      correctAnswers: examResultData.correctAnswers,
      incorrectAnswers: examResultData.incorrectAnswers,
      unattempted: examResultData.unattempted,
      answerHash: await hashAnswers(examResultData.answers),
      questionAnalysisHash: await hashQuestionAnalysis(examResultData.questionAnalysis),
      subjectPerformanceHash: await hashSubjectPerformance(examResultData.subjectPerformance),
      engineVersion: examResultData.engineVersion,
      computationMethod: examResultData.validationData.computationMethod,
      timestamp: examResultData.validationData.timestamp
    };
    
    const hashString = JSON.stringify(hashInput, Object.keys(hashInput).sort());
    const msgBuffer = new TextEncoder().encode(hashString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
  } catch (error) {
    console.error('Enhanced hash generation error:', error);
    throw new Error('Failed to generate enhanced validation hash');
  }
}

/**
 * Generate validation hash for security (legacy compatibility)
 */
async function generateValidationHash(submissionData) {
  try {
    const hashInput = {
      examId: submissionData.examId,
      studentId: submissionData.studentId,
      finalScore: submissionData.finalScore,
      totalMarks: submissionData.totalMarks,
      correctAnswers: submissionData.correctAnswers,
      incorrectAnswers: submissionData.incorrectAnswers,
      answerHash: await hashAnswers(submissionData.answers),
      engineVersion: submissionData.engineVersion
    };
    
    const hashString = JSON.stringify(hashInput, Object.keys(hashInput).sort());
    const msgBuffer = new TextEncoder().encode(hashString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
  } catch (error) {
    console.error('Hash generation error:', error);
    throw new Error('Failed to generate validation hash');
  }
}

/**
 * Generate hash for answers object
 */
async function hashAnswers(answers) {
  const answerString = JSON.stringify(answers, Object.keys(answers).sort());
  const msgBuffer = new TextEncoder().encode(answerString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate hash for question analysis array
 */
async function hashQuestionAnalysis(questionAnalysis) {
  const analysisData = questionAnalysis.map(qa => ({
    questionId: qa.questionId,
    status: qa.status,
    marks: qa.marks,
    subject: qa.subject
  }));
  
  const analysisString = JSON.stringify(analysisData);
  const msgBuffer = new TextEncoder().encode(analysisString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate hash for subject performance data
 */
async function hashSubjectPerformance(subjectPerformance) {
  const performanceString = JSON.stringify(subjectPerformance, Object.keys(subjectPerformance).sort());
  const msgBuffer = new TextEncoder().encode(performanceString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Error handler for uncaught exceptions
 */
self.addEventListener('error', (event) => {
  console.error('🚨 Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Service Worker Unhandled Promise Rejection:', event.reason);
});

/**
 * ============================================================================
 * COMPREHENSIVE STATISTICS AND ENHANCED DATA GENERATION
 * ============================================================================
 */

/**
 * Calculate comprehensive statistics for complete ExamResult data
 */
function calculateComprehensiveStatistics() {
  try {
    if (!computationResults || !questionData) {
      return getDefaultStatistics();
    }

    const totalQuestions = questionData.length;
    const attempted = computationResults.correctAnswers + computationResults.incorrectAnswers;
    const timeTaken = computationStats.totalComputations * computationStats.averageTime / 1000; // Convert to seconds
    
    // Calculate accuracy
    const accuracy = attempted > 0 ? ((computationResults.correctAnswers / attempted) * 100).toFixed(2) : 0;
    
    // Calculate completion rate
    const completionRate = totalQuestions > 0 ? ((attempted / totalQuestions) * 100).toFixed(1) : 0;
    
    // Calculate time efficiency
    const averageTimePerQuestion = attempted > 0 ? (timeTaken / attempted).toFixed(1) : 0;
    const timeEfficiency = averageTimePerQuestion > 0 ? `${averageTimePerQuestion}s per question` : 'N/A';
    
    // Analyze subject performance for recommendations
    const subjectAnalysis = analyzeSubjectStrengthsWeaknesses();
    
    return {
      accuracy: parseFloat(accuracy),
      completionRate: parseFloat(completionRate),
      timeEfficiency: timeEfficiency,
      averageTimePerQuestion: parseFloat(averageTimePerQuestion),
      strongSubjects: subjectAnalysis.strong,
      weakSubjects: subjectAnalysis.weak,
      recommendedFocus: subjectAnalysis.recommendations
    };
    
  } catch (error) {
    console.error('❌ Statistics calculation error:', error);
    return getDefaultStatistics();
  }
}

/**
 * Analyze subject strengths and weaknesses
 */
function analyzeSubjectStrengthsWeaknesses() {
  try {
    if (!computationResults.subjectPerformance) {
      return { strong: [], weak: [], recommendations: [] };
    }

    const subjects = Object.keys(computationResults.subjectPerformance);
    const subjectScores = subjects.map(subject => ({
      subject: subject,
      percentage: computationResults.subjectPerformance[subject].scorePercentage || 0,
      attempted: computationResults.subjectPerformance[subject].attempted || 0
    }));

    // Sort by percentage
    subjectScores.sort((a, b) => b.percentage - a.percentage);
    
    // Identify strong subjects (top 30% performance)
    const strongThreshold = 70;
    const strong = subjectScores.filter(s => s.percentage >= strongThreshold).map(s => s.subject);
    
    // Identify weak subjects (bottom 30% performance and attempted > 0)
    const weakThreshold = 40;
    const weak = subjectScores.filter(s => s.percentage < weakThreshold && s.attempted > 0).map(s => s.subject);
    
    // Generate recommendations
    const recommendations = [];
    if (weak.length > 0) {
      recommendations.push(`Focus on improving ${weak.slice(0, 2).join(' and ')}`);
    }
    if (strong.length > 0) {
      recommendations.push(`Maintain strong performance in ${strong.slice(0, 2).join(' and ')}`);
    }
    
    return {
      strong: strong,
      weak: weak,
      recommendations: recommendations
    };
    
  } catch (error) {
    console.error('❌ Subject analysis error:', error);
    return { strong: [], weak: [], recommendations: [] };
  }
}

/**
 * Enhance subject performance data with additional metrics
 */
function enhanceSubjectPerformance(subjectPerformance) {
  try {
    if (!subjectPerformance) return {};

    const enhanced = {};
    
    for (const [subject, performance] of Object.entries(subjectPerformance)) {
      enhanced[subject] = {
        // Existing basic metrics
        score: performance.score || 0,
        totalMarks: performance.maxPossibleScore || 0,
        percentage: performance.scorePercentage ? performance.scorePercentage.toFixed(2) : '0.00',
        
        // Enhanced metrics
        correctAnswers: performance.correct || 0,
        incorrectAnswers: performance.incorrect || 0,
        unattempted: performance.totalQuestions - performance.attempted || 0,
        totalQuestions: performance.totalQuestions || 0,
        
        // Performance indicators
        accuracy: performance.accuracyPercentage ? performance.accuracyPercentage.toFixed(2) : '0.00',
        completionRate: performance.attemptedPercentage ? performance.attemptedPercentage.toFixed(1) : '0.0',
        
        // Time analysis (if available)
        timeTaken: performance.timeTaken || 0,
        averageTimePerQuestion: performance.attempted > 0 ? 
          ((performance.timeTaken || 0) / performance.attempted).toFixed(1) : '0.0',
        
        // Performance level classification
        performanceLevel: classifyPerformanceLevel(performance.scorePercentage || 0),
        
        // Improvement suggestions
        needsImprovement: (performance.scorePercentage || 0) < 60,
        strongSubject: (performance.scorePercentage || 0) >= 75
      };
    }
    
    return enhanced;
    
  } catch (error) {
    console.error('❌ Subject performance enhancement error:', error);
    return subjectPerformance || {};
  }
}

/**
 * Classify performance level based on percentage
 */
function classifyPerformanceLevel(percentage) {
  if (percentage >= 90) return 'Excellent';
  if (percentage >= 75) return 'Good';
  if (percentage >= 60) return 'Average';
  if (percentage >= 40) return 'Below Average';
  return 'Needs Improvement';
}

/**
 * Get default statistics structure
 */
function getDefaultStatistics() {
  return {
    accuracy: 0,
    completionRate: 0,
    timeEfficiency: 'N/A',
    averageTimePerQuestion: 0,
    strongSubjects: [],
    weakSubjects: [],
    recommendedFocus: []
  };
}

console.log('🎯 Progressive Scoring Service Worker loaded successfully');