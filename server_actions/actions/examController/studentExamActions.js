"use server";
import { connectDB } from "../../config/mongoose";
import Exam from "../../models/exam_portal/exam";
import Student from "../../models/student";
import EnrolledStudent from "../../models/exam_portal/enrolledStudent";
import mongoose from "mongoose";
import ExamResult from "../../models/exam_portal/examResult";
// Import models that are referenced in populate operations
import MasterMcqQuestion from "../../models/exam_portal/master_mcq_question";
import College from "../../models/exam_portal/college";
import DefaultNegativeMarkingRule from "../../models/exam_portal/defaultNegativeMarkingRule";
// Import caching utilities
import { getCachedExam, getCachedEligibility, getCachedQuestions, clearExamCache } from "../../utils/cache";
// Import retry handler
import { retryExamSubmission, withRetry } from "../../utils/retryHandler";
// Import safe numeric operations
import {
    safePercentage,
    safeParseNumber,
    standardPercentage,
    safeStandardDeviation,
    safeReduce
} from "../../../utils/safeNumericOperations";


// im getting error - Error: Maximum call stack size exceeded this has happened to me alot of times in this project and to solve it use JSON.parse(JSON.stringify(exam)) wherever needed
// or also use lean() 
// Helper function to get the appropriate negative marking rule for an exam
async function getNegativeMarkingRuleForExam(exam) {
  try {
    // Priority order: Super admin default > Exam's negativeMarks field
    // Note: College-specific rules have been removed - only admin-controlled default rules are used
    
    // 1. Try to find super admin default rule
    const defaultRules = await DefaultNegativeMarkingRule.find({
      stream: exam.stream,
      isActive: true
    }).sort({ priority: -1 });

    for (const rule of defaultRules) {
      // Check for exact match with subject and standard
      if (rule.subject && rule.standard) {
        if (exam.examSubject.includes(rule.subject) && rule.standard === exam.standard) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Default rule: ${rule.stream} > ${rule.standard}th > ${rule.subject}`,
            defaultRuleId: rule._id
          };
        }
      }
      // Check for standard-specific rule
      else if (!rule.subject && rule.standard) {
        if (rule.standard === exam.standard) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Default rule: ${rule.stream} > ${rule.standard}th`,
            defaultRuleId: rule._id
          };
        }
      }
      // Check for stream-wide rule
      else if (!rule.subject && !rule.standard) {
        return {
          source: "super_admin_default",
          negativeMarks: rule.negativeMarks,
          positiveMarks: rule.positiveMarks,
          description: rule.description || `Default rule: ${rule.stream}`,
          defaultRuleId: rule._id
        };
      }
    }

    // 2. Fallback to exam's negativeMarks field
    return {
      source: "exam_specific",
      negativeMarks: exam.negativeMarks || 0,
      positiveMarks: exam.positiveMarks || exam.marks || 4, // Use exam's positive marks or default to 4
      description: exam.negativeMarks > 0 ? `Exam-specific: -${exam.negativeMarks} marks per wrong answer` : "No negative marking",
      ruleId: null,
      defaultRuleId: null
    };

  } catch (error) {
    console.error("Error getting negative marking rule:", error);
    // Fallback to exam's negativeMarks
    return {
      source: "exam_specific",
      negativeMarks: exam.negativeMarks || 0,
      positiveMarks: exam.positiveMarks || exam.marks || 4, // Use exam's positive marks or default to 4
      description: "Fallback to exam setting",
      ruleId: null,
      defaultRuleId: null
    };
  }
}

// Helper function to determine section name from question and exam context
function getQuestionSection(exam, question) {
  // For JEE Advanced and similar exams with section-specific rules
  if (question.section !== undefined && question.section !== null) {
    // Map numeric section to string
    const sectionMap = {
      1: "Section A",
      2: "Section B", 
      3: "Section C"
    };
    return sectionMap[question.section] || "All";
  }
  
  // If exam has a section field, use that
  if (exam.section) {
    return exam.section;
  }
  
  // Default to "All" for backward compatibility
  return "All";
}

