"use server"
import EnquiryForm from "../models/enquiryForm"
import ContactUs from "../models/contactUs"
import { connectDB } from "../config/mongoose"
import Admin from "../models/admin"
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