import mongoose from "mongoose";

const couponCodeSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true,
        unique: true,
    },
    discountAmount: {
        type: Number,
        required: true,
    },
    expiryDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "expired", "used"],
        default: "active",
    },
    description: {
        type: String,
    },
    usedCount: {
        type: Number,
        default: 0,
    },
    password: {
        type: String,
        required: true,
    },
    referral: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Referral",
    }],
}, { timestamps: true });

const CouponCode = mongoose.models.CouponCode || mongoose.model("CouponCode", couponCodeSchema);


export default CouponCode;