// Enhanced helper function to get negative marking rule for a specific question type
export async function getNegativeMarkingRuleForQuestion(exam, question) {
  try {
    // Determine question type
    let questionType = 'MCQ'; // Default
    if (question.userInputAnswer) {
      questionType = 'Numerical';
    } else if (question.isMultipleAnswer) {
      questionType = 'MCMA';
    }
    
    // Determine section for this question
    const questionSection = getQuestionSection(exam, question);

    // Enhanced Priority order for rule matching (includes section-specific rules):
    // 1. Section + Question type + Subject + Standard specific (highest priority)
    // 2. Section + Question type + Subject specific
    // 3. Section + Question type + Standard specific
    // 4. Section + Question type specific
    // 5. Question type + Subject + Standard specific
    // 6. Question type + Subject specific
    // 7. Question type + Standard specific  
    // 8. Question type specific
    // 9. Section + Subject + Standard specific
    // 10. Section + Subject specific
    // 11. Section + Standard specific
    // 12. Section specific
    // 13. Subject + Standard specific
    // 14. Subject specific
    // 15. Standard specific
    // 16. Stream-wide rule
    // 17. Exam's negativeMarks field

    const defaultRules = await DefaultNegativeMarkingRule.find({
      stream: exam.stream,
      isActive: true
    }).sort({ priority: -1 });

    // Get question's subject if available
    const questionSubject = question.subject;

    for (const rule of defaultRules) {
      const ruleSection = rule.section || "All";
      const isRuleSectionMatch = (ruleSection === "All" || ruleSection === questionSection);
      
      // 1. Section + Question type + Subject + Standard specific (highest priority)
      if (isRuleSectionMatch && rule.questionType === questionType && rule.subject && rule.standard && rule.section && rule.section !== "All") {
        if (questionSubject === rule.subject && rule.standard === exam.standard) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `${questionType} rule: ${rule.stream} > ${rule.standard}th > ${rule.subject} > ${rule.section}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 2. Section + Question type + Subject specific
      else if (isRuleSectionMatch && rule.questionType === questionType && rule.subject && !rule.standard && rule.section && rule.section !== "All") {
        if (questionSubject === rule.subject) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `${questionType} rule: ${rule.stream} > ${rule.subject} > ${rule.section}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 3. Section + Question type + Standard specific
      else if (isRuleSectionMatch && rule.questionType === questionType && !rule.subject && rule.standard && rule.section && rule.section !== "All") {
        if (rule.standard === exam.standard) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `${questionType} rule: ${rule.stream} > ${rule.standard}th > ${rule.section}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 4. Section + Question type specific
      else if (isRuleSectionMatch && rule.questionType === questionType && !rule.subject && !rule.standard && rule.section && rule.section !== "All") {
        return {
          source: "super_admin_default",
          negativeMarks: rule.negativeMarks,
          positiveMarks: rule.positiveMarks,
          description: rule.description || `${questionType} rule: ${rule.stream} > ${rule.section}`,
          defaultRuleId: rule._id,
          partialMarkingEnabled: rule.partialMarkingEnabled,
          partialMarkingRules: rule.partialMarkingRules
        };
      }
      // 5. Question type + Subject + Standard specific (no section specified or "All")
      else if (rule.questionType === questionType && rule.subject && rule.standard && (!rule.section || rule.section === "All")) {
        if (questionSubject === rule.subject && rule.standard === exam.standard) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `${questionType} rule: ${rule.stream} > ${rule.standard}th > ${rule.subject}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 6. Question type + Subject specific (no section specified or "All")
      else if (rule.questionType === questionType && rule.subject && !rule.standard && (!rule.section || rule.section === "All")) {
        if (questionSubject === rule.subject) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `${questionType} rule: ${rule.stream} > ${rule.subject}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 7. Question type + Standard specific (no section specified or "All")
      else if (rule.questionType === questionType && !rule.subject && rule.standard && (!rule.section || rule.section === "All")) {
        if (rule.standard === exam.standard) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `${questionType} rule: ${rule.stream} > ${rule.standard}th`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 8. Question type specific (stream-wide, no section specified or "All")
      else if (rule.questionType === questionType && !rule.subject && !rule.standard && (!rule.section || rule.section === "All")) {
        return {
          source: "super_admin_default",
          negativeMarks: rule.negativeMarks,
          positiveMarks: rule.positiveMarks,
          description: rule.description || `${questionType} rule: ${rule.stream}`,
          defaultRuleId: rule._id,
          partialMarkingEnabled: rule.partialMarkingEnabled,
          partialMarkingRules: rule.partialMarkingRules
        };
      }
      // 9. Section + Subject + Standard specific (no question type)
      else if (isRuleSectionMatch && !rule.questionType && rule.subject && rule.standard && rule.section && rule.section !== "All") {
        if (questionSubject === rule.subject && rule.standard === exam.standard) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Section rule: ${rule.stream} > ${rule.standard}th > ${rule.subject} > ${rule.section}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 10. Section + Subject specific (no question type)
      else if (isRuleSectionMatch && !rule.questionType && rule.subject && !rule.standard && rule.section && rule.section !== "All") {
        if (questionSubject === rule.subject) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Section rule: ${rule.stream} > ${rule.subject} > ${rule.section}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 11. Section + Standard specific (no question type)
      else if (isRuleSectionMatch && !rule.questionType && !rule.subject && rule.standard && rule.section && rule.section !== "All") {
        if (rule.standard === exam.standard) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Section rule: ${rule.stream} > ${rule.standard}th > ${rule.section}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 12. Section specific (no question type, no subject, no standard)
      else if (isRuleSectionMatch && !rule.questionType && !rule.subject && !rule.standard && rule.section && rule.section !== "All") {
        return {
          source: "super_admin_default",
          negativeMarks: rule.negativeMarks,
          positiveMarks: rule.positiveMarks,
          description: rule.description || `Section rule: ${rule.stream} > ${rule.section}`,
          defaultRuleId: rule._id,
          partialMarkingEnabled: rule.partialMarkingEnabled,
          partialMarkingRules: rule.partialMarkingRules
        };
      }
      // 13. Subject + Standard specific (no question type, no section specified or "All")
      else if (!rule.questionType && rule.subject && rule.standard && (!rule.section || rule.section === "All")) {
        if (questionSubject === rule.subject && rule.standard === exam.standard) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Subject rule: ${rule.stream} > ${rule.standard}th > ${rule.subject}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 14. Subject specific (no question type, no section specified or "All")
      else if (!rule.questionType && rule.subject && !rule.standard && (!rule.section || rule.section === "All")) {
        if (questionSubject === rule.subject) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Subject rule: ${rule.stream} > ${rule.subject}`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 15. Standard specific (no question type, no subject, no section specified or "All")
      else if (!rule.questionType && !rule.subject && rule.standard && (!rule.section || rule.section === "All")) {
        if (rule.standard === exam.standard) {
          return {
            source: "super_admin_default",
            negativeMarks: rule.negativeMarks,
            positiveMarks: rule.positiveMarks,
            description: rule.description || `Standard rule: ${rule.stream} > ${rule.standard}th`,
            defaultRuleId: rule._id,
            partialMarkingEnabled: rule.partialMarkingEnabled,
            partialMarkingRules: rule.partialMarkingRules
          };
        }
      }
      // 16. Stream-wide rule (no question type, no subject, no standard, no section specified or "All")
      else if (!rule.questionType && !rule.subject && !rule.standard && (!rule.section || rule.section === "All")) {
        return {
          source: "super_admin_default",
          negativeMarks: rule.negativeMarks,
          positiveMarks: rule.positiveMarks,
          description: rule.description || `Stream rule: ${rule.stream}`,
          defaultRuleId: rule._id,
          partialMarkingEnabled: rule.partialMarkingEnabled,
          partialMarkingRules: rule.partialMarkingRules
        };
      }
    }

    // 17. Fallback to exam's negativeMarks field
    return {
      source: "exam_specific",
      negativeMarks: exam.negativeMarks || 0,
      positiveMarks: null,
      description: exam.negativeMarks > 0 ? `Exam-specific: -${exam.negativeMarks} marks per wrong answer` : "No negative marking",
      ruleId: null,
      defaultRuleId: null,
      partialMarkingEnabled: false,
      partialMarkingRules: null
    };

  } catch (error) {
    console.error("Error getting negative marking rule for question:", error);
    // Fallback to exam's negativeMarks
    return {
      source: "exam_specific",
      negativeMarks: exam.negativeMarks || 0,
      positiveMarks: null,
      description: "Fallback to exam setting",
      ruleId: null,
      defaultRuleId: null,
      partialMarkingEnabled: false,
      partialMarkingRules: null
    };
  }
}

export async function checkExamEligibility(details) {
  /**
   * checkExamEligibility(details)
   * Flow:
   * 1. Validate examId and studentId
   * 2. Check cache for eligibility result
   * 3. Fetch the exam and check if it exists
   * 4. Check if the exam is active (status: 'active' or 'scheduled')
   * 5. Fetch the student's enrollment in the college
   * 6. Check if the student is enrolled, allocated the subject, and in the correct class
   * 7. Cache successful eligibility results
   * 8. Return eligibility result
   */
  
  // Try to get cached eligibility first
  const cachedResult = await getCachedEligibility(
    details.examId,
    details.studentId,
    async () => {
      // This function is only called if not in cache
      return await checkExamEligibilityUncached(details);
    }
  );
  
  return cachedResult;
}

// Uncached version of checkExamEligibility
async function checkExamEligibilityUncached(details) {
  try {
    await connectDB();

    // 1. Validate examId and studentId
    if (!mongoose.Types.ObjectId.isValid(details.examId)) {
      return {
        success: false,
        message: "Invalid exam ID",
      };
    }
    if (!mongoose.Types.ObjectId.isValid(details.studentId)) {
      return {
        success: false,
        message: "Invalid student ID",
      };
    }

    // 2. Fetch the exam with caching
    const exam = await getCachedExam(details.examId, async () => {
      return await Exam.findById(details.examId)
        .populate("college")
        .populate("examQuestions")
        .lean();
    });
    
    if (!exam) {
      return {
        success: false,
        message: "Exam not found",
      };
    }

    // 3. Check if the exam is active
    
    if (exam.examStatus !== "active" || exam.status !== "scheduled") {
      return {
        success: false,
        message:
          "Exam is not active, Please go to classroom to check the exam status",
      };
    }

    // 3.5. Check if exam has questions
    if (!exam.examQuestions || exam.examQuestions.length === 0) {
      return {
        success: false,
        message: "This exam has no questions assigned. Please contact your administrator.",
      };
    }

    // 4. Fetch the student's enrollment in the college
    const college = exam.college;
    
    const enrolledStudent = await EnrolledStudent.findOne({
      college: college._id,
      student: details.studentId,
    }).lean(); // Added .lean() for performance

    // 5. Check if the student is enrolled by checking the allocated stream and class
    const isStreamMatch = enrolledStudent?.allocatedStreams.includes(exam.stream);
    const isClassMatch =
      enrolledStudent?.class === `${exam.standard}` ||
      enrolledStudent?.class === `${exam.standard}th`;
    const isEnrolled =
      enrolledStudent &&
      isStreamMatch &&
      isClassMatch;


    if (!isEnrolled) {
      return {
        success: false,
        message: "You are not enrolled in this exam",
      };
    }

    // 6. Get preview of marking rules that would be applied to this exam
    const previewMarkingRules = await getNegativeMarkingRuleForExam(exam);
    
    // 6.5. Get subject-specific marking rules for better preview
    const subjectMarkingMap = {};
    let isSubjectWise = false;
    
    if (exam.examQuestions && exam.examQuestions.length > 0) {
      // Get unique subjects and their marking rules
      const uniqueSubjects = [...new Set(exam.examQuestions.map(q => q.subject).filter(Boolean))];
      
      for (const subject of uniqueSubjects) {
        // Find a question from this subject to get its marking rule
        const sampleQuestion = exam.examQuestions.find(q => q.subject === subject);
        if (sampleQuestion) {
          const subjectRule = await getNegativeMarkingRuleForQuestion(exam, sampleQuestion);
          subjectMarkingMap[subject] = {
            correct: subjectRule.positiveMarks || previewMarkingRules.positiveMarks,
            incorrect: -Math.abs(subjectRule.negativeMarks || previewMarkingRules.negativeMarks),
            unanswered: 0
          };
        }
      }
      
      // Check if subjects have different marking schemes
      const markingValues = Object.values(subjectMarkingMap);
      if (markingValues.length > 1) {
        const uniquePositiveMarks = [...new Set(markingValues.map(v => v.correct))];
        isSubjectWise = uniquePositiveMarks.length > 1;
      }
    }
    
    // Add marking rules to exam object for Instructions component
    const examWithMarkingRules = {
      ...exam,
      markingRulePreview: {
        positiveMarks: previewMarkingRules.positiveMarks,
        negativeMarks: previewMarkingRules.negativeMarks,
        ruleDescription: previewMarkingRules.description,
        ruleSource: previewMarkingRules.source,
        hasMarkingRules: true,
        isSubjectWise: isSubjectWise,
        subjects: isSubjectWise ? subjectMarkingMap : {}
      }
    };

    // 7. Return eligibility result
    return {
      success: true,
      message: "You are eligible to give this exam",
      exam: examWithMarkingRules,
    };
  } catch (error) {
    console.error("Error checking exam eligibility:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      examId: details.examId,
      studentId: details.studentId
    });
    return {
      success: false,
      message: `Error checking exam eligibility: ${error.message}`,
    };
  }
}

export async function submitExamResult(examData) {
  /**
   * submitExamResult(examData) - WITH RETRY LOGIC
   * Flow:
   * 1. Use retry wrapper for submission
   * 2. Validate exam data
   * 3. Check attempt limit for this student and exam
   * 4. Calculate final score with negative marking
   * 5. Store new exam result (do not overwrite)
   * 6. Update exam statistics
   * 7. Return submission result
   * 
   * Retry Logic:
   * - 4 retry attempts with exponential backoff
   * - Failed submissions are queued for manual recovery
   * - Students are notified if submission is queued
   */
  
  // Wrap the entire submission in retry logic
  return await retryExamSubmission(submitExamResultInternal, examData);
}

// Internal function that does the actual submission
async function submitExamResultInternal(examData) {
  try {
    await connectDB();

    const {
      examId,
      studentId,
      answers,
      score,
      totalMarks,
      timeTaken,
      completedAt,
      isOfflineSubmission = false,
      visitedQuestions = [],
      markedQuestions = [],
      warnings = 0 // Extract warnings from exam data
    } = examData;

    // 1. Validate exam data
    if (!mongoose.Types.ObjectId.isValid(examId) || !mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        message: "Invalid exam or student ID",
      };
    }

    // 2. Fetch exam details and check attempt limit
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

    // Helper function to normalize answers for comparison based on model schema
    const normalizeAnswer = (answer, question) => {
      if (question.userInputAnswer) {
        return answer;
      }
      if (Array.isArray(answer)) {
        return answer.map(ans => {
          if (typeof ans === 'string') {
            const match = ans.match(/^[A-D]$/i);
            if (match) return match[0].toUpperCase();
            const htmlMatch = ans.match(/<p>([A-D])<\/p>/i);
            if (htmlMatch) return htmlMatch[1].toUpperCase();
            const complexMatch = ans.match(/<p>([A-D])\s*[^<]*<\/p>/i);
            if (complexMatch) return complexMatch[1].toUpperCase();
          }
          return ans;
        });
      } else if (typeof answer === 'string') {
        const match = answer.match(/^[A-D]$/i);
        if (match) return match[0].toUpperCase();
        const htmlMatch = answer.match(/<p>([A-D])<\/p>/i);
        if (htmlMatch) return htmlMatch[1].toUpperCase();
        const complexMatch = answer.match(/<p>([A-D])\s*[^<]*<\/p>/i);
        if (complexMatch) return complexMatch[1].toUpperCase();
      }
      return answer;
    };

    // 3. Calculate detailed score with question-specific negative marking
    let finalScore = 0;
    let correctAnswersCount = 0;
    let incorrectAnswers = 0;
    let unattempted = 0;
    const questionAnalysis = [];

    // Process each question with its specific negative marking rule
    for (const question of exam.examQuestions) {
      const userAnswer = answers[question._id];
      const questionMarks = question.marks || 4;
      
      // Get question-specific negative marking rule
      const questionNegativeMarkingRule = await getNegativeMarkingRuleForQuestion(exam, question);
      
      // Get admin-configured marks using proper fallback logic
      const adminPositiveMarks = questionNegativeMarkingRule.positiveMarks || questionMarks || 4;
      const adminNegativeMarks = questionNegativeMarkingRule.negativeMarks !== undefined ? questionNegativeMarkingRule.negativeMarks : 1;

      if (!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
        unattempted++;
        const correctAnswer = question.isMultipleAnswer ? question.multipleAnswer : question.answer;
        questionAnalysis.push({
          questionId: question._id,
          status: "unattempted",
          marks: 0,
          userAnswer: null,
          correctAnswer: correctAnswer,
          negativeMarkingRule: questionNegativeMarkingRule.description,
        });
      } else if (question.isMultipleAnswer) {
        // MCMA (Multiple Choice Multiple Answer) logic - JEE Advanced Rules
        const questionCorrectAnswers = question.multipleAnswer || [];
        const normalizedUserAnswer = normalizeAnswer(userAnswer, question);
        const normalizedCorrectAnswers = normalizeAnswer(questionCorrectAnswers, question);
        
        // Analyze user's selections
        const correctSelected = normalizedUserAnswer.filter(ans => normalizedCorrectAnswers.includes(ans));
        const wrongSelected = normalizedUserAnswer.filter(ans => !normalizedCorrectAnswers.includes(ans));
        const totalCorrectOptions = normalizedCorrectAnswers.length;
        const correctSelectedCount = correctSelected.length;
        
        let marksAwarded = 0;
        let status = "";
        
        // JEE Advanced MCMA Marking Scheme:
        if (normalizedUserAnswer.length === 0) {
          // Zero Marks: 0 if no options are chosen
          marksAwarded = 0;
          status = "unattempted";
          unattempted++;
        } else if (wrongSelected.length > 0) {
          // Negative Marks: Use admin-configured rule for MCMA wrong selections
          marksAwarded = -adminNegativeMarks; // Use admin-configured negative marking
          status = "incorrect";
          incorrectAnswers++;
        } else if (correctSelectedCount === totalCorrectOptions) {
          // Full Marks: Use admin-configured positive marks if ALL correct options chosen
          marksAwarded = adminPositiveMarks; // Use admin-configured positive marks
          status = "correct";
          correctAnswersCount++;
        } else if (correctSelectedCount > 0) {
          // Partial Marks: Use admin-configured partial marking rules
          if (questionNegativeMarkingRule.partialMarkingEnabled && questionNegativeMarkingRule.partialMarkingRules) {
            // Use admin-configured partial marking rules
            if (totalCorrectOptions >= 4 && correctSelectedCount === 3) {
              marksAwarded = questionNegativeMarkingRule.partialMarkingRules.threeOutOfFour || 3;
            } else if (totalCorrectOptions >= 3 && correctSelectedCount === 2) {
              marksAwarded = questionNegativeMarkingRule.partialMarkingRules.twoOutOfThree || 2;
            } else if (totalCorrectOptions >= 2 && correctSelectedCount === 1) {
              marksAwarded = questionNegativeMarkingRule.partialMarkingRules.oneOutOfTwo || 1;
            } else {
              // Proportional based on admin positive marks for other scenarios
              marksAwarded = Math.floor((correctSelectedCount / totalCorrectOptions) * adminPositiveMarks);
            }
          } else {
            // Fallback: If partial marking not configured, use proportional marking
            marksAwarded = Math.floor((correctSelectedCount / totalCorrectOptions) * adminPositiveMarks);
          }
          status = "partially_correct";
          // Don't increment correctAnswersCount for partial marks
        } else {
          // This shouldn't happen, but fallback
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
          negativeMarkingRule: questionNegativeMarkingRule.description,
          mcmaDetails: {
            totalCorrectOptions: totalCorrectOptions,
            correctSelected: correctSelected.length,
            wrongSelected: wrongSelected.length,
            partialCredit: marksAwarded > 0 && marksAwarded < questionMarks
          }
        });
      } else {
        // MCQ (Single Choice) or Numerical logic
        const normalizedUserAnswer = normalizeAnswer(userAnswer, question);
        const normalizedCorrectAnswer = normalizeAnswer(question.answer, question);
        if (normalizedUserAnswer === normalizedCorrectAnswer) {
          // Use admin-configured positive marks instead of questionMarks for subject-specific scoring (like MHT-CET)
          finalScore += adminPositiveMarks;
          correctAnswersCount++;
          questionAnalysis.push({
            questionId: question._id,
            status: "correct",
            marks: adminPositiveMarks,
            userAnswer: normalizedUserAnswer,
            correctAnswer: normalizedCorrectAnswer,
            negativeMarkingRule: questionNegativeMarkingRule.description,
          });
        } else {
          finalScore -= adminNegativeMarks;
          incorrectAnswers++;
          questionAnalysis.push({
            questionId: question._id,
            status: "incorrect",
            marks: -adminNegativeMarks,
            userAnswer: normalizedUserAnswer,
            correctAnswer: normalizedCorrectAnswer,
            negativeMarkingRule: questionNegativeMarkingRule.description,
          });
        }
      }
    }

    // 4. Get exam-wide negative marking summary for legacy compatibility
    const examNegativeMarkingRule = await getNegativeMarkingRuleForExam(exam);

    // 5. Calculate subject-wise performance
    const subjectPerformance = {};
    
    for (let index = 0; index < exam.examQuestions.length; index++) {
      const question = exam.examQuestions[index];
      const subject = question.subject || 'Unknown';
      const questionResult = questionAnalysis[index];
      
      // Get question-specific marking rule for accurate total marks calculation
      const questionNegativeMarkingRule = await getNegativeMarkingRuleForQuestion(exam, question);
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
        subjectStats.marks += questionResult.marks; // This will be negative for incorrect answers
      } else {
        subjectStats.unanswered++;
      }
    }
    
    // Calculate accuracy and percentage for each subject - Fixed double rounding
    Object.values(subjectPerformance).forEach(subject => {
      subject.accuracy = safePercentage(subject.correct, subject.attempted, 2);
      subject.percentage = standardPercentage(subject.marks, subject.totalMarks, 2);
    });

    // 6. Create new exam result (do not overwrite)
    const examResult = new ExamResult({
      exam: examId,
      student: studentId,
      attemptNumber: previousAttempts + 1,
      answers,
      visitedQuestions,
      markedQuestions,
      warnings, // Save warnings count
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
        ruleUsed: null, // College-specific rules no longer exist
        defaultRuleUsed: examNegativeMarkingRule.defaultRuleId,
        negativeMarks: examNegativeMarkingRule.negativeMarks,
        ruleDescription: "Question-specific rules applied (see questionAnalysis for details)",
        ruleSource: examNegativeMarkingRule.source
      },
    });
    await examResult.save();
    // 7. Update exam with result
    exam.examResults.push(examResult._id);
    await exam.save();

    // Extract college details
    const collegeDetails = student.college ? {
      collegeName: student.college.collegeName,
      collegeCode: student.college.collegeCode,
      collegeLogo: student.college.collegeLogo,
      collegeLocation: student.college.collegeLocation
    } : null;


    return {
      success: true,
      message: "Exam submitted successfully",
      result: {
        score: finalScore,
        totalMarks: exam.totalMarks || totalMarks,
        percentage: ((finalScore / (exam.totalMarks || totalMarks)) * 100).toFixed(2),
        correctAnswers: correctAnswersCount,
        incorrectAnswers,
        unattempted,
        timeTaken,
        completedAt: examResult.completedAt,
        warnings, // Include warnings in the result
        questionAnalysis, // Include questionAnalysis in immediate response
        negativeMarkingRule: {
          negativeMarks: examNegativeMarkingRule.negativeMarks,
          description: "Question-specific rules applied",
          source: examNegativeMarkingRule.source
        },
        collegeDetails, // Add college details to result
      },
    };
  } catch (error) {
    console.error("Error submitting exam result:", error);
    return {
      success: false,
      message: "Error submitting exam result",
    };
  }
}

