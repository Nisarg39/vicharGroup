import mongoose from "mongoose";

const studentRequestSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
    },
    college: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'College',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    allocatedStreams: {
        type: [String],
        required: true,
    },
    allocatedClasses: {
        type: [String],
        required: true,
    },
}, {
    timestamps: true
});

const StudentRequest = mongoose.models.StudentRequest || mongoose.model('StudentRequest', studentRequestSchema);

export default StudentRequest;