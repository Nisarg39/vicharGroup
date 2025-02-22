// example middleware
// export default function withMiddleware(handler) {
//     return async (formData) => {
//       // Pre-processing middleware logic
//       console.log('Middleware: Request started' + formData)
      
//       // Validate request
//       if (!formData) {
//         return {
//           success: false,
//           message: 'Invalid request data'
//         }
//       }
  
//       // Execute the original handler. Handler means server_actions/actions/studentActions.js
//       const result = await handler(formData)
  
//       // Post-processing middleware logic
//       console.log('Middleware: Request completed')
  
//       return result
//     }
// }

"use server"

import jwt from "jsonwebtoken"
import Student from "../models/student"


export async function verifyOtpMiddleware(handler){
    // console.log(handler)
    try {
        const student = await Student.findOne({phone: handler.mobile, otp: handler.otp})
        if (!student) {
            return {
                success: false,
                message: "Student Not Found"
            }
        }else{
            const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
            student.otp = null
            student.save()
            return {
                success: true,
                message: "Student Verified",
                student: student
            }
        }
    } catch (error) {
        return {
            success: false,
            message: "Student Verification Failed"
        }
    }
}

export async function verifyStudentMiddleware(handler){
    try {   
        const student = await Student.findOne({token: handler})
        if (!student) {
            return {
                success: false,
                message: "Student Not Found",
                student: null
            }
        }
        return {
            success: true,
            message: "Student Verified",
            student: student
        }
    }catch (error) {
        return {
            success: false,
            message: "Student Verification Failed",
            student: null
        }
    }
}