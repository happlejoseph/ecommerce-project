

import mongoose from "mongoose";


const orderSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    items: [
        {
            name: {
                type: String,
                // required: true
            },

            image: {
                type: String,
                // required: true
            },

            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },

            quantity: {
                type: Number,
                required: true,
                min: 1
            },

            price: {
                type: Number,
                required: true
            }
        }
    ],

    shippingAddress: {
        fullName: {
            type: String,
            required: true
        },

        phone: {
            type: Number,
            required: true
        },

        address: {
            type: String,
            required: true
        },

        city: {
            type: String,
            required: true
        },

        state: {
            type: String,
            required: true
        },

        pincode: {
            type: Number,
            required: true
        }
    },

    status: {
        type: String,
        enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
        default: 'pending'
    },

    // a timestamped log of every status change, used to render
    // the order tracking timeline on the frontend
    statusHistory: [
        {
            status: {
                type: String
            },

            updatedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],

    // shipment tracking info, set by admin
    trackingNumber: {
        type: String
    },

    courier: {
        type: String
    },

    estimatedDelivery: {
        type: Date
    },

    // return / refund
    returnStatus: {
        type: String,
        enum: ['none', 'requested', 'approved', 'rejected', 'refunded'],
        default: 'none'
    },

    returnReason: {
        type: String
    },

    returnRequestedAt: {
        type: Date
    }

}, {timestamps: true});

const Order = mongoose.model('Order', orderSchema);

export default Order;