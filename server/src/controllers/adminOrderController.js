

import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";


// GET ALL ORDERS //
export const getAllOrders = async(req, res)=> {

    try {

        const orders = await Order.find()
        .populate('user', 'name email')
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





// UPDATE order stat //
export const updateOrderStatus = async(req, res)=> {

    try {

        const {status, trackingNumber, courier, estimatedDelivery} = req.body;

        const allowedStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];

        if(status && !allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: 'Invalid order status'
            });
        }

        const order = await Order.findById(req.params.id);

        if(!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        if(status && status !== order.status) {
            order.status = status;
            order.statusHistory.push({ status });
        }

        if(trackingNumber !== undefined) order.trackingNumber = trackingNumber;
        if(courier !== undefined) order.courier = courier;
        if(estimatedDelivery !== undefined) order.estimatedDelivery = estimatedDelivery;

        await order.save();

        res.status(200).json({
            message: 'Order updated successfully',
            order
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}






// UPDATE RETUrn status //
export const updateReturnStatus = async(req, res)=> {

    try {

        const { returnStatus } = req.body;

        const allowedStatuses = ['approved', 'rejected',];

        if(!allowedStatuses.includes(returnStatus)) {
            return res.status(400).json({
                message: 'Invalid return status'
            });
        }

        const order = await Order.findById(req.params.id);

        if(!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        
        if(order.returnStatus !== 'requested') {
            return res.status(400).json({
                message: 'This order has no pending return request'
            });
        }

        order.returnStatus = returnStatus;

        await order.save();

        res.status(200).json({
            message: `Return ${returnStatus} successfully`,
            order
        });

    }
    catch(error) {

        res.status(500).json({
            message: error.message
        });
    }
}