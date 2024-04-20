import express from "express";
import {
  registerUserController,
  verifyOTPController,
  loginUserController,
  resendOtpController,
  googleAuthController,
  forgotPasswordController,
  forgotOtpController,
  resetPasswordController,
  getHashtagsController,
  getUserDetailsController,
  editProfileController,
  userSuggestionsController,
} from "../controllers/userController";
import { protect } from "../middlewares/auth";
import {
  otpValidation,
  registerValidation,
  userExistValidation,
  userLoginValidation,
} from "../validations/userValidations";
import {
  getPremiumUserDataController,
  initiatecheckoutController,
  validatePaymentController,
} from "../controllers/checkoutController";
import { getNotifications } from "../controllers/notificationController";
const router = express.Router();

router.post("/register", registerValidation, registerUserController);
router.post("/login", userLoginValidation, loginUserController);
router.post("/register-otp", otpValidation, verifyOTPController);
router.post("/resend-otp", resendOtpController);
router.post("/google-auth", googleAuthController);
router.post("/forgot-password", forgotPasswordController);
router.post("/forgot-otp", forgotOtpController);
router.post("/reset-password", resetPasswordController);
router.get("/get-hashtags", getHashtagsController);
router.get("/user-details/:userId", getUserDetailsController);
router.patch("/edit-profile", userExistValidation, editProfileController);
router.post(
  "/user-suggestions",
  userExistValidation,
  userSuggestionsController
);
router.post("/checkout-user", initiatecheckoutController);
router.post("/validate-payment", validatePaymentController);
router.post("/get-transactions", getPremiumUserDataController);
router.post("/get-notifications", getNotifications);

export default router;
