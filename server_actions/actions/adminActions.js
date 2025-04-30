"use server"
import EnquiryForm from "../models/enquiryForm"
import ContactUs from "../models/contactUs"
import { connectDB } from "../config/mongoose"
import Admin from "../models/admin"
import Student from "../models/student"
import Products from "../models/products"
import Subject from "../../server_actions/models/subject"
import Chapter from "../../server_actions/models/chapter"
import Lecture from "../../server_actions/models/lecture"
import Dpp from "../../server_actions/models/dpp"
import DppQuestion from "../models/dppQuestion"
import CouponCode from "../models/couponCode"
import Payment from "../models/payment"
import Exercise from "../models/exercise"
import Razorpay_Info from "../models/razorpay_info"
import Segment from "../models/segment"
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
        // console.log(token)
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
        .populate({
            path: 'cart',
            model: 'Products',
            select: 'name price discountPrice _id type'
        })
        // perform a nested populate where there is reference to product model inside payment model
        .populate({
            path: 'purchases',
            model: 'Payment',
            populate: {
                path: 'product',
                model: 'Products',
                select: 'name price discountPrice _id type'
            }
        })
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


// segment functions

export async function addSegment(details){
    try{
        await connectDB()
        const segment = await Segment.create({name: details.name})
        return {
            success: true,
            message: "Segment added successfully",
            segment: segment
        }
    }catch(error){
        console.log(error)
        return {
            success: false,
            message: "Error adding segment"
        }
    }
}

export async function segmentDetails(){
    try{
        await connectDB()
        const segments = await Segment.find({})
        .populate({
            path: 'products',
            model: 'Products',
            select: 'name price discountPrice _id type image'
        })
        .lean()
        const products = await Products.find({})
        return {
            success: true,
            segments: segments,
            products: products,
        }
    }catch(error){
        console.log(error)
        return {
            success: false,
            message: "Error fetching segments"
        }
    }
}

export async function editSegment(details){
    try{
        await connectDB()
        const segment = await Segment.findById(details.segmentId)
        segment.name = details.name
        await segment.save()
        const updatedSegment = await Segment.find({})
        .populate({
            path: 'products',
            model: 'Products',
            select: 'name price discountPrice _id type image'
        })
        .lean()
        const products = await Products.find({})
        return {
            success: true,
            message: "Segment fetched successfully",
            segment: updatedSegment,
            products: products
        }
    }catch(error){
        console.log(error)
        return {
            success: false,
            message: "Error fetching segment"
        }
    }
}

export async function updateSegment(details) {
    try {
        await connectDB();
        const segment = await Segment.findById(details.segmentId);
        
        // Use Promise.all to wait for all updates to complete
        await Promise.all(details.productIds.map(async (productId) => {
            // Find if product exists in any other segment
            const existingSegment = await Segment.findOne({ products: productId });
            if (existingSegment && existingSegment._id.toString() !== segment._id.toString()) {
                // Remove product from existing segment
                existingSegment.products = existingSegment.products.filter(
                    id => id.toString() !== productId.toString()
                );
                await existingSegment.save();
            }

            await Products.updateOne(
                { _id: productId }, 
                { $set: { segment: segment._id } }
            );
            
            // Check if product ID is already in the array to avoid duplicates
            if (!segment.products.includes(productId)) {
                segment.products.push(productId);
            }
        }));
        
        // Save the segment after all products have been added
        await segment.save();
        
        return {
            success: true,
            message: "Segment updated successfully"
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Error updating segment"
        };
    }
}

