import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
    subjectCode: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    chapters: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter'
    }],
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }
}, { timestamps: true })

const Subject = mongoose.models.Subject || mongoose.model("Subject", subjectSchema)

export default Subject
