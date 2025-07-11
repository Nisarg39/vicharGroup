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
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
    }
}, {timeStamp: true})

const Razorpay_Info = mongoose.models?.Razorpay_Info || mongoose.model("Razorpay_Info", razorpay_info_Schema);

export default Razorpay_Info;