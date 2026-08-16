

import mongoose from "mongoose";
import Category from "./categoryModel.js";


const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    discount: {
        type: Number,
        default: 0
    },

    stock: {
        type: Number,
        required: true,
        default: 0
    },

    image: {
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },

    // cached rating stats, recalculated whenever a review is
    // added / edited / deleted (see reviewController.js)
    averageRating: {
        type: Number,
        default: 0
    },

    numReviews: {
        type: Number,
        default: 0
    }

}, {timestamps: true});

const Product = mongoose.model('Product', productSchema);

export default Product;