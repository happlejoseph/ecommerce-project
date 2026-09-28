

import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer'
    },

    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
},

    addresses: [
        {
            label: {
                type: String,
                required: true,
                trim: true
            },

            fullName: {
                type: String,
                required: true,
                trim: true
            },

            phone: {
                type: Number,
                required: true
            },

            address: {
                type: String,
                required: true,
                trim: true
            },

            city: {
                type: String,
                required: true,
                trim: true
            },

            state: {
                type: String,
                required: true,
                trim: true
            },

            pincode: {
                type: Number,
                required: true
            }
        }
    ],

    resetPasswordOTP: {
        type: String,
    },

    resetPasswordOTPExpiry: {
        type: Date
    },

    


}, {timestamps: true});

const User = mongoose.model('User', userSchema);

export default User;