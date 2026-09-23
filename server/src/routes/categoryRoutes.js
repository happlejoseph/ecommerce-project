

import express from "express";
import { addCategory, deleteCategory, getCategories, getCategoryById, updateCategory } from "../controllers/categoryController.js";
import { auth } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";


const router = express.Router();

router.post('/', auth, adminMiddleware, upload.single('video'), addCategory);
router.put('/:id', auth, adminMiddleware, upload.single('video'), updateCategory);
router.delete('/:id', auth, adminMiddleware, deleteCategory);

router.get('/', getCategories);
router.get('/:id', getCategoryById);

export default router;