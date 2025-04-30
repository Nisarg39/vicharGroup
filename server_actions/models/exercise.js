import mongoose from "mongoose";

const exerciseSchema = new mongoose.Schema({
    exerciseName: {
        type: String,
        required: true
    },
    pdfUrl: {
        type: String,
        required: true
    }
}, { timestamps: true })

const Exercise = mongoose.models.Exercise || mongoose.model("Exercise", exerciseSchema)
export default Exercise