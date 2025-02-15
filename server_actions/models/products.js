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
    segment:{
        type: String,
    },
    class:{
        type: String,
    },
    duration:{
        type: String,
    },
    pageParameters:{
        type: String,
    }
},{ timestamps: true });

const Products = mongoose.models.Products || mongoose.model('Products', productsSchema);
export default Products;