export async function getExamQuestions(examId) {
  /**
   * getExamQuestions(examId)
   * Flow:
   * 1. Validate exam ID
   * 2. Fetch exam with populated questions
   * 3. Return questions for caching
   */
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return {
        success: false,
        message: "Invalid exam ID",
      };
    }

    const exam = await Exam.findById(examId)
      .populate("examQuestions")
      .select("examQuestions examName examDurationMinutes totalMarks negativeMarks");

    if (!exam) {
      return {
        success: false,
        message: "Exam not found",
      };
    }

    // Use JSON.parse(JSON.stringify()) to break circular references
    const cleanExam = JSON.parse(JSON.stringify({
      _id: exam._id,
      examName: exam.examName,
      examDurationMinutes: exam.examDurationMinutes,
      totalMarks: exam.totalMarks,
      negativeMarks: exam.negativeMarks,
      questions: exam.examQuestions,
    }));

    return {
      success: true,
      message: "Questions fetched successfully",
      exam: cleanExam,
    };
  } catch (error) {
    console.error("Error fetching exam questions:", error);
    return {
      success: false,
      message: "Error fetching exam questions",
    };
  }
}

export async function syncOfflineSubmissions(studentId, submissions) {
  /**
   * syncOfflineSubmissions(studentId, submissions)
   * Flow:
   * 1. Validate submissions array
   * 2. Process each submission
   * 3. Return sync results
   */
  try {
    await connectDB();

    if (!Array.isArray(submissions) || submissions.length === 0) {
      return {
        success: false,
        message: "No submissions to sync",
      };
    }

    const results = [];
    const errors = [];

    for (const submission of submissions) {
      try {
        const result = await submitExamResult({
          ...submission,
          studentId,
          isOfflineSubmission: true,
        });

        if (result.success) {
          results.push({
            examId: submission.examId,
            status: "synced",
            result: result.result,
          });
        } else {
          errors.push({
            examId: submission.examId,
            error: result.message,
          });
        }
      } catch (error) {
        errors.push({
          examId: submission.examId,
          error: error.message,
        });
      }
    }

    return {
      success: true,
      message: `Synced ${results.length} submissions successfully`,
      results,
      errors,
    };
  } catch (error) {
    console.error("Error syncing offline submissions:", error);
    return {
      success: false,
      message: "Error syncing offline submissions",
    };
  }
}

