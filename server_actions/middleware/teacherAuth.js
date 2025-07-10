"use server"

import jwt from "jsonwebtoken"
import TeacherExam from "../models/exam_portal/teacherExam"
import { connectDB } from "../config/mongoose"

export async function verifyTeacherAuth(handler){
    try {
        await connectDB()
        const teacher = await TeacherExam.findOne({token: handler.token})
        if (teacher) {
            return teacher
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