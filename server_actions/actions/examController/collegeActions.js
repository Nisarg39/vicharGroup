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
import NegativeMarkingRule from "../../models/exam_portal/negativeMarkingRule"
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
        
        // Get default negative marking if not provided
        let negativeMarks = examData.negativeMarks
        if (negativeMarks === undefined || negativeMarks === null) {
            const defaultNegativeMarking = await getDefaultNegativeMarking(
                collegeId, 
                examData.stream, 
                examData.standard, 
                examData.examSubject?.[0] // Use first subject if multiple
            )
            negativeMarks = defaultNegativeMarking.negativeMarks || 0
        }
        
        // Create a plain object for the exam
        const examDoc = {
            ...examData,
            startTime: examData.examAvailability === 'scheduled' ? examData.startTime : null,
            endTime: examData.examAvailability === 'scheduled' ? examData.endTime : null,
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
                console.log('Upcoming Exams Query:', JSON.stringify(query));
                console.log('Upcoming Exams Sort:', JSON.stringify(sortOptions));
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
            console.log('Found Upcoming Exams:', exams.map(e => ({ examName: e.examName, startTime: e.startTime })));
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

// Negative Marking Rules Management

export async function createNegativeMarkingRule(ruleData, collegeId) {
    try {
        await connectDB()
        
        const rule = await NegativeMarkingRule.create({
            ...ruleData,
            college: collegeId
        })
        
        // Add rule to college's negativeMarkingRules array
        await College.findByIdAndUpdate(
            collegeId,
            { $push: { negativeMarkingRules: rule._id } }
        )

        return {
            success: true,
            message: "Negative marking rule created successfully",
            rule: JSON.stringify(rule)
        }
    } catch (error) {
        console.error("Error creating negative marking rule:", error)
        return {
            success: false,
            message: error.message || "Failed to create negative marking rule"
        }
    }
}

export async function getNegativeMarkingRules(collegeId) {
    try {
        await connectDB()
        
        const rules = await NegativeMarkingRule.find({ 
            college: collegeId, 
            isActive: true 
        }).sort({ stream: 1, standard: 1, subject: 1 })

        return {
            success: true,
            rules: JSON.stringify(rules)
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

export async function updateNegativeMarkingRule(ruleId, updateData, collegeId) {
    try {
        await connectDB()
        
        const rule = await NegativeMarkingRule.findOneAndUpdate(
            { _id: ruleId, college: collegeId },
            updateData,
            { new: true, runValidators: true }
        )

        if (!rule) {
            return {
                success: false,
                message: "Rule not found or access denied"
            }
        }

        return {
            success: true,
            message: "Negative marking rule updated successfully",
            rule: JSON.stringify(rule)
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

export async function deleteNegativeMarkingRule(ruleId, collegeId) {
    try {
        await connectDB()
        
        const rule = await NegativeMarkingRule.findOneAndUpdate(
            { _id: ruleId, college: collegeId },
            { isActive: false },
            { new: true }
        )

        if (!rule) {
            return {
                success: false,
                message: "Rule not found or access denied"
            }
        }

        // Remove from college's negativeMarkingRules array
        await College.findByIdAndUpdate(
            collegeId,
            { $pull: { negativeMarkingRules: ruleId } }
        )

        return {
            success: true,
            message: "Negative marking rule deleted successfully"
        }
    } catch (error) {
        return {
            success: false,
            message: error.message
        }
    }
}

export async function getDefaultNegativeMarking(collegeId, stream, standard, subject) {
    try {
        await connectDB()
        
        // Find the most specific rule that matches
        const rules = await NegativeMarkingRule.find({
            college: collegeId,
            stream: stream,
            isActive: true,
            $or: [
                // Exact match for subject-specific rules
                { standard: standard, subject: subject },
                // Standard-specific rules (no subject)
                { standard: standard, subject: { $in: [null, undefined] } },
                // Stream-wide rules (no standard or subject)
                { standard: { $in: [null, undefined] }, subject: { $in: [null, undefined] } }
            ]
        }).sort({ priority: -1 })

        if (rules.length > 0) {
            return {
                success: true,
                negativeMarks: rules[0].negativeMarks,
                description: rules[0].description
            }
        }

        // Fallback to college global default
        const college = await College.findById(collegeId)
        return {
            success: true,
            negativeMarks: college.globalNegativeMarks || 0,
            description: "Global college default"
        }
    } catch (error) {
        return {
            success: false,
            message: error.message,
            negativeMarks: 0
        }
    }
}