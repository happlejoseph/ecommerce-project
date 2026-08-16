

import express from "express";
import {
    addReview,
    getProductReviews,
    getMyReview,
    updateReview,
    deleteReview
} from "../controllers/reviewController.js";
import { auth } from "../middleware/authMiddleware.js";


const router = express.Router();

router.post('/', auth, addReview);
router.get('/product/:productId', getProductReviews);
router.get('/product/:productId/mine', auth, getMyReview);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);

export default router;
