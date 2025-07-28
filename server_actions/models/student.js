import mongoose from "mongoose";
import { type } from "os";

const studentsSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
    },
    course:{
        type: String,
        enum: ["jee", "neet", "mht-cet", "foundation"],
    },
    otp: {
        type: String,
    },
    token: {
        type: String,
    },
    previousToken: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    cart: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
    }],
    gender: {
        type: String,
        enum: ["male", "female", "other"]
    },
    dob: {
        type: Date,
    },
    address: {
        type: String,
    },
    area: {
        type: String,
    },
    city: {
        type: String,
    },
    state: {
        type: String,
    },
    referralCode: {
        type: String,
    },
    referral: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Referral",
    }],
    purchases: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Payment",
    }],
    dppTests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DppTest",
    }],
    college: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
    },
    interestedStream: {
        type: String,
        enum: ["NEET", "JEE", "MHT-CET", "SSC", "HSC", "ICSE"]
    },
    interestedClass: {
        type: Number,
        enum: [12, 11, 10, 9, 8]
    },
}, {
    timestamps: true,
})

const Student = mongoose.models?.Student || mongoose.model("Student", studentsSchema);
export default Student;