// product controls
export async function addProduct(details){
    const productObject = {
        name: details.name,
        price: details.price,
        discountPrice: details.discountPrice,
        type: details.type,
        class: details.class,
        duration: details.duration,
        pageParameters: details.pageParameters,
        image: details.image
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

// course controls

export async function showCourses(){
    try {
        await connectDB()
        const courseProducts = await Products.find({type: {$in: ['course', 'mtc']}})
        return {
            success: true,
            products: courseProducts
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error fetching courses"
        }
    }
}
export async function updateCourse(details) {
    try {
        await connectDB()
        const product = await Products.findById(details.id)
        product.name = details.name
        product.image = details.image
        await product.save()
        return {
            success: true,
            message: "Course updated successfully",
            product: product
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error updating course"
        }
    }
}

// subject controls
export async function addSubject(details){
    // console.log(details)
    try {
        await connectDB()
        
        const addSubject = await Subject.create({
            subjectCode: details.subjectCode,
            name: details.name,
            image: details.image,
            description: details.description,
            productId: details.productId
        })

        const product = await Products.findByIdAndUpdate(details.productId, {
            $push: {
                subjects: addSubject._id
            }
        }, {new: true})

        if(!product){
            return {
                success: false,
                message: "Product not found"
            }
        }

        return {
            success: true,
            message: "Subject added successfully",
            subject: addSubject
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error adding subject"
        }
    }
}

export async function showSubjects(productId){
    try {
        await connectDB()
        const subjects = await Subject.find({productId: productId})
        .populate({
            path: 'chapters',
            model: Chapter,
            select: 'serialNumber chapterName image dpps',
            populate: {
                path: 'dpps',
                model: "Dpp",
                populate: {
                    path: 'dppQuestions',
                    model: "DppQuestion",
                },
            }
        }).lean()
        return {
            success: true,
            subjects: subjects
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error fetching subjects"
        }
    }
}
export async function updateSubject(details){
    try {
        await connectDB()
        const updatedSubject = await Subject.findByIdAndUpdate(details.id, {
            subjectCode: details.subjectCode,
            name: details.name,
            image: details.image,
            description: details.description,
        }, {new: true})
        return {
            success: true,
            message: "Subject updated successfully",
            subject: updatedSubject
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error updating subject"
        }
    }
}

// chapter controls
export async function addChapter(details){
    try {
        await connectDB()
        const chapter = await Chapter.create(details)
        if(chapter){
            const subject = await Subject.findByIdAndUpdate(details.subjectId, {
                $push: {
                    chapters: chapter._id
                }
            }, {new: true})
            if(subject){
                return {
                    success: true,
                    message: "Chapter added successfully",
                    chapter: chapter,
                    subject: subject
                }
            }
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error adding chapter"
        }
    }
}

export async function updateChapter(details){
    try {
        await connectDB()
        const updatedChapter = await Chapter.findByIdAndUpdate(details.id, {
            serialNumber: details.serialNumber,
            chapterName: details.chapterName,
            image: details.image,
        }, {new: true})
        return {
            success: true,
            message: "Chapter updated successfully",
            chapter: updatedChapter
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error updating chapter"
        }
    }
}

// lecture controls

export async function addLecture(details){
    try {
        await connectDB()
        const lecture = await Lecture.create(details)
        if(lecture){
            const chapter = await Chapter.findByIdAndUpdate(details.chapterId, {
                $push: {
                    lectures: lecture._id
                }
            }, {new: true})
            if(chapter){
                return {
                    success: true,
                    message: "Lecture added successfully",
                    lecture: lecture,
                    chapter: chapter
                }
            }
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error adding lecture"
        }
    }
}

export async function showLectures(details) {
    try {
        await connectDB()
        const chapter = await Chapter.findById(details.chapterId)
        .populate({
            path: 'lectures',
            model: 'Lecture',
            select: 'serialNumber title description videoUrl'
        })
        .lean()
        return {
            success: true,
            message: "Lectures fetched successfully",
            chapter: chapter
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error fetching lectures"
        }
    }
}

export async function updateLecture(details) {
    try {
        await connectDB()
        const lecture = await Lecture.findByIdAndUpdate(details.lectureId, details, {new: true})
        return {
            success: true,
            message: "Lecture updated successfully",
            lecture: lecture
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error updating lecture"
        }
    }
}

// dpp controls
export async function addDpp(details) {
    try {
        await connectDB()
        const dpp = await Dpp.create(details)
        // console.log(dpp)
        if(dpp){
            const chapter = await Chapter.findByIdAndUpdate(details.chapterId, {
                $push: {
                    dpps: dpp._id
                }
            }, {new: true})

            console.log(chapter)
            if(chapter){
                return {
                    success: true,
                    message: "Dpp added successfully",
                    dpp: dpp,
                    chapter: chapter
                }
            }
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error adding dpp"
        }
    }
}

export async function updateDpp(details){
    try {
        await connectDB()
        const dpp = await Dpp.findByIdAndUpdate(details.dppId, details, {new: true})
        return {
            success: true,
            message: "Dpp updated successfully",
            dpp: dpp
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error updating dpp"
        }
    }
}

// dpp question control

export async function addDppQuestion(details){
    try {
        await connectDB()
        const dppQuestion = await DppQuestion.create(details)
        await Dpp.findByIdAndUpdate(details.dppId, {
            $push: {
                dppQuestions: dppQuestion._id
            }
        })
        return {
            success: true,
            message: "Question added successfully",
            dppQuestion: JSON.parse(JSON.stringify(dppQuestion))
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error adding question"
        }
    }
}

export async function updateDppQuestion(details){
    try {
        await connectDB()
        const updatedQuestion = await DppQuestion.findByIdAndUpdate(details.questionId, details, {new: true})
        return {
            success: true,
            message: "Question updated successfully",
            dppQuestion: JSON.parse(JSON.stringify(updatedQuestion))
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error updating question"
        }
        
    }
}

// exercise control

export async function addExercise(details){
    try {
        await connectDB()
        const exercise = await Exercise.create({
            exerciseName: details.exerciseName,
            pdfUrl: details.pdfUrl
        })
        await Chapter.findByIdAndUpdate(details.chapterId, {
            $push: {
                exercises: exercise._id
            }
        })
        return {
            success: true,
            message: "Exercise added successfully",
            exercise: JSON.parse(JSON.stringify(exercise))
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error adding exercise"
        }
    }
}

export async function showExercise(chapterId) {
    try {
        const exercises = await Chapter.findById(chapterId).populate("exercises")
        return {
            success: true,
            exercises: JSON.parse(JSON.stringify(exercises.exercises))
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error showing exercise"
        }
    }
}

// coupon code control

export async function addCouponCode(details){
    try {
        await connectDB()
        const couponCode = await CouponCode.create(details)
        return {
            success: true,
            message: "Coupon code added successfully",
            couponCode: couponCode
        }
    } catch (error) {
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

export async function paymentDetails(page = 1, limit = 10){
    try {
        await connectDB()
        const skip = (page - 1) * limit
        const payments = await Payment.find({})
        .populate({
            path: 'student',
            model: 'Student',
            select: 'name email phone _id'
        })
        .populate({
            path: 'product',
            model: 'Products',
            select: 'name price discountPrice _id type'
        })
        .populate({
            path: 'razorpay_info',
            model: 'Razorpay_Info',
            select: 'razorpay_order_id razorpay_payment_id razorpay_signature'
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })

        const totalCount = await Payment.countDocuments({})
        const serializedPayments = payments.map(payment => {
            const plainPayment = payment.toObject()
            return {
                _id: plainPayment._id.toString(),
                ...plainPayment,
                createdAt: plainPayment.createdAt?.toISOString(),
                updatedAt: plainPayment.updatedAt?.toISOString()
            }
        })
        return {
            success: true,
            payments: serializedPayments,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            totalCount,
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error fetching payments"
        }
    }
}