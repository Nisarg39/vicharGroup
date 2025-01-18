"use server" 
import { connectDB } from "../config/mongoose"
import Student from "../models/student";
import { verifyOtpMiddleware, verifyStudentMiddleware } from '../middleware/studentAuth'
import jwt from 'jsonwebtoken'

export async function sendOtp(phone){
    // console.log(phone)  
    try {
        await connectDB()
        const student = await Student.findOne({phone: phone})   
        if(!student){
           const studentOtp = Math.floor(1000 + Math.random() * 9000)
           const newStudent = new Student({ 
                phone: phone, 
                otp: studentOtp,
            })
            const token = jwt.sign({ id: newStudent._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
            newStudent.token = token
            newStudent.save()
            return{
                message: "OTP sent successfully",
                success: true,
                token: token
            }
        }else{
            student.otp = Math.floor(1000 + Math.random() * 9000)
            const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
            student.token = token
            await student.save()
            return{
                message: "OTP sent successfully",
                success: true,
                token: token,
            }
        }
    } catch (error) {
        return {
            message: "Error finding student",
            success: false,
        }
    }
}

export async function verifyOtp(data) {
    await connectDB()
    // console.log(data)
    const middleware = await verifyOtpMiddleware(data)
    
   if(middleware.success){

    // made a different object because there was an error saying cannot pass plain object
    const student = {
        id: middleware.student._id.toString(),
        phone: middleware.student.phone,
        otp: middleware.student.otp,
        isVerified: middleware.student.isVerified,
        token: middleware.student.token,
        createdAt: middleware.student.createdAt.toString(),
        updatedAt: middleware.student.updatedAt.toString()
    }
    return {
            message: "OTP verified successfully",
            success: true,
            student: student
        }
    }else{
        return {
            message: "OTP verification failed",
            success: false,
            student: null
        }
    }
}
export async function getStudentDetails(token){
    await connectDB()
    const middleware = await verifyStudentMiddleware(token)
    console.log(middleware)
    const student = {
        id: middleware.student._id.toString(),
        phone: middleware.student.phone,
        otp: middleware.student.otp,
        isVerified: middleware.student.isVerified,
        token: middleware.student.token,
        createdAt: middleware.student.createdAt.toString(),
        updatedAt: middleware.student.updatedAt.toString()
    }
    if(middleware.success){
        return {
            message: "Student details fetched successfully",
            success: true,
            student: student
        }
    }else{
        return {
            message: "Student details fetching failed",
            success: false,
            student: null
        }
    }
}

export async function mandatoryDetails(data){
    // console.log(data)
    await connectDB()
    const middleware = await verifyStudentMiddleware(data.token)
    if(middleware.success){
        const student = await Student.findById(middleware.student._id)
        student.name = data.name
        student.email = data.email
        student.isVerified = true
        await student.save()

        // made a different object because there was an error saying cannot pass plain object
        const studentObject = {
            id: middleware.student._id.toString(),
            phone: middleware.student.phone,
            otp: middleware.student.otp,
            isVerified: middleware.student.isVerified,
            token: middleware.student.token,
            createdAt: middleware.student.createdAt.toString(),
            updatedAt: middleware.student.updatedAt.toString()
        }
        return {
            message: "Mandatory details updated successfully",
            success: true,
            student: studentObject
        }
    }else{
        return {
            message: "Mandatory details updating failed",
            success: false,
        }
    }
}
