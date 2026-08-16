

import express from "express";
import { auth } from "../middleware/authMiddleware.js";
import { addToWishlist, getWishlist, removeFromWishlist } from "../controllers/wishlistController.js";


const router = express.Router();

router.post('/add', auth, addToWishlist);
router.get('/', auth, getWishlist);
router.delete('/remove', auth, removeFromWishlist);


export default router;