export async function getStudentExamResult(studentId, examId) {
  /**
   * getStudentExamResult(studentId, examId)
   * Flow:
   * 1. Validate student ID and exam ID
   * 2. Fetch specific exam result for student
   * 3. Return result with exam details
   */
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(examId)) {
      return {
        success: false,
        message: "Invalid student ID or exam ID",
      };
    }

    const result = await ExamResult.findOne({ 
      student: studentId,
      exam: examId 
    }).populate({
      path: "exam",
      select: "examName examSubject stream standard completedAt",
    }).populate({
      path: "negativeMarkingInfo.defaultRuleUsed", 
      select: "negativeMarks description stream standard subject examType isActive"  
    }).populate({
      path: "student",
      populate: {
        path: "college",
        select: "collegeName collegeCode collegeLogo collegeLocation"
      }
    });

    if (!result) {
      return {
        success: false,
        message: "No result found for this exam",
      };
    }

    // Properly serialize result to avoid circular references
    const resultObj = result.toObject();
    
    // Extract college details
    const collegeDetails = resultObj.student?.college ? {
      collegeName: resultObj.student.college.collegeName,
      collegeCode: resultObj.student.college.collegeCode,
      collegeLogo: resultObj.student.college.collegeLogo,
      collegeLocation: resultObj.student.college.collegeLocation
    } : null;

    
    const cleanResult = {
      _id: resultObj._id,
      exam: resultObj.exam,
      examName: resultObj.exam.examName,
      examSubject: resultObj.exam.examSubject,
      stream: resultObj.exam.stream,
      standard: resultObj.exam.standard,
      score: resultObj.score,
      totalMarks: resultObj.totalMarks,
      percentage: ((resultObj.score / resultObj.totalMarks) * 100).toFixed(2),
      timeTaken: resultObj.timeTaken,
      completedAt: resultObj.completedAt,
      isOfflineSubmission: resultObj.isOfflineSubmission,
      statistics: resultObj.statistics,
      questionAnalysis: resultObj.questionAnalysis,
      negativeMarkingInfo: resultObj.negativeMarkingInfo ? {
        negativeMarks: resultObj.negativeMarkingInfo.negativeMarks,
        ruleDescription: resultObj.negativeMarkingInfo.ruleDescription,
        ruleSource: resultObj.negativeMarkingInfo.ruleSource,
        ruleUsed: null, // College-specific rules no longer exist
        defaultRuleUsed: resultObj.negativeMarkingInfo.defaultRuleUsed ? {
          _id: resultObj.negativeMarkingInfo.defaultRuleUsed._id,
          negativeMarks: resultObj.negativeMarkingInfo.defaultRuleUsed.negativeMarks,
          description: resultObj.negativeMarkingInfo.defaultRuleUsed.description,
          stream: resultObj.negativeMarkingInfo.defaultRuleUsed.stream,
          standard: resultObj.negativeMarkingInfo.defaultRuleUsed.standard,
          subject: resultObj.negativeMarkingInfo.defaultRuleUsed.subject,
          examType: resultObj.negativeMarkingInfo.defaultRuleUsed.examType
        } : null
      } : null,
      collegeDetails, // Add college details to result
    };

    return {
      success: true,
      message: "Result fetched successfully",
      result: cleanResult,
    };
  } catch (error) {
    console.error("Error fetching student exam result:", error);
    return {
      success: false,
      message: "Error fetching exam result",
    };
  }
}

