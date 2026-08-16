

import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { auth } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import { addProduct, deleteProduct, getProductById, getProducts, updateProduct } from "../controllers/productController.js";


const router = express.Router();


router.post('/', auth, adminMiddleware, upload.single('image'), addProduct);
router.put('/:id', auth, adminMiddleware, upload.single('image'), updateProduct);
router.delete('/:id', auth, adminMiddleware, deleteProduct);


router.get('/', getProducts);
router.get('/:id', getProductById);


export default router;