import mongoose from "mongoose";
import StudentRequest from "./studentRequest";
import EnrolledStudent from "./enrolledStudent";
import CollegeTeacher from "./collegeTeacher";
const collegeSchema = new mongoose.Schema({
    collegeName: {
        type: String,
        required: true,
    },
    collegeCode: {
        type: String,
        required: true,
    },
    collegeLocation: {
        type: String,
        required: true,
    },
    collegeContact: {
        type: String,
        required: true,
    },
    collegeEmail: {
        type: String,
        required: true,
    },
    collegeLogo: {
        type: String,
    },
    collegeWebsite: {
        type: String,
    },
    principalName: {
        type: String,
    },
    principalContact: {
        type: String,
    },
    Address: {
        type: String,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    allocatedSubjects: {
        type: [String],
    },
    password: {
        type: String,
        default: "collegeadmin@123"
    },
    token: {
        type: String,
    },
    exams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Exam',
    }],
    studentRequests: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'StudentRequest',
    }],
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EnrolledStudent',
    }],
    collegeTeachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CollegeTeacher',
    }],
}, {
    timestamps: true
});

const College = mongoose.models.College || mongoose.model('College', collegeSchema);

export default College;
