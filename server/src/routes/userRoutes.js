

import express from "express";

import { forgotPassword, getAllUsers, getProfile, resetPassword, updateProfile, verifyResetOtp } from "../controllers/userController.js";
import { auth } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();


router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

router.get('/', auth, adminMiddleware, getAllUsers);


export default router;