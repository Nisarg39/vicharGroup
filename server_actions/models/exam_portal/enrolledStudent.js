import mongoose from 'mongoose';

const enrolledStudentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    allocatedSubjects: {
        type: [String],
        default: [],
    },
    college: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true,
    },
    class : {
        type: String,
        required: true,
    },
}, {
    timestamps: true
});

const EnrolledStudent = mongoose.models.EnrolledStudent || mongoose.model('EnrolledStudent', enrolledStudentSchema);

export default EnrolledStudent;
