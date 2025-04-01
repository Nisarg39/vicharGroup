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
    videoLength: {
        type: String,
        required: true
    },
    videoThumbnail: {
        type: String,
        required: true
    },
    videoSection: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["unlocked", "locked"],
        required: true
    },
}, { timestamps: true });

export const Lecture = mongoose.models.Lecture || mongoose.model("Lecture", lectureSchema);