export async function getStudentExamResults(studentId) {
  /**
   * getStudentExamResults(studentId)
   * Flow:
   * 1. Validate student ID
   * 2. Fetch all exam results for student
   * 3. Return results with exam details
   */
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        message: "Invalid student ID",
      };
    }

    const results = await ExamResult.find({ student: studentId })
      .populate({
        path: "exam",
        select: "examName examSubject stream standard completedAt",
      })
      .populate({
        path: "negativeMarkingInfo.defaultRuleUsed", 
        select: "negativeMarks description stream standard subject examType isActive"
      })
      .sort({ completedAt: -1 });

    // Properly serialize results to avoid circular references
    const cleanResults = results.map((result) => {
      const resultObj = result.toObject();
      return {
        _id: resultObj._id,
        exam: resultObj.exam,
        examName: resultObj.exam.examName,
        examSubject: resultObj.exam.examSubject,
        stream: resultObj.exam.stream,
        standard: resultObj.exam.standard,
        score: resultObj.score,
        totalMarks: resultObj.totalMarks,
        percentage: ((resultObj.score / resultObj.totalMarks) * 100).toFixed(2),
        timeTaken: resultObj.timeTaken,
        completedAt: resultObj.completedAt,
        isOfflineSubmission: resultObj.isOfflineSubmission,
        statistics: resultObj.statistics,
        questionAnalysis: resultObj.questionAnalysis,
        negativeMarkingInfo: resultObj.negativeMarkingInfo ? {
          negativeMarks: resultObj.negativeMarkingInfo.negativeMarks,
          ruleDescription: resultObj.negativeMarkingInfo.ruleDescription,
          ruleSource: resultObj.negativeMarkingInfo.ruleSource,
          ruleUsed: null, // College-specific rules no longer exist
          defaultRuleUsed: resultObj.negativeMarkingInfo.defaultRuleUsed ? {
            _id: resultObj.negativeMarkingInfo.defaultRuleUsed._id,
            negativeMarks: resultObj.negativeMarkingInfo.defaultRuleUsed.negativeMarks,
            description: resultObj.negativeMarkingInfo.defaultRuleUsed.description,
            stream: resultObj.negativeMarkingInfo.defaultRuleUsed.stream,
            standard: resultObj.negativeMarkingInfo.defaultRuleUsed.standard,
            subject: resultObj.negativeMarkingInfo.defaultRuleUsed.subject,
            examType: resultObj.negativeMarkingInfo.defaultRuleUsed.examType
          } : null
        } : null,
      };
    });

    return {
      success: true,
      message: "Results fetched successfully",
      results: cleanResults,
    };
  } catch (error) {
    console.error("Error fetching student exam results:", error);
    return {
      success: false,
      message: "Error fetching exam results",
    };
  }
}

