import mongoose from "mongoose";
import { type } from "os";

const productsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    price:{
        type: Number,
        required: true
    },
    discountPrice:{
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ["course", "test-series"],
        required: true
    },
    class:{
        type: String,
    },
    duration:{
        type: String,
    },
    pageParameters:{
        type: String,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    segment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Segment'
    },
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        }
    ]
},{ timestamps: true });

const Products = mongoose.models.Products || mongoose.model('Products', productsSchema);
export default Products;
