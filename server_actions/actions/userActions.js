"use server"
import {connectDB} from "../config/mongoose"
import EnquiryForm from "../models/enquiryForm"
import ContactUs from "../models/contactUs"
export  async function studentEnq(formData) {
    try {
        await connectDB()
        // console.log(formData)
        const newEnquiry = new EnquiryForm({
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            mobile: formData.get('mobile'),
            stream: formData.get('stream'),
            class: formData.get('class'),
            message: formData.get('message'),
        })
        await newEnquiry.save()
        return {
            success: true,
            message: "Enquiry Submitted Successfully",
        }
    } catch (error) {
        // console.log(error)
        if (error.code === 11000) {
            return {
                success: false,
                message: "Enquiry Already Exists"
            }
        }else{
            return {
                success: false,
                message: "Enquiry Submission Failed"
            }
        }
    }
}

export async function contactUs(formdata) {
    // console.log(formdata)
    try{
        await connectDB()
        const newContact = new ContactUs({
            name: formdata.get('name'),
            email: formdata.get('email'),
            mobile_number: formdata.get('mobile_number'),
            interest_area: formdata.get('interest_area'),
            message: formdata.get('message'),
        })
        await newContact.save()
        return {
            success: true,
            message: "Contact Us Submitted Successfully"
        }
    }catch(error){
        // console.log(error)
        if (error.code === 11000) {
            return {
                success: false,
                message: "Contact Already Exists"
            }
        }else{
            return {
                success: false,
                message: "Contact Submission Failed"
            }
        }
    }
}