export async function getAllExamAttempts(studentId, examId) {
  try {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(examId)) {
      return { success: false, message: "Invalid student ID or exam ID" };
    }
    const results = await ExamResult.find({ student: studentId, exam: examId })
      .sort({ completedAt: -1 })
      .lean();
    
    
    // Simple serialization without population for now
    const cleanResults = results.map((result, i) => {
      return {
        _id: result._id,
        score: result.score,
        totalMarks: result.totalMarks,
        percentage: ((result.score / result.totalMarks) * 100).toFixed(2),
        timeTaken: result.timeTaken,
        completedAt: result.completedAt,
        statistics: result.statistics,
        questionAnalysis: result.questionAnalysis,
        attemptNumber: result.attemptNumber,
        negativeMarkingInfo: result.negativeMarkingInfo ? {
          negativeMarks: result.negativeMarkingInfo.negativeMarks,
          ruleDescription: result.negativeMarkingInfo.ruleDescription,
          ruleSource: result.negativeMarkingInfo.ruleSource
        } : null
      };
    });
    
    return {
      success: true,
      attempts: cleanResults,
    };
  } catch (error) {
    console.error("getAllExamAttempts error:", error);
    return { success: false, message: "Error fetching attempts: " + error.message };
  }
}

export async function getEligibleExamsForStudent(studentId) {
  /**
   * getEligibleExamsForStudent(studentId)
   * Flow:
   * 1. Find all colleges where student is enrolled and approved
   * 2. Get all active exams from those colleges
   * 3. Check eligibility for each exam (stream, class, subject match)
   * 4. Return list of eligible exams with college information
   */
  try {
    await connectDB();

    // 1. Validate studentId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        message: "Invalid student ID",
      };
    }

    // 2. Find all enrollments for this student that are approved
    const enrollments = await EnrolledStudent.find({
      student: studentId,
      status: 'approved'
    }).populate('college');

    if (!enrollments || enrollments.length === 0) {
      return {
        success: true,
        message: "No college enrollments found",
        scheduledExams: [],
        practiceExams: [],
        totalExams: 0,
        enrollments: [],
      };
    }

    // 3. Get all college IDs where student is enrolled
    const collegeIds = enrollments.map(enrollment => enrollment.college._id);

    // 4. Find all exams from these colleges (include scheduled, completed, cancelled for scheduled availability)
    const allExams = await Exam.find({
      college: { $in: collegeIds },
      $or: [
        { examStatus: 'active', status: { $in: ['scheduled', 'completed', 'cancelled'] } },
        { examStatus: 'inactive', status: { $in: ['scheduled', 'completed', 'cancelled'] } }
      ]
    }).populate('college').populate('examQuestions');

    // 5. Check eligibility for each exam
    const eligibleExams = [];

    for (const exam of allExams) {
      // Find the enrollment for this exam's college
      const enrollment = enrollments.find(enr => 
        enr.college._id.toString() === exam.college._id.toString()
      );

      if (!enrollment) continue;

      // Check eligibility criteria
      const isStreamMatch = enrollment.allocatedStreams.includes(exam.stream);
      const isClassMatch = 
        enrollment.class === `${exam.standard}` ||
        enrollment.class === `${exam.standard}th`;

      // Check subject match - student should have all subjects required by the exam
      let isSubjectMatch = true;
      if (enrollment.allocatedSubjects && enrollment.allocatedSubjects.length > 0 && 
          exam.examSubject && exam.examSubject.length > 0) {
        // Check if all exam subjects are in student's allocated subjects
        isSubjectMatch = exam.examSubject.every(examSubject => 
          enrollment.allocatedSubjects.some(studentSubject => 
            // Case-insensitive comparison and handle variations
            studentSubject.toLowerCase() === examSubject.toLowerCase() ||
            // Handle common abbreviations
            (studentSubject.toLowerCase() === 'physics' && examSubject.toLowerCase() === 'phy') ||
            (studentSubject.toLowerCase() === 'phy' && examSubject.toLowerCase() === 'physics') ||
            (studentSubject.toLowerCase() === 'chemistry' && examSubject.toLowerCase() === 'chem') ||
            (studentSubject.toLowerCase() === 'chem' && examSubject.toLowerCase() === 'chemistry') ||
            (studentSubject.toLowerCase() === 'mathematics' && examSubject.toLowerCase() === 'math') ||
            (studentSubject.toLowerCase() === 'math' && examSubject.toLowerCase() === 'mathematics') ||
            (studentSubject.toLowerCase() === 'mathematics' && examSubject.toLowerCase() === 'maths') ||
            (studentSubject.toLowerCase() === 'maths' && examSubject.toLowerCase() === 'mathematics') ||
            (studentSubject.toLowerCase() === 'biology' && examSubject.toLowerCase() === 'bio') ||
            (studentSubject.toLowerCase() === 'bio' && examSubject.toLowerCase() === 'biology')
          )
        );
      }

      // Check if exam has questions
      const hasQuestions = exam.examQuestions && exam.examQuestions.length > 0;

      // Include exam if stream, class, and subjects match
      if (isStreamMatch && isClassMatch && isSubjectMatch) {
        // Check if student has already exhausted attempts
        const maxAttempts = exam.reattempt || 1;
        const previousAttempts = await ExamResult.countDocuments({ 
          exam: exam._id, 
          student: studentId 
        });

        const canAttempt = previousAttempts < maxAttempts && exam.examStatus === 'active' && hasQuestions;

        eligibleExams.push({
          _id: exam._id,
          examName: exam.examName,
          examInstructions: exam.examInstructions,
          examDurationMinutes: exam.examDurationMinutes,
          totalMarks: exam.totalMarks,
          stream: exam.stream,
          standard: exam.standard,
          examSubject: exam.examSubject,
          startTime: exam.startTime,
          endTime: exam.endTime,
          reattempt: exam.reattempt,
          questionCount: exam.examQuestions.length,
          examAvailability: exam.examAvailability, // Add exam type
          examStatus: exam.examStatus, // Add exam status
          status: exam.status, // Add exam lifecycle status
          college: {
            _id: exam.college._id,
            collegeName: exam.college.collegeName,
            collegeCode: exam.college.collegeCode,
            collegeLogo: exam.college.collegeLogo,
          },
          eligibility: {
            canAttempt,
            attemptsUsed: previousAttempts,
            maxAttempts,
            isStreamMatch,
            isClassMatch,
            isSubjectMatch,
            hasQuestions,
            isActive: exam.examStatus === 'active',
            studentSubjects: enrollment.allocatedSubjects || []
          }
        });
      }
    }

    // 6. Separate scheduled and practice exams
    const scheduledExams = eligibleExams.filter(exam => exam.examAvailability === 'scheduled');
    const practiceExams = eligibleExams.filter(exam => exam.examAvailability === 'practice');

    // Sort scheduled exams by start time (upcoming first)
    scheduledExams.sort((a, b) => {
      if (a.startTime && b.startTime) {
        return new Date(a.startTime) - new Date(b.startTime);
      }
      return 0;
    });

    // Sort practice exams by exam name
    practiceExams.sort((a, b) => a.examName.localeCompare(b.examName));

    return {
      success: true,
      message: `Found ${eligibleExams.length} eligible exams (${scheduledExams.length} scheduled, ${practiceExams.length} practice)`,
      scheduledExams,
      practiceExams,
      totalExams: eligibleExams.length,
      enrollments: enrollments.map(enr => ({
        college: {
          _id: enr.college._id,
          collegeName: enr.college.collegeName,
          collegeCode: enr.college.collegeCode,
          collegeLogo: enr.college.collegeLogo,
        },
        class: enr.class,
        allocatedStreams: enr.allocatedStreams,
        status: enr.status
      }))
    };

  } catch (error) {
    console.error("Error fetching eligible exams:", error);
    return {
      success: false,
      message: `Error fetching eligible exams: ${error.message}`,
    };
  }
}

