import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Student',
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Products',
    },
    paymentStatus:{
        type:String,
        enum: ["pending","success","failed"],
        default:"pending"
    },
    amountPaid:{
        type:Number,
        required:true
    },
    price: {
        type: String,
        required: true,
    },
    initialDiscountAmount: {
        type: String,
        default:0
    },
    couponDiscount:{
        type:Number,
        default:0
    },
    referral:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Referral',
    },
    razorpay_info: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Razorpay_Info'
    },
    paymentType:{
        type:String,
        default:"online"
    },
    paymentMode:{
        type:String,
        enum: ["razorpay","cash"],
        default: "razorpay"
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    },
    deletedBy: {
        type: String
    },
    deletionReason: {
        type: String
    },
    deletionType: {
        type: String,
        enum: ["admin_removal", "refund", "error_correction"],
        default: "admin_removal"
    }
}, { timestamps: true })

const Payment = mongoose.models?.Payment || mongoose.model("Payment",paymentSchema)

export default Payment
