import mongoose from "mongoose";

let Schema = mongoose.Schema
const mcqQuestionSchema = new Schema({
    stream: {
        type: String, required: true
    },
    standard: {
        type: String, required: true
    },
    topic: {
        type: String, default: "Others"
    },
    questionNumber: {
        type: Number, required: true
    },
    question: {
        type: String, required: true
    },
    subject: {
        type: String, required: true
    },
    options: {
        type: [String], required: true
    },
    answer: {
        type: String, required: true
    },
    marks: {
        type: Number, required: true
    },
    section: {
        type: Number, required: false, default: null
    },
    userInputAnswer: {
        type: Boolean, required: true
    },
    usedInExamsCount: {
        type: Number, default: 0
    },
    createdAt: {
        type: Date, default: Date.now
    }
});
mcqQuestionSchema.index({ questionNumber: 1, subject: 1 }, { unique: true })

export default mongoose.model("master_mcq_question", mcqQuestionSchema) || mongoose.model(master_mcq_question);