// Clear exam cache - useful for refreshing exam data
export async function clearExamCacheData(examId) {
  try {
    // Clear server-side cache for this exam
    clearExamCache(examId);
    
    return {
      success: true,
      message: "Exam cache cleared successfully"
    };
  } catch (error) {
    console.error("Error clearing exam cache:", error);
    return {
      success: false,
      message: `Error clearing exam cache: ${error.message}`
    };
  }
}

export async function getStudentExamAnalytics(studentId) {
  /**
   * getStudentExamAnalytics(studentId)
   * Flow:
   * 1. Validate studentId 
   * 2. Check student's college enrollments
   * 3. Get all exam results for the student
   * 4. Process analytics data (subject-wise, time-based, comparative)
   * 5. Generate insights and recommendations
   * 6. Return comprehensive analytics data
   */
  try {
    await connectDB();

    // 1. Validate studentId
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return {
        success: false,
        message: "Invalid student ID",
      };
    }

    // 2. Find student and verify existence
    const student = await Student.findById(studentId).lean();
    if (!student) {
      return {
        success: false,
        message: "Student not found",
      };
    }

    // 3. Get student's college enrollments
    const enrollments = await EnrolledStudent.find({
      student: studentId,
      status: 'approved'
    }).populate({
      path: 'college',
      select: 'collegeName collegeCode collegeLogo collegeLocation'
    }).lean();

    if (!enrollments || enrollments.length === 0) {
      return {
        success: true,
        message: "No college enrollments found",
        analytics: {
          student: {
            _id: student._id,
            studentName: student.studentName || student.name,
            email: student.email
          },
          enrollments: [],
          examResults: [],
          overallStats: {
            totalExamsAttempted: 0,
            totalExamsAvailable: 0,
            averagePercentage: 0,
            bestPerformance: 0,
            worstPerformance: 0,
            totalTimeSpent: 0,
            completionRate: 0
          },
          subjectWiseStats: [],
          collegeWiseStats: [],
          performanceOverTime: [],
          insights: {
            strengths: [],
            improvements: [],
            recommendations: []
          }
        }
      };
    }

    // 4. Get college IDs for finding available exams
    const collegeIds = enrollments.map(enrollment => enrollment.college._id);

    // 5. Get all available exams from enrolled colleges
    const availableExams = await Exam.find({
      college: { $in: collegeIds },
      examStatus: 'active'
    }).select('_id examName stream standard examSubject college totalMarks examDurationMinutes').lean();

    // 6. Get all exam results for this student
    const examResults = await ExamResult.find({ 
      student: studentId 
    }).populate({
      path: 'exam',
      select: 'examName examSubject stream standard college totalMarks examDurationMinutes startTime endTime'
    }).populate({
      path: 'exam.college',
      select: 'collegeName collegeCode collegeLogo'
    }).sort({ completedAt: -1 }).lean();

    // 7. Process analytics data
    const analyticsData = await processStudentAnalyticsData(
      student,
      enrollments,
      examResults,
      availableExams
    );

    return {
      success: true,
      message: "Analytics data retrieved successfully",
      analytics: analyticsData
    };

  } catch (error) {
    console.error("Error fetching student exam analytics:", error);
    return {
      success: false,
      message: `Error fetching analytics: ${error.message}`,
    };
  }
}

