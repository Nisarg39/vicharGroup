"use server"
import { connectDB } from "../config/mongoose";
import Student from "../models/student";
import jwt from "jsonwebtoken"

// This signInGoogle function is called by api/auth/[...nextAuth]/route.js to store user data
export async function signInGoogle(details){
   try {
        await connectDB()
        const student = await Student.findOne({email: details.email})
        if (student) {
            const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
            student.token = token
            await student.save()
            return {
                success: true,
                message: "Student Verified",
                token : token
            }
        }
        if (!student) {
            const newStudent = new Student({
                email: details.email,
                name: details.name,
            })
            const token = jwt.sign({ id: newStudent._id }, process.env.JWT_SECRET, { expiresIn: '30d' })
            newStudent.token = token
            await newStudent.save()
            if(newStudent){
                console.log("New Student Created")
            }
            return {
                success: true,
                message: "Student Verified",
                token : token
            }
        }
    } catch (error) {
        return {
            success: false,
            message: "Student Verification Failed"
        }
    }
}

// This function is called to verify that user's detail stored by above function by useEffect in the client side when session is given by google callback
export async function validateGoogleSignIn(data) {
  try {
    await connectDB();
    if (data) {
      const student = await Student.findOne({ email: data.user.email });
      if (student) {
        const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
          expiresIn: "30d",
        });
        student.token = token;
        student.isVerified = true;
        await student.save();
        return {
          message: "Student Verified",
          success: true,
          student: student,
        };
      } else {
        return {
          message: "Student Not Found, Google Verification Failed",
          success: false,
          student: null,
        };
      }
    } else {
      return {
        message: "Verification Failed",
        success: false,
        student: null,
      };
    }
  } catch (error) {
    return {
      message: "Verification Failed",
      success: false,
      student: null,
    };
  }
}