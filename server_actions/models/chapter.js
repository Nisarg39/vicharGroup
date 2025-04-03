import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema({
    chapterName: {
        type: String,
        required: true
    },
    serialNumber: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    lectures: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lecture'
    }],
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject'
    },
    dpps: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dpp'
    }]

}, { timestamps: true })

const Chapter = mongoose.models.Chapter || mongoose.model("Chapter", chapterSchema)

export default Chapter
