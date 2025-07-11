import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    bio: {
        type: String,
        default: ""
    },
    imageUrl: {
        type: String,
        default: ""
    },
}, { timestamps: true })

const Teacher = mongoose.models?.Teacher || mongoose.model("Teacher", teacherSchema)
export default Teacher