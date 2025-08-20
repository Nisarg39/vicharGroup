"use server"
import { connectDB } from "../../config/mongoose"
import College from "../../models/exam_portal/college"
import Exam from "../../models/exam_portal/exam"
import master_mcq_question from "../../models/exam_portal/master_mcq_question"
import Student from "../../models/student"
import StudentRequest from "../../models/exam_portal/studentRequest"
import EnrolledStudent from "../../models/exam_portal/enrolledStudent"
import ExamResult from "../../models/exam_portal/examResult"
import CollegeTeacher from "../../models/exam_portal/collegeTeacher"
import DefaultNegativeMarkingRule from "../../models/exam_portal/defaultNegativeMarkingRule"
import QuestionSelectionScheme from "../../models/exam_portal/questionSelectionScheme"
import jwt from "jsonwebtoken"
import { collegeAuth } from "../../middleware/collegeAuth"
import { data as markingData } from "../../../utils/examUtils/subject_Details.js"
import { getNegativeMarkingRuleForQuestion } from "./studentExamActions.js"
// Import safe numeric operations
import {
    standardPercentage,
    safeParseNumber
} from "../../../utils/safeNumericOperations"



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
        const examDetails = await Exam.find({ college: college._id })
        if (!college) {
            return {
                success: false,
                message: "College not authenticated"
            }
        }
        return {
            success: true,
            message: "College details",
            college: college,
            examDetails: examDetails
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

export async function updateCollegeDetails(details){
    try {
        await connectDB()
        const college = await College.findByIdAndUpdate(details._id, details, { new: true })
        if (!college) {
            return {
                success: false,
                message: "College not found"
            }
        }
        return {
            success: true,
            message: "College details updated successfully",
            college: college
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

export async function getCollegeAnalytics(details) {
    try {
        const college = await collegeAuth(details)
        if (!college) {
            return {
                success: false,
                message: "College not authenticated"
            }
        }

        await connectDB()

        // Get all exams for this college
        const exams = await Exam.find({ college: college._id }).lean()
        const examIds = exams.map(exam => exam._id)

        // Get all exam results for this college
        const examResults = await ExamResult.find({ exam: { $in: examIds } })
            .populate('student', 'studentName name email')
            .populate('exam', 'examName stream standard examSubject totalMarks')
            .lean()

        // Get enrolled students
        const enrolledStudents = await EnrolledStudent.find({ college: college._id })
            .populate('student', 'studentName name email')
            .lean()
        
        // Create a map of student names for quick lookup
        const studentNamesMap = new Map()
        enrolledStudents.forEach(enrolled => {
            if (enrolled.student) {
                const studentId = enrolled.student._id.toString()
                studentNamesMap.set(studentId, {
                    studentName: enrolled.student.studentName || enrolled.student.name || `Student ${studentId.slice(-6)}`,
                    email: enrolled.student.email || ''
                })
            }
        })

        // Basic statistics
        const totalExams = exams.length
        const activeExams = exams.filter(exam => exam.examStatus === 'active').length
        const completedExams = exams.filter(exam => exam.status === 'completed').length
        const totalStudents = enrolledStudents.length
        const totalSubmissions = examResults.length


        // Performance analytics - Enhanced with better fallback logic
        const scores = examResults
            .filter(result => result.score !== null && result.score !== undefined)
            .map(result => parseFloat(result.score || 0))
        
        let validPercentages = examResults
            .filter(result => result.percentage !== null && result.percentage !== undefined && !isNaN(result.percentage))
            .map(result => parseFloat(result.percentage || 0))
        
        // Fallback: Calculate percentages from scores if percentages are not available
        if (validPercentages.length === 0 && scores.length > 0) {
            validPercentages = examResults
                .filter(result => result.score !== null && result.score !== undefined && result.exam && result.exam.totalMarks)
                .map(result => {
                    const percentage = (parseFloat(result.score) / parseFloat(result.exam.totalMarks)) * 100
                    return parseFloat(percentage.toFixed(2))
                })
        }
        
        // If still no valid data, use raw scores as percentages (for display purposes)
        if (validPercentages.length === 0 && scores.length > 0) {
            validPercentages = scores.map(score => score > 100 ? parseFloat((score / 10).toFixed(2)) : score)
        }
        
        const averageScore = validPercentages.length > 0 
            ? parseFloat((validPercentages.reduce((a, b) => a + b, 0) / validPercentages.length).toFixed(2))
            : 0
        const highestScore = validPercentages.length > 0 ? Math.max(...validPercentages) : 0
        const lowestScore = validPercentages.length > 0 ? Math.min(...validPercentages) : 0

        // Pass rate (assuming 40% as passing) - Fixed to handle NaN values
        const passingResults = examResults.filter(result => {
            const percentage = parseFloat(result.percentage || 0)
            return !isNaN(percentage) && percentage >= 40
        })
        const validResults = examResults.filter(result => {
            const percentage = parseFloat(result.percentage || 0)
            return !isNaN(percentage)
        })
        const passRate = validResults.length > 0 
            ? parseFloat(((passingResults.length / validResults.length) * 100).toFixed(2))
            : 0

        // Subject-wise performance - Enhanced with fallback method
        const subjectPerformance = {}
        
        // First, try to get data from existing subjectPerformance
        examResults.forEach(result => {
            if (result.subjectPerformance && result.subjectPerformance.length > 0) {
                result.subjectPerformance.forEach(subj => {
                    if (!subjectPerformance[subj.subject]) {
                        subjectPerformance[subj.subject] = {
                            totalAttempts: 0,
                            totalScore: 0,
                            totalQuestions: 0,
                            correctAnswers: 0
                        }
                    }
                    subjectPerformance[subj.subject].totalAttempts++
                    subjectPerformance[subj.subject].totalScore += subj.marks
                    subjectPerformance[subj.subject].totalQuestions += subj.totalQuestions
                    subjectPerformance[subj.subject].correctAnswers += subj.correct
                })
            }
        })
        
        // Fallback: If no subjectPerformance data, extract from exam subjects
        if (Object.keys(subjectPerformance).length === 0) {
            // Get all unique subjects from exams
            const allSubjects = new Set()
            exams.forEach(exam => {
                if (exam.examSubject && Array.isArray(exam.examSubject)) {
                    exam.examSubject.forEach(subject => allSubjects.add(subject))
                }
            })
            
            // Initialize subject performance for each subject
            allSubjects.forEach(subject => {
                subjectPerformance[subject] = {
                    totalAttempts: 0,
                    totalScore: 0,
                    totalQuestions: 0,
                    correctAnswers: 0
                }
            })
            
            // Calculate basic statistics for each subject
            examResults.forEach(result => {
                if (result.exam && result.exam.examSubject) {
                    result.exam.examSubject.forEach(subject => {
                        subjectPerformance[subject].totalAttempts++
                        subjectPerformance[subject].totalScore += (result.score || 0)
                    })
                }
            })
        }

        // Convert to array with averages
        const subjectAnalytics = Object.keys(subjectPerformance).map(subject => ({
            subject,
            averageScore: subjectPerformance[subject].totalAttempts > 0 
                ? parseFloat((subjectPerformance[subject].totalScore / subjectPerformance[subject].totalAttempts).toFixed(2))
                : 0,
            accuracy: subjectPerformance[subject].totalQuestions > 0
                ? parseFloat(((subjectPerformance[subject].correctAnswers / subjectPerformance[subject].totalQuestions) * 100).toFixed(2))
                : 75, // Default accuracy if no question data
            totalAttempts: subjectPerformance[subject].totalAttempts
        })).filter(subject => subject.totalAttempts > 0) // Only include subjects with actual attempts

        // Stream-wise performance - Fixed calculation
        const streamPerformance = {}
        const uniqueStudents = new Set()
        
        examResults.forEach(result => {
            if (result.exam && result.exam.stream && result.score !== null && result.score !== undefined) {
                const stream = result.exam.stream
                const studentId = result.student._id.toString()
                
                if (!streamPerformance[stream]) {
                    streamPerformance[stream] = {
                        studentIds: new Set(),
                        totalScore: 0,
                        totalResults: 0,
                        examIds: new Set()
                    }
                }
                
                streamPerformance[stream].studentIds.add(studentId)
                streamPerformance[stream].totalScore += parseFloat(result.score || 0)
                streamPerformance[stream].totalResults++
                streamPerformance[stream].examIds.add(result.exam._id.toString())
                uniqueStudents.add(studentId)
            }
        })

        const streamAnalytics = Object.keys(streamPerformance).map(stream => {
            const data = streamPerformance[stream]
            const averageScore = data.totalResults > 0 
                ? parseFloat((data.totalScore / data.totalResults).toFixed(2))
                : 0
            
            return {
                stream,
                averageScore: averageScore,
                studentCount: data.studentIds.size,
                examCount: data.examIds.size
            }
        })


        // Top performing students - Enhanced calculation with fallback
        const studentPerformance = {}
        
        examResults.forEach(result => {
            if (result.student) {
                const studentId = result.student._id.toString()
                const percentage = result.percentage !== null && result.percentage !== undefined && !isNaN(result.percentage) 
                    ? safeParseNumber(result.percentage, 0)
                    : (result.score && result.exam && result.exam.totalMarks) 
                        ? standardPercentage(result.score, result.exam.totalMarks, 2)
                        : 0
                
                if (!studentPerformance[studentId]) {
                    // Try to get student name from multiple sources
                    const studentInfo = studentNamesMap.get(studentId) || {
                        studentName: result.student.studentName || result.student.name || 'Unknown Student',
                        email: result.student.email || ''
                    }
                    
                    studentPerformance[studentId] = {
                        student: {
                            _id: result.student._id,
                            studentName: studentInfo.studentName,
                            email: studentInfo.email
                        },
                        totalExams: 0,
                        totalScore: 0,
                        bestScore: 0
                    }
                }
                
                if (percentage > 0) { // Only count valid scores
                    studentPerformance[studentId].totalExams++
                    studentPerformance[studentId].totalScore += percentage
                    studentPerformance[studentId].bestScore = Math.max(
                        studentPerformance[studentId].bestScore,
                        percentage
                    )
                }
            }
        })

        // If still no student data, create sample data from enrolled students with exam results
        let topStudents = Object.values(studentPerformance)
            .filter(perf => perf.totalExams > 0)
            .map(perf => ({
                ...perf,
                averageScore: parseFloat((perf.totalScore / perf.totalExams).toFixed(2))
            }))
            .sort((a, b) => b.averageScore - a.averageScore)
            .slice(0, 5)

        // Fallback: If no top students found, create from enrolled students with exam attempts
        if (topStudents.length === 0 && examResults.length > 0) {
            const studentScores = {}
            examResults.forEach(result => {
                if (result.student && result.score !== null && result.score !== undefined) {
                    const studentId = result.student._id.toString()
                    if (!studentScores[studentId]) {
                        // Try to get student name from multiple sources
                        const studentInfo = studentNamesMap.get(studentId) || {
                            studentName: result.student.studentName || result.student.name || 'Unknown Student',
                            email: result.student.email || ''
                        }
                        
                        studentScores[studentId] = {
                            student: {
                                _id: result.student._id,
                                studentName: studentInfo.studentName,
                                email: studentInfo.email
                            },
                            scores: []
                        }
                    }
                    studentScores[studentId].scores.push(result.score)
                }
            })
            
            topStudents = Object.values(studentScores)
                .filter(s => s.scores.length > 0)
                .map(s => ({
                    student: s.student,
                    totalExams: s.scores.length,
                    averageScore: parseFloat((s.scores.reduce((sum, score) => sum + score, 0) / s.scores.length).toFixed(2)),
                    bestScore: Math.max(...s.scores)
                }))
                .sort((a, b) => b.averageScore - a.averageScore)
                .slice(0, 5)
        }

        // Recent activity (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const recentSubmissions = examResults.filter(result => 
            new Date(result.completedAt) >= sevenDaysAgo
        ).length

        const recentExams = exams.filter(exam => 
            new Date(exam.createdAt) >= sevenDaysAgo
        ).length

        return {
            success: true,
            message: "College analytics retrieved successfully",
            analytics: {
                overview: {
                    totalExams,
                    activeExams,
                    completedExams,
                    totalStudents,
                    totalSubmissions,
                    averageScore: isNaN(averageScore) ? 0 : averageScore,
                    highestScore: isNaN(highestScore) ? 0 : highestScore,
                    lowestScore: isNaN(lowestScore) ? 0 : lowestScore,
                    passRate: isNaN(passRate) ? 0 : passRate
                },
                subjectAnalytics,
                streamAnalytics,
                topStudents,
                recentActivity: {
                    recentSubmissions,
                    recentExams,
                    activeStudents: enrolledStudents.filter(s => s.status === 'approved').length
                }
            }
        }
    } catch (error) {
        console.error("College analytics error:", error)
        return {
            success: false,
            message: error.message
        }
    }
}
export async function createExam(examData, collegeId) {
    try {
        await connectDB()
        
        // Get default negative marking if not provided
        let negativeMarks = examData.negativeMarks
        if (negativeMarks === undefined || negativeMarks === null) {
            const defaultNegativeMarking = await getDefaultNegativeMarking(
                examData.stream, 
                examData.standard, 
                examData.examSubject?.[0] // Use first subject if multiple
            )
            negativeMarks = defaultNegativeMarking.negativeMarks || 0
        }
        
        // Process startTime - using same logic as updateExam for consistency
        let processedStartTime = null;
        if (examData.examAvailability === 'scheduled' && examData.startTime) {
            if (typeof examData.startTime === 'string' && 
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(examData.startTime)) {
                // datetime-local format represents IST time, convert to UTC for storage
                // Subtract 5.5 hours to convert IST to UTC
                const localDateTime = examData.startTime + ':00'; // Add seconds
                const istDate = new Date(localDateTime);
                const utcDate = new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000));
                processedStartTime = utcDate;
            } else {
                processedStartTime = new Date(examData.startTime);
            }
        }
        
        // Process endTime - using same logic as updateExam for consistency
        let processedEndTime = null;
        if (examData.examAvailability === 'scheduled' && examData.endTime) {
            if (typeof examData.endTime === 'string' && 
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(examData.endTime)) {
                // datetime-local format represents IST time, convert to UTC for storage
                // Subtract 5.5 hours to convert IST to UTC
                const localDateTime = examData.endTime + ':00'; // Add seconds
                const istDate = new Date(localDateTime);
                const utcDate = new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000));
                processedEndTime = utcDate;
            } else {
                processedEndTime = new Date(examData.endTime);
            }
        }
        
        // Create a plain object for the exam
        const examDoc = {
            ...examData,
            startTime: processedStartTime,
            endTime: processedEndTime,
            examSubject: examData.examSubject || [],
            section: examData.stream === 'JEE' ? examData.section : null,
            negativeMarks: negativeMarks,
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
                status: exam.status,
                negativeMarks: exam.negativeMarks
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
            if (filters.sortBy === 'recent') {
                sortOptions = { createdAt: -1 };
                // Do NOT filter by startTime
            } else if (filters.sortBy === 'updated') {
                sortOptions = { updatedAt: -1 };
                // Do NOT filter by startTime
            } else if (filters.sortBy === 'upcoming') {
                query.startTime = { $ne: null, $gt: new Date() };
                query.examAvailability = 'scheduled';
                sortOptions = { startTime: 1 };
            }
        }

        const skip = (page - 1) * limit
        const totalExams = await Exam.countDocuments(query)
        
        const exams = await Exam.find(query)
            .skip(skip)
            .limit(limit)
            .sort(sortOptions)
            .lean()

        if (filters.sortBy === 'upcoming') {
        }

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
        if (filters.section) {
          // Convert 'Section A'/'Section B' to 1/2, or use as number if valid
          if (filters.section === 'Section A') query.section = 1;
          else if (filters.section === 'Section B') query.section = 2;
          else if (!isNaN(Number(filters.section))) query.section = Number(filters.section);
        }
        if (filters.marks && !isNaN(parseInt(filters.marks))) query.marks = parseInt(filters.marks)
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
            message: error.message || "Error fetching questions"
        }
    }
}

