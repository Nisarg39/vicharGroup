"use server"

import { verifyTeacherAuth } from "../../middleware/teacherAuth";
import { connectDB } from "../../config/mongoose"
import TeacherExam from "../../models/exam_portal/teacherExam"
import jwt from "jsonwebtoken"

export async function teacherLogin(details) {
    // console.log(details.email)
    try {
        await connectDB()
        const teacher = await TeacherExam.findOne({email: details.email, password: details.password})
        if (teacher) {
            const token = jwt.sign({id: teacher._id}, process.env.JWT_SECRET, {expiresIn: "30d"})
            teacher.token = token
            await teacher.save()
            return {
                success: true,
                message: "Teacher Logged In",
                teacher: teacher
            }
        } else {
            return {
                success: false,
                message: "Teacher Not Found"
            }
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error"
        }
    }
}

export async function getTeacherDetails(details){
    try {
        const verifyTeacher = await verifyTeacherAuth(details)
        if (verifyTeacher) {
            return {
                success: true,
                message: "Teacher Found",
                teacher: verifyTeacher
            }
        } else {
            return {
                success: false,
                message: "Teacher Not Found"
            }
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error"
        }
    }
}
