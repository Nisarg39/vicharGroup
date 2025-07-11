import mongoose from "mongoose";
const bannerSchema = new mongoose.Schema({
    serialNumber: {
        type: Number,
        required: true,
    },
    imageUrl: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Banner = mongoose.models?.Banner || mongoose.model("Banner", bannerSchema);
export default Banner;