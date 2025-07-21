"use server"
import { connectDB } from "../../config/mongoose"
import College from "../../models/exam_portal/college"
import TeacherExam from "../../models/exam_portal/teacherExam"
import Exam from "../../models/exam_portal/exam"
import master_mcq_question from "../../models/exam_portal/master_mcq_question"
import Student from "../../models/student"
import StudentRequest from "../../models/exam_portal/studentRequest"
import EnrolledStudent from "../../models/exam_portal/enrolledStudent"
import CollegeTeacher from "../../models/exam_portal/collegeTeacher"
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
        if (filteredUpdateData.startTime) {
            filteredUpdateData.startTime = new Date(filteredUpdateData.startTime)
        }
        if (filteredUpdateData.endTime) {
            filteredUpdateData.endTime = new Date(filteredUpdateData.endTime)
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
        enrolledStudent = await EnrolledStudent.create({
            student: details.studentId,
            college: details.collegeId,
            allocatedSubjects: details.allocatedSubject,
            class: details.class
        })
        const college = await College.findById(details.collegeId)
        const student = await Student.findById(details.studentId)
        const studentRequest = await StudentRequest.deleteOne({college: details.collegeId, student: details.studentId})
        student.college = college._id
        college.studentRequests.push(studentRequest._id)
        studentRequest.status = 'approved'
        college.enrolledStudents.push(enrolledStudent._id)
        await college.save()
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
            enrolledStudent: enrolledStudent
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
        const updatedStudent = await EnrolledStudent.findByIdAndUpdate(
            studentId,
            {
                class: updateData.class,
                allocatedSubjects: updateData.allocatedSubjects,
            },
            { new: true, runValidators: true }
        ).populate('student', 'name email').lean()

        if (!updatedStudent) {
            return {
                success: false,
                message: "Student not found"
            }
        }

        // Update request status if provided
        if (updateData.requestStatus) {
            await StudentRequest.findOneAndUpdate(
                { student: updatedStudent.student._id },
                { status: updateData.requestStatus },
                { new: true }
            ).lean()
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