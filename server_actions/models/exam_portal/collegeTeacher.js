import mongoose from "mongoose";

const collegeTeacherSchema = new mongoose.Schema({
    college: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    allocatedSubjects: {
        type: [String],
    },
    profileImageUrl: {
        type: String,
    },
    allocatedClasses: {
        type: [String],
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
},{
    timestamps: true
})

const CollegeTeacher = mongoose.models.CollegeTeacher || mongoose.model('CollegeTeacher', collegeTeacherSchema)

export default CollegeTeacher
