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
import Teacher from "../models/teacher"
import Razorpay_Info from "../models/razorpay_info"
import Segment from "../models/segment"
import Banner from "../models/banner"
import College from "../models/exam_portal/college"
import master_mcq_question from "../models/exam_portal/master_mcq_question"
import TeacherExam from "../models/exam_portal/teacherExam"
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

export async function searchStudent(details){
    try {
        await connectDB();
        let query = {};
        
        if (details.searchTerm) {
            // If search term is a number, search by phone
            if (/^\d+$/.test(details.searchTerm)) {
                query.phone = { $regex: details.searchTerm, $options: 'i' };
            } else {
                // Search by name with partial matching
                query.name = { $regex: details.searchTerm, $options: 'i' };
            }
        }

        const students = await Student.find(query)
            .limit(10) // Limit results for better performance
            .select('name phone email') // Select only needed fields
            .lean(); // Convert to plain JavaScript objects

        return {
            success: true,
            message: "Students found",
            students: students
        };
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error fetching students"
        }
    }
}

export async function assignProduct(details){
    try {
        await connectDB()

        const student = await Student.findById(details.studentId)

        const product = await Products.findById(details.productId)

        const razorpay_info = await Razorpay_Info.create({
            razorpay_order_id: details.razorpay_order_id,
            razorpay_payment_id: details.razorpay_payment_id,
            razorpay_signature: details.razorpay_signature,
        })

        const payment = await Payment.create({
            student: student._id,
            product: product._id,
            paymentStatus: "success",
            amountPaid: details.amountPaid,
            couponDiscount: 0,
            razorpay_info: razorpay_info._id,
            initialDiscountAmount: details.initialDiscountAmount,
            price: product.price,
        })

        razorpay_info.payment = payment._id
        await razorpay_info.save()
        student.purchases.push(payment._id)
        student.cart = student.cart.filter((item) => item.toString() !== product._id.toString());
        await student.save();

        return {
            success: true,
            message: "Product assigned successfully",
            payment: payment,
        }

    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error assigning product"
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

export async function deleteChapter(chapterId){
    try {
        await connectDB()
        const deletedChapter = await Chapter.findByIdAndDelete(chapterId)
        if(deletedChapter){
            await Subject.findByIdAndUpdate(deletedChapter.subjectId, {
                $pull: {
                    chapters: deletedChapter._id
                }
            })
            return {
                success: true,
                message: "Chapter deleted successfully",
                chapter: deletedChapter
            }
        }else{
            return {
                success: false,
                message: "Chapter not found"
            }
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error deleting chapter"
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
            select: 'serialNumber title description videoUrl teacher',
            populate: {
                path: 'teacher',
                model: 'Teacher',
                select: 'name imageUrl'
            }
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

export async function deleteLecture(details) {
    try {
        await connectDB()
        const chapter = await Chapter.findById(details.chapterId)
        if(!chapter){
            return {
                success: false,
                message: "Chapter not found"
            }
        }
        chapter.lectures = chapter.lectures.filter((item) => item.toString() !== details.lectureId.toString());
        await chapter.save()
        const lecture = await Lecture.findByIdAndDelete(details.lectureId)
        return {
            success: true,
            message: "Lecture deleted successfully",
            lecture: lecture
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error deleting lecture"
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

            // console.log(chapter)
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
    console.log(details)
    try {
        await connectDB()
        const dpp = await Dpp.findByIdAndUpdate(details._id, details, {new: true})
        if (!dpp) {
            return {
                success: false,
                message: "DPP not found"
            }
        }
        
        // console.log(dpp)
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

export async function deleteDpp(details){
    try {
        await connectDB()
        const chapter = await Chapter.findById(details.chapterId)
        if(!chapter){
            return {
                success: false,
                message: "Chapter not found"
            }
        }else{
            chapter.dpps = chapter.dpps.filter((item) => item.toString() !== details.dppId.toString());
            const dpp = await Dpp.findById(details.dppId)
            if(!dpp){
                return {
                    success: false,
                    message: "Dpp not found"
                }
            }else{
                dpp.dppQuestions.map(async(item) => {
                    await DppQuestion.findByIdAndDelete(item._id)
                })
                await Dpp.findByIdAndDelete(details.dppId)
                chapter.dpps = chapter.dpps.filter((item) => item.toString() !== details.dppId.toString());
                await chapter.save()
                return {
                    success: true,
                    message: "Dpp deleted successfully",
                    chapter: JSON.parse(JSON.stringify(chapter))
                }
            }
        }
        
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error deleting dpp"
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

export async function deleteDppQuestion(questionId){
    try {
        await connectDB()
        await DppQuestion.findByIdAndDelete(questionId)
        return {
            success: true,
            message: "Question deleted successfully"
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error deleting question"
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

export async function deleteExercise(details) {
    try {
        await connectDB()
        const chapter = await Chapter.findById(details.chapterId)
        if(!chapter){
            return {
                success: false,
                message: "Chapter not found"
            }
        }else{
            chapter.exercises = chapter.exercises.filter((item) => item.toString() !== details.exerciseId.toString());
            await chapter.save()
            const exercise = await Exercise.findById(details.exerciseId)
            if(!exercise){
                return {
                    success: false,
                    message: "Exercise not found"
                }
            }else{
                await Exercise.findByIdAndDelete(details.exerciseId)
                return {
                    success: true,
                    message: "Exercise deleted successfully",
                    chapter: JSON.parse(JSON.stringify(chapter))
                }
            }
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error deleting exercise"
        }
        
    }
}

// teacher control
export async function addTeacher(details){
    try {
        await connectDB()
        const teacher = await Teacher.create(details)
        return {
            success: true,
            message: "Teacher added successfully",
            teacher: JSON.parse(JSON.stringify(teacher))
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error adding teacher"
        }
    }
}

export async function updateTeacher(details){
    try {
        await connectDB()
        const teacher = await Teacher.findByIdAndUpdate(details.teacherId, details, {new: true})
        console.log(teacher)
        return {
            success: true,
            message: "Teacher updated successfully",
            teacher: JSON.parse(JSON.stringify(teacher))
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error updating teacher"
        }
    }
}

export async function showTeachers() {
    try {
        await connectDB()
        const teachers = await Teacher.find({})
        return {
            success: true,
            teachers: JSON.parse(JSON.stringify(teachers))
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error showing teachers"
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

// payment controls

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

// search student by name or phone just like searchStudent function but returning result like paymentDetails function
export async function searchStudentPayments(searchTerm, page = 1, limit = 10){
    try {
        await connectDB()
        const skip = (page - 1) * limit
        
        // First, find students that match the search criteria
        let studentQuery = {};
        if (/^\d+$/.test(searchTerm)) {
            // If search term is a number, search by phone
            studentQuery.phone = { $regex: searchTerm, $options: 'i' };
        } else {
            // Search by name with partial matching
            studentQuery.name = { $regex: searchTerm, $options: 'i' };
        }
        
        const matchingStudents = await Student.find(studentQuery).select('_id');
        const studentIds = matchingStudents.map(student => student._id);
        
        if (studentIds.length === 0) {
            return {
                success: true,
                payments: [],
                totalPages: 0,
                currentPage: page,
                totalCount: 0,
            }
        }
        
        // Now find payments for these students
        const payments = await Payment.find({
            student: { $in: studentIds }
        })
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

        const totalCount = await Payment.countDocuments({
            student: { $in: studentIds }
        })
        
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
            message: "Error searching payments"
        }
    }
}


// ------------------------- App Controls -------------------------


// // Banner controls
export async function addBanner(details) {
    try {
        await connectDB()
        const banner = await Banner.create({
            serialNumber: details.serialNumber,
            imageUrl: details.imageUrl
        })
        return {
            success: true,
            message: "Banner added successfully",
            banner: JSON.parse(JSON.stringify(banner))
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error adding banner"
        }
    }
}

export async function showBanners() {
    try {
        await connectDB()
        const banners = await Banner.find({}).sort({ serialNumber: 1 }).lean()
        return {
            success: true,
            banners: banners
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error fetching banners"
        }
    }
}

// write a function to update the serial number of banner

export async function updateBanner(details) {
    try {
        await connectDB()
        const banner = await Banner.findByIdAndUpdate(details._id, { serialNumber: details.serialNumber }, {
            new: true,
        }).lean()
        return {
            success: true,
            message: "Banner updated successfully",
            banner: JSON.parse(JSON.stringify(banner))
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error updating banner"
        }
    }
}


// // ------------------------- Exam Portal Controls -------------------------


// College controls

export async function addCollege(details) {
    try {
        await connectDB()
        const college = await College.create(details)
        return {
            success: true,
            message: "College added successfully",
            college: JSON.parse(JSON.stringify(college))
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error adding college"
        }
    }
}
export async function showCollegeList(page = 1, limit = 10) {
    try {
        await connectDB()
        const skip = (page - 1) * limit
        // Single aggregation pipeline to get colleges and counts
        const [aggregateResult] = await College.aggregate([
            {
                $facet: {
                    colleges: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit }
                    ],
                    totalCount: [
                        { $count: 'count' }
                    ],
                    inactiveCount: [
                        { $match: { isActive: false } },
                        { $count: 'count' }
                    ]
                }
            }
        ])

        const colleges = aggregateResult.colleges
        const totalCount = aggregateResult.totalCount[0]?.count || 0
        const inactiveCount = aggregateResult.inactiveCount[0]?.count || 0
        const totalPages = Math.ceil(totalCount / limit)

        return {
            success: true,
            colleges: JSON.parse(JSON.stringify(colleges)),
            totalLength: totalCount,
            inactiveCount,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalCount,
                itemsPerPage: limit
            }
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error fetching colleges"
        }
    }
}

export async function updateCollegeDetails(details){
    try {
        await connectDB();
        const college = await College.findByIdAndUpdate(
            details._id,
            { $set: details }, // Use $set to update only provided fields
            { 
                new: true,
                runValidators: true // Enable validation
            }
        );
        
        if (!college) {
            return {
                success: false,
                message: "College not found"
            };
        }

        return {
            success: true,
            message: "College details updated successfully",
            college: JSON.parse(JSON.stringify(college))
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Error updating college details: " + error.message
        };
    }
}

export async function deleteCollege(collegeId) {
    try {
        await connectDB();
        const college = await College.findByIdAndDelete(collegeId);
        if (!college) {
            return {
                success: false,
                message: "College not found"
            };
        }
        return {
            success: true,
            message: "College deleted successfully",
            college: JSON.parse(JSON.stringify(college))
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Error deleting college"
        };
    }
}

// search college by name and returning result like showCollegeList function show result according to closest match
export async function searchCollege(searchTerm, page = 1, limit = 10) {
    try {
        await connectDB();
        const skip = (page - 1) * limit;

        // Use regex to search for college names that match the search term
        const regex = new RegExp(searchTerm, 'i'); // 'i' for case-insensitive search

        const colleges = await College.find({ collegeName: regex })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        const totalCount = await College.countDocuments({ name: regex });
        const totalPages = Math.ceil(totalCount / limit);
        return {
            success: true,
            colleges: colleges,
            totalLength: totalCount,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalCount,
                itemsPerPage: limit
            }
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Error searching colleges"
        };
    }
}



// question related actions
export async function addExamQuestion(questionData) {
    try {
        await connectDB();
        
        // Get the highest question number for this subject
        const maxQuestionNumber = await master_mcq_question.findOne({ 
            subject: questionData.subject 
        }).sort({ questionNumber: -1 }).limit(1);
        
        // Calculate next question number
        const nextNumber = (+maxQuestionNumber?.questionNumber || 0) + 1;
        
        // Add the question number to questionData
        const questionWithNumber = {
            ...questionData,
            questionNumber: nextNumber
        };
        
        const question = await master_mcq_question.create(questionWithNumber);
        return {
            success: true,
            message: "Question added successfully",
            question: JSON.parse(JSON.stringify(question))
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Error adding question"
        };
    }
}

export async function showQuestionsList(questionData) {
    try {
        await connectDB();
        const query = {};

        // Add filters based on questionData parameters
        if (questionData.stream) query.stream = questionData.stream;
        if (questionData.standard) query.standard = questionData.standard;
        if (questionData.subject) query.subject = questionData.subject;
        if (questionData.topic) query.topic = questionData.topic;
        if (questionData.section) query.section = questionData.section;
        if (questionData.difficultyLevel) query.difficultyLevel = questionData.difficultyLevel;
        
        // Calculate pagination
        const page = questionData.page || 1;
        const limit = questionData.limit || 10;
        const skip = (page - 1) * limit;

        // Get filtered questions with pagination
        const questions = await master_mcq_question.find(query)
            .sort({ questionNumber: 1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Get total count for pagination
        const totalCount = await master_mcq_question.countDocuments(query);

        return {
            success: true,
            questions: questions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalQuestions: totalCount,
                questionsPerPage: limit
            }
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Error fetching questions"
        };
    }
}

export async function updateExamQuestion(details){
    try {
        await connectDB()
        const updatedQuestion = await master_mcq_question.findByIdAndUpdate(details._id, {
            ...details,
            difficultyLevel: details.difficultyLevel // Add this explicitly
        }, {new: true})
        return {
            success: true,
            message: "Question updated successfully",
            question: JSON.parse(JSON.stringify(updatedQuestion))
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error updating question"
        }
    }
}

export async function deleteExamQuestion(questionId){
    try {
        await connectDB()
        await master_mcq_question.findByIdAndDelete(questionId)
        return {
            success: true,
            message: "Question deleted successfully"
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error deleting question"
        }
    }
}


// Teacher Exam Management

export async function createTeacherExam(teacherExamData){
    try {
        await connectDB()
        const teacherExam = await TeacherExam.create(teacherExamData)
        return {
            success: true,
            message: "Teacher Exam created successfully",
            teacherExam: JSON.parse(JSON.stringify(teacherExam))
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: "Error creating teacher exam"
        }
    }
}

export async function CreateTeacherExam(details) {
    try {
        await connectDB()
        
        // Check if teacher already exists with this email
        const existingTeacher = await TeacherExam.findOne({ email: details.email })
        if (existingTeacher) {
            return {
                success: false,
                message: "Teacher with this email already exists"
            }
        }
        
        // Create new teacher
        const teacher = await TeacherExam.create({
            name: details.name,
            email: details.email,
            password: details.password,
            subject: details.subject,
            profileImageUrl: details.profileImageUrl || ""
        })
        
        return {
            success: true,
            message: "Teacher created successfully",
            teacher: teacher
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: error.message || "Error creating teacher"
        }
    }
}

export async function GetAllTeachers(page = 1, limit = 10) {
    try {
        await connectDB()
        
        const skip = (page - 1) * limit
        
        const teachers = await TeacherExam.find({})
            .select('name email subject profileImageUrl createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
        
        const totalCount = await TeacherExam.countDocuments({})
        
        const serializedTeachers = teachers.map(teacher => ({
            _id: teacher._id.toString(),
            ...teacher,
        }))
        
        return {
            success: true,
            teachers: serializedTeachers,
            totalCount,
            totalPages: Math.ceil(totalCount / limit),
            currentPage: page,
            hasNextPage: page < Math.ceil(totalCount / limit),
            hasPrevPage: page > 1
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: error.message || "Error fetching teachers"
        }
    }
}

export async function UpdateTeacherExam(teacherId, details) {
    try {
        await connectDB()
        
        // Check if another teacher already exists with this email (excluding current teacher)
        const existingTeacher = await TeacherExam.findOne({ 
            email: details.email,
            _id: { $ne: teacherId }
        })
        
        if (existingTeacher) {
            return {
                success: false,
                message: "Another teacher with this email already exists"
            }
        }
        
        // Update teacher
        const updatedTeacher = await TeacherExam.findByIdAndUpdate(
            teacherId,
            {
                name: details.name,
                email: details.email,
                password: details.password,
                subject: details.subject,
                profileImageUrl: details.profileImageUrl || ""
            },
            { new: true }
        )
        
        if (!updatedTeacher) {
            return {
                success: false,
                message: "Teacher not found"
            }
        }
        
        return {
            success: true,
            message: "Teacher updated successfully",
            teacher: updatedTeacher
        }
    } catch (error) {
        console.log(error)
        return {
            success: false,
            message: error.message || "Error updating teacher"
        }
    }
}
