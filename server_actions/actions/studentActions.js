"use server" 
import { connectDB } from "../config/mongoose"
import Student from "../models/student";
import Products from "../models/products";
import CouponCode from "../models/couponCode";
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
    // console.log(middleware)
    if(middleware.success){
        const student = {
            name: middleware.student.name || null,
            email: middleware.student.email || null,
            id: middleware.student._id.toString(),
            phone: middleware.student.phone || null,
            otp: middleware.student.otp || null,
            isVerified: middleware.student.isVerified || false,
            token: middleware.student.token || null,
            interestedInProduct: middleware.student.interestedInProduct || [],
            address: middleware.student.address || null,
            area: middleware.student.area || null,
            city: middleware.student.city || null,
            state: middleware.student.state || null,
            gender: middleware.student.gender || null,
            dob: middleware.student.dob || null,
            referralCode: middleware.student.referralCode || null,
            createdAt: middleware.student.createdAt.toString(),
            updatedAt: middleware.student.updatedAt.toString()
        }
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
        student.referralCode = `${data.name.slice(0, 3)}${Math.floor(1000 + Math.random() * 9000)}`
        await student.save()

        // made a different object because there was an error saying cannot pass plain object
        const studentObject = {
            id: student._id.toString(),
            phone: student.phone,
            otp: student.otp,
            isVerified: student.isVerified,
            token: student.token,
            createdAt: student.createdAt.toString(),
            updatedAt: student.updatedAt.toString()
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

export async function addToCart(data) {
  await connectDB();
  const middleware = await verifyStudentMiddleware(data.token);
  if (middleware.success) {
    const product = await Products.findById(data.productId);
    const student = await Student.findById(middleware.student._id);
    if (student.cart.includes(product._id)) {
      return {
        message: "Product already in cart",
        success: false,
      };
    } else {
      student.cart.push(product._id);
      await student.save();
      return {
        message: "Product added to cart successfully",
        success: true,
      };
    }
  } else {
    return {
      message: "Product adding to cart failed",
      success: false,
    };
  }
}

export async function updateStudentDetails(data){
    await connectDB()
    const middleware = await verifyStudentMiddleware(data.token)
    if(middleware.success){
        const student = await Student.findById(middleware.student._id)
        // checking duplicate key error on phone and sending response
        if(data.phone && !student.phone){
            const studentWithSamePhone = await Student.findOne({phone: data.phone})
            if(studentWithSamePhone){
                return {
                    message: "Phone number already exists",
                    success: false,
                }
            }
        }
        if(data.referralCode) student.referralCode =  `${student.name.slice(0, 3)}${Math.floor(1000 + Math.random() * 9000)}`
        if(data.name) student.name = data.name
        if(data.email) student.email = data.email
        if(data.address) student.address = data.address
        if(data.area) student.area = data.area
        if(data.city) student.city = data.city
        if(data.state) student.state = data.state
        if(data.gender) student.gender = data.gender
        if(data.dob) student.dob = data.dob
        if(data.phone) student.phone = data.phone
        student.isVerified = true

        await student.save()
        return {
            message: "Student details updated successfully",
            success: true,
        }
    }else{
        return {
            message: "Student details updating failed",
            success: false,
        }
    }
}

export async function verifyCouponCode(data) {
  try {
    await connectDB();
    const middleware = await verifyStudentMiddleware(data.token);
    if (middleware.success) {
      const student = await Student.findOne({ referralCode: data.couponCode });
      if (student) {
        if (middleware.student.referralCode !== data.couponCode) {
          const coupon = {
            couponCode: student.referralCode,
            discountAmount: 500,
            expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
            status: "active",
            usedCount: 0,
            description: `${student.name} has referred you`,
          };
          return {
            message: "Coupon code verified successfully",
            coupon: coupon,
            success: true,
          };
        } else {
          return {
            message: "You cannot use your own referral code",
            success: false,
          };
        }
      } else {
        const coupon = await CouponCode.findOne({couponCode: data.couponCode})
        if(coupon){
            return({
                message: "Coupon code verified successfully",
                coupon: coupon,
                success: true,
            })
        }else{
            return({
                message: "No Referral or Coupon Code Found",
                success: false,
            })
        }
      }
    } else {
      return {
        message: "Coupon code verification failed",
        success: false,
      };
    }
  } catch (error) {
    return {
      message: "Error verifying coupon code",
      success: false,
    };
  }
}

