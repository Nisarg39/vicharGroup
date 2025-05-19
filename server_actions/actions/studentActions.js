"use server" 
import { connectDB } from "../config/mongoose"
import Student from "../models/student";
import Products from "../models/products";
import CouponCode from "../models/couponCode";
import Payment from "../models/payment";
import Subject from "../models/subject";
import Chapter from "../models/chapter";
import Lecture from "../models/lecture";
import Dpp from "../models/dpp";
import Exercise from "../models/exercise";
import Teacher from "../models/teacher";
import DppQuestion from "../models/dppQuestion";
import Segment from "../models/segment";
import Referral from "../models/referral";
import Razorpay_Info from "../models/razorpay_info";
import { verifyOtpMiddleware, verifyStudentMiddleware } from '../middleware/studentAuth'
import jwt from 'jsonwebtoken'
import { model } from "mongoose";
import path from "path";

export async function sendOtp(phone){  
    try {
        await connectDB()
        const student = await Student.findOne({phone: phone})   
        if(!student){
           const studentOtp = Math.floor(1000 + Math.random() * 9000)
           const newStudent = new Student({ 
                phone: phone, 
                otp: studentOtp,
            })
            // console.log(studentOtp)

            // sending otp to student using fast2sms api
            await fetch('https://www.fast2sms.com/dev/bulkV2', {
                method: 'POST',
                headers: {
                    'authorization': process.env.FAST2SMS_API_KEY
                },
                body: new URLSearchParams({
                    'variables_values': studentOtp.toString(),
                    'route': 'otp',
                    'numbers': newStudent.phone
                })
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
            // console.log(student.otp)
            await fetch('https://www.fast2sms.com/dev/bulkV2', {
                method: 'POST',
                headers: {
                    'authorization': process.env.FAST2SMS_API_KEY
                },
                body: new URLSearchParams({
                    'variables_values': student.otp.toString(),
                    'route': 'otp',
                    'numbers': phone
                })
            })
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
    const student = await Student.findOne({token: token}).populate([
        {
            path: "purchases",
            populate: {
                path: "product",
                model: "Products",
                select: "name price discountPrice duration pageParameters class type image subjects",
                populate: {
                    path: "subjects",
                    model: "Subject",
                    select: "name image chapters",
                    populate: {
                        path: "chapters",
                        model: "Chapter",
                        select: "image chapterName lectures dpps exercises",
                    }
                }
            }
        },
        {
            path: "cart",
            model: "Products",
            select: "name price discountPrice duration pageParameters class type image"
        }
    ])
    .lean()
    
    if(student){
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
        
        // Check for duplicate email
        const studentWithSameEmail = await Student.findOne({email: data.email})
        if(studentWithSameEmail){
            return {
                message: "Email already exists",
                success: false,
            }
        }
        
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
            couponType: "referral",
            success: true,
          };
        } else {
          return {
            message: "You cannot use your own referral code",
            success: false,
          };
        }
      } else {
        const coupon = await CouponCode.findOne({couponCode: data.couponCode, status: "active"})
        if(coupon){
            return({
                message: "Coupon code verified successfully",
                coupon: coupon,
                couponType: "coupon",
                success: true,
            })
        }else{
            
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

export async function productPurchase(data){
    try {
        await connectDB()
        const middleware = await verifyStudentMiddleware(data.token)
        if(middleware.success){
            const student = await Student.findById(middleware.student._id)
            const product = await Products.findById(data.productId)
            // razorpay info logic
            const razorpay_info = await Razorpay_Info.create({
                razorpay_order_id: data.razorpay_order_id,
                razorpay_payment_id: data.razorpay_payment_id,
                razorpay_signature: data.razorpay_signature,
            })

            // referral and coupon code logic
            let referral;
            if(data.couponType === "referral" ){
                const refferedByStudent = await Student.findOne({referralCode: data.couponCode})
                referral = await Referral.create({
                    studentRefferal: refferedByStudent._id,
                    referralCode: refferedByStudent.referralCode,
                    referralType: "student",
                    status: "approved",
                })
                refferedByStudent.referral.push(referral._id)
                await refferedByStudent.save()
                await referral.save()
            }

            if(data.couponType === "coupon" ){
                const coupon = await CouponCode.findOne({couponCode: data.couponCode, status: "active"})
                referral = await Referral.create({
                    couponReferral: coupon._id,
                    referralCode: coupon.couponCode,
                    referralType: "coupon",
                    status: "approved",
                })
                coupon.usedCount++
                coupon.referral.push(referral._id)
                await coupon.save()
                await referral.save()
            }

            // payment logic
            let payment;

            if(data.couponType === "referral" || data.couponType === "coupon"){
                    payment = await Payment.create({
                    student: student._id,
                    product: product._id,
                    paymentStatus: "success",
                    amountPaid: data.amountPaid,
                    couponDiscount: data.couponDiscount,
                    referral: referral._id,
                    razorpay_info: razorpay_info._id,
                    initialDiscountAmount: data.initialDiscountAmount,
                    price: product.price,
                })
            }else{
                    payment = await Payment.create({
                    student: student._id,
                    product: product._id,
                    paymentStatus: "success",
                    amountPaid: data.amountPaid,
                    couponDiscount: 0,
                    razorpay_info: razorpay_info._id,
                    initialDiscountAmount: data.initialDiscountAmount,
                    price: product.price,
                })
            }

            razorpay_info.payment = payment._id
            await razorpay_info.save()
            student.purchases.push(payment._id)
            student.cart = student.cart.filter((item) => item.toString() !== product._id.toString());
            await student.save();

            return {
                message: "To see your purchased products go to your Dashboard",
                success: true,
                payment: payment,
                modalTitle: "Payment Successful",
            }
        }else{
            return {
                message: "Product purchase failed, authentication failed",
                success: false,
                modalTitle: "Payment Failed",
            }
        }
    } catch (error) {
        console.log(error)
        return {
            message: "Error purchasing product",
            success: false,
            modalTitle: "Payment Failed",
        }
    }
}

// app functions

export async function getChapterDetails(details){
    try {
        await connectDB()
        const middleware = await verifyStudentMiddleware(details.token)
        if(!middleware.success){
            return {
                message: "Student verification failed",
                success: false,
                chapter: null
            }
        }
        const chapter = await Chapter.findById(details.chapterId)
        .populate([
            {
                path: "lectures",
                model: "Lecture",
                populate: {
                    path: "teacher",
                    model: "Teacher",
                }
            },
            {
                path: "dpps",
                model: "Dpp",
                populate: {
                    path: "dppQuestions",
                    model: "DppQuestion",
                }
            },
            {
                path: "exercises",
                model: "Exercise",
            }
        ])
        .lean()
        if(chapter){
            return {
                message: "Chapter details fetched successfully",
                success: true,
                chapter: chapter
            }
        }
        else{
            return {
                message: "Chapter details fetching failed",
                success: false,
                chapter: null
            }
        }
    } catch (error) {
        console.log(error)
        return {
            message: "Error fetching chapter details",
            success: false,
            chapter: null
        }
    }
}

export async function getSegments(){
    try {
        await connectDB()
        const segments = await Segment.find({})
        .populate({
            path: "products",
            model: "Products",
        })
        .lean()
        return {
            message: "Segments fetched successfully",
            success: true,
            segments: JSON.parse(JSON.stringify(segments))
        }
    } catch (error) {
        console.log(error)
        return {
            message: "Error fetching segments",
            success: false,
            segments: null
        }
    }
    
}