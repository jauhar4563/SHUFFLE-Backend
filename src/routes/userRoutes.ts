import express from 'express'
import { registerUser,verifyOTP ,loginUser, resendOtp, googleAuth, forgotPassword,forgotOtp, resetPassword, getHashtags } from '../controllers/userController';
import { protect } from '../middlewares/auth';
const router = express.Router()


router.post('/register',registerUser);
router.post('/login',loginUser);
router.post('/register-otp',verifyOTP);
router.post('/resend-otp',resendOtp);
router.post('/google-auth',googleAuth);
router.post('/forgot-password',forgotPassword)
router.post('/forgot-otp',forgotOtp)
router.post('/reset-password',resetPassword)
router.get('/get-hashtags',getHashtags)


export default router