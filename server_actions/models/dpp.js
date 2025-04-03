import mongoose from "mongoose";

const dppSchema = new mongoose.Schema({
    serialNumber: {
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    dppCode: {
        type: String,
        required: true
    },
    chapterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
        required: true
    },
}, {timestamps: true})

const Dpp = mongoose.models.Dpp || mongoose.model("Dpp", dppSchema)
export default Dpp;