

import { Router } from "express";
import { loginUser, registerUser, verifyOTP, verifyLoginOTP, resendLoginOTP} from "../controllers/authController.js";


const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/verify-login-otp', verifyLoginOTP);
router.post('/resend-login-otp', resendLoginOTP);


export default router;
