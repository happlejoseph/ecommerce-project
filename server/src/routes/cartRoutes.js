

import express from "express";
import { addToCart, getCart, updateCart } from "../controllers/cartController.js";
import { auth } from "../middleware/authMiddleware.js"


const router = express.Router();

router.post('/add', auth, addToCart);
router.get('/', auth, getCart);
router.patch('/', auth, updateCart);

export default router;