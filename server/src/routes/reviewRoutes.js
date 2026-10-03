

import express from "express";
import {addReview, getProductReviews, deleteReview} from "../controllers/reviewController.js";
import { auth } from "../middleware/authMiddleware.js";



const router = express.Router();



router.post('/', auth, addReview);

router.get('/product/:productId', getProductReviews);

router.delete('/:id', auth, deleteReview);

export default router;
