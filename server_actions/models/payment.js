import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Student',
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Product',
    },
    paymentStatus:{
        type:String,
        default:"pending"
    },
    amount:{
        type:Number,
        required:true
    },
    referral:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Referral',
    },
    coupon:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CouponCode'
    },

}, { timestamps: true })

const Payment = mongoose.models.Payment || mongoose.model("Payment",paymentSchema)

export default Payment
