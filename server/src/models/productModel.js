

import mongoose from "mongoose";


const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    stock: {
        type: Number,
        required: true,
        default: 0,
        min: 0
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
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },

    numReviews: {
        type: Number,
        default: 0
    }
    
}, {timestamps: true});

const Product = mongoose.model('Product', productSchema);

export default Product;