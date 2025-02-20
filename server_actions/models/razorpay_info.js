import mongoose from "mongoose";


const razorpay_info_Schema = mongoose.Schema({
    razorpay_order_id :{
        type: String,
        required: true
    },
    razorpay_payment_id :{
        type:String,
        required: true
    },
    razorpay_signature :{
        type:String,
        required: true
    }
}, {timeStamp: true})