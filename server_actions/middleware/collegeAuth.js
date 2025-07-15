"use server"
import College from "../models/exam_portal/college"
import Exam from "../models/exam_portal/exam"
import EnrolledStudent from "../models/exam_portal/enrolledStudent"
import CollegeTeacher from "../models/exam_portal/collegeTeacher"
import { connectDB } from "../config/mongoose"

export async function collegeAuth(details) {
    try {
        await connectDB()
        // the exams field is an array of exam ids. but im still geting empty array
        const college = await College.findOne({ token: details.token }).populate({
            path: "enrolledStudents",
            populate: {
                path: "student",
                model: "Student",
            }
        }).populate({
            path: "collegeTeachers",
            model: "CollegeTeacher",
        }).lean()

        if (college) {
            return college
        } else {
            return null
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error"
        }
    }
}