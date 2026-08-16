

import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";



// CREATE ORDER //
export const createOrder = async(req, res)=> {

    try {
        
        const {shippingAddress} = req.body;

        const cart = await Cart.findOne({
            user: req.user.id
        });

        if(!cart) {
            return res.status(404).json({
                message: 'Cart not found'
            });
        }

        if(cart.items.length === 0) {
            return res.status(400).json({
                message: 'Cart is empty'
            });
        }

        const orderItems = [];

        for(const item of cart.items) {

            const product = await Product.findById(item.product);

            if(!product) {
                return res.status(404).json({
                    message: 'Product not found'
                });
            }

            if(product.stock < item.quantity) {
                return res.status(400).json({
                    message: `${product.name} does not have enough stock`
                });
            }

            orderItems.push({
                product: product._id,
                name: product.name,
                image: product.image.url,
                quantity: item.quantity,
                price: product.price
            });
        }

        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            shippingAddress,
            statusHistory: [
                { status: 'pending' }
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

        res.status(201).json({
            message: 'Order created successfully',
            order
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}




// GET ORDERS //
export const getMyOrder = async(req, res)=> {

    try {

        const orders = await Order.find({
            user: req.user.id
        })
        .populate('items.product')
        .sort({createdAt: -1});

        res.status(200).json({
            orders
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}



// GET ORDER BY ID //
export const getOrderById = async(req, res)=> {

    try {

        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate('items.product');
        
        if(!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        res.status(200).json({
            order
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}



// CANCEL ORDER //
export const cancelOrder = async(req, res)=> {

    try {

        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if(!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        if(order.status === 'shipping' || order.status === 'delivered' || order.status === 'cancelled') {
            
            return res.status(400).json({
                message: 'Order cannot be cancelled'
            });
        }

        for(const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                {
                    $inc: {
                        stock: item.quantity
                    }
                }
            )
        }

        order.status = 'cancelled';
        order.statusHistory.push({ status: 'cancelled' });

        await order.save();

        res.status(200).json({
            message: 'Order cancelled successfully',
            order
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}




// REQUEST RETURN //
export const requestReturn = async(req, res)=> {

    try {

        const { reason } = req.body;

        if(!reason || !reason.trim()) {
            return res.status(400).json({
                message: 'Please provide a reason for the return'
            });
        }

        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if(!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        if(order.status !== 'delivered') {
            return res.status(400).json({
                message: 'Only delivered orders can be returned'
            });
        }

        if(order.returnStatus !== 'none') {
            return res.status(400).json({
                message: 'A return has already been requested for this order'
            });
        }

        order.returnStatus = 'requested';
        order.returnReason = reason.trim();
        order.returnRequestedAt = new Date();

        await order.save();

        res.status(200).json({
            message: 'Return request submitted successfully',
            order
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}