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
    console.log(details)
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
            examSubject: [examData.subject],
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
        if (filters.topic) query.topic = filters.topic
        if (filters.difficultyLevel) query.difficultyLevel = filters.difficultyLevel

        // Calculate skip value for pagination
        const skip = (page - 1) * limit

        // Get total count for pagination
        const totalExams = await Exam.countDocuments(query)
        
        // Fetch paginated results
        const exams = await Exam.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })

        return {
            success: true,
            message: "Exams fetched successfully",
            data: {
                exams,
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