import express, {  Request, Response } from 'express'
import { registerUser,verifyOTP ,loginUser, resendOtp, googleAuth, forgotPassword,forgotOtp, resetPassword } from '../controllers/userController';
const router = express.Router()

router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/register-otp',verifyOTP);
router.post('/resend-otp',resendOtp);
router.post('/google-auth',googleAuth);
router.post('/forgot-password',forgotPassword)
router.post('/forgot-otp',forgotOtp)
router.post('/reset-password',resetPassword)
export default router