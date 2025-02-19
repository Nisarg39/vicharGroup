import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  referralType: {
    type: String,
    enum: ["student", "teacher", "coupon"],
    required: true,
  },
  referralCode: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
}, { timestamps: true });

const Referral = mongoose.model("referral", referralSchema);

export default Referral;
