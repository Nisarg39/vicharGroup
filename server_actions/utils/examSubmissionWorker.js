"use server";

import { connectDB } from "../config/mongoose";
import ExamSubmissionQueue from "../models/exam_portal/examSubmissionQueue";
import Exam from "../models/exam_portal/exam";
import Student from "../models/student";
import EnrolledStudent from "../models/exam_portal/enrolledStudent";
import mongoose from "mongoose";
import ExamResult from "../models/exam_portal/examResult";
import MasterMcqQuestion from "../models/exam_portal/master_mcq_question";
import College from "../models/exam_portal/college";
import DefaultNegativeMarkingRule from "../models/exam_portal/defaultNegativeMarkingRule";
import { MonitoringService } from "../../lib/monitoring/MonitoringService";

// Import utilities from existing system
import {
    safePercentage,
    safeParseNumber,
    standardPercentage,
    safeStandardDeviation,
    safeReduce
} from "../../utils/safeNumericOperations";

import { 
  evaluateAnswer, 
  validateEvaluationConfig 
} from "../../utils/decimalAnswerEvaluator.js";

import { 
  getEvaluationConfig, 
  logConfigResolution,
  getSafeDefaultConfig 
} from "../../utils/examEvaluationConfig.js";

import { validateExamDuration } from "../../utils/examDurationHelpers";
import { getEffectiveExamDuration } from "../../utils/examTimingUtils";

/**
 * EXAM SUBMISSION BACKGROUND PROCESSOR
 * 
 * This worker processes queued exam submissions in the background using
 * the existing scoring logic from studentExamActions.js to maintain
 * accuracy while eliminating blocking behavior during concurrent submissions.
 * 
 * CRITICAL: This uses the EXACT same scoring logic as the original 
 * submitExamResultInternal function to ensure scoring accuracy.
 */

class ExamSubmissionWorker {
  constructor() {
    this.workerId = `worker-${process.env.NODE_ENV || 'dev'}-${Date.now()}`;
    this.isProcessing = false;
    this.processingInterval = null;
    this.stats = {
      startedAt: new Date(),
      processedCount: 0,
      errorCount: 0,
      averageProcessingTime: 0
    };
  }

  /**
   * Start the background worker
   */
  start() {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    
    MonitoringService.logActivity('ExamSubmissionWorker', 'Worker started', {
      workerId: this.workerId,
      processId: process.pid
    });

    // Process queue every 3 seconds
    this.processingInterval = setInterval(async () => {
      try {
        await this.processNextSubmission();
      } catch (error) {
        MonitoringService.logError('ExamSubmissionWorker', 'Worker cycle error', {
          error: error.message,
          stack: error.stack,
          workerId: this.workerId
        });
      }
    }, 3000);
  }

  /**
   * Stop the worker gracefully
   */
  stop() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    
    this.isProcessing = false;
    
