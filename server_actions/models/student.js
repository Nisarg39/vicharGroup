import mongoose from "mongoose";

const studentsSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
        unique: true
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
    isVerified: {
        type: Boolean,
        default: false
    },
    interestedInProduct: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products"
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
}, {
    timestamps: true
})

const Student = mongoose.models.Student || mongoose.model("Student", studentsSchema);
export default Student;