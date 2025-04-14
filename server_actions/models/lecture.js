import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    serialNumber: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    videoUrl: {
        type: String,
        required: true
    },
}, { timestamps: true });

const Lecture = mongoose.models.Lecture || mongoose.model("Lecture", lectureSchema);

export default Lecture;