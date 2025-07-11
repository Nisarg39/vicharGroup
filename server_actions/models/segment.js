import mongoose from "mongoose";

const segmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Products'
    }],
}, { timestamps: true })

const Segment = mongoose.models?.Segment || mongoose.model("Segment", segmentSchema)

export default Segment
