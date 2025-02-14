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
        enum: ["course", "test-series"],
        required: true
    },

},{ timestamps: true });

const Products = mongoose.models.Products || mongoose.model('Products', productsSchema);
export default Products;
