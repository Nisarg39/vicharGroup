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
        enum: ['image', 'video', 'audio', 'text'],
    },
    objectiveoptions: [{
        option: {
            type: String,
        },
        text: {
            type: String,
        },
        isImage: {
            type: Boolean,
            default: false,
        }
    }],
    multipleObjective: [{
        option: {
            type: String,
        },
        text: {
            type: String,
        },
        isImage: {
            type: Boolean,
            default: false,
        }
    }],
    answerObjective: {
        type: String,
    },
    answerMultiple: {
        type: [String],
    },
    answerNumeric: {
        type: Number,
    },
}, {timestamps: true})

const DppQuestion = mongoose.models.DppQuestion || mongoose.model('DppQuestion', dppQuestionSchema)

export default DppQuestion