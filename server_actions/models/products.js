import mongoose from "mongoose";

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
        enum: ["course", "test-series", "mtc"],
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
    image: {
        type: String,
    },
    segment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Segment'
    },
    cart_url:{
        type: String
    },
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject'
        }
    ]
},{ timestamps: true });

const Products = mongoose.models?.Products || mongoose.model('Products', productsSchema);
export default Products;
