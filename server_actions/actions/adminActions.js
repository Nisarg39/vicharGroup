"use server"
import EnquiryForm from "../models/enquiryForm"
import ContactUs from "../models/contactUs"
import { connectDB } from "../config/mongoose"
import Admin from "../models/admin"
import Student from "../models/student"
import Products from "../models/products"
import CouponCode from "../models/couponCode"
import jwt from "jsonwebtoken"


export async function adminLogin(details) {
    try {
        await connectDB()
        const adminCount = await Admin.countDocuments()
        if (adminCount === 0) {
            const newAdmin = await Admin.create({
                username: details.username,
                password: details.password
            })
            const token = jwt.sign({ id: newAdmin._id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '30d' })
            return {
                success: true,
                message: "Admin created and logged in successfully",
                token
            }
        }
        const admin = await Admin.findOne({ username: details.username })
        if (!admin) {
            return {
                success: false,
                message: "Invalid Credentials"
            }
        }
        if (admin.password !== details.password) {
            return {
                success: false,
                message: "Invalid Credentials"
            }
        }
        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'fallback_secret_key', { expiresIn: '30d' })
        console.log(token)
        return {
            success: true,
            message: "Login Successful",
            token
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Login Failed"
        }
    }
}
export async function getEnquiries(page) {
    try {
        connectDB()
        const limit = 10
        const skip = (page - 1) * limit
        const enquiries = await EnquiryForm.find({})
            .skip(skip)
            .limit(limit)
            .lean()
            .sort({ createdAt: -1 })
        const totalCount = await EnquiryForm.countDocuments({})
        const unseenCount = await EnquiryForm.countDocuments({ seen: false })
        const serializedEnquiries = enquiries.map(enquiry => ({
            _id: enquiry._id.toString(),
            ...enquiry,
        }))
        return {
            success: true,
            enquiries: serializedEnquiries,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            totalCount,
            unseenCount
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error fetching enquiries"
        }
    }
}
export async function getContactUs(page) {
    try {
        connectDB()
        const limit = 10
        const skip = (page - 1) * limit
        const contactUs = await ContactUs.find({})
            .skip(skip)
            .limit(limit)
            .lean()
            .sort({ createdAt: -1 })
        const totalCount = await ContactUs.countDocuments({})
        const unseenCount = await ContactUs.countDocuments({ seen: false })
        const serializedContactUs = contactUs.map(contact => ({
            _id: contact._id.toString(),
            ...contact,
        }))
        return {
            success: true,
            contactUs: serializedContactUs,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            totalCount,
            unseenCount
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error fetching contactUs"
        }
    }
}
export async function changePassword(details) {
    const admin = await Admin.findOne({password: details.currentPassword})
    if (!admin) {
        return {
            success: false,
            message: "Invalid Credentials"
        }
    }
    admin.password = details.newPassword
    await admin.save()
    return {
        success: true,
        message: "Password Changed Successfully"
    }
}

export async function messageSeenEnquiryForm(id) {
    const contact = await EnquiryForm.findById(id)
    if (!contact) {
        return {
            success: false,
            message: "Contact Not Found"
        }
    }
    contact.seen = true
    await contact.save()
    return {
        success: true,
        message: "Message Seen Successfully"
    }
}

export async function messageSeenContactUs(id) {
    const contact = await ContactUs.findById(id)
    if (!contact) {
        return {
            success: false,
            message: "Contact Not Found"
        }
    }
    contact.seen = true
    await contact.save()
    return {
        success: true,
        message: "Message Seen Successfully"
    }
}

export async function contactedToogle(id, followUpNote) {
    // console.log(id, followUpNote)
    try{
        await connectDB()
        const student = await EnquiryForm.findById(id)
        if(!student){
            return {
                success: false,
                message: "Student Not Found"
            }
        }
        else{
            student.contacted = true
            if(followUpNote){
                student.followUpNote = followUpNote
            }
            await student.save()
            return {
                success: true,
                message: "Contact Status Updated Successfully"
            }
        }
    }catch(error){
        console.log(error)
        return {
            success: false,
            message: "Error contacting"
        }
    }
}

export async function contactUsToogle(id, followUpNote){
    // console.log(id, followUpNote)
    try {
        await connectDB()
        const customer = await ContactUs.findById(id)
        if(!customer){
            return{
                success : false,
                message : "Customer not found"
            }
        }else{
            customer.contacted=true
            if(followUpNote){
                customer.followUpNote = followUpNote
            }
            await customer.save()
            return {
                success: true,
                message: "Contact Status Updated Successfully"
            }
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error contacting"
        }
    }
}

export async function fetchAllStudents(page) {
    try {
        await connectDB()
        const limit = 10
        const skip = (page - 1) * limit
        const students = await Student.find({})
            .skip(skip)
            .limit(limit)
            .lean()
            .sort({ createdAt: -1 })
        const totalCount = await Student.countDocuments({})
        const serializedStudents = students.map(student => ({
            _id: student._id.toString(),
            ...student,
        }))
        return {
            success: true,
            students: serializedStudents,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            totalCount,
        }
    }catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error fetching students"
        }
    }
}

export async function addProduct(details){
    const productObject = {
        name: details.name,
        price: details.price,
        discountPrice: details.discountPrice,
        type: details.type,
        class: details.class,
        duration: details.duration,
        pageParameters: details.pageParameters
    }
    try{
        await connectDB()
        if(!details.originalName){
            const product = await Products.create(productObject)
            return {
                success: true,
                message: "Product added successfully",
                product: product
            }
        }else{
            const product = await Products.findOneAndUpdate({name: details.originalName}, productObject, {new: true})
            return {
                success: true,
                message: "Product updated successfully",
                product: product
            }
        }
    }catch(error){
        console.log(error)
        return {
            success: false,
            message: "Error adding product"
        }
    }
}

export async function showProducts(){
    try{
        await connectDB()
        const products = await Products.find({})
        .sort({createdAt: -1})
        return {
            success: true,
            products: products
        }
    }catch(error){
        console.log(error)
        return {
            success: false,
            message: "Error fetching products"
        }
    }
}

export async function addCouponCode(details){
    const couponCodeObject = {
        couponCode: details.couponCode,
        discountAmount: details.discountAmount,
        expiryDate: details.expiryDate,
        status: details.status,
        description: details.description,
        password: details.password
    }
    try{
        await connectDB()
        const existingCoupon = await CouponCode.findOne({ couponCode: details.couponCode })
        if(existingCoupon){
            return {
                success: false,
                message: "Coupon Code already exists"
            }
        }
        const couponCode = await CouponCode.create(couponCodeObject)
        return {
            success: true,
            message: "Coupon Code added successfully",
            couponCode: couponCode
        }
    }catch(error){
        console.log(error)
        return {
            success: false,
            message: "Error adding coupon code"
        }
    }
}

export async function getAllCouponCodes(page = 1, limit = 10){
    try{
        await connectDB()
        const skip = (page - 1) * limit
        const couponCodes = await CouponCode.find({})
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        
        const totalCoupons = await CouponCode.countDocuments({})
        const totalPages = Math.ceil(totalCoupons / limit)

        return {
            success: true,
            couponCodes: couponCodes,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalCoupons,
                itemsPerPage: limit
            }
        }
    }catch(error){
        console.log(error)
        return {
            success: false,
            message: "Error fetching coupon codes"
        }
    }
}
