"use server"
import College from "../models/exam_portal/college"
import { connectDB } from "../config/mongoose"

export async function collegeAuth(details) {
    try {
        await connectDB()
        const college = await College.findOne({token: details.token})
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