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
}, {
    timestamps: true
})

const Student = mongoose.models.Student || mongoose.model("Student", studentsSchema);
export default Student;