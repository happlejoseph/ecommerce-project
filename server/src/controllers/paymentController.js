

import crypto from "crypto";

import razorpay from "../config/razorpay.js";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";



export const createPaymentOrder = async (req, res) => {

    try {
        const cart = await Cart.findOne({
            user: req.user.id
        });

        if(!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        if(cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        let totalAmount = 0;

        for (const item of cart.items) {

            const product = await Product.findById(item.product);

            if(!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            if(product.stock < item.quantity) {
                return res.status(400).json({
                    message: `${product.name} does not have enough stock`
                });
            }

            const price = product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)): product.price;
                
                totalAmount += price * item.quantity;
        }


        const amountInPaise = totalAmount * 100;
        

        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        });

        return res.status(200).json({
            message: "Payment order created successfully",
            order: razorpayOrder,
            amount: totalAmount,
            key: process.env.RAZORPAY_KEY_ID
        });
    }
    
    catch (error) {
        console.error("Create payment order error:", error);

        return res.status(500).json({
            message: error.message
        });
    }
};





export const verifyPayment = async (req, res) => {

    try {
        
        const {razorpay_order_id, razorpay_payment_id, razorpay_signature, shippingAddress} = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({
                message: "Payment verification data is missing"
            });
        }


        if(!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
            return res.status(400).json({
                message: 'Complete shipping address is required'
            });
        }


        const generatedSignature = crypto.createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )
            .update(
                `${razorpay_order_id}|${razorpay_payment_id}`
            )
            .digest("hex");

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({
                message: "Invalid payment signature"
            });
        }

        const cart = await Cart.findOne({
            user: req.user.id
        });

        if(!cart) {
            return res.status(404).json({
                message: "Cart not found"
            });
        }

        if(cart.items.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        const orderItems = [];

        let totalAmount = 0;

        for(const item of cart.items) {
            const product = await Product.findById(item.product);

            if(!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            if(product.stock < item.quantity) {
                return res.status(400).json({
                    message: `${product.name} does not have enough stock`
                });
            }

            const price = product.discount > 0 ? Math.round(product.price * (1 - product.discount / 100)): product.price;

            totalAmount += price * item.quantity;

            orderItems.push({
                product: product._id,
                name: product.name,
                image: product.image.url,
                quantity: item.quantity,
                price
            });
        }

        const order = await Order.create({
            user: req.user.id,

            items: orderItems,

            shippingAddress,

            paymentMethod: "online",

            paymentStatus: "paid",

            razorpayOrderId: razorpay_order_id,

            razorpayPaymentId: razorpay_payment_id,

            statusHistory: [
                {
                    status: "pending"
                }
            ]
        });


        for(const item of cart.items) {
            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        stock: -item.quantity
                    }
                }
            );
        }

        cart.items = [];

        await cart.save();

        return res.status(201).json({
            message:
                "Payment verified and order created successfully",
            order
        });
    }
    
    catch (error) {
        console.error(
            "Payment verification error:",
            error
        );

        return res.status(500).json({
            message: error.message
        });
    }
};