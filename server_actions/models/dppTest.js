import mongoose from "mongoose";

const dppTestSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
    },
    dpp: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dpp',
    },
    totalTimeTaken: {
        type: Number,
        default: 0,
    },
    correctAnswers: {
        type: Number,
        default: 0,
    },
    totalQuestions: {
        type: Number,
        default: 0,
    },
}, { timestamps: true })

const DppTest = mongoose.models.DppTest || mongoose.model('DppTest', dppTestSchema)
export default DppTest