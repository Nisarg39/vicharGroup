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

// Enhanced helper function to get negative marking rule for a specific question type
async function getNegativeMarkingRuleForQuestion(exam, question) {
  try {
    // Determine question type
    let questionType = 'MCQ'; // Default
    if (question.userInputAnswer) {
      questionType = 'Numerical';
    } else if (question.isMultipleAnswer) {
      questionType = 'MCMA';
    }

    // Priority order for rule matching:
    // 1. Question type + Subject + Standard specific
    // 2. Question type + Subject specific
    // 3. Question type + Standard specific  
    // 4. Question type specific
    // 5. Subject + Standard specific
    // 6. Subject specific
    // 7. Standard specific
    // 8. Stream-wide rule
    // 9. Exam's negativeMarks field

    const defaultRules = await DefaultNegativeMarkingRule.find({
      stream: exam.stream,
      isActive: true
    }).sort({ priority: -1 });

    // Get question's subject if available
    const questionSubject = question.subject;

    for (const rule of defaultRules) {
      // 1. Question type + Subject + Standard specific (highest priority)
      if (rule.questionType === questionType && rule.subject && rule.standard) {
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
      // 2. Question type + Subject specific
      else if (rule.questionType === questionType && rule.subject && !rule.standard) {
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
      // 3. Question type + Standard specific
      else if (rule.questionType === questionType && !rule.subject && rule.standard) {
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
      // 4. Question type specific (stream-wide)
      else if (rule.questionType === questionType && !rule.subject && !rule.standard) {
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
      // 5. Subject + Standard specific (no question type)
      else if (!rule.questionType && rule.subject && rule.standard) {
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
      // 6. Subject specific (no question type)
      else if (!rule.questionType && rule.subject && !rule.standard) {
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
      // 7. Standard specific (no question type, no subject)
      else if (!rule.questionType && !rule.subject && rule.standard) {
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
      // 8. Stream-wide rule (no question type, no subject, no standard)
      else if (!rule.questionType && !rule.subject && !rule.standard) {
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

    // 9. Fallback to exam's negativeMarks field
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
    
    // Add marking rules to exam object for Instructions component
    const examWithMarkingRules = {
      ...exam,
      markingRulePreview: {
        positiveMarks: previewMarkingRules.positiveMarks,
        negativeMarks: previewMarkingRules.negativeMarks,
        ruleDescription: previewMarkingRules.description,
        ruleSource: previewMarkingRules.source,
        hasMarkingRules: true
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
      markedQuestions = []
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
      const negativeMarks = questionNegativeMarkingRule.negativeMarks;
      
      // Get admin-configured positive marks (fallback to question.marks or 4)
      const adminPositiveMarks = questionNegativeMarkingRule.positiveMarks || questionMarks || 4;

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
          marksAwarded = -negativeMarks; // Use admin-configured negative marking
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
          finalScore += questionMarks;
          correctAnswersCount++;
          questionAnalysis.push({
            questionId: question._id,
            status: "correct",
            marks: questionMarks,
            userAnswer: normalizedUserAnswer,
            correctAnswer: normalizedCorrectAnswer,
            negativeMarkingRule: questionNegativeMarkingRule.description,
          });
        } else {
          finalScore -= negativeMarks;
          incorrectAnswers++;
          questionAnalysis.push({
            questionId: question._id,
            status: "incorrect",
            marks: -negativeMarks,
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
    
    exam.examQuestions.forEach((question, index) => {
      const subject = question.subject || 'Unknown';
      const questionResult = questionAnalysis[index];
      
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
          timeSpent: 0,
          accuracy: 0
        };
      }
      
      const subjectStats = subjectPerformance[subject];
      subjectStats.totalQuestions++;
      subjectStats.totalMarks += question.marks || 4;
      
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
    });
    
    // Calculate accuracy and percentage for each subject
    Object.values(subjectPerformance).forEach(subject => {
      subject.accuracy = subject.attempted > 0 ? 
        Math.round((subject.correct / subject.attempted) * 100 * 100) / 100 : 0;
      subject.percentage = subject.totalMarks > 0 ? 
        Math.round((subject.marks / subject.totalMarks) * 100 * 100) / 100 : 0;
    });

    // 6. Create new exam result (do not overwrite)
    const examResult = new ExamResult({
      exam: examId,
      student: studentId,
      attemptNumber: previousAttempts + 1,
      answers,
      visitedQuestions,
      markedQuestions,
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
    // console.log("getAllExamAttempts called with:", { studentId, examId });
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(examId)) {
      console.log("Invalid IDs provided");
      return { success: false, message: "Invalid student ID or exam ID" };
    }
    const results = await ExamResult.find({ student: studentId, exam: examId })
      .sort({ completedAt: -1 })
      .lean();
    
    // console.log("Found", results.length, "results from database");
    
    // Simple serialization without population for now
    const cleanResults = results.map((result, i) => {
      console.log(`Processing result ${i + 1}:`, result._id);
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
    
    // console.log("Returning", cleanResults.length, "clean results");
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

      // Check if exam has questions
      const hasQuestions = exam.examQuestions && exam.examQuestions.length > 0;

      // Include exam if stream and class match (regardless of questions for inactive exams)
      if (isStreamMatch && isClassMatch) {
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
            hasQuestions,
            isActive: exam.examStatus === 'active'
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
