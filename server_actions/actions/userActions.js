"use server"
import {connectDB} from "../config/mongoose"
import EnquiryForm from "../models/enquiryForm"
import ContactUs from "../models/contactUs"
import Products from "../models/products"
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
            message: formData.get('message') || "No Message",
        })
        await newEnquiry.save()
        return {
            success: true,
            message: "Thank You for Contacting Us, we will get back to you soon",
        }
    } catch (error) {
        // console.log(error)
        return {
            success: false,
            message: "Enquiry Submission Failed"
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
            message: formdata.get('message') || "No Message",
        })
        await newContact.save()
        return {
            success: true,
            message: "Thank You for Contacting Us, we will get back to you soon",
        }
    }catch(error){
        // console.log(error)
            return {
                success: false,
                message: "Contact Submission Failed"
            }
        }
}

export async function getProductDetail(pageParameters){
    try{
        await connectDB()
        const product = await Products.findOne({pageParameters: pageParameters})
        if (!product) {
            return {
                success: false,
                message: "Product Not Found"
            }
        }
        else{
            return {
                success: true,
                product: product
            }
        }
    }catch(error){
        // console.log(error)
        return {
            success: false,
            message: "Error fetching product"
        }
    }
}