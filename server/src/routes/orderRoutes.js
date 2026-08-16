

import express from "express";
import { cancelOrder, createOrder, getMyOrder, getOrderById, requestReturn } from "../controllers/orderController.js";
import { auth } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { getAllOrders, updateOrderStatus, updateReturnStatus } from "../controllers/adminOrderController.js";


const router = express.Router();

router.post('/', auth, createOrder);
router.get('/', auth, getMyOrder);

router.get('/admin', auth, adminMiddleware, getAllOrders);
router.patch('/admin/:id/status', auth, adminMiddleware, updateOrderStatus)
router.patch('/admin/:id/return', auth, adminMiddleware, updateReturnStatus)

router.get('/:id', auth, getOrderById);
router.patch('/:id/cancel', auth, cancelOrder);
router.patch('/:id/return', auth, requestReturn);


export default router;