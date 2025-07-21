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
      .populate("examQuestions");
    
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

    // 5. Check if the student is enrolled, allocated the subject, and in the correct class
    
    const isSubjectAllocated =
      Array.isArray(enrolledStudent?.allocatedSubjects) &&
      (Array.isArray(exam.examSubject)
        ? exam.examSubject.some((subject) =>
            enrolledStudent.allocatedSubjects.includes(subject)
          )
        : enrolledStudent.allocatedSubjects.includes(exam.examSubject));
    const isClassMatch = enrolledStudent?.class === `${exam.standard}th`;
    const isEnrolled =
      enrolledStudent &&
      isSubjectAllocated &&
      isClassMatch &&
      enrolledStudent.allocatedSubjects.length > 0;

    if (!isEnrolled) {
      return {
        success: false,
        message: "You are not enrolled in this exam",
      };
    }

    // 6. Return eligibility result
    
    try {
      const examData = JSON.parse(JSON.stringify(exam));
      return {
        success: true,
        message: "You are eligible to give this exam",
        exam: examData,
      };
    } catch (jsonError) {
      console.error("Error serializing exam data:", jsonError);
      return {
        success: false,
        message: "Error processing exam data",
      };
    }
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

    // 3. Calculate detailed score with negative marking
    let finalScore = 0;
    let correctAnswersCount = 0;
    let incorrectAnswers = 0;
    let unattempted = 0;
    const questionAnalysis = [];

    exam.examQuestions.forEach((question) => {
      const userAnswer = answers[question._id];
      const questionMarks = question.marks || 4;
      const negativeMarks = exam.negativeMarks || 0;

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

    // 4. Create new exam result (do not overwrite)
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
    });
    await examResult.save();
    // 5. Update exam with result
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
    });

    if (!result) {
      return {
        success: false,
        message: "No result found for this exam",
      };
    }

    // Use JSON.parse(JSON.stringify()) to break circular references
    const cleanResult = JSON.parse(JSON.stringify({
      _id: result._id,
      exam: result.exam,
      examName: result.exam.examName,
      examSubject: result.exam.examSubject,
      stream: result.exam.stream,
      standard: result.exam.standard,
      score: result.score,
      totalMarks: result.totalMarks,
      percentage: ((result.score / result.totalMarks) * 100).toFixed(2),
      timeTaken: result.timeTaken,
      completedAt: result.completedAt,
      isOfflineSubmission: result.isOfflineSubmission,
      statistics: result.statistics,
      questionAnalysis: result.questionAnalysis,
    }));

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
      .sort({ completedAt: -1 });

    // Use JSON.parse(JSON.stringify()) to break circular references
    const cleanResults = JSON.parse(JSON.stringify(results.map((result) => ({
      _id: result._id,
      exam: result.exam,
      examName: result.exam.examName,
      examSubject: result.exam.examSubject,
      stream: result.exam.stream,
      standard: result.exam.standard,
      score: result.score,
      totalMarks: result.totalMarks,
      percentage: ((result.score / result.totalMarks) * 100).toFixed(2),
      timeTaken: result.timeTaken,
      completedAt: result.completedAt,
      isOfflineSubmission: result.isOfflineSubmission,
      statistics: result.statistics,
      questionAnalysis: result.questionAnalysis,
    }))));

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
      .sort({ completedAt: -1 });
    // Break circular references
    const cleanResults = JSON.parse(JSON.stringify(results));
    return {
      success: true,
      attempts: cleanResults.map(result => ({
        _id: result._id,
        score: result.score,
        totalMarks: result.totalMarks,
        percentage: ((result.score / result.totalMarks) * 100).toFixed(2),
        timeTaken: result.timeTaken,
        completedAt: result.completedAt,
        statistics: result.statistics,
        questionAnalysis: result.questionAnalysis,
      })),
    };
  } catch (error) {
    return { success: false, message: "Error fetching attempts" };
  }
}
