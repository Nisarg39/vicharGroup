"use server"
import { connectDB } from "../../config/mongoose"
import College from "../../models/exam_portal/college"
import TeacherExam from "../../models/exam_portal/teacherExam"
import Exam from "../../models/exam_portal/exam"
import master_mcq_question from "../../models/exam_portal/master_mcq_question"
import jwt from "jsonwebtoken"
import { collegeAuth } from "../../middleware/collegeAuth"
export async function collegeSignIn(details) {
    try {
        await connectDB()
        const college = await College.findOne({ collegeEmail: details.email })
        if (!college) {
            return {
                success: false,
                message: "College not found"
            }
        }
        if (college.password !== details.password) {
            return {
                success: false,
                message: "Incorrect password"
            }
        }
        const token = jwt.sign({ id: college._id }, process.env.JWT_SECRET, { expiresIn: "30d" })
        college.token = token
        await college.save()
        return {
            success: true,
            message: "College signed in successfully",
            college: college
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

export async function collegeDetails(details) {
    try {
        const college = await collegeAuth(details)
        if (!college) {
            return {
                success: false,
                message: "College not authenticated"
            }
        }
        return {
            success: true,
            message: "College details",
            college: college
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

export async function createExam(examData, collegeId) {
    try {
        await connectDB()
        
        // Create a plain object for the exam
        const examDoc = {
            ...examData,
            startTime: examData.examAvailability === 'scheduled' ? examData.startTime : null,
            endTime: examData.examAvailability === 'scheduled' ? examData.endTime : null,
            examSubject: examData.examSubject || [],
            section: examData.stream === 'JEE' ? examData.section : null,
            status: 'draft',
            college: collegeId
        }
        
        const exam = await Exam.create(examDoc)
        
        return {
            success: true,
            message: "Exam created successfully",
            exam: {
                _id: exam._id,
                examName: exam.examName,
                status: exam.status
            }
        }
    } catch (error) {
        console.error("Exam creation error:", error)
        return {
            success: false,
            message: "Failed to create exam"
        }
    }
}

export async function showExamList(collegeId, page = 1, limit = 10, filters = {}) {
    try {
        await connectDB()
        
        // Build query based on filters
        const query = { college: collegeId }
        if (filters.stream) query.stream = filters.stream
        if (filters.subject) query.examSubject = filters.subject
        if (filters.standard) query.standard = filters.standard
        if (filters.examAvailability) query.examAvailability = filters.examAvailability

        // Add sorting based on sortBy filter
        let sortOptions = { createdAt: -1 } // Default sort by creation date

        if (filters.sortBy) {
            switch (filters.sortBy) {
                case 'recent':
                    sortOptions = { createdAt: -1 }
                    break
                case 'upcoming':
                    query.startTime = { $gt: new Date() }
                    sortOptions = { startTime: 1 }
                    break
                case 'updated':
                    sortOptions = { updatedAt: -1 }
                    break
            }
        }

        const skip = (page - 1) * limit
        const totalExams = await Exam.countDocuments(query)
        
        const exams = await Exam.find(query)
            .skip(skip)
            .limit(limit)
            .sort(sortOptions)
            .lean()

        const serializedExams = exams.map(exam => ({
            ...exam,
            _id: exam._id.toString(),
            college: exam.college.toString()
        }))

        return {
            success: true,
            message: "Exams fetched successfully",
            data: {
                exams: serializedExams,
                pagination: {
                    total: totalExams,
                    page: page,
                    limit: limit,
                    totalPages: Math.ceil(totalExams / limit)
                }
            }
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

export async function fetchQuestionsForExam(filters = {}) {
    try {
        await connectDB()
        
        // Build query based on filters
        const query = {}
        if (filters.stream) query.stream = filters.stream
        if (filters.subject) query.subject = filters.subject
        if (filters.standard) query.standard = filters.standard
        if (filters.topic) query.topic = filters.topic
        if (filters.difficultyLevel) query.difficultyLevel = filters.difficultyLevel
        if (filters.section) query.section = filters.section
        if (filters.marks) query.marks = parseInt(filters.marks)
        if (filters.questionType) {
            switch (filters.questionType) {
                case 'MCSA':
                    query.$and = [
                        { isMultipleAnswer: { $ne: true } },
                        { userInputAnswer: { $ne: true } }
                    ];
                    break;
                case 'MCMA':
                    query.isMultipleAnswer = true;
                    break;
                case 'numerical':
                    query.userInputAnswer = true;
                    break;
            }
        }

        // Get filtered questions with pagination
        const questions = await master_mcq_question.find(query)
            .sort({ questionNumber: 1 })
            .skip((filters.page - 1) * filters.limit)
            .limit(filters.limit)
            .lean()

        const totalCount = await master_mcq_question.countDocuments(query)

        return {
            success: true,
            questions: questions.map(q => ({
                ...q,
                _id: q._id.toString()
            })),
            pagination: {
                currentPage: filters.page,
                totalPages: Math.ceil(totalCount / filters.limit),
                totalQuestions: totalCount,
                questionsPerPage: filters.limit
            }
        }
    } catch (error) {
        console.error("Error fetching questions:", error)
        return {
            success: false,
            message: "Error fetching questions"
        }
    }
}

export async function assignQuestionsToExam(examId, questionIds) {
    try {
        await connectDB()
        
        // Update the exam with the selected questions
        const exam = await Exam.findByIdAndUpdate(
            examId,
            { 
                examQuestions: questionIds,
                // Update total marks based on selected questions
                totalMarks: questionIds.length * 4 // Assuming 4 marks per question
            },
            { new: true }
        )
        
        if (!exam) {
            return {
                success: false,
                message: "Exam not found"
            }
        }

        // Update the usedInExamsCount for each question
        await master_mcq_question.updateMany(
            { _id: { $in: questionIds } },
            { $inc: { usedInExamsCount: 1 } }
        )

        return {
            success: true,
            message: `${questionIds.length} questions assigned successfully`,
            exam: exam
        }
    } catch (error) {
        console.error("Error assigning questions:", error)
        return {
            success: false,
            message: "Error assigning questions to exam"
        }
    }
}

export async function getExamQuestions(examId) {
    try {
        await connectDB()
        
        const exam = await Exam.findById(examId)
            .populate('examQuestions')
            .lean()
        
        if (!exam) {
            return {
                success: false,
                message: "Exam not found"
            }
        }

        // Convert ObjectIds to strings for client-side compatibility
        const serializedExam = {
            ...exam,
            _id: exam._id.toString(),
            college: exam.college.toString()
        };

        const serializedQuestions = (exam.examQuestions || []).map(q => ({
            ...q,
            _id: q._id.toString()
        }));

        return {
            success: true,
            exam: serializedExam,
            assignedQuestions: serializedQuestions
        }
    } catch (error) {
        console.error("Error fetching exam questions:", error)
        return {
            success: false,
            message: "Error fetching exam questions"
        }
    }
}