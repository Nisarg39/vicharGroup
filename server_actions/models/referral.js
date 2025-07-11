import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
  referralType: {
    type: String,
    enum: ["student", "teacher", "coupon"],
    required: true,
  },
  referralCode: {
    type: String,
    required: true,
  },
  studentRefferal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
  },
  couponReferral: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CouponCode",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
}, { timestamps: true });

const Referral = mongoose.models?.Referral || mongoose.model("Referral", referralSchema);

export default Referral;
