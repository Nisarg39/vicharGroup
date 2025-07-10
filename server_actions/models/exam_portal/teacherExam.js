import mongoose from "mongoose";
import { type } from "os";

const teacherExamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImageUrl: {
        type: String,
        default: "",
    },
    subject: {
        type: String,
    },
    token: {
        type: String,
    },
}, {timestamps: true})

const TeacherExam = mongoose.models.TeacherExam || mongoose.model("TeacherExam", teacherExamSchema);
export default TeacherExam;