// Helper function to process analytics data
async function processStudentAnalyticsData(student, enrollments, examResults, availableExams) {
  // Basic student info
  const studentInfo = {
    _id: student._id,
    studentName: student.studentName || student.name,
    email: student.email
  };

  // College info
  const collegeInfo = enrollments.map(enrollment => ({
    _id: enrollment.college._id,
    collegeName: enrollment.college.collegeName,
    collegeCode: enrollment.college.collegeCode,
    collegeLogo: enrollment.college.collegeLogo,
    collegeLocation: enrollment.college.collegeLocation,
    class: enrollment.class,
    allocatedStreams: enrollment.allocatedStreams,
    allocatedSubjects: enrollment.allocatedSubjects
  }));

  // Overall statistics
  const totalExamsAttempted = examResults.length;
  const totalExamsAvailable = availableExams.length;
  
  const percentages = examResults
    .filter(result => result.score !== null && result.totalMarks > 0)
    .map(result => (result.score / result.totalMarks) * 100);
  
  const averagePercentage = percentages.length > 0 
    ? percentages.reduce((a, b) => a + b, 0) / percentages.length 
    : 0;
  
  const bestPerformance = percentages.length > 0 ? Math.max(...percentages) : 0;
  const worstPerformance = percentages.length > 0 ? Math.min(...percentages) : 0;
  
  const totalTimeSpent = examResults.reduce((total, result) => total + (result.timeTaken || 0), 0);
  const completionRate = totalExamsAvailable > 0 ? (totalExamsAttempted / totalExamsAvailable) * 100 : 0;

  // Subject-wise performance
  const subjectWiseStats = {};
  examResults.forEach(result => {
    if (result.subjectPerformance && result.subjectPerformance.length > 0) {
      result.subjectPerformance.forEach(subj => {
        if (!subjectWiseStats[subj.subject]) {
          subjectWiseStats[subj.subject] = {
            subject: subj.subject,
            totalAttempts: 0,
            totalQuestions: 0,
            totalCorrect: 0,
            totalIncorrect: 0,
            totalUnanswered: 0,
            totalMarks: 0,
            totalPossibleMarks: 0,
            averageAccuracy: 0,
            bestPerformance: 0,
            worstPerformance: 100,
            trend: 'stable'
          };
        }

        const stats = subjectWiseStats[subj.subject];
        stats.totalAttempts++;
        stats.totalQuestions += subj.totalQuestions || 0;
        stats.totalCorrect += subj.correct || 0;
        stats.totalIncorrect += subj.incorrect || 0;
        stats.totalUnanswered += subj.unanswered || 0;
        stats.totalMarks += subj.marks || 0;
        stats.totalPossibleMarks += subj.totalMarks || 0;

        const subjectPercentage = subj.totalMarks > 0 ? (subj.marks / subj.totalMarks) * 100 : 0;
        stats.bestPerformance = Math.max(stats.bestPerformance, subjectPercentage);
        stats.worstPerformance = Math.min(stats.worstPerformance, subjectPercentage);
      });
    }
  });

  // Calculate averages for subject-wise stats
  Object.values(subjectWiseStats).forEach(stats => {
    stats.averageAccuracy = stats.totalQuestions > 0 
      ? (stats.totalCorrect / stats.totalQuestions) * 100 
      : 0;
    stats.averagePercentage = stats.totalPossibleMarks > 0 
      ? (stats.totalMarks / stats.totalPossibleMarks) * 100 
      : 0;
  });

  // College-wise performance
  const collegeWiseStats = {};
  examResults.forEach(result => {
    if (result.exam && result.exam.college) {
      const collegeId = result.exam.college._id || result.exam.college;
      const collegeName = result.exam.college.collegeName || 'Unknown College';
      
      if (!collegeWiseStats[collegeId]) {
        collegeWiseStats[collegeId] = {
          collegeId: collegeId,
          collegeName: collegeName,
          totalExamsAttempted: 0,
          totalMarks: 0,
          totalPossibleMarks: 0,
          averagePercentage: 0,
          bestPerformance: 0,
          worstPerformance: 100
        };
      }

      const stats = collegeWiseStats[collegeId];
      stats.totalExamsAttempted++;
      stats.totalMarks += result.score || 0;
      stats.totalPossibleMarks += result.totalMarks || 0;

      const examPercentage = result.totalMarks > 0 ? (result.score / result.totalMarks) * 100 : 0;
      stats.bestPerformance = Math.max(stats.bestPerformance, examPercentage);
      stats.worstPerformance = Math.min(stats.worstPerformance, examPercentage);
    }
  });

  // Calculate averages for college-wise stats
  Object.values(collegeWiseStats).forEach(stats => {
    stats.averagePercentage = stats.totalPossibleMarks > 0 
      ? (stats.totalMarks / stats.totalPossibleMarks) * 100 
      : 0;
  });

  // Performance over time (last 10 exams)
  const recentResults = examResults.slice(0, 10);
  const performanceOverTime = recentResults.reverse().map(result => ({
    examName: result.exam?.examName || 'Unknown Exam',
    examDate: result.completedAt,
    percentage: result.totalMarks > 0 ? (result.score / result.totalMarks) * 100 : 0,
    timeTaken: result.timeTaken || 0,
    stream: result.exam?.stream || 'Unknown',
    standard: result.exam?.standard || 'Unknown'
  }));

  // Generate insights and recommendations
  const insights = generateStudentInsights(
    percentages,
    Object.values(subjectWiseStats),
    performanceOverTime,
    totalExamsAttempted
  );

  return {
    student: studentInfo,
    enrollments: collegeInfo,
    examResults: examResults.slice(0, 20), // Limit to recent 20 results
    overallStats: {
      totalExamsAttempted,
      totalExamsAvailable,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      bestPerformance: Math.round(bestPerformance * 100) / 100,
      worstPerformance: Math.round(worstPerformance * 100) / 100,
      totalTimeSpent: Math.round(totalTimeSpent / 60), // Convert to minutes
      completionRate: Math.round(completionRate * 100) / 100
    },
    subjectWiseStats: Object.values(subjectWiseStats).map(stats => ({
      ...stats,
      averageAccuracy: Math.round(stats.averageAccuracy * 100) / 100,
      averagePercentage: Math.round(stats.averagePercentage * 100) / 100,
      bestPerformance: Math.round(stats.bestPerformance * 100) / 100,
      worstPerformance: Math.round(stats.worstPerformance * 100) / 100
    })),
    collegeWiseStats: Object.values(collegeWiseStats).map(stats => ({
      ...stats,
      averagePercentage: Math.round(stats.averagePercentage * 100) / 100,
      bestPerformance: Math.round(stats.bestPerformance * 100) / 100,
      worstPerformance: Math.round(stats.worstPerformance * 100) / 100
    })),
    performanceOverTime,
    insights
  };
}

// Helper function to generate insights and recommendations
function generateStudentInsights(percentages, subjectStats, performanceOverTime, totalExamsAttempted) {
  const insights = {
    strengths: [],
    improvements: [],
    recommendations: []
  };

  if (totalExamsAttempted === 0) {
    insights.recommendations.push("Start taking exams to build your performance analytics");
    return insights;
  }

  const averagePercentage = percentages.length > 0 
    ? percentages.reduce((a, b) => a + b, 0) / percentages.length 
    : 0;

  // Performance level insights
  if (averagePercentage >= 85) {
    insights.strengths.push("Excellent overall academic performance");
    insights.recommendations.push("Continue your excellent work and consider mentoring other students");
  } else if (averagePercentage >= 70) {
    insights.strengths.push("Good overall academic performance");
    insights.recommendations.push("Focus on weak subjects to reach excellence");
  } else if (averagePercentage >= 50) {
    insights.improvements.push("Average performance with room for improvement");
    insights.recommendations.push("Increase study time and focus on understanding concepts");
  } else {
    insights.improvements.push("Below average performance requires immediate attention");
    insights.recommendations.push("Seek help from teachers and create a structured study plan");
  }

  // Subject-wise insights - Safe reduce operations
  const bestSubject = safeReduce(
    subjectStats, 
    (best, current) => 
      safeParseNumber(current.averagePercentage, 0) > safeParseNumber(best.averagePercentage, 0) ? current : best, 
    subjectStats[0] || { subject: 'None', averagePercentage: 0 },
    { subject: 'None', averagePercentage: 0 }
  );

  const worstSubject = safeReduce(
    subjectStats,
    (worst, current) => 
      safeParseNumber(current.averagePercentage, 100) < safeParseNumber(worst.averagePercentage, 100) ? current : worst, 
    subjectStats[0] || { subject: 'None', averagePercentage: 100 },
    { subject: 'None', averagePercentage: 100 }
  );

  if (bestSubject && bestSubject.averagePercentage > 75) {
    insights.strengths.push(`Strong performance in ${bestSubject.subject}`);
  }

  if (worstSubject && worstSubject.averagePercentage < 60) {
    insights.improvements.push(`Need improvement in ${worstSubject.subject}`);
    insights.recommendations.push(`Allocate more study time to ${worstSubject.subject}`);
  }

  // Note: Time management insights removed as per-question timing data is not available

  // Trend analysis
  if (performanceOverTime.length >= 3) {
    const recentAvg = performanceOverTime.slice(-3).reduce((sum, exam) => sum + exam.percentage, 0) / 3;
    const earlierAvg = performanceOverTime.slice(0, 3).reduce((sum, exam) => sum + exam.percentage, 0) / 3;
    
    if (recentAvg > earlierAvg + 10) {
      insights.strengths.push("Shows improving trend in recent exams");
    } else if (recentAvg < earlierAvg - 10) {
      insights.improvements.push("Shows declining trend in recent exams");
      insights.recommendations.push("Review study methods and seek guidance to reverse the downward trend");
    }
  }

  // Consistency insights - Fixed variance calculation
  if (percentages.length > 2) {
    const standardDeviation = safeStandardDeviation(percentages, 0);
    
    if (standardDeviation < 10) {
      insights.strengths.push("Consistent performance across exams");
    } else if (standardDeviation > 20) {
      insights.improvements.push("Inconsistent performance across exams");
      insights.recommendations.push("Focus on building consistent study habits");
    }
  }

  return insights;
}