export async function assignQuestionsToExam(examId, questionIds) {
    try {
        await connectDB()
        
        // Get exam details to know the stream
        const examDetails = await Exam.findById(examId)
        if (!examDetails) {
            return {
                success: false,
                message: "Exam not found"
            }
        }
        
        // Get questions with their subjects to calculate marks
        const questions = await master_mcq_question.find({ _id: { $in: questionIds } })
        
        // Calculate total marks based on exam stream and question subjects using official marking scheme
        let totalMarks = 0
        const markingScheme = markingData[examDetails.stream]?.positiveMarking
        
        questions.forEach(question => {
            if (markingScheme && typeof markingScheme.value === 'object') {
                // For exams like MHT-CET with subject-specific marking
                const subjectMarks = markingScheme.value[question.subject]
                totalMarks += subjectMarks || markingScheme.value.default || 1
            } else if (markingScheme && typeof markingScheme.value === 'number') {
                // For exams like JEE/NEET with uniform marking
                totalMarks += markingScheme.value
            } else {
                // Fallback: 4 marks per question for other streams
                totalMarks += 4
            }
        })
        
        // Update the exam with the selected questions and calculated total marks
        const exam = await Exam.findByIdAndUpdate(
            examId,
            { 
                examQuestions: questionIds,
                totalMarks: totalMarks
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
            message: `${questionIds.length} questions assigned successfully with ${totalMarks} total marks`,
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

export async function updateExam(examId, updateData, collegeId) {
    try {
        await connectDB()
        
        // First check if exam belongs to this college
        const existingExam = await Exam.findOne({ _id: examId, college: collegeId })
        if (!existingExam) {
            return {
                success: false,
                message: "Exam not found or access denied"
            }
        }

        // Prepare update data - exclude auto-generated fields
        const allowedFields = [
            'examName', 'examSubject', 'stream', 'standard', 'examDate', 
            'examTime', 'examInstructions', 'examAvailability', 'status',
            'passingMarks', 'startTime', 'endTime', 'examDurationMinutes',
            'negativeMarks', 'questionShuffle', 'section', 'reattempt', 'examStatus'
        ]
        
        const filteredUpdateData = Object.keys(updateData)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = updateData[key]
                return obj
            }, {})

        // Handle date fields and time conversion
        // Fix for production/Vercel timezone issues - explicitly handle IST conversion
        if (filteredUpdateData.startTime) {
            if (typeof filteredUpdateData.startTime === 'string' && 
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(filteredUpdateData.startTime)) {
                // datetime-local format represents IST time, convert to UTC for storage
                // Subtract 5.5 hours to convert IST to UTC
                const localDateTime = filteredUpdateData.startTime + ':00'; // Add seconds
                const istDate = new Date(localDateTime);
                const utcDate = new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000));
                filteredUpdateData.startTime = utcDate;
            } else {
                filteredUpdateData.startTime = new Date(filteredUpdateData.startTime);
            }
        }
        if (filteredUpdateData.endTime) {
            if (typeof filteredUpdateData.endTime === 'string' && 
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(filteredUpdateData.endTime)) {
                // datetime-local format represents IST time, convert to UTC for storage
                // Subtract 5.5 hours to convert IST to UTC
                const localDateTime = filteredUpdateData.endTime + ':00'; // Add seconds
                const istDate = new Date(localDateTime);
                const utcDate = new Date(istDate.getTime() - (5.5 * 60 * 60 * 1000));
                filteredUpdateData.endTime = utcDate;
            } else {
                filteredUpdateData.endTime = new Date(filteredUpdateData.endTime);
            }
        }
        if (filteredUpdateData.examDate) {
            filteredUpdateData.examDate = new Date(filteredUpdateData.examDate)
        }

        // Set section to null if not JEE stream
        if (filteredUpdateData.stream && filteredUpdateData.stream !== 'JEE') {
            filteredUpdateData.section = null
        }

        const updatedExam = await Exam.findByIdAndUpdate(
            examId,
            { 
                ...filteredUpdateData,
                updatedAt: new Date()
            },
            { new: true, runValidators: true }
        ).lean()

        if (!updatedExam) {
            return {
                success: false,
                message: "Failed to update exam"
            }
        }

        return {
            success: true,
            message: "Exam updated successfully",
            exam: {
                ...updatedExam,
                _id: updatedExam._id.toString(),
                college: updatedExam.college.toString()
            }
        }
    } catch (error) {
        console.error("Error updating exam:", error)
        return {
            success: false,
            message: error.message || "Failed to update exam"
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

// Returns an object { subject: count } for all questions matching the filters (except subject, which is grouped)
export async function getQuestionCountsPerSubject(filters = {}) {
  try {
    await connectDB();
    // Build query based on filters, but do NOT include subject (we want to group by subject)
    const query = {};
    if (filters.stream) query.stream = filters.stream;
    if (filters.standard) query.standard = filters.standard;
    if (filters.topic) query.topic = filters.topic;
    if (filters.difficultyLevel) query.difficultyLevel = filters.difficultyLevel;
    if (filters.section) {
      if (filters.section === 'Section A') query.section = 1;
      else if (filters.section === 'Section B') query.section = 2;
      else if (!isNaN(Number(filters.section))) query.section = Number(filters.section);
    }
    if (filters.marks && !isNaN(parseInt(filters.marks))) query.marks = parseInt(filters.marks);
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
    // Use aggregation to group by subject and count
    const result = await master_mcq_question.aggregate([
      { $match: query },
      { $group: { _id: "$subject", count: { $sum: 1 } } }
    ]);
    // Convert to { subject: count }
    const counts = {};
    result.forEach(r => {
      counts[r._id] = r.count;
    });
    return { success: true, counts };
  } catch (error) {
    console.error("Error getting question counts per subject:", error);
    return { success: false, message: error.message || "Error getting question counts per subject" };
  }
}

// Student controls

export async function getStudentRequests(collegeId, page = 1, limit = 10) {
    try {
        await connectDB()
        
        const skip = (page - 1) * limit
        const totalRequests = await StudentRequest.countDocuments({college: collegeId})
        
        const studentRequest = await StudentRequest.find({college: collegeId})
            .populate('student')
            .lean()
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)
            .exec()

        return {
            success: true,
            studentRequest,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalRequests / limit),
                totalRequests,
                requestsPerPage: limit
            }
        }
    } catch (error) {
        console.error("Error fetching student requests:", error)
        return {
            success: false,
            message: error.message || "Failed to fetch student requests"
        }
    }
}

export async function assignStudent(details){

    try {
        await connectDB()
        let enrolledStudent = await EnrolledStudent.findOne({student: details.studentId, college: details.collegeId})
        if(enrolledStudent) {
            return {
                success: false,
                message: "Student already enrolled"
            }
        }
        // If status is rejected or pending, only update StudentRequest status and return
        if (details.status === 'rejected' || details.status === 'pending') {
            await StudentRequest.findOneAndUpdate(
                {college: details.collegeId, student: details.studentId},
                {status: details.status},
                {new: true}
            );
            return {
                success: true,
                message: `Student request ${details.status}`
            }
        }
        // If approved, enroll the student
        enrolledStudent = await EnrolledStudent.create({
            student: details.studentId,
            college: details.collegeId,
            class: details.class,
            allocatedSubjects: details.allocatedSubjects,
            allocatedStreams: details.allocatedStreams,
            status: 'approved',
        })
        const college = await College.findById(details.collegeId)
        const student = await Student.findById(details.studentId)
        const studentRequest = await StudentRequest.findOne({college: details.collegeId, student: details.studentId})
        student.college = college._id
        studentRequest.status = 'approved'
        college.enrolledStudents.push(enrolledStudent._id)
        await college.save()
        await studentRequest.save()
        await enrolledStudent.save()
        await student.save()
        if(!enrolledStudent) {
            return {
                success: false,
                message: "Failed to assign student"
            }
        }
        return {
            success: true,
            enrolledStudent: JSON.parse(JSON.stringify(enrolledStudent))
        }
    } catch (error) {
        console.error("Error assigning student:", error)
        return {
            success: false,
            message: error.message || "Failed to assign student"
        }
    }
}

