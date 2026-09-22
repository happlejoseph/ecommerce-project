

import mongoose from "mongoose";


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
        ref: 'Category',
        required: true
    },

    movement: {
        type: String,
        required: true,
        trim: true
    },

    caseMaterial: {
        type: String,
        required: true,
        trim: true
    },

    strapMaterial: {
        type: String,
        required: true,
        trim: true
    },

    waterResistance: {
        type: String,
        required: true,
        trim: true
    },

    warranty: {
        type: String,
        required: true,
        trim: true
    },

    averageRating: {
        type: String,
        default: 0
    },

    numReview: {
        type: String,
        default: 0
    }
    
}, {timestamps: true});

const Product = mongoose.model('Product', productSchema);

export default Product;