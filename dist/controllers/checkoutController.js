"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPremiumUserDataController = exports.validatePaymentController = exports.initiatecheckoutController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const transactionModel_1 = __importDefault(require("../models/transactions/transactionModel"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default("sk_test_51P3Dg0SFbrlOtlupwDCCmAMC4m67Ji3ycQMfozETC5sawQ9Zkd7yPtUcUs6twrhsGxGep2EBZcGu7VmDMgNXmkcx00K2XpYzKp");
// @desc    Generate stripe session
// @route   get /post/get-post
// @access  Public
exports.initiatecheckoutController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    console.log(userId + "checkout");
    try {
        const user = yield userModel_1.default.findById(userId);
        if (user && user.isVerified === true) {
            res.json({
                success: false,
                message: "User is already subscribed to premium",
                user,
            });
        }
        const fare = "499";
        const session = yield stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: "Shuffle premium membership - 1Year",
                        },
                        unit_amount: parseInt(fare) * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.DOMAIN_NAME}/payment-success`,
            cancel_url: `${process.env.DOMAIN_NAME}/premium/payment-failed`,
            customer_email: user === null || user === void 0 ? void 0 : user.email,
            billing_address_collection: "required",
        });
        console.log("Stripe session created:", session);
        res.json({ success: true, id: session.id });
    }
    catch (error) {
        console.error("Error creating checkout session:", error);
        res
            .status(500)
            .json({ success: false, message: "Error creating checkout session" });
    }
}));
// @desc    validate payment
// @route   get /post/get-post
// @access  Public
const validatePaymentController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sessionId, userId } = req.body;
    const amount = "499";
    try {
        const user = yield userModel_1.default.findById(userId);
        if (user && user.isVerified === true) {
            return res.json({
                success: false,
                message: "User is already subscribed to premium",
            });
        }
        const existingPremium = yield transactionModel_1.default.findOne({
            transactionId: sessionId,
        });
        if (existingPremium) {
            return res
                .status(400)
                .json({ success: false, message: "Unauthorized access" });
        }
        const session = yield stripe.checkout.sessions.retrieve(sessionId);
        if (session && session.payment_status === "paid") {
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 364);
            const newPremium = new transactionModel_1.default({
                userId,
                amount,
                transactionId: sessionId,
                startDate: Date.now(),
                expiryDate,
            });
            yield newPremium.save();
            yield userModel_1.default.findByIdAndUpdate(userId, { isVerified: true, premiumExpiryDate: expiryDate });
            const updatedUser = yield userModel_1.default.findById(userId, { password: 0 });
            return res.json({
                success: true,
                message: "Premium document created and user updated successfully",
                user: updatedUser,
            });
        }
        else {
            return res.json({ success: false, message: "Payment not successful" });
        }
    }
    catch (error) {
        console.error("Error processing successful payment:", error);
        return res
            .status(500)
            .json({ success: false, message: "Error processing successful payment" });
    }
});
exports.validatePaymentController = validatePaymentController;
// @desc    Get all user transactions
// @route   get /post/get-post
// @access  Public
const getPremiumUserDataController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.body;
    try {
        const allPremiumUserData = yield transactionModel_1.default.find({ userId });
        const latestPremiumUser = yield transactionModel_1.default.findOne({ userId }).sort({
            startDate: -1,
        });
        res
            .status(200)
            .json({ success: true, allPremiumUserData, latestPremiumUser });
    }
    catch (error) {
        console.error("Error fetching premium user data:", error);
        res
            .status(500)
            .json({ success: false, message: "Error fetching premium user data" });
    }
});
exports.getPremiumUserDataController = getPremiumUserDataController;
