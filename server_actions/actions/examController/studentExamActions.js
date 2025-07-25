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
import NegativeMarkingRule from "../../models/exam_portal/negativeMarkingRule";
import DefaultNegativeMarkingRule from "../../models/exam_portal/defaultNegativeMarkingRule";


// im getting error - Error: Maximum call stack size exceeded this has happened to me alot of times in this project and to solve it use JSON.parse(JSON.stringify(exam)) wherever needed
// or also use lean() 
// Helper function to get the appropriate negative marking rule for an exam
async function getNegativeMarkingRuleForExam(exam) {
  try {
    // Priority order: College-specific rule > College default > Super admin default > Exam's negativeMarks field
    
    // 1. Try to find college-specific rule (most specific first: subject > standard > stream)
    const collegeRules = await NegativeMarkingRule.find({
      college: exam.college,
      stream: exam.stream,
      isActive: true
    }).sort({ priority: -1 });

    // Find the most specific matching rule
    for (const rule of collegeRules) {
      // Check for exact match with subject and standard
      if (rule.subject && rule.standard) {
        if (exam.examSubject.includes(rule.subject) && rule.standard === exam.standard) {
          return {
            source: "college_specific",
            negativeMarks: rule.negativeMarks,
            description: rule.description || `College rule: ${rule.stream} > ${rule.standard}th > ${rule.subject}`,
            ruleId: rule._id
          };
        }
      }
      // Check for standard-specific rule (no subject)
      else if (!rule.subject && rule.standard) {
        if (rule.standard === exam.standard) {
          return {
            source: "college_specific",
            negativeMarks: rule.negativeMarks,
            description: rule.description || `College rule: ${rule.stream} > ${rule.standard}th`,
            ruleId: rule._id
          };
        }
      }
      // Check for stream-wide rule (no subject or standard)
      else if (!rule.subject && !rule.standard) {
        return {
          source: "college_specific",
          negativeMarks: rule.negativeMarks,
          description: rule.description || `College rule: ${rule.stream}`,
          ruleId: rule._id
        };
      }
    }

    // 2. Try to find super admin default rule
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
          description: rule.description || `Default rule: ${rule.stream}`,
          defaultRuleId: rule._id
        };
      }
    }

    // 3. Fallback to exam's negativeMarks field
    return {
      source: "exam_specific",
      negativeMarks: exam.negativeMarks || 0,
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
      description: "Fallback to exam setting",
      ruleId: null,
      defaultRuleId: null
    };
  }
}

