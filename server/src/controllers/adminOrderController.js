

import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";


// GET ALL ORDERS (ADMIN) //
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



// UPDATE ORDER STATUS (ADMIN) //
export const updateOrderStatus = async(req, res)=> {

    try {

        const {status, trackingNumber, courier, estimatedDelivery} = req.body;

        const order = await Order.findById(req.params.id);

        if(!order) {
            return res.status(404).json({
                message: 'Order not found'
            });
        }

        // only log + change status if it actually changed
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




// UPDATE RETURN STATUS (ADMIN) //
export const updateReturnStatus = async(req, res)=> {

    try {

        const { returnStatus } = req.body;

        const allowedStatuses = ['approved', 'rejected', 'refunded'];

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

        // 'refunded' can only follow an already-approved return.
        // 'approved' / 'rejected' can only follow a pending request.
        if(returnStatus === 'refunded' && order.returnStatus !== 'approved') {
            return res.status(400).json({
                message: 'Return must be approved before it can be marked as refunded'
            });
        }

        if(returnStatus !== 'refunded' && order.returnStatus !== 'requested') {
            return res.status(400).json({
                message: 'This order has no pending return request'
            });
        }

        // restock items only when a return is actually approved
        if(returnStatus === 'approved') {
            for(const item of order.items) {
                await Product.findByIdAndUpdate(
                    item.product,
                    {
                        $inc: {
                            stock: item.quantity
                        }
                    }
                );
            }
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