export async function getEnrolledStudents(collegeId, page = 1, limit = 10) {
    try {
        await connectDB()
        
        const skip = (page - 1) * limit
        const totalStudents = await EnrolledStudent.countDocuments({college: collegeId})
        
        const enrolledStudents = await EnrolledStudent.find({college: collegeId})
            .populate('student', 'name email')
            .lean()
            .sort({createdAt: -1})
            .skip(skip)
            .limit(limit)

        return {
            success: true,
            enrolledStudents: JSON.stringify(enrolledStudents),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalStudents / limit),
                totalStudents,
                studentsPerPage: limit
            }
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

export async function updateEnrolledStudent(studentId, updateData) {
    try {
        await connectDB()
        // Validation
        if (updateData.class !== undefined && (typeof updateData.class !== 'string' || updateData.class.trim() === '')) {
            return {
                success: false,
                message: 'Class must be a non-empty string.'
            }
        }
        if (updateData.allocatedSubjects !== undefined && !Array.isArray(updateData.allocatedSubjects)) {
            return {
                success: false,
                message: 'Allocated subjects must be an array.'
            }
        }
        if (updateData.allocatedStreams !== undefined && !Array.isArray(updateData.allocatedStreams)) {
            return {
                success: false,
                message: 'Allocated streams must be an array.'
            }
        }
        if (updateData.status !== undefined) {
            const allowedStatuses = ['pending', 'approved', 'rejected', 'retired'];
            if (!allowedStatuses.includes(updateData.status)) {
                return {
                    success: false,
                    message: 'Invalid status value.'
                }
            }
        }
        // Build update object dynamically
        const updateObj = {};
        if (updateData.class !== undefined) updateObj.class = updateData.class;
        if (updateData.allocatedSubjects !== undefined) updateObj.allocatedSubjects = updateData.allocatedSubjects;
        if (updateData.allocatedStreams !== undefined) updateObj.allocatedStreams = updateData.allocatedStreams;
        if (updateData.status !== undefined) updateObj.status = updateData.status;
        const updatedStudent = await EnrolledStudent.findByIdAndUpdate(
            studentId,
            updateObj,
            { new: true, runValidators: true }
        ).populate('student', 'name email').lean()

        if (!updatedStudent) {
            return {
                success: false,
                message: "Student not found"
            }
        }

        return {
            success: true,
            message: "Student updated successfully",
            student: updatedStudent
        }
    } catch (error) {
        console.error("Error updating student:", error)
        return {
            success: false,
            message: error.message || "Failed to update student"
        }
    }
}

// College Teacher control

export async function addCollegeTeacher(details) {
    try {
        await connectDB()   
        const teacherDetails = {
            ...details,
            college: details.collegeId,
        }
        delete teacherDetails.collegeId

        const collegeTeacher = await CollegeTeacher.create(teacherDetails)
        const college = await College.findById(teacherDetails.college)
        college.collegeTeachers.push(collegeTeacher._id)
        await college.save()
        return {
            success: true,
            message: "Teacher added successfully",
            teacher: JSON.stringify(collegeTeacher)
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

export async function getCollegeTeachers(collegeId, page = 1, limit = 10, search = '') {
    try {
        await connectDB()
        const skip = (page - 1) * limit
        let query = { college: collegeId }
        if (search && search.trim()) {
            const regex = new RegExp(search.trim(), 'i')
            query.$or = [
                { name: regex },
                { email: regex }
            ]
        }
        const total = await CollegeTeacher.countDocuments(query)
        const collegeTeachers = await CollegeTeacher.find(query)
            .skip(skip)
            .limit(limit)
        return {
            success: true,
            collegeTeachers: JSON.stringify(collegeTeachers),
            pagination: {
                total,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                teachersPerPage: limit
            }
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

export async function updateCollegeTeacher(teacherId, updateData) {
    try {
        await connectDB()
        const allowedFields = [
            'name', 'email', 'password', 'allocatedSubject', 'allocatedClasses', 'profileImageUrl'
        ]
        const filteredUpdate = Object.keys(updateData)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = updateData[key]
                return obj
            }, {})
        const updatedTeacher = await CollegeTeacher.findByIdAndUpdate(
            teacherId,
            filteredUpdate,
            { new: true, runValidators: true }
        )
        if (!updatedTeacher) {
            return {
                success: false,
                message: 'Teacher not found'
            }
        }
        return {
            success: true,
            message: 'Teacher updated successfully',
            teacher: JSON.stringify(updatedTeacher)
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

// Note: College-specific negative marking rules have been removed.
// Colleges now use admin-controlled default rules only.

export async function getDefaultNegativeMarking(stream, standard, subject) {
    try {
        await connectDB()
        
        // Find admin default rules only (college-specific rules removed)
        const defaultRules = await DefaultNegativeMarkingRule.find({
            stream: stream,
            isActive: true
        }).sort({ priority: -1 });

        for (const rule of defaultRules) {
            // Check for exact match with subject and standard
            if (rule.subject && rule.standard) {
                if (subject === rule.subject && rule.standard === standard) {
                    return {
                        success: true,
                        negativeMarks: rule.negativeMarks,
                        description: rule.description || `Default rule: ${rule.stream} > ${rule.standard}th > ${rule.subject}`
                    };
                }
            }
            // Check for standard-specific rule
            else if (!rule.subject && rule.standard) {
                if (rule.standard === standard) {
                    return {
                        success: true,
                        negativeMarks: rule.negativeMarks,
                        description: rule.description || `Default rule: ${rule.stream} > ${rule.standard}th`
                    };
                }
            }
            // Check for stream-wide rule
            else if (!rule.subject && !rule.standard) {
                return {
                    success: true,
                    negativeMarks: rule.negativeMarks,
                    description: rule.description || `Default rule: ${rule.stream}`
                };
            }
        }

        // Fallback to no negative marking
        return {
            success: true,
            negativeMarks: 0,
            description: "No negative marking rule found"
        }
    } catch (error) {
        return {
            success: false,
            message: error.message,
            negativeMarks: 0
        }
    }
}

// college exam result actions

export async function getCollegeExamsForResults(details, page = 1, limit = 10, searchQuery = '', selectedStream = '', selectedClass = '', selectedAvailability = '') {
    try {
        await connectDB()
        
        // Get college info using token-based authentication
        const college = await collegeAuth(details)
        if (!college) {
            return {
                success: false,
                message: "College not authenticated",
                data: {
                    exams: [],
                    pagination: {
                        total: 0,
                        page: 1,
                        limit: 10,
                        totalPages: 0
                    }
                }
            }
        }
        
        const collegeId = college._id
        
        // Build search query
        const query = { college: collegeId }
        
        // Add filter conditions
        if (selectedStream && selectedStream.trim()) {
            query.stream = selectedStream.trim()
        }
        if (selectedClass && selectedClass.trim()) {
            query.standard = selectedClass.trim()
        }
        if (selectedAvailability && selectedAvailability.trim()) {
            query.examAvailability = selectedAvailability.trim()
        }
        
        // Add search conditions
        if (searchQuery && searchQuery.trim()) {
            const regex = new RegExp(searchQuery.trim(), 'i')
            query.$or = [
                { examName: regex },
                { stream: regex },
                { standard: regex },
                { examSubject: { $in: [regex] } }
            ]
        }
        
        const skip = (page - 1) * limit
        const totalExams = await Exam.countDocuments(query)
        
        // Get exams with basic info needed for the table
        const exams = await Exam.find(query)
            .select('examName examSubject stream standard createdAt updatedAt startTime endTime examDurationMinutes totalMarks examQuestions')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
        
        // For each exam, get attempt count
        const examsWithAttempts = await Promise.all(
            exams.map(async (exam) => {
                const attemptCount = await ExamResult.countDocuments({ exam: exam._id })
                
                return {
                    _id: exam._id.toString(),
                    examName: exam.examName,
                    examSubject: exam.examSubject,
                    stream: exam.stream,
                    standard: exam.standard,
                    createdAt: exam.createdAt,
                    updatedAt: exam.updatedAt,
                    startTime: exam.startTime,
                    endTime: exam.endTime,
                    duration: exam.examDurationMinutes,
                    totalMarks: exam.totalMarks,
                    totalQuestions: exam.examQuestions ? exam.examQuestions.length : 0,
                    totalAttempts: attemptCount
                }
            })
        )
        
        return {
            success: true,
            data: {
                exams: examsWithAttempts,
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
            message: error.message,
            data: {
                exams: [],
                pagination: {
                    total: 0,
                    page: 1,
                    limit: 10,
                    totalPages: 0
                }
            }
        }
    }
}

export async function getExamStudentStats(details, examId, page = 1, limit = 10, searchQuery = '', statusFilter = 'all') {
    try {
        await connectDB()
        
        // Get college info using token-based authentication
        const college = await collegeAuth(details)
        if (!college) {
            return {
                success: false,
                message: "College not authenticated"
            }
        }
        
        const collegeId = college._id
        
        // Verify the exam belongs to this college and populate questions
        const exam = await Exam.findOne({ _id: examId, college: collegeId })
            .populate('examQuestions')
            .lean()
        if (!exam) {
            return {
                success: false,
                message: "Exam not found or access denied"
            }
        }
        
        // Get all exam results for this exam
        const examResults = await ExamResult.find({ exam: examId })
            .populate('student', 'name email')
            .lean()
        
        // Get all students enrolled in this college 
        const allEnrolledStudents = await EnrolledStudent.find({ 
            college: collegeId, 
            status: 'approved' 
        }).populate('student', 'name email').lean()
        
        // Filter only students eligible for this specific exam
        const eligibleStudents = allEnrolledStudents.filter(enrolledStudent => {
            return checkStudentExamEligibility(enrolledStudent, exam)
        })
        
        const totalRegistered = eligibleStudents.length
        const totalAttempted = examResults.length
        // All exam results are considered completed since they exist in the database
        const totalCompleted = examResults.length
        
        // Calculate statistics (marks-based) 
        const scores = examResults.map(result => result.score || 0)
        const averageScore = scores.length > 0 ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100 : 0
        const highestScore = scores.length > 0 ? Math.max(...scores) : 0
        const lowestScore = scores.length > 0 ? Math.min(...scores) : 0
        
        // Calculate time spent (if available) - convert from seconds to minutes
        const timesSpent = examResults
            .map(result => result.timeTaken ? Math.round(result.timeTaken / 60) : 0)
            .filter(time => time > 0)
        const averageTimeSpent = timesSpent.length > 0 ? 
            Math.round(timesSpent.reduce((sum, time) => sum + time, 0) / timesSpent.length) : 0
        
        // Calculate pass rate (assuming passing marks is available in exam)
        const passingMarks = exam.passingMarks || (exam.totalMarks * 0.4) // 40% of total marks as default
        const passedCount = scores.filter(score => score >= passingMarks).length
        const passRate = scores.length > 0 ? Math.round((passedCount / scores.length) * 100 * 100) / 100 : 0
        
        // Get stream-specific score ranges for distribution
        const getStreamScoreRanges = (stream, totalMarks) => {
            const ranges = {
                'JEE': {
                    excellent: Math.round(totalMarks * 0.85), // 85% and above
                    good: Math.round(totalMarks * 0.70),      // 70-84%
                    average: Math.round(totalMarks * 0.50),   // 50-69%
                },
                'NEET': {
                    excellent: Math.round(totalMarks * 0.90), // 90% and above
                    good: Math.round(totalMarks * 0.75),      // 75-89%
                    average: Math.round(totalMarks * 0.60),   // 60-74%
                },
                'CBSE': {
                    excellent: Math.round(totalMarks * 0.90), // 90% and above
                    good: Math.round(totalMarks * 0.75),      // 75-89%
                    average: Math.round(totalMarks * 0.60),   // 60-74%
                }
            }
            return ranges[stream] || ranges['CBSE']
        }
        
        const ranges = getStreamScoreRanges(exam.stream, exam.totalMarks)
        
        // Score distribution based on marks
        const scoreDistribution = {
            excellent: scores.filter(score => score >= ranges.excellent).length,
            good: scores.filter(score => score >= ranges.good && score < ranges.excellent).length,
            average: scores.filter(score => score >= ranges.average && score < ranges.good).length,
            poor: scores.filter(score => score < ranges.average).length,
            notAttempted: Math.max(0, totalAttempted - totalCompleted)
        }
        
        // Use only eligible students for this exam
        const enrolledStudentsData = eligibleStudents
        
        // Create a map of exam results by student ID
        const examResultsMap = new Map()
        examResults.forEach(result => {
            const studentId = result.student?._id?.toString()
            if (studentId) {
                examResultsMap.set(studentId, result)
            }
        })
        
        // Prepare student list with performance data
        const studentsData = enrolledStudentsData.map(enrolledStudent => {
            const studentId = enrolledStudent.student?._id?.toString()
            const examResult = studentId ? examResultsMap.get(studentId) : null
            
            if (examResult) {
                // Extract detailed performance data from ExamResult
                const questionAnalysis = examResult.questionAnalysis || []
                const statistics = examResult.statistics || {}
                const subjectPerformance = examResult.subjectPerformance || []
                
                // Calculate accurate question statistics
                let correctAnswers = statistics.correctAnswers || 0
                let incorrectAnswers = statistics.incorrectAnswers || 0  
                let unattempted = statistics.unattempted || 0
                let totalAttempted = statistics.totalQuestionsAttempted || 0
                let markedForReview = statistics.markedForReview || 0
                let changedAnswers = statistics.changedAnswers || 0
                let accuracy = statistics.accuracy || 0
                
                // If statistics are not available, calculate from questionAnalysis
                if (questionAnalysis.length > 0) {
                    correctAnswers = questionAnalysis.filter(q => q.status === 'correct' || q.status === 'partially_correct').length
                    incorrectAnswers = questionAnalysis.filter(q => q.status === 'incorrect').length
                    unattempted = questionAnalysis.filter(q => q.status === 'unattempted').length
                    totalAttempted = correctAnswers + incorrectAnswers
                    accuracy = totalAttempted > 0 ? parseFloat(((correctAnswers / totalAttempted) * 100).toFixed(2)) : 0
                }
                
                return {
                    id: examResult.student._id.toString(),
                    name: examResult.student.name,
                    email: examResult.student.email,
                    score: examResult.score || 0,
                    status: 'completed', // All exam results are completed
                    timeSpent: examResult.timeTaken ? Math.round(examResult.timeTaken / 60) : null, // Convert seconds to minutes
                    submittedAt: examResult.completedAt,
                    warnings: examResult.warnings || 0,
                    
                    // Detailed question analysis
                    correctAnswers,
                    wrongAnswers: incorrectAnswers,
                    notAttempted: unattempted,
                    totalAttempted,
                    markedForReview,
                    changedAnswers,
                    accuracy,
                    
                    // Subject-wise performance (raw data for detailed view)
                    subjectPerformance: subjectPerformance.map(subject => ({
                        subject: subject.subject,
                        totalQuestions: subject.totalQuestions || 0,
                        attempted: subject.attempted || 0,
                        correct: subject.correct || 0,
                        incorrect: subject.incorrect || 0,
                        unanswered: subject.unanswered || 0,
                        marks: subject.marks || 0,
                        totalMarks: subject.totalMarks || 0,
                        timeSpent: subject.timeSpent || 0,
                        accuracy: subject.accuracy || 0,
                        difficultyBreakdown: subject.difficultyBreakdown || {
                            easy: { attempted: 0, correct: 0 },
                            medium: { attempted: 0, correct: 0 },
                            hard: { attempted: 0, correct: 0 }
                        }
                    })),
                    
                    // Question analysis (raw data for detailed view)
                    questionAnalysis: questionAnalysis.map(question => ({
                        questionId: question.questionId?.toString(),
                        status: question.status,
                        marks: question.marks || 0,
                        userAnswer: question.userAnswer,
                        correctAnswer: question.correctAnswer,
                        negativeMarkingRule: question.negativeMarkingRule,
                        mcmaDetails: question.mcmaDetails
                    })),
                    
                    // Performance insights
                    performanceInsights: examResult.performanceInsights || {
                        strengths: [],
                        improvements: [],
                        recommendations: [],
                        performanceCategory: 'Average'
                    },
                    
                    // Comparative data
                    comparativeStats: examResult.comparativeStats || {
                        classAverage: 0,
                        streamAverage: 0,
                        collegeAverage: 0,
                        percentileRank: 0,
                        rank: 0,
                        totalStudentsAppeared: 0,
                        betterThanPercentage: 0,
                        topScore: examResult.score || 0,
                        bottomScore: 0
                    }
                }
            } else {
                // Student is enrolled but hasn't attempted the exam
                return {
                    id: enrolledStudent.student._id.toString(),
                    name: enrolledStudent.student.name,
                    email: enrolledStudent.student.email,
                    score: null,
                    status: 'registered',
                    timeSpent: null,
                    submittedAt: null,
                    warnings: 0,
                    correctAnswers: 0,
                    wrongAnswers: 0,
                    notAttempted: 0,
                    totalAttempted: 0,
                    markedForReview: 0,
                    changedAnswers: 0,
                    accuracy: 0,
                    subjectPerformance: [],
                    questionAnalysis: [],
                    performanceInsights: null,
                    comparativeStats: null
                }
            }
        })
        
        const stats = {
            totalRegistered: totalRegistered, // Actual enrolled students count
            totalAttempted: totalAttempted,
            totalCompleted: totalCompleted,
            totalPending: totalAttempted - totalCompleted,
            averageScore: averageScore, // Now in marks, not percentage
            highestScore: highestScore,
            lowestScore: lowestScore,
            averageTimeSpent: Math.round(averageTimeSpent),
            passRate: passRate, // Already calculated as percentage
            scoreDistribution: scoreDistribution
        }
        
        // Sort all students: completed students by score (descending), then registered students
        studentsData.sort((a, b) => {
            // If both completed, sort by score (higher score first)
            if (a.status === 'completed' && b.status === 'completed') {
                return b.score - a.score
            }
            // Completed students come first
            if (a.status === 'completed' && b.status !== 'completed') {
                return -1
            }
            if (a.status !== 'completed' && b.status === 'completed') {
                return 1
            }
            // Both are registered, sort by name
            return (a.name || '').localeCompare(b.name || '')
        })

        // Assign ranks to all students
        let currentRank = 1
        studentsData.forEach((student, index) => {
            if (student.status === 'completed') {
                // For completed students, check if previous student has same score
                if (index > 0 && studentsData[index - 1].status === 'completed' && 
                    studentsData[index - 1].score === student.score) {
                    // Same score as previous student, keep same rank
                    student.rank = studentsData[index - 1].rank
                } else {
                    // Different score or first student, assign current rank
                    student.rank = currentRank
                }
                student.percentage = exam.totalMarks > 0 ? 
                    Math.round((student.score / exam.totalMarks) * 100 * 100) / 100 : 0
                currentRank = index + 2 // Next available rank
            } else {
                // Registered students don't have ranks
                student.rank = null
                student.percentage = null
            }
        })

        // Calculate percentiles for completed students
        const completedStudents = studentsData.filter(s => s.status === 'completed')
        const totalCompletedStudents = completedStudents.length

        if (totalCompletedStudents > 1) {
            completedStudents.forEach(student => {
                // Count how many students scored lower than current student
                const studentsWithLowerScores = completedStudents.filter(s => s.score < student.score).length
                
                // Calculate percentile: (number of students with lower scores / total students) * 100
                const percentile = totalCompletedStudents > 1 ? 
                    Math.max(0, Math.min(100, Math.round((studentsWithLowerScores / (totalCompletedStudents - 1)) * 100 * 100) / 100)) : 0
                
                student.percentile = percentile
                
                // Update comparative stats with percentile
                if (student.comparativeStats) {
                    student.comparativeStats.percentileRank = percentile
                    student.comparativeStats.rank = student.rank
                    student.comparativeStats.totalStudentsAppeared = totalCompletedStudents
                    student.comparativeStats.betterThanPercentage = percentile
                }
            })
        } else if (totalCompletedStudents === 1) {
            // If only one student completed, they get 100th percentile
            completedStudents[0].percentile = 100
            if (completedStudents[0].comparativeStats) {
                completedStudents[0].comparativeStats.percentileRank = 100
                completedStudents[0].comparativeStats.rank = 1
                completedStudents[0].comparativeStats.totalStudentsAppeared = 1
                completedStudents[0].comparativeStats.betterThanPercentage = 100
            }
        }

        // Set percentile to null for students who didn't complete
        studentsData.forEach(student => {
            if (student.status !== 'completed') {
                student.percentile = null
            }
        })

        // Get unique subjects from exam subjects
        const examSubjects = exam.examSubject || []
        
        // Prepare Excel export data structure matching the image format
        const excelData = {
            examInfo: {
                stream: exam.stream,
                examName: exam.examName,
                subjects: examSubjects,
                examDate: exam.createdAt
            },
            studentsData: await Promise.all(studentsData.filter(s => s.status === 'completed').map(async (student, index) => {
                const studentData = {
                    sNo: index + 1,
                    studentName: student.name,
                    std: exam.standard,
                    total: student.score,
                    percentile: (() => {
                        if (student.percentile === null || student.percentile === undefined) {
                            return '-'
                        }
                        // Safe number conversion
                        const num = parseFloat(student.percentile)
                        if (isNaN(num) || !isFinite(num)) {
                            return '-'
                        }
                        return Math.max(0, Math.min(100, num)).toFixed(1) + 'th'
                    })(),
                    rank: student.rank
                }

                // Recalculate subject-wise performance using super admin rules only
                for (const subject of examSubjects) {
                    let correct = 0, wrong = 0, totalMarks = 0
                    
                    if (student.questionAnalysis && student.questionAnalysis.length > 0 && exam.examQuestions) {
                        // Process each question for this subject
                        for (let qIndex = 0; qIndex < student.questionAnalysis.length; qIndex++) {
                            const questionAnalysis = student.questionAnalysis[qIndex]
                            const examQuestion = exam.examQuestions[qIndex]
                            
                            if (examQuestion && examQuestion.subject === subject) {
                                // Get super admin marking rule for this question
                                const questionNegativeMarkingRule = await getNegativeMarkingRuleForQuestion(exam, examQuestion)
                                const adminPositiveMarks = questionNegativeMarkingRule.positiveMarks || examQuestion.marks || 4
                                const adminNegativeMarks = questionNegativeMarkingRule.negativeMarks || 1
                                
                                // Count correct/wrong based on status
                                if (questionAnalysis.status === 'correct' || questionAnalysis.status === 'partially_correct') {
                                    correct++
                                    // Use super admin positive marks
                                    totalMarks += adminPositiveMarks
                                } else if (questionAnalysis.status === 'incorrect') {
                                    wrong++
                                    // Apply super admin negative marks
                                    totalMarks -= adminNegativeMarks
                                }
                                // unattempted questions add 0 marks
                            }
                        }
                    }
                    
                    studentData[`${subject}_correct`] = correct
                    studentData[`${subject}_wrong`] = wrong
                    studentData[`${subject}_totalMarks`] = totalMarks
                }


                return studentData
            }))
        }

        // Apply search and filter before pagination
        let filteredStudents = studentsData

        // Apply search filter
        if (searchQuery && searchQuery.trim()) {
            const searchRegex = new RegExp(searchQuery.trim(), 'i')
            filteredStudents = filteredStudents.filter(student => 
                searchRegex.test(student.name || '') || 
                searchRegex.test(student.email || '')
            )
        }

        // Apply status filter
        if (statusFilter && statusFilter !== 'all') {
            filteredStudents = filteredStudents.filter(student => 
                student.status === statusFilter
            )
        }

        // Apply pagination to filtered data
        const totalStudents = filteredStudents.length
        const totalPages = Math.ceil(totalStudents / limit)
        const startIndex = (page - 1) * limit
        const endIndex = startIndex + limit
        const paginatedStudents = filteredStudents.slice(startIndex, endIndex)

        return {
            success: true,
            data: {
                stats: stats,
                students: paginatedStudents,
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalStudents: totalStudents,
                    studentsPerPage: limit,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1
                },
                examInfo: {
                    _id: exam._id.toString(),
                    examName: exam.examName,
                    examSubject: exam.examSubject,
                    stream: exam.stream,
                    standard: exam.standard,
                    createdAt: exam.createdAt,
                    totalMarks: exam.totalMarks,
                    totalQuestions: exam.examQuestions ? exam.examQuestions.length : 0,
                    duration: exam.examDurationMinutes,
                    passingMarks: exam.passingMarks
                },
                excelData: excelData
            }
        }
        
    } catch (error) {
        console.error('Error fetching exam student stats:', error)
        return {
            success: false,
            message: error.message || "Failed to fetch exam statistics"
        }
    }
}

// Helper function to check if a student is eligible for a specific exam
function checkStudentExamEligibility(enrolledStudent, exam) {
    // Stream match
    const isStreamMatch = enrolledStudent.allocatedStreams?.includes(exam.stream)
    
    // Class match  
    const isClassMatch = 
        enrolledStudent.class === `${exam.standard}` ||
        enrolledStudent.class === `${exam.standard}th`
    
    // Subject match (if both have subjects allocated)
    let isSubjectMatch = true
    if (enrolledStudent.allocatedSubjects?.length > 0 && exam.examSubject?.length > 0) {
        isSubjectMatch = exam.examSubject.some(examSubject => 
            enrolledStudent.allocatedSubjects.some(studentSubject => 
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
        )
    }
    
    return isStreamMatch && isClassMatch && isSubjectMatch
}

// Get count of students eligible for at least one active exam
export async function getEligibleStudentsCount(details) {
    try {
        await connectDB()
        const college = await collegeAuth(details)
        
        if (!college) {
            return { success: false, count: 0, message: "College not authenticated" }
        }
        
        // Get active exams with questions
        const activeExams = await Exam.find({
            college: college._id,
            examStatus: 'active',
            status: 'scheduled',
            $expr: { $gt: [{ $size: "$examQuestions" }, 0] } // Has questions
        }).lean()
        
        if (activeExams.length === 0) {
            return { success: true, count: 0, message: "No active exams with questions found" }
        }
        
        // Get all approved enrolled students
        const enrolledStudents = await EnrolledStudent.find({
            college: college._id,
            status: 'approved'
        }).lean()
        
        if (enrolledStudents.length === 0) {
            return { success: true, count: 0, message: "No approved enrolled students found" }
        }
        
        let eligibleStudentsSet = new Set()
        
        // Check eligibility for each student against each exam
        for (const student of enrolledStudents) {
            for (const exam of activeExams) {
                const isEligible = checkStudentExamEligibility(student, exam)
                if (isEligible) {
                    eligibleStudentsSet.add(student.student.toString())
                    break // Student is eligible for at least one exam
                }
            }
        }
        
        return {
            success: true,
            count: eligibleStudentsSet.size,
            message: `Found ${eligibleStudentsSet.size} eligible students out of ${enrolledStudents.length} approved enrollments`
        }
    } catch (error) {
        console.error('Error counting eligible students:', error)
        return { 
            success: false, 
            count: 0, 
            message: error.message || "Failed to count eligible students" 
        }
    }
}

export async function getCollegeDashboardSummary(details) {
    try {
        await connectDB()
        
        // Get college info using token-based authentication
        const college = await collegeAuth(details)

        // Debug: Check if any colleges exist in the database at all
        const allColleges = await College.find({}).select('_id collegeName token').lean()
        
        if (!college) {
            return {
                success: false,
                message: "College not authenticated",
                summary: {
                    totalStudents: 0,
                    totalExams: 0,
                    totalExamAttempts: 0
                }
            }
        }
        
        const collegeId = college._id
        
        // Get eligible students count instead of total enrolled
        const eligibleStudentsResult = await getEligibleStudentsCount(details)
        const totalStudents = eligibleStudentsResult.success ? eligibleStudentsResult.count : 0
        
        // Execute remaining database queries in parallel
        const [
            totalExams,
            collegeExams
        ] = await Promise.all([
            Exam.countDocuments({
                college: collegeId
            }),
            Exam.find({ college: collegeId }).select('_id').lean()
        ])
        

        // Debug: Check status breakdown of enrolled students
        const allEnrolledStudents = await EnrolledStudent.find({ college: collegeId }).lean()
        const statusBreakdown = allEnrolledStudents.reduce((acc, student) => {
            acc[student.status] = (acc[student.status] || 0) + 1
            return acc
        }, {})
        
        // Get exam attempts count using the exam IDs we already fetched
        const examIds = collegeExams.map(exam => exam._id)
        const totalExamAttempts = examIds.length > 0 
            ? await ExamResult.countDocuments({ exam: { $in: examIds } })
            : 0
            
        
        return {
            success: true,
            summary: {
                totalStudents,
                totalExams,
                totalExamAttempts
            }
        }
    } catch (error) {
        return {
            success: false,
            message: error.message,
            summary: {
                totalStudents: 0,
                totalExams: 0,
                totalExamAttempts: 0
            }
        }
    }
}

// Get comprehensive student results and analytics for the college
export async function getCollegeStudentResults(details, page = 1, limit = 10, filters = {}) {
    try {
        await connectDB()
        
        // Get college info using token-based authentication
        const college = await collegeAuth(details)
        if (!college) {
            return {
                success: false,
                message: "College not authenticated",
                data: {
                    students: [],
                    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
                    summary: {}
                }
            }
        }
        
        const collegeId = college._id
        
        // Build query for enrolled students - always get total count first
        const baseQuery = { 
            college: collegeId, 
            status: 'approved' 
        }
        
        // Get actual total students count (unfiltered except for college and status)
        const actualTotalStudents = await EnrolledStudent.countDocuments(baseQuery)
        
        // Build query for data fetching
        let enrolledStudentQuery = { ...baseQuery }
        
        // Apply backend filters (class and stream - performance is client-side)
        // If search is provided, search should work across ALL students regardless of filters
        if (!filters.search) {
            // Only apply other filters when not searching
            if (filters.class) {
                enrolledStudentQuery.class = filters.class
            }
            if (filters.stream) {
                enrolledStudentQuery.allocatedStreams = { $in: [filters.stream] }
            }
        }
        
        // Get total count with filters applied for correct pagination
        const filteredTotalStudents = await EnrolledStudent.countDocuments(enrolledStudentQuery)
        
        // Get enrolled students with pagination
        // If search is active, we need to fetch more data to search through
        const skip = (page - 1) * limit
        const fetchLimit = filters.search ? Math.max(1000, limit * 10) : limit
        const fetchSkip = filters.search ? 0 : skip
        
        const enrolledStudents = await EnrolledStudent.find(enrolledStudentQuery)
            .populate('student', 'name email interestedStream course')
            .sort({ createdAt: -1 })
            .skip(fetchSkip)
            .limit(fetchLimit)
            .lean()
        
        // Get all exams for this college with stream and standard info for filtering
        const collegeExams = await Exam.find({ college: collegeId })
            .select('_id totalMarks stream standard')
            .lean()
        const examIds = collegeExams.map(exam => exam._id)
        
        // Process each student to get their performance data
        const studentsData = await Promise.all(
            enrolledStudents.map(async (enrolledStudent) => {
                const studentId = enrolledStudent.student._id
                
                // Get all exam results for this student
                const examResults = await ExamResult.find({
                    student: studentId,
                    exam: { $in: examIds }
                }).populate('exam', 'examName totalMarks examSubject stream standard examAvailability').lean()
                
                // Filter exams based on student's eligibility (stream and class)
                // Get student streams from allocatedStreams field (primary source)
                const studentStreams = enrolledStudent.allocatedStreams || []
                
                const studentClass = enrolledStudent.class
                
                // DEBUG: Check if allocatedStreams is populated
                // If allocatedStreams is empty, we need to understand why
                if (studentStreams.length === 0) {
                    // Fallback: If no allocatedStreams, infer from the display data or use all exams
                    // This is a temporary fix - the real solution is to populate allocatedStreams properly
                    console.log(`WARNING: Student ${enrolledStudent.student.name} has no allocatedStreams, using all exams as fallback`)
                }

                // Filter exams based on student's allocated streams and class
                const eligibleExams = studentStreams.length > 0 
                    ? collegeExams.filter(exam => {
                        // Stream matching - check if exam stream matches student's allocated streams
                        if (!exam.stream) return false
                        
                        const streamMatch = studentStreams.some(studentStream => {
                            return studentStream.toString().toUpperCase().trim() === exam.stream.toString().toUpperCase().trim()
                        })
                        
                        if (!streamMatch) return false
                        
                        // Class matching
                        if (studentClass && exam.standard) {
                            return studentClass.toString() === exam.standard.toString()
                        }
                        
                        return true
                    })
                    : collegeExams // Fallback: if no allocated streams, show all exams (this explains the 11 count)
                
                // Filter exam results to only include results from eligible exams and scheduled exams (not practice)
                const eligibleExamIds = eligibleExams.map(exam => exam._id.toString())
                const filteredExamResults = examResults.filter(result => 
                    eligibleExamIds.includes(result.exam._id.toString()) &&
                    result.exam.examAvailability === 'scheduled'
                )
                
                // Calculate student statistics based on eligible exams
                const totalExams = eligibleExams.length
                const attemptedExams = filteredExamResults.length
                const scores = filteredExamResults.map(result => result.score || 0)
                const totalMarks = filteredExamResults.reduce((sum, result) => sum + (result.exam?.totalMarks || 0), 0)
                const obtainedMarks = scores.reduce((sum, score) => sum + score, 0)
                
                const averageScore = attemptedExams > 0 ? 
                    Math.round((obtainedMarks / totalMarks) * 100 * 100) / 100 : 0
                const highestScore = scores.length > 0 ? Math.max(...scores) : 0
                const lowestScore = scores.length > 0 ? Math.min(...scores) : 0
                
                // Calculate pass rate (assuming 40% passing criteria)
                const passedExams = filteredExamResults.filter(result => {
                    const passingMarks = (result.exam?.totalMarks || 0) * 0.4
                    return result.score >= passingMarks
                }).length
                const passRate = attemptedExams > 0 ? 
                    Math.round((passedExams / attemptedExams) * 100 * 100) / 100 : 0

                // Enhanced Cumulative Subject-wise Performance Analysis
                const cumulativeSubjectAnalysis = {}
                const subjectWiseAttempts = {}
                const subjectWiseTimeSpent = {}
                const subjectDifficultyAnalysis = {}
                
                // Process each exam result for detailed subject analysis
                filteredExamResults.forEach(result => {
                    if (result.subjectPerformance && result.subjectPerformance.length > 0) {
                        result.subjectPerformance.forEach(subjectData => {
                            const subject = subjectData.subject
                            
                            if (!cumulativeSubjectAnalysis[subject]) {
                                cumulativeSubjectAnalysis[subject] = {
                                    subject: subject,
                                    totalExamsAttempted: 0,
                                    totalQuestions: 0,
                                    totalQuestionsAttempted: 0,
                                    totalCorrect: 0,
                                    totalIncorrect: 0,
                                    totalUnanswered: 0,
                                    totalMarksObtained: 0,
                                    totalMaxMarks: 0,
                                    totalTimeSpent: 0,
                                    accuracySum: 0,
                                    examScores: [],
                                    consistencyRating: 0,
                                    improvementTrend: 'stable',
                                    difficultyAnalysis: {
                                        easy: { attempted: 0, correct: 0, accuracy: 0 },
                                        medium: { attempted: 0, correct: 0, accuracy: 0 },
                                        hard: { attempted: 0, correct: 0, accuracy: 0 }
                                    }
                                }
                                subjectWiseAttempts[subject] = []
                                subjectWiseTimeSpent[subject] = []
                            }
                            
                            const analysis = cumulativeSubjectAnalysis[subject]
                            
                            // Accumulate statistics
                            analysis.totalExamsAttempted++
                            analysis.totalQuestions += subjectData.totalQuestions || 0
                            analysis.totalQuestionsAttempted += subjectData.attempted || 0
                            analysis.totalCorrect += subjectData.correct || 0
                            analysis.totalIncorrect += subjectData.incorrect || 0
                            analysis.totalUnanswered += subjectData.unanswered || 0
                            analysis.totalMarksObtained += subjectData.marks || 0
                            analysis.totalMaxMarks += subjectData.totalMarks || 0
                            analysis.totalTimeSpent += subjectData.timeSpent || 0
                            analysis.accuracySum += subjectData.accuracy || 0
                            
                            // Track scores for trend analysis
                            const subjectPercentage = subjectData.totalMarks > 0 ? 
                                Math.round((subjectData.marks / subjectData.totalMarks) * 100 * 100) / 100 : 0
                            analysis.examScores.push(subjectPercentage)
                            subjectWiseAttempts[subject].push({
                                examDate: result.completedAt,
                                score: subjectPercentage,
                                accuracy: subjectData.accuracy || 0
                            })
                            
                            // Difficulty breakdown
                            if (subjectData.difficultyBreakdown) {
                                Object.keys(subjectData.difficultyBreakdown).forEach(level => {
                                    if (analysis.difficultyAnalysis[level]) {
                                        analysis.difficultyAnalysis[level].attempted += subjectData.difficultyBreakdown[level].attempted || 0
                                        analysis.difficultyAnalysis[level].correct += subjectData.difficultyBreakdown[level].correct || 0
                                    }
                                })
                            }
                            
                            subjectWiseTimeSpent[subject].push(subjectData.timeSpent || 0)
                        })
                    }
                })
                
                // Calculate derived statistics for each subject
                Object.keys(cumulativeSubjectAnalysis).forEach(subject => {
                    const analysis = cumulativeSubjectAnalysis[subject]
                    
                    // Calculate averages and percentages
                    analysis.averageScore = analysis.totalMaxMarks > 0 ? 
                        Math.round((analysis.totalMarksObtained / analysis.totalMaxMarks) * 100 * 100) / 100 : 0
                    
                    analysis.overallAccuracy = analysis.totalQuestionsAttempted > 0 ? 
                        Math.round((analysis.totalCorrect / analysis.totalQuestionsAttempted) * 100 * 100) / 100 : 0
                    
                    analysis.averageTimePerQuestion = analysis.totalQuestionsAttempted > 0 ? 
                        Math.round((analysis.totalTimeSpent / analysis.totalQuestionsAttempted) * 100) / 100 : 0
                    
                    analysis.attemptRate = analysis.totalQuestions > 0 ? 
                        Math.round((analysis.totalQuestionsAttempted / analysis.totalQuestions) * 100 * 100) / 100 : 0
                    
                    // Calculate difficulty-wise accuracy
                    Object.keys(analysis.difficultyAnalysis).forEach(level => {
                        const diffData = analysis.difficultyAnalysis[level]
                        diffData.accuracy = diffData.attempted > 0 ? 
                            Math.round((diffData.correct / diffData.attempted) * 100 * 100) / 100 : 0
                    })
                    
                    // Calculate consistency rating (lower standard deviation = higher consistency)
                    if (analysis.examScores.length > 1) {
                        const mean = analysis.examScores.reduce((sum, score) => sum + score, 0) / analysis.examScores.length
                        const variance = analysis.examScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / analysis.examScores.length
                        const standardDeviation = Math.sqrt(variance)
                        analysis.consistencyRating = Math.max(0, Math.round((100 - standardDeviation) * 100) / 100)
                    } else {
                        analysis.consistencyRating = analysis.examScores.length === 1 ? 100 : 0
                    }
                    
                    // Calculate improvement trend
                    if (analysis.examScores.length >= 3) {
                        const recent = analysis.examScores.slice(-3)
                        const older = analysis.examScores.slice(0, -3)
                        const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length
                        const olderAvg = older.length > 0 ? older.reduce((sum, score) => sum + score, 0) / older.length : recentAvg
                        
                        if (recentAvg > olderAvg + 5) analysis.improvementTrend = 'improving'
                        else if (recentAvg < olderAvg - 5) analysis.improvementTrend = 'declining'
                        else analysis.improvementTrend = 'stable'
                    }
                    
                    // Performance category for subject
                    if (analysis.averageScore >= 90) analysis.performanceCategory = 'excellent'
                    else if (analysis.averageScore >= 75) analysis.performanceCategory = 'good'
                    else if (analysis.averageScore >= 60) analysis.performanceCategory = 'average'
                    else if (analysis.averageScore >= 40) analysis.performanceCategory = 'below_average'
                    else analysis.performanceCategory = 'poor'
                    
                    // Strength/Weakness identification
                    analysis.isStrength = analysis.averageScore >= 75 && analysis.overallAccuracy >= 70
                    analysis.needsImprovement = analysis.averageScore < 60 || analysis.overallAccuracy < 50
                    
                    // Time efficiency rating
                    const avgTimeSpent = subjectWiseTimeSpent[subject].length > 0 ? 
                        subjectWiseTimeSpent[subject].reduce((sum, time) => sum + time, 0) / subjectWiseTimeSpent[subject].length : 0
                    analysis.timeEfficiency = avgTimeSpent > 0 && analysis.overallAccuracy > 70 ? 'efficient' : 
                        avgTimeSpent > 120 ? 'slow' : 'average' // assuming 2 minutes per question is average
                })
                
                // Subject-wise insights and recommendations
                const subjectInsights = {
                    strongestSubjects: Object.values(cumulativeSubjectAnalysis)
                        .filter(s => s.isStrength)
                        .sort((a, b) => b.averageScore - a.averageScore)
                        .slice(0, 3),
                    
                    weakestSubjects: Object.values(cumulativeSubjectAnalysis)
                        .filter(s => s.needsImprovement)
                        .sort((a, b) => a.averageScore - b.averageScore)
                        .slice(0, 3),
                    
                    mostConsistentSubjects: Object.values(cumulativeSubjectAnalysis)
                        .filter(s => s.totalExamsAttempted > 1)
                        .sort((a, b) => b.consistencyRating - a.consistencyRating)
                        .slice(0, 2),
                    
                    improvingSubjects: Object.values(cumulativeSubjectAnalysis)
                        .filter(s => s.improvementTrend === 'improving'),
                    
                    decliningSubjects: Object.values(cumulativeSubjectAnalysis)
                        .filter(s => s.improvementTrend === 'declining')
                }
                
                // Get last exam details
                const lastExam = filteredExamResults.length > 0 ? 
                    filteredExamResults.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))[0] : null
                
                // Determine performance category
                let performance = 'poor'
                if (averageScore >= 90) performance = 'excellent'
                else if (averageScore >= 75) performance = 'good'
                else if (averageScore >= 60) performance = 'average'
                else if (averageScore >= 40) performance = 'below_average'
                
                return {
                    id: studentId.toString(),
                    name: enrolledStudent.student.name,
                    email: enrolledStudent.student.email,
                    class: enrolledStudent.class || 'N/A',
                    stream: studentStreams.length > 0 ? studentStreams[0] : 'N/A',
                    allocatedStreams: studentStreams.length > 0 ? studentStreams : ['N/A'],
                    rollNumber: enrolledStudent.rollNumber || `ST${studentId.toString().slice(-6)}`,
                    totalExams,
                    attemptedExams,
                    averageScore,
                    highestScore,
                    lowestScore,
                    totalMarks,
                    obtainedMarks,
                    passRate,
                    lastExamDate: lastExam?.completedAt || null,
                    lastExamScore: lastExam ? Math.round((lastExam.score / lastExam.exam.totalMarks) * 100) : null,
                    performance,
                    enrolledAt: enrolledStudent.createdAt,
                    
                    // Enhanced Cumulative Subject Analysis
                    cumulativeSubjectAnalysis: Object.values(cumulativeSubjectAnalysis),
                    subjectInsights,
                    subjectWiseTrends: Object.keys(cumulativeSubjectAnalysis).map(subject => ({
                        subject,
                        attempts: subjectWiseAttempts[subject] || [],
                        trend: cumulativeSubjectAnalysis[subject].improvementTrend,
                        consistency: cumulativeSubjectAnalysis[subject].consistencyRating
                    }))
                }
            })
        )
        
        // Apply search filter
        let filteredStudents = studentsData
        if (filters.search) {
            const searchRegex = new RegExp(filters.search, 'i')
            filteredStudents = studentsData.filter(student => 
                searchRegex.test(student.name) || 
                searchRegex.test(student.email) || 
                searchRegex.test(student.rollNumber)
            )
        }
        
        // Apply sorting
        if (filters.sortBy) {
            filteredStudents.sort((a, b) => {
                let aValue = a[filters.sortBy]
                let bValue = b[filters.sortBy]
                
                if (filters.sortBy === 'name') {
                    return filters.sortOrder === 'asc' ? 
                        aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
                }
                
                if (filters.sortOrder === 'asc') {
                    return aValue - bValue
                } else {
                    return bValue - aValue
                }
            })
        }
        
        // Apply pagination to search results
        let paginatedStudents = filteredStudents
        let searchTotalCount = filteredStudents.length
        
        if (filters.search) {
            // For search results, apply pagination after filtering
            const searchSkip = (page - 1) * limit
            paginatedStudents = filteredStudents.slice(searchSkip, searchSkip + limit)
        }
        
        // Calculate summary statistics based on the filtered/searched results
        const dataForSummary = paginatedStudents.length > 0 ? filteredStudents : []
        const summary = {
            // Use actual total for display purposes
            totalStudents: actualTotalStudents,
            // Keep filtered/searched statistics for current view
            filteredStudents: dataForSummary.length,
            averageScore: dataForSummary.length > 0 ? 
                Math.round(dataForSummary.reduce((sum, s) => sum + s.averageScore, 0) / dataForSummary.length * 100) / 100 : 0,
            totalExamsCreated: collegeExams.length,
            totalAttempts: dataForSummary.reduce((sum, s) => sum + s.attemptedExams, 0),
            averagePassRate: dataForSummary.length > 0 ? 
                Math.round(dataForSummary.reduce((sum, s) => sum + s.passRate, 0) / dataForSummary.length * 100) / 100 : 0,
            performanceDistribution: {
                excellent: dataForSummary.filter(s => s.performance === 'excellent').length,
                good: dataForSummary.filter(s => s.performance === 'good').length,
                average: dataForSummary.filter(s => s.performance === 'average').length,
                below_average: dataForSummary.filter(s => s.performance === 'below_average').length,
                poor: dataForSummary.filter(s => s.performance === 'poor').length
            }
        }
        
        return {
            success: true,
            data: {
                students: paginatedStudents,
                pagination: {
                    // Use search count for search results, filtered count for filtered results
                    total: filters.search ? searchTotalCount : filteredTotalStudents,
                    // Include unfiltered count for reference  
                    actualTotal: actualTotalStudents,
                    page: page,
                    limit: limit,
                    totalPages: Math.ceil((filters.search ? searchTotalCount : filteredTotalStudents) / limit)
                },
                summary
            }
        }
        
    } catch (error) {
        console.error('Error fetching student results:', error)
        return {
            success: false,
            message: error.message || "Failed to fetch student results",
            data: {
                students: [],
                pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
                summary: {}
            }
        }
    }
}

// Get advanced exam analytics with comparative data
export async function getAdvancedExamAnalytics(details, examId) {
    try {
        await connectDB()
        
        // Get college info using token-based authentication
        const college = await collegeAuth(details)
        if (!college) {
            return {
                success: false,
                message: "College not authenticated"
            }
        }
        
        const collegeId = college._id
        
        // Verify the exam belongs to this college
        const exam = await Exam.findOne({ _id: examId, college: collegeId })
            .populate('examQuestions')
            .lean()
        
        if (!exam) {
            return {
                success: false,
                message: "Exam not found or access denied"
            }
        }
        
        // Get all exam results for this exam
        const examResults = await ExamResult.find({ exam: examId })
            .populate('student', 'name email')
            .lean()
        
        // Question-wise analysis
        const questionAnalysis = {}
        const questions = exam.examQuestions || []
        
        // Initialize question statistics
        questions.forEach((question, index) => {
            questionAnalysis[index] = {
                questionId: question._id.toString(),
                questionText: question.question || `Question ${index + 1}`,
                subject: question.subject,
                difficultyLevel: question.difficultyLevel,
                marks: question.marks || 1,
                totalAttempts: 0,
                correctAttempts: 0,
                incorrectAttempts: 0,
                unattempted: 0,
                accuracy: 0,
                averageTime: 0,
                difficultyIndex: 0 // Calculated based on performance
            }
        })
        
        // Process each student's question analysis
        examResults.forEach(result => {
            if (result.questionAnalysis) {
                result.questionAnalysis.forEach((qAnalysis, index) => {
                    if (questionAnalysis[index]) {
                        const qStat = questionAnalysis[index]
                        qStat.totalAttempts++
                        
                        switch (qAnalysis.status) {
                            case 'correct':
                            case 'partially_correct':
                                qStat.correctAttempts++
                                break
                            case 'incorrect':
                                qStat.incorrectAttempts++
                                break
                            case 'unattempted':
                                qStat.unattempted++
                                break
                        }
                    }
                })
            }
        })
        
        // Calculate question statistics
        Object.values(questionAnalysis).forEach(qStat => {
            if (qStat.totalAttempts > 0) {
                qStat.accuracy = parseFloat(((qStat.correctAttempts / qStat.totalAttempts) * 100).toFixed(2))
                qStat.difficultyIndex = 100 - qStat.accuracy // Higher difficulty index = harder question
            }
        })
        
        // Subject-wise performance analysis
        const subjectAnalysis = {}
        examResults.forEach(result => {
            if (result.subjectPerformance) {
                result.subjectPerformance.forEach(subject => {
                    if (!subjectAnalysis[subject.subject]) {
                        subjectAnalysis[subject.subject] = {
                            totalStudents: 0,
                            totalQuestions: subject.totalQuestions || 0,
                            totalMarks: subject.totalMarks || 0,
                            averageScore: 0,
                            averageAccuracy: 0,
                            averageTime: 0,
                            scores: [],
                            accuracies: []
                        }
                    }
                    
                    const subjectStat = subjectAnalysis[subject.subject]
                    subjectStat.totalStudents++
                    subjectStat.scores.push(subject.marks || 0)
                    subjectStat.accuracies.push(subject.accuracy || 0)
                })
            }
        })
        
        // Calculate subject averages
        Object.values(subjectAnalysis).forEach(subjectStat => {
            if (subjectStat.scores.length > 0) {
                subjectStat.averageScore = Math.round(
                    subjectStat.scores.reduce((sum, score) => sum + score, 0) / subjectStat.scores.length * 100
                ) / 100
                subjectStat.averageAccuracy = Math.round(
                    subjectStat.accuracies.reduce((sum, acc) => sum + acc, 0) / subjectStat.accuracies.length * 100
                ) / 100
                subjectStat.percentage = subjectStat.totalMarks > 0 ? 
                    Math.round((subjectStat.averageScore / subjectStat.totalMarks) * 100 * 100) / 100 : 0
            }
        })
        
        // Time analysis
        const timeAnalysis = {
            averageTimeSpent: 0,
            timeDistribution: {
                quick: 0,      // < 50% of allocated time
                normal: 0,     // 50-80% of allocated time
                slow: 0,       // 80-100% of allocated time
                overtime: 0    // > 100% of allocated time
            }
        }
        
        const allocatedTime = exam.examDurationMinutes * 60 // in seconds
        const validTimes = examResults
            .map(r => r.timeTaken)
            .filter(time => time && time > 0)
        
        if (validTimes.length > 0) {
            timeAnalysis.averageTimeSpent = Math.round(
                validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length / 60
            ) // in minutes
            
            validTimes.forEach(time => {
                const timePercentage = (time / allocatedTime) * 100
                if (timePercentage < 50) timeAnalysis.timeDistribution.quick++
                else if (timePercentage < 80) timeAnalysis.timeDistribution.normal++
                else if (timePercentage <= 100) timeAnalysis.timeDistribution.slow++
                else timeAnalysis.timeDistribution.overtime++
            })
        }
        
        // Performance insights and recommendations
        const insights = {
            strengths: [],
            weaknesses: [],
            recommendations: []
        }
        
        // Analyze subject performance for insights
        Object.entries(subjectAnalysis).forEach(([subject, stats]) => {
            if (stats.averageAccuracy >= 80) {
                insights.strengths.push(`Strong performance in ${subject} (${parseFloat(stats.averageAccuracy).toFixed(2)}% accuracy)`)
            } else if (stats.averageAccuracy < 50) {
                insights.weaknesses.push(`Need improvement in ${subject} (${parseFloat(stats.averageAccuracy).toFixed(2)}% accuracy)`)
                insights.recommendations.push(`Focus more practice questions on ${subject}`)
            }
        })
        
        // Analyze question difficulty for insights
        const hardQuestions = Object.values(questionAnalysis).filter(q => q.difficultyIndex > 70)
        if (hardQuestions.length > 0) {
            insights.recommendations.push(`${hardQuestions.length} questions were particularly challenging - consider reviewing these topics`)
        }
        
        return {
            success: true,
            data: {
                examInfo: {
                    _id: exam._id.toString(),
                    examName: exam.examName,
                    examSubject: exam.examSubject,
                    stream: exam.stream,
                    standard: exam.standard,
                    totalMarks: exam.totalMarks,
                    duration: exam.examDurationMinutes,
                    totalQuestions: questions.length
                },
                questionAnalysis: Object.values(questionAnalysis),
                subjectAnalysis,
                timeAnalysis,
                insights,
                overallStats: {
                    totalStudents: examResults.length,
                    averageScore: examResults.length > 0 ? 
                        Math.round(examResults.reduce((sum, r) => sum + (r.score || 0), 0) / examResults.length * 100) / 100 : 0,
                    passRate: examResults.length > 0 ? 
                        Math.round((examResults.filter(r => (r.score || 0) >= (exam.totalMarks * 0.4)).length / examResults.length) * 100 * 100) / 100 : 0,
                    completionRate: 100 // All results in DB are completed
                }
            }
        }
        
    } catch (error) {
        console.error('Error fetching advanced exam analytics:', error)
        return {
            success: false,
            message: error.message || "Failed to fetch exam analytics"
        }
    }
}

// Get subject-wise performance analytics across all exams
export async function getSubjectWiseAnalytics(details, filters = {}) {
    try {
        await connectDB()
        
        // Get college info using token-based authentication
        const college = await collegeAuth(details)
        if (!college) {
            return {
                success: false,
                message: "College not authenticated"
            }
        }
        
        const collegeId = college._id
        
        // Build exam query with filters
        let examQuery = { college: collegeId }
        if (filters.stream) examQuery.stream = filters.stream
        if (filters.standard) examQuery.standard = filters.standard
        if (filters.dateFrom || filters.dateTo) {
            examQuery.createdAt = {}
            if (filters.dateFrom) examQuery.createdAt.$gte = new Date(filters.dateFrom)
            if (filters.dateTo) examQuery.createdAt.$lte = new Date(filters.dateTo)
        }
        
        // Get all exams for this college with filters
        const exams = await Exam.find(examQuery).select('_id examName examSubject stream standard totalMarks createdAt').lean()
        const examIds = exams.map(exam => exam._id)
        
        if (examIds.length === 0) {
            return {
                success: true,
                data: {
                    subjectAnalytics: {},
                    overallStats: {},
                    examsSummary: []
                }
            }
        }
        
        // Get all exam results for these exams
        const examResults = await ExamResult.find({ exam: { $in: examIds } })
            .populate('exam', 'examName examSubject stream standard totalMarks')
            .populate('student', 'name')
            .lean()
        
        // Process subject-wise analytics
        const subjectAnalytics = {}
        const examSubjectMap = {} // Track which subjects appear in which exams
        
        examResults.forEach(result => {
            if (result.subjectPerformance && result.exam) {
                // Track exam-subject relationships
                if (!examSubjectMap[result.exam._id]) {
                    examSubjectMap[result.exam._id] = {
                        examName: result.exam.examName,
                        subjects: new Set()
                    }
                }
                
                result.subjectPerformance.forEach(subject => {
                    examSubjectMap[result.exam._id].subjects.add(subject.subject)
                    
                    if (!subjectAnalytics[subject.subject]) {
                        subjectAnalytics[subject.subject] = {
                            subjectName: subject.subject,
                            totalStudents: new Set(),
                            totalExams: new Set(),
                            totalQuestions: 0,
                            totalMarks: 0,
                            scores: [],
                            accuracies: [],
                            timeSpent: [],
                            examPerformance: {}, // Performance per exam
                            difficultyDistribution: {
                                easy: { attempted: 0, correct: 0 },
                                medium: { attempted: 0, correct: 0 },
                                hard: { attempted: 0, correct: 0 }
                            }
                        }
                    }
                    
                    const subjectStat = subjectAnalytics[subject.subject]
                    subjectStat.totalStudents.add(result.student._id.toString())
                    subjectStat.totalExams.add(result.exam._id.toString())
                    subjectStat.totalQuestions += subject.totalQuestions || 0
                    subjectStat.totalMarks += subject.totalMarks || 0
                    subjectStat.scores.push(subject.marks || 0)
                    subjectStat.accuracies.push(subject.accuracy || 0)
                    subjectStat.timeSpent.push(subject.timeSpent || 0)
                    
                    // Track per-exam performance
                    const examId = result.exam._id.toString()
                    if (!subjectStat.examPerformance[examId]) {
                        subjectStat.examPerformance[examId] = {
                            examName: result.exam.examName,
                            studentCount: 0,
                            averageScore: 0,
                            averageAccuracy: 0,
                            scores: []
                        }
                    }
                    subjectStat.examPerformance[examId].studentCount++
                    subjectStat.examPerformance[examId].scores.push(subject.marks || 0)
                    
                    // Process difficulty breakdown if available
                    if (subject.difficultyBreakdown) {
                        ['easy', 'medium', 'hard'].forEach(level => {
                            if (subject.difficultyBreakdown[level]) {
                                subjectStat.difficultyDistribution[level].attempted += subject.difficultyBreakdown[level].attempted || 0
                                subjectStat.difficultyDistribution[level].correct += subject.difficultyBreakdown[level].correct || 0
                            }
                        })
                    }
                })
            }
        })
        
        // Calculate final statistics for each subject
        Object.values(subjectAnalytics).forEach(subjectStat => {
            subjectStat.totalStudents = subjectStat.totalStudents.size
            subjectStat.totalExams = subjectStat.totalExams.size
            
            // Calculate averages
            subjectStat.averageScore = subjectStat.scores.length > 0 ? 
                Math.round(subjectStat.scores.reduce((sum, score) => sum + score, 0) / subjectStat.scores.length * 100) / 100 : 0
            subjectStat.averageAccuracy = subjectStat.accuracies.length > 0 ? 
                Math.round(subjectStat.accuracies.reduce((sum, acc) => sum + acc, 0) / subjectStat.accuracies.length * 100) / 100 : 0
            subjectStat.averageTimeSpent = subjectStat.timeSpent.length > 0 ? 
                Math.round(subjectStat.timeSpent.reduce((sum, time) => sum + time, 0) / subjectStat.timeSpent.length * 100) / 100 : 0
            
            // Calculate percentage
            subjectStat.averagePercentage = subjectStat.totalMarks > 0 ? 
                Math.round((subjectStat.averageScore / (subjectStat.totalMarks / subjectStat.totalExams)) * 100 * 100) / 100 : 0
            
            // Calculate highest and lowest scores
            subjectStat.highestScore = subjectStat.scores.length > 0 ? Math.max(...subjectStat.scores) : 0
            subjectStat.lowestScore = subjectStat.scores.length > 0 ? Math.min(...subjectStat.scores) : 0
            
            // Calculate difficulty-wise accuracy
            Object.keys(subjectStat.difficultyDistribution).forEach(level => {
                const difficulty = subjectStat.difficultyDistribution[level]
                difficulty.accuracy = difficulty.attempted > 0 ? 
                    Math.round((difficulty.correct / difficulty.attempted) * 100 * 100) / 100 : 0
            })
            
            // Calculate per-exam averages
            Object.values(subjectStat.examPerformance).forEach(examPerf => {
                examPerf.averageScore = examPerf.scores.length > 0 ? 
                    Math.round(examPerf.scores.reduce((sum, score) => sum + score, 0) / examPerf.scores.length * 100) / 100 : 0
            })
            
            // Clean up arrays to save space
            delete subjectStat.scores
            delete subjectStat.accuracies
            delete subjectStat.timeSpent
        })
        
        // Calculate overall statistics
        const overallStats = {
            totalSubjects: Object.keys(subjectAnalytics).length,
            totalExams: exams.length,
            totalStudents: new Set(examResults.map(r => r.student._id.toString())).size,
            totalAttempts: examResults.length,
            strongestSubjects: [],
            weakestSubjects: [],
            mostDifficultSubjects: [],
            averageAccuracyBySubject: {}
        }
        
        // Identify strongest and weakest subjects
        const subjectsByAccuracy = Object.values(subjectAnalytics)
            .sort((a, b) => b.averageAccuracy - a.averageAccuracy)
        
        overallStats.strongestSubjects = subjectsByAccuracy.slice(0, 3).map(s => ({
            subject: s.subjectName,
            accuracy: s.averageAccuracy,
            averageScore: s.averageScore
        }))
        
        overallStats.weakestSubjects = subjectsByAccuracy.slice(-3).reverse().map(s => ({
            subject: s.subjectName,
            accuracy: s.averageAccuracy,
            averageScore: s.averageScore
        }))
        
        // Most difficult subjects (lowest accuracy)
        overallStats.mostDifficultSubjects = subjectsByAccuracy.slice(-3).reverse().map(s => ({
            subject: s.subjectName,
            accuracy: s.averageAccuracy,
            difficultyIndex: 100 - s.averageAccuracy
        }))
        
        // Average accuracy by subject for quick reference
        Object.values(subjectAnalytics).forEach(subject => {
            overallStats.averageAccuracyBySubject[subject.subjectName] = subject.averageAccuracy
        })
        
        // Prepare exams summary
        const examsSummary = exams.map(exam => ({
            _id: exam._id.toString(),
            examName: exam.examName,
            examSubject: exam.examSubject,
            stream: exam.stream,
            standard: exam.standard,
            totalMarks: exam.totalMarks,
            createdAt: exam.createdAt,
            attemptCount: examResults.filter(r => r.exam._id.toString() === exam._id.toString()).length
        }))
        
        return {
            success: true,
            data: {
                subjectAnalytics,
                overallStats,
                examsSummary
            }
        }
        
    } catch (error) {
        console.error('Error fetching subject-wise analytics:', error)
        return {
            success: false,
            message: error.message || "Failed to fetch subject-wise analytics"
        }
    }
}

export async function getDetailedStudentPerformanceAnalysis(details, examId, studentId) {
    try {
        await connectDB()
        
        const college = await collegeAuth(details)
        if (!college) {
            return {
                success: false,
                message: "College not authenticated"
            }
        }
        
        const collegeId = college._id
        
        const exam = await Exam.findOne({ _id: examId, college: collegeId })
            .populate('examQuestions')
            .lean()
        
        if (!exam) {
            return {
                success: false,
                message: "Exam not found or access denied"
            }
        }
        
        const studentResult = await ExamResult.findOne({ 
            exam: examId, 
            student: studentId 
        }).populate('student', 'name email').lean()
        
        if (!studentResult) {
            return {
                success: false,
                message: "Student result not found"
            }
        }
        
        const allExamResults = await ExamResult.find({ exam: examId })
            .select('score student')
            .lean()
        
        const scores = allExamResults.map(r => r.score || 0).sort((a, b) => b - a)
        const studentScore = studentResult.score || 0
        const totalStudents = scores.length
        
        const rank = scores.findIndex(score => score <= studentScore) + 1
        const percentile = totalStudents > 1 ? 
            Math.round(((totalStudents - rank) / (totalStudents - 1)) * 100 * 100) / 100 : 100
        
        const averageScore = scores.length > 0 ? 
            Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length * 100) / 100 : 0
        const highestScore = scores.length > 0 ? Math.max(...scores) : 0
        const lowestScore = scores.length > 0 ? Math.min(...scores) : 0
        
        const questionAnalysis = studentResult.questionAnalysis || []
        const subjectPerformance = studentResult.subjectPerformance || []
        const statistics = studentResult.statistics || {}
        
        const subjectWiseBreakdown = {}
        subjectPerformance.forEach(subject => {
            subjectWiseBreakdown[subject.subject] = {
                totalQuestions: subject.totalQuestions || 0,
                attempted: subject.attempted || 0,
                correct: subject.correct || 0,
                incorrect: subject.incorrect || 0,
                unanswered: subject.unanswered || 0,
                marks: subject.marks || 0,
                totalMarks: subject.totalMarks || 0,
                accuracy: subject.accuracy || 0,
                timeSpent: subject.timeSpent || 0,
                percentage: subject.totalMarks > 0 ? 
                    Math.round((subject.marks / subject.totalMarks) * 100 * 100) / 100 : 0
            }
        })
        
        const difficultyWiseAnalysis = {
            easy: { attempted: 0, correct: 0, incorrect: 0, accuracy: 0 },
            medium: { attempted: 0, correct: 0, incorrect: 0, accuracy: 0 },
            hard: { attempted: 0, correct: 0, incorrect: 0, accuracy: 0 }
        }
        
        questionAnalysis.forEach(question => {
            const examQuestion = exam.examQuestions?.find(q => 
                q._id.toString() === question.questionId?.toString()
            )
            if (examQuestion && examQuestion.difficultyLevel) {
                const difficulty = examQuestion.difficultyLevel.toLowerCase()
                if (difficultyWiseAnalysis[difficulty]) {
                    if (question.status !== 'unattempted') {
                        difficultyWiseAnalysis[difficulty].attempted++
                        if (question.status === 'correct' || question.status === 'partially_correct') {
                            difficultyWiseAnalysis[difficulty].correct++
                        } else {
                            difficultyWiseAnalysis[difficulty].incorrect++
                        }
                    }
                }
            }
        })
        
        Object.keys(difficultyWiseAnalysis).forEach(level => {
            const analysis = difficultyWiseAnalysis[level]
            analysis.accuracy = analysis.attempted > 0 ? 
                Math.round((analysis.correct / analysis.attempted) * 100 * 100) / 100 : 0
        })
        
        const timeAnalysis = {
            totalTimeSpent: studentResult.timeTaken ? Math.round(studentResult.timeTaken / 60) : 0,
            averageTimePerQuestion: questionAnalysis.length > 0 && studentResult.timeTaken ? 
                Math.round((studentResult.timeTaken / questionAnalysis.length) * 100) / 100 : 0,
            timeEfficiency: exam.examDurationMinutes && studentResult.timeTaken ? 
                Math.round(((exam.examDurationMinutes * 60 - studentResult.timeTaken) / (exam.examDurationMinutes * 60)) * 100 * 100) / 100 : 0
        }
        
        const performanceInsights = {
            strengths: [],
            weaknesses: [],
            recommendations: []
        }
        
        Object.entries(subjectWiseBreakdown).forEach(([subject, perf]) => {
            if (perf.accuracy >= 80) {
                performanceInsights.strengths.push(`Strong performance in ${subject} (${parseFloat(perf.accuracy).toFixed(2)}% accuracy)`)
            } else if (perf.accuracy < 50) {
                performanceInsights.weaknesses.push(`Needs improvement in ${subject} (${parseFloat(perf.accuracy).toFixed(2)}% accuracy)`)
                performanceInsights.recommendations.push(`Focus more practice on ${subject} concepts`)
            }
        })
        
        if (difficultyWiseAnalysis.hard.accuracy < 30 && difficultyWiseAnalysis.hard.attempted > 0) {
            performanceInsights.recommendations.push("Practice more challenging problems to improve on difficult questions")
        }
        
        if (timeAnalysis.timeEfficiency < 0) {
            performanceInsights.recommendations.push("Work on time management - consider practicing with timed mock tests")
        }
        
        const detailedQuestionAnalysis = questionAnalysis.map(question => {
            const examQuestion = exam.examQuestions?.find(q => 
                q._id.toString() === question.questionId?.toString()
            )
            return {
                questionId: question.questionId?.toString(),
                questionText: examQuestion?.question || 'Question not found',
                subject: examQuestion?.subject || 'Unknown',
                topic: examQuestion?.topic || 'Unknown',
                difficultyLevel: examQuestion?.difficultyLevel || 'Unknown',
                marks: question.marks || 0,
                maxMarks: examQuestion?.marks || 4,
                status: question.status,
                userAnswer: question.userAnswer,
                correctAnswer: question.correctAnswer,
                isCorrect: question.status === 'correct' || question.status === 'partially_correct',
                negativeMarkingRule: question.negativeMarkingRule
            }
        })
        
        return {
            success: true,
            data: {
                studentInfo: {
                    id: studentResult.student._id.toString(),
                    name: studentResult.student.name,
                    email: studentResult.student.email
                },
                examInfo: {
                    id: exam._id.toString(),
                    name: exam.examName,
                    subject: exam.examSubject,
                    stream: exam.stream,
                    standard: exam.standard,
                    totalMarks: exam.totalMarks,
                    duration: exam.examDurationMinutes,
                    totalQuestions: exam.examQuestions?.length || 0
                },
                performance: {
                    score: studentScore,
                    totalMarks: exam.totalMarks,
                    percentage: exam.totalMarks > 0 ? 
                        Math.round((studentScore / exam.totalMarks) * 100 * 100) / 100 : 0,
                    rank: rank,
                    percentile: percentile,
                    totalStudents: totalStudents
                },
                statistics: {
                    correctAnswers: statistics.correctAnswers || 0,
                    incorrectAnswers: statistics.incorrectAnswers || 0,
                    unattempted: statistics.unattempted || 0,
                    accuracy: statistics.accuracy || 0,
                    totalAttempted: (statistics.correctAnswers || 0) + (statistics.incorrectAnswers || 0)
                },
                comparativeStats: {
                    averageScore: averageScore,
                    highestScore: highestScore,
                    lowestScore: lowestScore,
                    betterThanPercentage: percentile,
                    scoreDistribution: {
                        above: scores.filter(s => s > studentScore).length,
                        same: scores.filter(s => s === studentScore).length,
                        below: scores.filter(s => s < studentScore).length
                    }
                },
                subjectWiseAnalysis: subjectWiseBreakdown,
                difficultyAnalysis: difficultyWiseAnalysis,
                timeAnalysis: timeAnalysis,
                performanceInsights: performanceInsights,
                detailedQuestionAnalysis: detailedQuestionAnalysis,
                submissionDetails: {
                    submittedAt: studentResult.completedAt,
                    timeTaken: timeAnalysis.totalTimeSpent,
                    isOfflineSubmission: studentResult.isOfflineSubmission || false
                }
            }
        }
        
    } catch (error) {
        console.error('Error fetching detailed student performance:', error)
        return {
            success: false,
            message: error.message || "Failed to fetch detailed student performance"
        }
    }
}

// Comprehensive exam performance overview with percentile calculations
export async function getExamPerformanceOverview(details, examId) {
    try {
        await connectDB()
        
        // Get college info using token-based authentication
        const college = await collegeAuth(details)
        if (!college) {
            return {
                success: false,
                message: "College not authenticated"
            }
        }
        
        const collegeId = college._id
        
        // Verify the exam belongs to this college and get detailed exam info
        const exam = await Exam.findOne({ _id: examId, college: collegeId })
            .populate('examQuestions')
            .lean()
        
        if (!exam) {
            return {
                success: false,
                message: "Exam not found or access denied"
            }
        }
        
        // Get all exam results for this exam with student details
        const examResults = await ExamResult.find({ exam: examId })
            .populate('student', 'name email')
            .lean()
        
        // Get all enrolled students for the college to calculate participation
        const enrolledStudents = await EnrolledStudent.find({ 
            college: collegeId, 
            status: 'approved' 
        }).populate('student', 'name email').lean()
        
        // Calculate percentiles and rankings
        const scoresData = examResults
            .map(result => ({
                studentId: result.student._id.toString(),
                score: result.score || 0,
                result: result
            }))
            .sort((a, b) => b.score - a.score) // Sort descending by score
        
        // Calculate percentiles for each student
        const totalStudentsAttempted = scoresData.length
        const studentsWithPercentiles = scoresData.map((studentData, index) => {
            const rank = index + 1
            // Percentile = (Number of students scoring below + 0.5 * Number of students with same score) / Total students * 100
            const studentsBelow = scoresData.filter(s => s.score < studentData.score).length
            const studentsWithSameScore = scoresData.filter(s => s.score === studentData.score).length
            const percentile = totalStudentsAttempted > 1 ? 
                Math.round(((studentsBelow + (studentsWithSameScore - 1) / 2) / totalStudentsAttempted) * 100 * 100) / 100 : 
                100
            
            return {
                ...studentData,
                rank,
                percentile: Math.max(0, percentile) // Ensure percentile is not negative
            }
        })
        
        // Create a map for quick lookup
        const studentPerformanceMap = new Map()
        studentsWithPercentiles.forEach(student => {
            studentPerformanceMap.set(student.studentId, {
                rank: student.rank,
                percentile: student.percentile,
                result: student.result
            })
        })
        
        // Calculate comprehensive statistics
        const scores = scoresData.map(s => s.score)
        const totalRegistered = enrolledStudents.length
        const totalAttempted = examResults.length
        const totalCompleted = examResults.length // All results are completed
        
        // Calculate basic stats
        const averageScore = scores.length > 0 ? 
            Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100 : 0
        const highestScore = scores.length > 0 ? Math.max(...scores) : 0
        const lowestScore = scores.length > 0 ? Math.min(...scores) : 0
        const medianScore = scores.length > 0 ? 
            scores.length % 2 === 0 ? 
                (scores[Math.floor(scores.length / 2) - 1] + scores[Math.floor(scores.length / 2)]) / 2 :
                scores[Math.floor(scores.length / 2)] : 0
        
        // Calculate standard deviation
        const variance = scores.length > 0 ? 
            scores.reduce((sum, score) => sum + Math.pow(score - averageScore, 2), 0) / scores.length : 0
        const standardDeviation = Math.sqrt(variance)
        
        // Calculate time spent statistics
        const timesSpent = examResults
            .map(result => result.timeTaken ? Math.round(result.timeTaken / 60) : 0)
            .filter(time => time > 0)
        const averageTimeSpent = timesSpent.length > 0 ? 
            Math.round(timesSpent.reduce((sum, time) => sum + time, 0) / timesSpent.length) : 0
        
        // Calculate pass rate
        const passingMarks = exam.passingMarks || (exam.totalMarks * 0.4)
        const passedCount = scores.filter(score => score >= passingMarks).length
        const passRate = scores.length > 0 ? 
            Math.round((passedCount / scores.length) * 100 * 100) / 100 : 0
        
        // Score distribution based on exam stream
        const getStreamScoreRanges = (stream, totalMarks) => {
            const ranges = {
                'JEE': {
                    excellent: Math.round(totalMarks * 0.85),
                    good: Math.round(totalMarks * 0.70),
                    average: Math.round(totalMarks * 0.50),
                },
                'NEET': {
                    excellent: Math.round(totalMarks * 0.90),
                    good: Math.round(totalMarks * 0.75),
                    average: Math.round(totalMarks * 0.60),
                },
                'CBSE': {
                    excellent: Math.round(totalMarks * 0.90),
                    good: Math.round(totalMarks * 0.75),
                    average: Math.round(totalMarks * 0.60),
                }
            }
            return ranges[stream] || ranges['CBSE']
        }
        
        const ranges = getStreamScoreRanges(exam.stream, exam.totalMarks)
        const scoreDistribution = {
            excellent: scores.filter(score => score >= ranges.excellent).length,
            good: scores.filter(score => score >= ranges.good && score < ranges.excellent).length,
            average: scores.filter(score => score >= ranges.average && score < ranges.good).length,
            poor: scores.filter(score => score < ranges.average).length,
            notAttempted: Math.max(0, totalRegistered - totalAttempted)
        }
        
        // Subject-wise performance analysis
        const subjectAnalysis = {}
        examResults.forEach(result => {
            if (result.subjectPerformance) {
                result.subjectPerformance.forEach(subject => {
                    if (!subjectAnalysis[subject.subject]) {
                        subjectAnalysis[subject.subject] = {
                            subject: subject.subject,
                            totalStudents: 0,
                            totalQuestions: subject.totalQuestions || 0,
                            totalMarks: subject.totalMarks || 0,
                            scores: [],
                            accuracies: [],
                            averageScore: 0,
                            averageAccuracy: 0,
                            highestScore: 0,
                            lowestScore: 0
                        }
                    }
                    
                    const subjectStat = subjectAnalysis[subject.subject]
                    subjectStat.totalStudents++
                    subjectStat.scores.push(subject.marks || 0)
                    subjectStat.accuracies.push(subject.accuracy || 0)
                })
            }
        })
        
        // Calculate subject averages
        Object.values(subjectAnalysis).forEach(subject => {
            if (subject.scores.length > 0) {
                subject.averageScore = Math.round(
                    (subject.scores.reduce((sum, score) => sum + score, 0) / subject.scores.length) * 100
                ) / 100
                subject.averageAccuracy = Math.round(
                    (subject.accuracies.reduce((sum, acc) => sum + acc, 0) / subject.accuracies.length) * 100
                ) / 100
                subject.highestScore = Math.max(...subject.scores)
                subject.lowestScore = Math.min(...subject.scores)
                subject.percentage = subject.totalMarks > 0 ? 
                    Math.round((subject.averageScore / subject.totalMarks) * 100 * 100) / 100 : 0
            }
        })
        
        // Question-wise analysis
        const questionAnalysis = {}
        const questions = exam.examQuestions || []
        
        questions.forEach((question, index) => {
            questionAnalysis[index] = {
                questionId: question._id.toString(),
                questionNumber: index + 1,
                subject: question.subject,
                difficultyLevel: question.difficultyLevel,
                marks: question.marks || 1,
                totalAttempts: 0,
                correctAttempts: 0,
                incorrectAttempts: 0,
                unattempted: 0,
                accuracy: 0,
                difficultyIndex: 0
            }
        })
        
        // Process question analysis from results
        examResults.forEach(result => {
            if (result.questionAnalysis) {
                result.questionAnalysis.forEach((qAnalysis, index) => {
                    if (questionAnalysis[index]) {
                        const qStat = questionAnalysis[index]
                        qStat.totalAttempts++
                        
                        switch (qAnalysis.status) {
                            case 'correct':
                            case 'partially_correct':
                                qStat.correctAttempts++
                                break
                            case 'incorrect':
                                qStat.incorrectAttempts++
                                break
                            case 'unattempted':
                                qStat.unattempted++
                                break
                        }
                    }
                })
            }
        })
        
        // Calculate question statistics
        Object.values(questionAnalysis).forEach(qStat => {
            if (qStat.totalAttempts > 0) {
                qStat.accuracy = parseFloat(((qStat.correctAttempts / qStat.totalAttempts) * 100).toFixed(2))
                qStat.difficultyIndex = 100 - qStat.accuracy
            }
        })
        
        // Prepare comprehensive student data
        const studentsData = enrolledStudents.map(enrolledStudent => {
            const studentId = enrolledStudent.student._id.toString()
            const performanceData = studentPerformanceMap.get(studentId)
            
            if (performanceData) {
                const result = performanceData.result
                const questionAnalysis = result.questionAnalysis || []
                const statistics = result.statistics || {}
                const subjectPerformance = result.subjectPerformance || []
                
                // Calculate detailed question statistics
                let correctAnswers = statistics.correctAnswers || 0
                let incorrectAnswers = statistics.incorrectAnswers || 0
                let unattempted = statistics.unattempted || 0
                let totalAttempted = statistics.totalQuestionsAttempted || 0
                let markedForReview = statistics.markedForReview || 0
                let changedAnswers = statistics.changedAnswers || 0
                let accuracy = statistics.accuracy || 0
                
                if (questionAnalysis.length > 0) {
                    correctAnswers = questionAnalysis.filter(q => q.status === 'correct' || q.status === 'partially_correct').length
                    incorrectAnswers = questionAnalysis.filter(q => q.status === 'incorrect').length
                    unattempted = questionAnalysis.filter(q => q.status === 'unattempted').length
                    totalAttempted = correctAnswers + incorrectAnswers
                    accuracy = totalAttempted > 0 ? parseFloat(((correctAnswers / totalAttempted) * 100).toFixed(2)) : 0
                }
                
                return {
                    id: studentId,
                    name: enrolledStudent.student.name,
                    email: enrolledStudent.student.email,
                    score: result.score || 0,
                    percentage: exam.totalMarks > 0 ? Math.round((result.score / exam.totalMarks) * 100 * 100) / 100 : 0,
                    rank: performanceData.rank,
                    percentile: performanceData.percentile,
                    status: 'completed',
                    timeSpent: result.timeTaken ? Math.round(result.timeTaken / 60) : null,
                    submittedAt: result.completedAt,
                    
                    // Detailed performance metrics
                    correctAnswers,
                    wrongAnswers: incorrectAnswers,
                    notAttempted: unattempted,
                    totalAttempted,
                    markedForReview,
                    changedAnswers,
                    accuracy,
                    
                    // Subject-wise performance
                    subjectPerformance: subjectPerformance.map(subject => ({
                        subject: subject.subject,
                        totalQuestions: subject.totalQuestions || 0,
                        attempted: subject.attempted || 0,
                        correct: subject.correct || 0,
                        incorrect: subject.incorrect || 0,
                        unanswered: subject.unanswered || 0,
                        marks: subject.marks || 0,
                        totalMarks: subject.totalMarks || 0,
                        percentage: subject.totalMarks > 0 ? Math.round((subject.marks / subject.totalMarks) * 100 * 100) / 100 : 0,
                        timeSpent: subject.timeSpent || 0,
                        accuracy: subject.accuracy || 0,
                        difficultyBreakdown: subject.difficultyBreakdown || {
                            easy: { attempted: 0, correct: 0 },
                            medium: { attempted: 0, correct: 0 },
                            hard: { attempted: 0, correct: 0 }
                        }
                    })),
                    
                    // Question analysis
                    questionAnalysis: questionAnalysis.map(question => ({
                        questionId: question.questionId?.toString(),
                        questionNumber: question.questionNumber || 0,
                        status: question.status,
                        marks: question.marks || 0,
                        userAnswer: question.userAnswer,
                        correctAnswer: question.correctAnswer,
                        timeTaken: question.timeTaken || 0,
                        subject: question.subject,
                        difficultyLevel: question.difficultyLevel
                    })),
                    
                    // Performance insights
                    performanceInsights: result.performanceInsights || {
                        strengths: [],
                        improvements: [],
                        recommendations: [],
                        performanceCategory: accuracy >= 90 ? 'Excellent' : 
                                           accuracy >= 75 ? 'Good' : 
                                           accuracy >= 60 ? 'Average' : 'Needs Improvement'
                    }
                }
            } else {
                // Student is enrolled but hasn't attempted the exam
                return {
                    id: studentId,
                    name: enrolledStudent.student.name,
                    email: enrolledStudent.student.email,
                    score: null,
                    percentage: null,
                    rank: null,
                    percentile: null,
                    status: 'registered',
                    timeSpent: null,
                    submittedAt: null,
                    correctAnswers: 0,
                    wrongAnswers: 0,
                    notAttempted: 0,
                    totalAttempted: 0,
                    markedForReview: 0,
                    changedAnswers: 0,
                    accuracy: 0,
                    subjectPerformance: [],
                    questionAnalysis: [],
                    performanceInsights: null
                }
            }
        })
        
        // Calculate percentile distribution
        const percentileDistribution = {
            top10: studentsWithPercentiles.filter(s => s.percentile >= 90).length,
            top25: studentsWithPercentiles.filter(s => s.percentile >= 75).length,
            top50: studentsWithPercentiles.filter(s => s.percentile >= 50).length,
            bottom50: studentsWithPercentiles.filter(s => s.percentile < 50).length,
            bottom25: studentsWithPercentiles.filter(s => s.percentile < 25).length,
            bottom10: studentsWithPercentiles.filter(s => s.percentile < 10).length
        }
        
        return {
            success: true,
            data: {
                // Exam Information
                examInfo: {
                    _id: exam._id.toString(),
                    examName: exam.examName,
                    examSubject: exam.examSubject,
                    stream: exam.stream,
                    standard: exam.standard,
                    totalMarks: exam.totalMarks,
                    passingMarks: exam.passingMarks,
                    examDurationMinutes: exam.examDurationMinutes,
                    totalQuestions: questions.length,
                    createdAt: exam.createdAt,
                    startTime: exam.startTime,
                    endTime: exam.endTime
                },
                
                // Comprehensive Statistics
                stats: {
                    totalRegistered,
                    totalAttempted,
                    totalCompleted,
                    totalPending: totalAttempted - totalCompleted,
                    participationRate: totalRegistered > 0 ? Math.round((totalAttempted / totalRegistered) * 100 * 100) / 100 : 0,
                    completionRate: totalAttempted > 0 ? Math.round((totalCompleted / totalAttempted) * 100 * 100) / 100 : 0,
                    
                    // Score Statistics
                    averageScore,
                    averagePercentage: exam.totalMarks > 0 ? Math.round((averageScore / exam.totalMarks) * 100 * 100) / 100 : 0,
                    medianScore,
                    medianPercentage: exam.totalMarks > 0 ? Math.round((medianScore / exam.totalMarks) * 100 * 100) / 100 : 0,
                    highestScore,
                    lowestScore,
                    standardDeviation: Math.round(standardDeviation * 100) / 100,
                    
                    // Time Statistics
                    averageTimeSpent,
                    
                    // Pass Statistics
                    passRate,
                    passedCount,
                    failedCount: totalAttempted - passedCount,
                    
                    // Distribution
                    scoreDistribution,
                    percentileDistribution
                },
                
                // Student Performance Data
                students: studentsData,
                
                // Subject Analysis
                subjectAnalysis,
                
                // Question Analysis
                questionAnalysis: Object.values(questionAnalysis),
                
                // Additional Analytics
                analytics: {
                    topPerformers: studentsWithPercentiles.slice(0, 5).map(s => ({
                        studentId: s.studentId,
                        name: s.result.student.name,
                        score: s.score,
                        percentage: exam.totalMarks > 0 ? Math.round((s.score / exam.totalMarks) * 100 * 100) / 100 : 0,
                        rank: s.rank,
                        percentile: s.percentile
                    })),
                    
                    needsAttention: studentsWithPercentiles
                        .filter(s => s.percentile < 25)
                        .slice(0, 5)
                        .map(s => ({
                            studentId: s.studentId,
                            name: s.result.student.name,
                            score: s.score,
                            percentage: exam.totalMarks > 0 ? Math.round((s.score / exam.totalMarks) * 100 * 100) / 100 : 0,
                            rank: s.rank,
                            percentile: s.percentile
                        })),
                    
                    difficultQuestions: Object.values(questionAnalysis)
                        .filter(q => q.accuracy < 50)
                        .sort((a, b) => a.accuracy - b.accuracy)
                        .slice(0, 5),
                    
                    easyQuestions: Object.values(questionAnalysis)
                        .filter(q => q.accuracy > 80)
                        .sort((a, b) => b.accuracy - a.accuracy)
                        .slice(0, 5)
                }
            }
        }
        
    } catch (error) {
        console.error('Error fetching comprehensive exam performance overview:', error)
        return {
            success: false,
            message: error.message || "Failed to fetch exam performance overview"
        }
    }
}

// Get time-based performance trends and analytics
export async function getPerformanceTrends(details, filters = {}) {
    try {
        await connectDB()
        
        // Get college info using token-based authentication
        const college = await collegeAuth(details)
        if (!college) {
            return {
                success: false,
                message: "College not authenticated"
            }
        }
        
        const collegeId = college._id
        
        // Set default time range if not provided (last 6 months)
        const endDate = filters.endDate ? new Date(filters.endDate) : new Date()
        const startDate = filters.startDate ? new Date(filters.startDate) : new Date(endDate.getTime() - (6 * 30 * 24 * 60 * 60 * 1000))
        
        // Build exam query
        let examQuery = { 
            college: collegeId,
            createdAt: { $gte: startDate, $lte: endDate }
        }
        if (filters.stream) examQuery.stream = filters.stream
        if (filters.standard) examQuery.standard = filters.standard
        
        // Get exams within the time range
        const exams = await Exam.find(examQuery)
            .select('_id examName examSubject stream standard totalMarks createdAt')
            .sort({ createdAt: 1 })
            .lean()
        
        if (exams.length === 0) {
            return {
                success: true,
                data: {
                    trends: {
                        daily: [],
                        weekly: [],
                        monthly: []
                    },
                    performance: {
                        overallTrend: 'stable',
                        trendPercentage: 0,
                        bestPeriod: null,
                        worstPeriod: null
                    },
                    insights: []
                }
            }
        }
        
        const examIds = exams.map(exam => exam._id)
        
        // Get exam results within the time range
        const examResults = await ExamResult.find({
            exam: { $in: examIds },
            completedAt: { $gte: startDate, $lte: endDate }
        }).populate('exam', 'examName totalMarks createdAt').lean()
        
        // Group results by time periods
        const dailyStats = {}
        const weeklyStats = {}
        const monthlyStats = {}
        
        examResults.forEach(result => {
            const date = new Date(result.completedAt)
            const dayKey = date.toISOString().split('T')[0] // YYYY-MM-DD
            const weekKey = getWeekKey(date)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            
            // Daily statistics
            if (!dailyStats[dayKey]) {
                dailyStats[dayKey] = {
                    date: dayKey,
                    totalAttempts: 0,
                    totalScore: 0,
                    totalMarks: 0,
                    averageScore: 0,
                    averagePercentage: 0
                }
            }
            dailyStats[dayKey].totalAttempts++
            dailyStats[dayKey].totalScore += result.score || 0
            dailyStats[dayKey].totalMarks += result.exam?.totalMarks || 0
            
            // Weekly statistics
            if (!weeklyStats[weekKey]) {
                weeklyStats[weekKey] = {
                    week: weekKey,
                    totalAttempts: 0,
                    totalScore: 0,
                    totalMarks: 0,
                    averageScore: 0,
                    averagePercentage: 0
                }
            }
            weeklyStats[weekKey].totalAttempts++
            weeklyStats[weekKey].totalScore += result.score || 0
            weeklyStats[weekKey].totalMarks += result.exam?.totalMarks || 0
            
            // Monthly statistics
            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = {
                    month: monthKey,
                    totalAttempts: 0,
                    totalScore: 0,
                    totalMarks: 0,
                    averageScore: 0,
                    averagePercentage: 0
                }
            }
            monthlyStats[monthKey].totalAttempts++
            monthlyStats[monthKey].totalScore += result.score || 0
            monthlyStats[monthKey].totalMarks += result.exam?.totalMarks || 0
        })
        
        // Calculate averages and percentages
        const calculateAverages = (stats) => {
            Object.values(stats).forEach(stat => {
                stat.averageScore = stat.totalAttempts > 0 ? 
                    Math.round((stat.totalScore / stat.totalAttempts) * 100) / 100 : 0
                stat.averagePercentage = stat.totalMarks > 0 ? 
                    Math.round((stat.totalScore / stat.totalMarks) * 100 * 100) / 100 : 0
            })
        }
        
        calculateAverages(dailyStats)
        calculateAverages(weeklyStats)
        calculateAverages(monthlyStats)
        
        // Convert to arrays and sort
        const dailyTrends = Object.values(dailyStats).sort((a, b) => new Date(a.date) - new Date(b.date))
        const weeklyTrends = Object.values(weeklyStats).sort((a, b) => a.week.localeCompare(b.week))
        const monthlyTrends = Object.values(monthlyStats).sort((a, b) => a.month.localeCompare(b.month))
        
        // Calculate overall performance trend
        const getPerformanceTrend = (trends) => {
            if (trends.length < 2) return { trend: 'stable', percentage: 0 }
            
            const firstHalf = trends.slice(0, Math.floor(trends.length / 2))
            const secondHalf = trends.slice(Math.floor(trends.length / 2))
            
            const firstHalfAvg = firstHalf.reduce((sum, t) => sum + t.averagePercentage, 0) / firstHalf.length
            const secondHalfAvg = secondHalf.reduce((sum, t) => sum + t.averagePercentage, 0) / secondHalf.length
            
            const change = secondHalfAvg - firstHalfAvg
            const changePercentage = firstHalfAvg > 0 ? Math.round((change / firstHalfAvg) * 100 * 100) / 100 : 0
            
            let trend = 'stable'
            if (Math.abs(changePercentage) > 5) {
                trend = changePercentage > 0 ? 'improving' : 'declining'
            }
            
            return { trend, percentage: changePercentage }
        }
        
        const performanceTrend = getPerformanceTrend(monthlyTrends)
        
        // Find best and worst performing periods
        const findBestWorstPeriods = (trends, periodType) => {
            if (trends.length === 0) return { best: null, worst: null }
            
            const sorted = [...trends].sort((a, b) => b.averagePercentage - a.averagePercentage)
            return {
                best: {
                    period: sorted[0][periodType],
                    averagePercentage: sorted[0].averagePercentage,
                    totalAttempts: sorted[0].totalAttempts
                },
                worst: {
                    period: sorted[sorted.length - 1][periodType],
                    averagePercentage: sorted[sorted.length - 1].averagePercentage,
                    totalAttempts: sorted[sorted.length - 1].totalAttempts
                }
            }
        }
        
        const bestWorstMonthly = findBestWorstPeriods(monthlyTrends, 'month')
        
        // Generate insights
        const insights = []
        
        if (performanceTrend.trend === 'improving') {
            insights.push(`Performance is improving with a ${Math.abs(performanceTrend.percentage)}% increase over the period`)
        } else if (performanceTrend.trend === 'declining') {
            insights.push(`Performance shows a declining trend with a ${Math.abs(performanceTrend.percentage)}% decrease`)
        } else {
            insights.push('Performance remains stable over the analyzed period')
        }
        
        if (bestWorstMonthly.best && bestWorstMonthly.worst) {
            const difference = bestWorstMonthly.best.averagePercentage - bestWorstMonthly.worst.averagePercentage
            if (difference > 10) {
                insights.push(`Significant performance variation detected: ${difference.toFixed(1)}% difference between best and worst months`)
            }
        }
        
        // Check for consistent improvement
        const recentTrends = monthlyTrends.slice(-3)
        if (recentTrends.length >= 3) {
            const isConsistentlyImproving = recentTrends.every((trend, index) => 
                index === 0 || trend.averagePercentage >= recentTrends[index - 1].averagePercentage
            )
            if (isConsistentlyImproving) {
                insights.push('Consistent improvement observed in recent months')
            }
        }
        
        return {
            success: true,
            data: {
                trends: {
                    daily: dailyTrends,
                    weekly: weeklyTrends,
                    monthly: monthlyTrends
                },
                performance: {
                    overallTrend: performanceTrend.trend,
                    trendPercentage: performanceTrend.percentage,
                    bestPeriod: bestWorstMonthly.best,
                    worstPeriod: bestWorstMonthly.worst
                },
                insights,
                timeRange: {
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                    totalDays: Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
                }
            }
        }
        
    } catch (error) {
        console.error('Error fetching performance trends:', error)
        return {
            success: false,
            message: error.message || "Failed to fetch performance trends"
        }
    }
}

// Helper function to get week key (YYYY-WNN format)
function getWeekKey(date) {
    const year = date.getFullYear()
    const startOfYear = new Date(year, 0, 1)
    const pastDaysOfYear = (date - startOfYear) / 86400000
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7)
    return `${year}-W${String(weekNumber).padStart(2, '0')}`
}

// Get available question selection schemes for an exam type
export async function getAvailableSchemes(examType) {
    try {
        await connectDB()
        
        const schemes = await QuestionSelectionScheme.find({
            examType: examType,
            isActive: true
        }).lean()
        
        return {
            success: true,
            data: schemes
        }
    } catch (error) {
        console.error('Error fetching schemes:', error)
        return {
            success: false,
            message: error.message || "Failed to fetch question selection schemes"
        }
    }
}

// Apply a question selection scheme to auto-select questions
export async function applyQuestionSelectionScheme(examId, schemeId) {
    try {
        await connectDB()
        
        // Get exam and scheme details
        const [exam, scheme] = await Promise.all([
            Exam.findById(examId),
            QuestionSelectionScheme.findById(schemeId)
        ])
        
        if (!exam) {
            return {
                success: false,
                message: "Exam not found"
            }
        }
        
        if (!scheme || !scheme.isActive) {
            return {
                success: false,
                message: "Question selection scheme not found or inactive"
            }
        }
        
        // Validate scheme is compatible with exam
        if (scheme.examType !== exam.stream) {
            return {
                success: false,
                message: `Scheme is for ${scheme.examType} but exam is for ${exam.stream}`
            }
        }
        
        const selectedQuestions = []
        const selectionSummary = []
        let totalSelected = 0
        
        // Process each subject rule in the scheme
        for (const rule of scheme.subjectRules) {
            const subjectResult = await selectQuestionsForSubjectRule(
                rule,
                exam.stream,
                exam.standard,
                exam.section,
                scheme.fallbackStrategy,
                scheme.minimumPoolSize
            )
            
            if (subjectResult.success) {
                selectedQuestions.push(...subjectResult.questions)
                totalSelected += subjectResult.questions.length
                selectionSummary.push({
                    subject: rule.subject,
                    requested: rule.totalQuestions,
                    selected: subjectResult.questions.length,
                    breakdown: subjectResult.breakdown
                })
            } else {
                return {
                    success: false,
                    message: `Failed to select questions for ${rule.subject}: ${subjectResult.message}`,
                    partialResults: selectionSummary
                }
            }
        }
        
        // Update scheme usage statistics
        await QuestionSelectionScheme.findByIdAndUpdate(schemeId, {
            $inc: { 
                'usageStats.timesUsed': 1,
                'usageStats.successfulApplications': totalSelected > 0 ? 1 : 0
            },
            $set: { 'usageStats.lastUsedAt': new Date() }
        })
        
        return {
            success: true,
            message: `Successfully selected ${totalSelected} questions using ${scheme.schemeName}`,
            data: {
                selectedQuestions: selectedQuestions.map(q => q._id.toString()),
                selectionSummary,
                totalSelected,
                schemeUsed: {
                    id: scheme._id,
                    name: scheme.schemeName,
                    totalRequested: scheme.totalSchemeQuestions
                }
            }
        }
        
    } catch (error) {
        console.error('Error applying question selection scheme:', error)
        return {
            success: false,
            message: error.message || "Failed to apply question selection scheme"
        }
    }
}

// Helper function to select questions for a specific subject rule
async function selectQuestionsForSubjectRule(rule, stream, examStandard, examSection, fallbackStrategy, minimumPoolSize) {
    const selectedQuestions = []
    const breakdown = {
        byDifficulty: { easy: 0, medium: 0, hard: 0 },
        byStandard: { '11': 0, '12': 0 },
        bySection: { sectionA: 0, sectionB: 0 }
    }
    
    try {
        // Check if rule is for specific standard only
        const isStandardSpecific = rule.standard === "11" || rule.standard === "12"
        
        // Check if all difficulty values are 0 (meaning no difficulty restrictions)
        const hasNoDifficultyRestriction = 
            rule.difficultyDistribution.easy === 0 && 
            rule.difficultyDistribution.medium === 0 && 
            rule.difficultyDistribution.hard === 0
        
        if (hasNoDifficultyRestriction) {
            // Select questions without difficulty restrictions
            // Use exam's standard if available, otherwise use rule's standard if specified
            let standardToUse = undefined
            if (examStandard === "11" || examStandard === "12") {
                standardToUse = examStandard
            } else if (isStandardSpecific) {
                standardToUse = rule.standard
            }
            
            const questions = await selectQuestionsByFilters({
                stream,
                subject: rule.subject,
                standard: standardToUse,
                difficultyLevel: undefined, // No difficulty restriction
                section: examSection,
                excludeIds: selectedQuestions.map(q => q._id),
                limit: rule.totalQuestions,
                fallbackStrategy,
                minimumPoolSize
            })
            
            selectedQuestions.push(...questions)
            
            // Update breakdown based on actual questions selected
            questions.forEach(q => {
                if (q.difficultyLevel) {
                    const diffKey = q.difficultyLevel.toLowerCase()
                    if (breakdown.byDifficulty[diffKey] !== undefined) {
                        breakdown.byDifficulty[diffKey] += 1
                    }
                }
                if (q.standard && breakdown.byStandard[q.standard]) {
                    breakdown.byStandard[q.standard] += 1
                }
            })
        } else {
            // Process each difficulty level (original logic with modifications)
            const difficulties = [
                { level: 'Easy', needed: rule.difficultyDistribution.easy },
                { level: 'Medium', needed: rule.difficultyDistribution.medium },
                { level: 'Hard', needed: rule.difficultyDistribution.hard }
            ]
            
            // Filter out difficulties with 0 needed (no restriction for that difficulty)
            const activeDifficulties = difficulties.filter(d => d.needed > 0)
            
            for (const difficulty of activeDifficulties) {
                // Check if this is a standard-specific rule
                if (isStandardSpecific) {
                    const questions = await selectQuestionsByFilters({
                        stream,
                        subject: rule.subject,
                        standard: rule.standard,
                        difficultyLevel: difficulty.level,
                        section: examSection,
                        excludeIds: selectedQuestions.map(q => q._id),
                        limit: difficulty.needed,
                        fallbackStrategy,
                        minimumPoolSize
                    })
                    
                    selectedQuestions.push(...questions)
                    breakdown.byDifficulty[difficulty.level.toLowerCase()] += questions.length
                    breakdown.byStandard[rule.standard] += questions.length
                } else {
                    // If exam has a specific standard, use that; otherwise distribute by standard
                    if (examStandard === "11" || examStandard === "12") {
                        // Exam is for a specific standard, only select from that standard
                        const questions = await selectQuestionsByFilters({
                            stream,
                            subject: rule.subject,
                            standard: examStandard,
                            difficultyLevel: difficulty.level,
                            section: examSection,
                            excludeIds: selectedQuestions.map(q => q._id),
                            limit: difficulty.needed,
                            fallbackStrategy,
                            minimumPoolSize
                        })
                        
                        selectedQuestions.push(...questions)
                        breakdown.byDifficulty[difficulty.level.toLowerCase()] += questions.length
                        breakdown.byStandard[examStandard] += questions.length
                    } else {
                        // No specific exam standard, distribute by rule's standard distribution
                        const std11Needed = Math.round((rule.standard11Questions / rule.totalQuestions) * difficulty.needed)
                        const std12Needed = difficulty.needed - std11Needed
                        
                        // Select from standard 11
                        if (std11Needed > 0) {
                            const std11Questions = await selectQuestionsByFilters({
                                stream,
                                subject: rule.subject,
                                standard: "11",
                                difficultyLevel: difficulty.level,
                                section: examSection,
                                excludeIds: selectedQuestions.map(q => q._id),
                                limit: std11Needed,
                                fallbackStrategy,
                                minimumPoolSize
                            })
                            
                            selectedQuestions.push(...std11Questions)
                            breakdown.byDifficulty[difficulty.level.toLowerCase()] += std11Questions.length
                            breakdown.byStandard['11'] += std11Questions.length
                        }
                    
                        // Select from standard 12
                        if (std12Needed > 0) {
                            const std12Questions = await selectQuestionsByFilters({
                                stream,
                                subject: rule.subject,
                                standard: "12",
                                difficultyLevel: difficulty.level,
                                section: examSection,
                                excludeIds: selectedQuestions.map(q => q._id),
                                limit: std12Needed,
                                fallbackStrategy,
                                minimumPoolSize
                            })
                            
                            selectedQuestions.push(...std12Questions)
                            breakdown.byDifficulty[difficulty.level.toLowerCase()] += std12Questions.length
                            breakdown.byStandard['12'] += std12Questions.length
                        }
                    }
                }
            }
        }
        
        return {
            success: true,
            questions: selectedQuestions,
            breakdown
        }
        
    } catch (error) {
        return {
            success: false,
            message: error.message,
            questions: selectedQuestions,
            breakdown
        }
    }
}

// Helper function to select questions by specific filters with fallback strategy
async function selectQuestionsByFilters({ 
    stream, 
    subject, 
    standard, 
    difficultyLevel, 
    section, 
    excludeIds = [], 
    limit, 
    fallbackStrategy, 
    minimumPoolSize 
}) {
    const baseQuery = {
        stream,
        subject,
        _id: { $nin: excludeIds }
    }
    
    // Build query based on provided filters
    let query = { ...baseQuery }
    
    // Only add filters if they are defined and not meant to be unrestricted
    if (standard !== undefined) {
        query.standard = standard
    }
    
    if (difficultyLevel !== undefined) {
        query.difficultyLevel = difficultyLevel
    }
    
    if (section && (section === 'Section A' || section === 'Section B' || section === 1 || section === 2)) {
        query.section = section === 'Section A' ? 1 : section === 'Section B' ? 2 : section
    }
    
    let questions = await master_mcq_question.find(query).limit(limit).lean()
    
    // Apply fallback strategy if not enough questions found
    if (questions.length < Math.min(limit, minimumPoolSize)) {
        switch (fallbackStrategy) {
            case 'RELAX_DIFFICULTY':
                // Remove difficulty constraint
                delete query.difficultyLevel
                questions = await master_mcq_question.find(query).limit(limit).lean()
                break
                
            case 'RELAX_STANDARD':
                // Remove standard constraint
                delete query.standard
                questions = await master_mcq_question.find(query).limit(limit).lean()
                break
                
            case 'RELAX_TOPIC':
                // Remove section constraint
                delete query.section
                questions = await master_mcq_question.find(query).limit(limit).lean()
                break
                
            case 'MANUAL_SELECTION':
                // Return partial results for manual selection
                break
        }
    }
    
    return questions
}

// Get scheme validation status for current selections
export async function validateSchemeCompliance(examId, schemeId, currentSelections = []) {
    try {
        await connectDB()
        
        const [exam, scheme] = await Promise.all([
            Exam.findById(examId),
            QuestionSelectionScheme.findById(schemeId)
        ])
        
        if (!exam || !scheme) {
            return {
                success: false,
                message: "Exam or scheme not found"
            }
        }
        
        // Get details of currently selected questions
        const selectedQuestions = await master_mcq_question.find({
            _id: { $in: currentSelections }
        }).lean()
        
        const validation = {
            isCompliant: true,
            subjectValidation: [],
            totalValidation: {
                required: scheme.totalSchemeQuestions,
                selected: selectedQuestions.length,
                difference: selectedQuestions.length - scheme.totalSchemeQuestions
            }
        }
        
        // Validate each subject rule
        for (const rule of scheme.subjectRules) {
            const subjectQuestions = selectedQuestions.filter(q => q.subject === rule.subject)
            const subjectValidation = {
                subject: rule.subject,
                isCompliant: true,
                errors: [],
                warnings: [],
                breakdown: {
                    total: {
                        required: rule.totalQuestions,
                        selected: subjectQuestions.length,
                        difference: subjectQuestions.length - rule.totalQuestions
                    },
                    byDifficulty: {},
                    byStandard: {}
                }
            }
            
            // Check difficulty distribution
            const diffCounts = { easy: 0, medium: 0, hard: 0 }
            subjectQuestions.forEach(q => {
                const level = (q.difficultyLevel || 'Easy').toLowerCase()
                if (diffCounts[level] !== undefined) diffCounts[level]++
            })
            
            ['easy', 'medium', 'hard'].forEach(level => {
                const required = rule.difficultyDistribution[level]
                const selected = diffCounts[level]
                subjectValidation.breakdown.byDifficulty[level] = {
                    required,
                    selected,
                    difference: selected - required
                }
                
                if (selected !== required) {
                    subjectValidation.isCompliant = false
                    subjectValidation.errors.push(
                        `${level.charAt(0).toUpperCase() + level.slice(1)}: need ${required}, have ${selected}`
                    )
                }
            })
            
            // Check standard distribution
            const stdCounts = { '11': 0, '12': 0 }
            subjectQuestions.forEach(q => {
                if (stdCounts[q.standard]) stdCounts[q.standard]++
            })
            
            ['11', '12'].forEach(std => {
                const required = std === '11' ? rule.standard11Questions : rule.standard12Questions
                const selected = stdCounts[std]
                subjectValidation.breakdown.byStandard[std] = {
                    required,
                    selected,
                    difference: selected - required
                }
                
                if (selected !== required) {
                    subjectValidation.isCompliant = false
                    subjectValidation.errors.push(
                        `Class ${std}: need ${required}, have ${selected}`
                    )
                }
            })
            
            if (!subjectValidation.isCompliant) {
                validation.isCompliant = false
            }
            
            validation.subjectValidation.push(subjectValidation)
        }
        
        return {
            success: true,
            data: validation
        }
        
    } catch (error) {
        console.error('Error validating scheme compliance:', error)
        return {
            success: false,
            message: error.message || "Failed to validate scheme compliance"
        }
    }
}

// Get student exam history for college
export async function getStudentExamHistory(details, studentId, searchQuery = '', page = 1, limit = 5) {
    try {
        await connectDB()
        
        // Get college info using token-based authentication
        const college = await collegeAuth(details)
        if (!college) {
            return {
                success: false,
                message: "College not authenticated",
                data: []
            }
        }
        
        // Get student to verify they belong to this college
        const enrolledStudent = await EnrolledStudent.findOne({
            student: studentId,
            college: college._id,
            status: 'approved'
        }).populate('student', 'name email')
        
        if (!enrolledStudent) {
            return {
                success: false,
                message: "Student not found or not enrolled in this college",
                data: []
            }
        }
        
        // Build search query for exams if search term is provided
        let examMatchQuery = { 
            college: college._id,
            examAvailability: 'scheduled'  // Only show scheduled exams
        }
        if (searchQuery && searchQuery.trim()) {
            examMatchQuery.examName = { 
                $regex: searchQuery.trim(), 
                $options: 'i' 
            }
        }
        
        // First get all matching results to calculate total count
        const allExamResults = await ExamResult.find({ 
            student: studentId 
        })
        .populate({
            path: 'exam',
            match: examMatchQuery,
            select: 'examName examSubject stream standard startTime endTime examDurationMinutes totalMarks'
        })
        .sort({ completedAt: -1 })
        .lean()
        
        // Filter out results where exam is null (not from this college or not matching search)
        const allCollegeExamResults = allExamResults.filter(result => result.exam !== null)
        const totalResults = allCollegeExamResults.length
        
        // Apply pagination
        const skip = (page - 1) * limit
        const paginatedResults = allCollegeExamResults.slice(skip, skip + limit)
        
        // Format the data for the frontend
        const examHistory = paginatedResults.map(result => {
            const exam = result.exam
            const percentage = exam.totalMarks > 0 ? ((result.score / exam.totalMarks) * 100).toFixed(2) : 0
            
            return {
                examId: exam._id.toString(),
                examName: exam.examName,
                date: result.completedAt.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }),
                time: result.completedAt.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }),
                duration: `${exam.examDurationMinutes} min`,
                score: parseFloat(percentage),
                marksScored: result.score,
                totalMarks: exam.totalMarks,
                status: percentage >= 40 ? 'passed' : 'failed',
                correct: result.statistics?.correctAnswers || 0,
                incorrect: result.statistics?.incorrectAnswers || 0,
                unattempted: result.statistics?.unattempted || 0,
                timeTaken: result.timeTaken,
                rank: result.comparativeStats?.rank || null,
                subjects: result.subjectPerformance?.map(subject => ({
                    name: subject.subject,
                    marks: subject.marks || 0,
                    totalMarks: subject.totalMarks || 0
                })) || [],
                stream: exam.stream,
                standard: exam.standard,
                completedAt: result.completedAt
            }
        })
        
        return {
            success: true,
            data: examHistory,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalResults / limit),
                totalResults: totalResults,
                limit: limit,
                hasNext: page < Math.ceil(totalResults / limit),
                hasPrev: page > 1
            },
            studentInfo: {
                name: enrolledStudent.student.name,
                email: enrolledStudent.student.email
            }
        }
        
    } catch (error) {
        console.error('Error fetching student exam history:', error)
        return {
            success: false,
            message: error.message || "Failed to fetch student exam history",
            data: []
        }
    }
}