export async function checkExamEligibility(details) {
  /**
   * checkExamEligibility(details)
   * Flow:
   * 1. Validate examId and studentId
   * 2. Fetch the exam and check if it exists
   * 3. Check if the exam is active (status: 'active' or 'scheduled')
   * 4. Fetch the student's enrollment in the college
   * 5. Check if the student is enrolled, allocated the subject, and in the correct class
   * 6. Return eligibility result
   */
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

    // 2. Fetch the exam and check if it exists
    const exam = await Exam.findById(details.examId)
      .populate("college")
      .populate("examQuestions")
      .lean();
    
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
    });

    // 5. Check if the student is enrolled by checking the allocated stream and class
    // console.log(exam)
    // console.log(enrolledStudent)
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

    // 6. Return eligibility result
    return {
      success: true,
      message: "You are eligible to give this exam",
      exam: exam,
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
   * submitExamResult(examData)
   * Flow:
   * 1. Validate exam data
   * 2. Check attempt limit for this student and exam
   * 3. Calculate final score with negative marking
   * 4. Store new exam result (do not overwrite)
   * 5. Update exam statistics
   * 6. Return submission result
   */
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
      isOfflineSubmission = false
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

    // 3. Get negative marking rule for this exam
    const negativeMarkingRule = await getNegativeMarkingRuleForExam(exam);

    // 4. Calculate detailed score with negative marking
    let finalScore = 0;
    let correctAnswersCount = 0;
    let incorrectAnswers = 0;
    let unattempted = 0;
    const questionAnalysis = [];

    exam.examQuestions.forEach((question) => {
      const userAnswer = answers[question._id];
      const questionMarks = question.marks || 4;
      const negativeMarks = negativeMarkingRule.negativeMarks;

      if (!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0)) {
        unattempted++;
        const correctAnswer = question.isMultipleAnswer ? question.multipleAnswer : question.answer;
        questionAnalysis.push({
          questionId: question._id,
          status: "unattempted",
          marks: 0,
          userAnswer: null,
          correctAnswer: correctAnswer,
        });
      } else if (question.isMultipleAnswer) {
        const questionCorrectAnswers = question.multipleAnswer || [];
        const normalizedUserAnswer = normalizeAnswer(userAnswer, question);
        const normalizedCorrectAnswers = normalizeAnswer(questionCorrectAnswers, question);
        const isCorrect = Array.isArray(normalizedUserAnswer) &&
          normalizedUserAnswer.length === normalizedCorrectAnswers.length &&
          normalizedUserAnswer.every((ans) => normalizedCorrectAnswers.includes(ans));
        if (isCorrect) {
          finalScore += questionMarks;
          correctAnswersCount++;
          questionAnalysis.push({
            questionId: question._id,
            status: "correct",
            marks: questionMarks,
            userAnswer: normalizedUserAnswer,
            correctAnswer: normalizedCorrectAnswers,
          });
        } else {
          finalScore -= negativeMarks;
          incorrectAnswers++;
          questionAnalysis.push({
            questionId: question._id,
            status: "incorrect",
            marks: -negativeMarks,
            userAnswer: normalizedUserAnswer,
            correctAnswer: normalizedCorrectAnswers,
          });
        }
      } else {
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
          });
        }
      }
    });

    // 5. Create new exam result (do not overwrite)
    const examResult = new ExamResult({
      exam: examId,
      student: studentId,
      attemptNumber: previousAttempts + 1,
      answers,
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
      },
      negativeMarkingInfo: {
        ruleUsed: negativeMarkingRule.ruleId,
        defaultRuleUsed: negativeMarkingRule.defaultRuleId,
        negativeMarks: negativeMarkingRule.negativeMarks,
        ruleDescription: negativeMarkingRule.description,
        ruleSource: negativeMarkingRule.source
      },
    });
    await examResult.save();
    // 6. Update exam with result
    exam.examResults.push(examResult._id);
    await exam.save();

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
          negativeMarks: negativeMarkingRule.negativeMarks,
          description: negativeMarkingRule.description,
          source: negativeMarkingRule.source
        },
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
      path: "negativeMarkingInfo.ruleUsed",
      select: "negativeMarks description stream standard subject college isActive"
    }).populate({
      path: "negativeMarkingInfo.defaultRuleUsed", 
      select: "negativeMarks description stream standard subject examType isActive"  
    });

    if (!result) {
      return {
        success: false,
        message: "No result found for this exam",
      };
    }

    // Properly serialize result to avoid circular references
    const resultObj = result.toObject();
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
        ruleUsed: resultObj.negativeMarkingInfo.ruleUsed ? {
          _id: resultObj.negativeMarkingInfo.ruleUsed._id,
          negativeMarks: resultObj.negativeMarkingInfo.ruleUsed.negativeMarks,
          description: resultObj.negativeMarkingInfo.ruleUsed.description,
          stream: resultObj.negativeMarkingInfo.ruleUsed.stream,
          standard: resultObj.negativeMarkingInfo.ruleUsed.standard,
          subject: resultObj.negativeMarkingInfo.ruleUsed.subject
        } : null,
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
        path: "negativeMarkingInfo.ruleUsed",
        select: "negativeMarks description stream standard subject college isActive"
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
          ruleUsed: resultObj.negativeMarkingInfo.ruleUsed ? {
            _id: resultObj.negativeMarkingInfo.ruleUsed._id,
            negativeMarks: resultObj.negativeMarkingInfo.ruleUsed.negativeMarks,
            description: resultObj.negativeMarkingInfo.ruleUsed.description,
            stream: resultObj.negativeMarkingInfo.ruleUsed.stream,
            standard: resultObj.negativeMarkingInfo.ruleUsed.standard,
            subject: resultObj.negativeMarkingInfo.ruleUsed.subject
          } : null,
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
    console.log("getAllExamAttempts called with:", { studentId, examId });
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(studentId) || !mongoose.Types.ObjectId.isValid(examId)) {
      console.log("Invalid IDs provided");
      return { success: false, message: "Invalid student ID or exam ID" };
    }
    const results = await ExamResult.find({ student: studentId, exam: examId })
      .sort({ completedAt: -1 })
      .lean();
    
    console.log("Found", results.length, "results from database");
    
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
    
    console.log("Returning", cleanResults.length, "clean results");
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
