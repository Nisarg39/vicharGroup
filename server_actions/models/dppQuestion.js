import mongoose from "mongoose";

const dppQuestionSchema = new mongoose.Schema({
    serialNumber: {
        type: Number,
        required: true,
    },
    question: {
        type: String,
        required: true,
    },
    questionType: {
        type: String,
        enum: ['objective', 'multiple', 'numeric'],
        required: true,
    },
    options: [{
        option: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        }
    }],
    answerObjective: {
        type: String,
        required: true,
    },
    answerMultiple: {
        type: [String],
        required: true,
    },
    answerNumeric: {
        type: Number,
        required: true,
    },
    attachmentType: {
        type: String,
        enum: ['image', 'video', 'audio', 'text'],
    },
    attachmentUrl: {
        type: String,   
    },
}, {timestamps: true})

const DppQuestion = mongoose.models.DppQuestion || mongoose.model('DppQuestion', dppQuestionSchema)

export default DppQuestion