    MonitoringService.logActivity('ExamSubmissionWorker', 'Worker stopped', {
      workerId: this.workerId,
      stats: this.stats
    });
  }

  /**
   * Process the next queued submission
   */
  async processNextSubmission() {
    try {
      await connectDB();
      
      // Get next submission (this handles priority and retry logic)
      const submission = await ExamSubmissionQueue.getNextQueuedSubmission(this.workerId);
      
      if (!submission) {
        return; // No work to do
      }

      const processingStartTime = Date.now();
      
      MonitoringService.logActivity('ExamSubmissionWorker', 'Processing submission', {
        submissionId: submission.submissionId,
        examId: submission.exam,
        studentId: submission.student,
        attempt: submission.processing.attempts,
        workerId: this.workerId
      });

      try {
        // Process using the extracted scoring logic
        const result = await this.processExamSubmission(submission.submissionData);
        
        const processingTime = Date.now() - processingStartTime;
        
        if (result.success) {
          // Mark as completed with metrics
          await submission.markAsCompleted(result.examResultId, {
            totalProcessingTimeMs: processingTime,
            scoringTimeMs: result.metrics?.scoringTimeMs || processingTime,
            bulkRulesLoadTimeMs: result.metrics?.bulkRulesLoadTimeMs || 0,
            questionProcessingTimeMs: result.metrics?.questionProcessingTimeMs || 0
          });
          
          this.stats.processedCount++;
          this.updateAverageProcessingTime(processingTime);
          
          MonitoringService.logActivity('ExamSubmissionWorker', 'Submission processed successfully', {
            submissionId: submission.submissionId,
            processingTimeMs: processingTime,
            score: result.score,
            totalMarks: result.totalMarks,
            workerId: this.workerId
          });
          
        } else {
          // Processing failed
          const error = new Error(result.message || 'Processing failed');
          await submission.markAsFailed(error, true);
          
          this.stats.errorCount++;
          
          MonitoringService.logError('ExamSubmissionWorker', 'Submission processing failed', {
            submissionId: submission.submissionId,
            error: result.message,
            attempt: submission.processing.attempts,
            workerId: this.workerId
          });
        }
        
      } catch (processingError) {
        // Unexpected error during processing
        await submission.markAsFailed(processingError, true);
        
        this.stats.errorCount++;
        
        MonitoringService.logError('ExamSubmissionWorker', 'Unexpected processing error', {
          submissionId: submission.submissionId,
          error: processingError.message,
          stack: processingError.stack,
          workerId: this.workerId
        });
      }
      
    } catch (error) {
      MonitoringService.logError('ExamSubmissionWorker', 'Worker processing error', {
        error: error.message,
        stack: error.stack,
        workerId: this.workerId
      });
    }
  }

  /**
   * CRITICAL: Process exam submission using EXACT same logic as original system
   * This is extracted from submitExamResultInternal to maintain scoring accuracy
   */
  async processExamSubmission(examData) {
    const processingMetrics = {
      startTime: Date.now()
    };

    try {
      const {
        examId,
        studentId,
        answers,
        totalMarks,
        timeTaken,
        completedAt,
        isOfflineSubmission = false,
        visitedQuestions = [],
        markedQuestions = [],
        warnings = 0
      } = examData;

      // Validate exam data
      if (!mongoose.Types.ObjectId.isValid(examId) || !mongoose.Types.ObjectId.isValid(studentId)) {
        return {
          success: false,
          message: "Invalid exam or student ID",
        };
      }

      // Fetch exam details and check attempt limit
      const exam = await Exam.findById(examId).populate("examQuestions");
      if (!exam) {
        return {
          success: false,
          message: "Exam not found",
        };
      }

      // Fetch student details with college information
      const student = await Student.findById(studentId).populate('college');
      if (!student) {
        return {
          success: false,
          message: "Student not found",
        };
      }

      const maxAttempts = exam.reattempt || 1;
      const previousAttempts = await ExamResult.countDocuments({ exam: examId, student: studentId });
      if (previousAttempts >= maxAttempts) {
        return {
          success: false,
          message: `You have reached the maximum allowed attempts (${maxAttempts}) for this exam.`,
        };
      }

      // CRITICAL: Use exact same answer normalization logic
      const normalizeAnswer = (answer, question) => {
        try {
          if (!answer) return null;
          
          if (question.isMultipleAnswer || (Array.isArray(answer) && answer.length > 0)) {
            return Array.isArray(answer) ? 
              answer.map(a => String(a).trim().toLowerCase()) : 
              [String(answer).trim().toLowerCase()];
          }
          
          return String(answer).trim();
          
        } catch (error) {
          console.error('Error in normalizeAnswer:', error);
          return String(answer || '').trim();
        }
      };
      
      // CRITICAL: Use exact same answer evaluation logic
      const evaluateAnswerMatch = (userAnswer, correctAnswer, question) => {
        try {
          let evaluationConfig = getEvaluationConfig(exam, question);
          
          if (!validateEvaluationConfig(evaluationConfig)) {
            console.warn('Invalid evaluation config, using safe defaults for question:', question._id);
            evaluationConfig = getSafeDefaultConfig();
          }
          
          const evaluationResult = evaluateAnswer(userAnswer, correctAnswer, question, evaluationConfig);
          
          if (evaluationResult.evaluationType === 'numerical' && process.env.NODE_ENV === 'development') {
            logConfigResolution(evaluationConfig, exam, question);
          }
          
          return evaluationResult;
          
        } catch (error) {
          console.error('Error in evaluateAnswerMatch:', error);
          
          const userStr = String(userAnswer || '').trim().toLowerCase();
          const correctStr = String(correctAnswer || '').trim().toLowerCase();
          
          return {
            isMatch: userStr === correctStr,
            evaluationType: 'fallback_string',
            details: {
              error: error.message,
              userValue: userAnswer,
              correctValue: correctAnswer
            }
          };
        }
      };

      // CRITICAL: Calculate scores using exact same logic
      let finalScore = 0;
      let correctAnswersCount = 0;
      let incorrectAnswers = 0;
      let unattempted = 0;
      const questionAnalysis = [];

      // PERFORMANCE OPTIMIZATION: Bulk fetch marking rules (same as original)
      const bulkRulesStartTime = Date.now();
      const bulkMarkingRules = await this.getBulkNegativeMarkingRules(exam);
      processingMetrics.bulkRulesLoadTimeMs = Date.now() - bulkRulesStartTime;
      
      if (!bulkMarkingRules || !bulkMarkingRules.ruleMap || !bulkMarkingRules.markingRules) {
        throw new Error('Failed to fetch marking rules for exam scoring');
      }

      // Process each question with exact same logic
      const questionProcessingStartTime = Date.now();
      for (const question of exam.examQuestions) {
        const userAnswer = answers[question._id];
        const questionMarks = question.marks || 4;
        
        // Get question-specific marking rule
        const questionNegativeMarkingRule = this.getNegativeMarkingRuleFromBulk(exam, question, bulkMarkingRules);
        
        if (!questionNegativeMarkingRule || typeof questionNegativeMarkingRule !== 'object') {
          throw new Error(`Failed to get marking rule for question ${question._id}`);
        }
        
        const adminPositiveMarks = questionNegativeMarkingRule?.positiveMarks || questionMarks || 4;
        const adminNegativeMarks = questionNegativeMarkingRule?.negativeMarks !== undefined ? questionNegativeMarkingRule.negativeMarks : 1;

        if (!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
          // Unattempted
          unattempted++;
          const correctAnswer = question.isMultipleAnswer ? question.multipleAnswer : question.answer;
          questionAnalysis.push({
            questionId: question._id,
            status: "unattempted",
            marks: 0,
            userAnswer: null,
            correctAnswer: correctAnswer,
            negativeMarkingRule: questionNegativeMarkingRule?.description || 'Unknown rule',
          });
        } else if (question.isMultipleAnswer) {
          // MCMA logic - exact same as original
          const questionCorrectAnswers = question.multipleAnswer || [];
          const normalizedUserAnswer = normalizeAnswer(userAnswer, question);
          const normalizedCorrectAnswers = normalizeAnswer(questionCorrectAnswers, question);
          
          const correctSelected = normalizedUserAnswer.filter(ans => normalizedCorrectAnswers.includes(ans));
          const wrongSelected = normalizedUserAnswer.filter(ans => !normalizedCorrectAnswers.includes(ans));
          const totalCorrectOptions = normalizedCorrectAnswers.length;
          const correctSelectedCount = correctSelected.length;
          
          let marksAwarded = 0;
          let status = "";
          
          if (normalizedUserAnswer.length === 0) {
            marksAwarded = 0;
            status = "unattempted";
            unattempted++;
          } else if (wrongSelected.length > 0) {
            marksAwarded = -adminNegativeMarks;
            status = "incorrect";
            incorrectAnswers++;
          } else if (correctSelectedCount === totalCorrectOptions) {
            marksAwarded = adminPositiveMarks;
            status = "correct";
            correctAnswersCount++;
          } else if (correctSelectedCount > 0) {
            // Partial marking logic - exact same as original
            if (questionNegativeMarkingRule.partialMarkingEnabled && questionNegativeMarkingRule.partialMarkingRules) {
              if (totalCorrectOptions >= 4 && correctSelectedCount === 3) {
                marksAwarded = questionNegativeMarkingRule.partialMarkingRules.threeOutOfFour || 3;
              } else if (totalCorrectOptions >= 3 && correctSelectedCount === 2) {
                marksAwarded = questionNegativeMarkingRule.partialMarkingRules.twoOutOfThree || 2;
              } else if (totalCorrectOptions >= 2 && correctSelectedCount === 1) {
                marksAwarded = questionNegativeMarkingRule.partialMarkingRules.oneOutOfTwo || 1;
              } else {
                marksAwarded = Math.floor((correctSelectedCount / totalCorrectOptions) * adminPositiveMarks);
              }
            } else {
              marksAwarded = Math.floor((correctSelectedCount / totalCorrectOptions) * adminPositiveMarks);
            }
            status = "partially_correct";
          } else {
            marksAwarded = 0;
            status = "unattempted";
            unattempted++;
          }
          
          finalScore += marksAwarded;
          questionAnalysis.push({
            questionId: question._id,
            status: status,
            marks: marksAwarded,
            userAnswer: normalizedUserAnswer,
            correctAnswer: normalizedCorrectAnswers,
            negativeMarkingRule: questionNegativeMarkingRule?.description || 'Unknown rule',
            mcmaDetails: {
              totalCorrectOptions: totalCorrectOptions,
              correctSelected: correctSelected.length,
              wrongSelected: wrongSelected.length,
              partialCredit: marksAwarded > 0 && marksAwarded < questionMarks
            }
          });
        } else {
          // MCQ/Numerical logic - exact same as original
          const evaluationResult = evaluateAnswerMatch(userAnswer, question.answer, question);
          
          if (evaluationResult.isMatch) {
            finalScore += adminPositiveMarks;
            correctAnswersCount++;
            questionAnalysis.push({
              questionId: question._id,
              status: "correct",
              marks: adminPositiveMarks,
              userAnswer: evaluationResult.details?.userValue || userAnswer,
              correctAnswer: evaluationResult.details?.correctValue || question.answer,
              negativeMarkingRule: questionNegativeMarkingRule?.description || 'Unknown rule',
              evaluationType: evaluationResult.evaluationType,
              evaluationDetails: evaluationResult.details,
              isNumericalEvaluation: evaluationResult.evaluationType === 'numerical'
            });
          } else {
            finalScore -= adminNegativeMarks;
            incorrectAnswers++;
            questionAnalysis.push({
              questionId: question._id,
              status: "incorrect",
              marks: -adminNegativeMarks,
              userAnswer: evaluationResult.details?.userValue || userAnswer,
              correctAnswer: evaluationResult.details?.correctValue || question.answer,
              negativeMarkingRule: questionNegativeMarkingRule?.description || 'Unknown rule',
              evaluationType: evaluationResult.evaluationType,
              evaluationDetails: evaluationResult.details,
              isNumericalEvaluation: evaluationResult.evaluationType === 'numerical',
              numericalDifference: evaluationResult.details?.difference
            });
          }
        }
      }
      processingMetrics.questionProcessingTimeMs = Date.now() - questionProcessingStartTime;

      // Get exam-wide marking rule for legacy compatibility
      const examNegativeMarkingRule = bulkMarkingRules.ruleMap.examWideRules.length > 0
        ? {
            source: "super_admin_default",
            negativeMarks: bulkMarkingRules.ruleMap.examWideRules[0].negativeMarks,
            positiveMarks: bulkMarkingRules.ruleMap.examWideRules[0].positiveMarks,
            description: bulkMarkingRules.ruleMap.examWideRules[0].description || "Exam-wide default rule"
          }
        : {
            source: "exam_specific",
            negativeMarks: exam.negativeMarks || 1,
            positiveMarks: 4,
            description: "Exam fallback rule"
          };

      // Calculate subject-wise performance - exact same logic
      const subjectPerformance = {};
      
      for (let index = 0; index < exam.examQuestions.length; index++) {
        const question = exam.examQuestions[index];
        const subject = question.subject || 'Unknown';
        const questionResult = questionAnalysis[index];
        
        const questionNegativeMarkingRule = this.getNegativeMarkingRuleFromBulk(exam, question, bulkMarkingRules);
        const questionMaxMarks = questionNegativeMarkingRule.positiveMarks || question.marks || 4;
        
        if (!subjectPerformance[subject]) {
          subjectPerformance[subject] = {
            subject: subject,
            totalQuestions: 0,
            attempted: 0,
            correct: 0,
            incorrect: 0,
            unanswered: 0,
            marks: 0,
            totalMarks: 0,
            accuracy: 0
          };
        }
        
        const subjectStats = subjectPerformance[subject];
        subjectStats.totalQuestions++;
        subjectStats.totalMarks += questionMaxMarks;
        
        if (questionResult.status === 'correct' || questionResult.status === 'partially_correct') {
          subjectStats.attempted++;
          subjectStats.correct++;
          subjectStats.marks += questionResult.marks;
        } else if (questionResult.status === 'incorrect') {
          subjectStats.attempted++;
          subjectStats.incorrect++;
          subjectStats.marks += questionResult.marks;
        } else {
          subjectStats.unanswered++;
        }
      }
      
      // Calculate accuracy and percentage for each subject
      Object.values(subjectPerformance).forEach(subject => {
        subject.accuracy = safePercentage(subject.correct, subject.attempted, 2);
        subject.percentage = standardPercentage(subject.marks, subject.totalMarks, 2);
      });

      // Create exam result - exact same as original
      const examResult = new ExamResult({
        exam: examId,
        student: studentId,
        attemptNumber: previousAttempts + 1,
        answers,
        visitedQuestions,
        markedQuestions,
        warnings,
        score: finalScore,
        totalMarks: exam.totalMarks || totalMarks,
        timeTaken,
        completedAt: new Date(completedAt),
        isOfflineSubmission,
        questionAnalysis,
        statistics: {
          correctAnswers: correctAnswersCount,
          incorrectAnswers,
          unattempted,
          accuracy: (correctAnswersCount / exam.examQuestions.length) * 100,
          totalQuestionsAttempted: correctAnswersCount + incorrectAnswers,
        },
        subjectPerformance: Object.values(subjectPerformance),
        negativeMarkingInfo: {
          ruleUsed: null,
          defaultRuleUsed: examNegativeMarkingRule.defaultRuleId,
          positiveMarks: examNegativeMarkingRule.positiveMarks || 4,
          negativeMarks: examNegativeMarkingRule.negativeMarks,
          ruleDescription: "Question-specific rules applied (see questionAnalysis for details)",
          ruleSource: examNegativeMarkingRule.source
        },
      });
      
      await examResult.save();
      
      // Update exam with result
      exam.examResults.push(examResult._id);
      await exam.save();

      const totalProcessingTime = Date.now() - processingMetrics.startTime;
      processingMetrics.scoringTimeMs = totalProcessingTime;

      return {
        success: true,
        examResultId: examResult._id,
        score: finalScore,
        totalMarks: exam.totalMarks || totalMarks,
        metrics: processingMetrics
      };

    } catch (error) {
      MonitoringService.logError('ExamSubmissionWorker', 'Processing error', {
        error: error.message,
        stack: error.stack,
        examId: examData.examId,
        studentId: examData.studentId
      });
      
      return {
        success: false,
        message: error.message || "Error processing exam result"
      };
    }
  }

  /**
   * Helper methods - exact copies from original system to maintain consistency
   */
  
  normalizeSubject(subject) {
    if (!subject) return null;
    
    const normalized = subject.toString().toLowerCase().trim();
    
    if (['math', 'maths', 'mathematics'].includes(normalized)) {
      return 'mathematics';
    }
    
    if (['phy', 'physics'].includes(normalized)) {
      return 'physics';
    }
    
    if (['chem', 'chemistry'].includes(normalized)) {
      return 'chemistry';
    }
    
    if (['bio', 'biology'].includes(normalized)) {
      return 'biology';
    }
    
    return normalized;
  }

  normalizeStandard(standard) {
    if (!standard) return null;
    return standard.toString().trim();
  }

  getQuestionSection(exam, question) {
    if (question.section !== undefined && question.section !== null) {
      const sectionMap = {
        1: "Section A",
        2: "Section B", 
        3: "Section C"
      };
      return sectionMap[question.section] || "All";
    }
    
    if (exam.section) {
      return exam.section;
    }
    
    return "All";
  }

  async getBulkNegativeMarkingRules(exam) {
    try {
      const markingRules = await DefaultNegativeMarkingRule.find({
        stream: exam.stream,
        isActive: true
      }).sort({ priority: -1 }).lean();

      const ruleMap = {
        examWideRules: [],
        questionTypeRules: {},
        subjectRules: {},
        sectionRules: {},
        combinedRules: {}
      };

      for (const rule of markingRules) {
        const key = `${rule.questionType || 'ALL'}_${rule.subject || 'ALL'}_${rule.standard || 'ALL'}_${rule.section || 'All'}`;
        
        if (!ruleMap.combinedRules[key]) {
          ruleMap.combinedRules[key] = [];
        }
        ruleMap.combinedRules[key].push(rule);

        if (!rule.questionType && !rule.subject && !rule.standard) {
          ruleMap.examWideRules.push(rule);
        }
      }

      return { markingRules, ruleMap };
    } catch (error) {
      console.error("Error fetching bulk marking rules:", error);
      return { 
        markingRules: [], 
        ruleMap: { 
          examWideRules: [], 
          combinedRules: {},
          questionTypeRules: {},
          subjectRules: {},
          sectionRules: {}
        } 
      };
    }
  }

  getNegativeMarkingRuleFromBulk(exam, question, bulkRuleData) {
    try {
      if (!bulkRuleData || !bulkRuleData.ruleMap) {
        throw new Error('Invalid bulk rule data structure');
      }
      
      if (!exam || !question) {
        throw new Error('Missing required exam or question data');
      }
      
      const { ruleMap } = bulkRuleData;
      
      let questionType = 'MCQ';
      if (question.userInputAnswer) {
        questionType = 'Numerical';
      } else if (question.isMultipleAnswer) {
        questionType = 'MCMA';
      }
      
      const questionSection = this.getQuestionSection(exam, question);
      const questionSubject = question.subject;

      const searchKeys = [
        `${questionType}_${questionSubject || 'ALL'}_${exam.standard || 'ALL'}_${questionSection}`,
        `${questionType}_${questionSubject || 'ALL'}_ALL_${questionSection}`,
        `${questionType}_ALL_${exam.standard || 'ALL'}_${questionSection}`,
        `${questionType}_ALL_ALL_${questionSection}`,
        `${questionType}_${questionSubject || 'ALL'}_${exam.standard || 'ALL'}_All`,
        `${questionType}_${questionSubject || 'ALL'}_ALL_All`,
        `${questionType}_ALL_${exam.standard || 'ALL'}_All`,
        `${questionType}_ALL_ALL_All`,
        `ALL_${questionSubject || 'ALL'}_${exam.standard || 'ALL'}_All`,
        `ALL_${questionSubject || 'ALL'}_ALL_All`,
        `ALL_ALL_${exam.standard || 'ALL'}_All`,
        `ALL_ALL_ALL_All`
      ];

      for (const searchKey of searchKeys) {
        const rules = ruleMap.combinedRules[searchKey];
        if (rules && rules.length > 0) {
          const rule = rules[0];
          
          if (rule.subject && questionSubject) {
            const normalizedQuestionSubject = this.normalizeSubject(questionSubject);
            const normalizedRuleSubject = this.normalizeSubject(rule.subject);
            if (normalizedQuestionSubject !== normalizedRuleSubject) {
              continue;
            }
          }

          if (rule.standard) {
            const examStandardStr = this.normalizeStandard(exam.standard);
            const ruleStandardStr = this.normalizeStandard(rule.standard);
            if (ruleStandardStr !== examStandardStr) {
              continue;
            }
          }

          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Optimized rule: ${rule.stream} > ${questionType}`,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules,
            questionType: questionType,
            appliedRule: rule
          };
        }
      }

      if (exam.negativeMarks !== undefined && exam.negativeMarks !== null) {
        return {
          source: "exam_specific",
          negativeMarks: exam.negativeMarks,
          positiveMarks: question.marks || 4,
          description: `Exam default: ${exam.negativeMarks} negative marks`,
          partialMarkingEnabled: false,
          partialMarkingRules: null,
          questionType: questionType
        };
      }

      return {
        source: "exam_specific",
        negativeMarks: 1,
        positiveMarks: 4,
        description: "System default: 1 negative mark, 4 positive marks",
        partialMarkingEnabled: false,
        partialMarkingRules: null,
        questionType: questionType
      };

    } catch (error) {
      console.error("Error getting marking rule from bulk data:", error);
      return {
        source: "exam_specific",
        negativeMarks: 1,
        positiveMarks: 4,
        description: "Error fallback: 1 negative mark, 4 positive marks",
        partialMarkingEnabled: false,
        partialMarkingRules: null,
        questionType: 'MCQ'
      };
    }
  }

  updateAverageProcessingTime(newTime) {
    if (this.stats.processedCount === 0) {
      this.stats.averageProcessingTime = newTime;
    } else {
      this.stats.averageProcessingTime = 
        (this.stats.averageProcessingTime * (this.stats.processedCount - 1) + newTime) / this.stats.processedCount;
    }
  }

  getStats() {
    return {
      ...this.stats,
      workerId: this.workerId,
      isProcessing: this.isProcessing,
      uptime: Date.now() - this.stats.startedAt
    };
  }
}

// Singleton worker instance
let workerInstance = null;

export async function getExamSubmissionWorker() {
  if (!workerInstance) {
    workerInstance = new ExamSubmissionWorker();
  }
  return workerInstance;
}

// Auto-start the worker
export async function startExamSubmissionWorker() {
  const worker = await getExamSubmissionWorker();
  worker.start();
  return worker;
}

export async function stopExamSubmissionWorker() {
  if (workerInstance) {
    workerInstance.stop();
  }
}

export async function getWorkerStats() {
  const worker = await getExamSubmissionWorker();
  return worker.getStats();
}

// Graceful shutdown
process.on('SIGTERM', stopExamSubmissionWorker);
process.on('SIGINT', stopExamSubmissionWorker);