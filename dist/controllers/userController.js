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
exports.userSearchController = exports.userSuggestionsController = exports.editProfileController = exports.getUserDetailsController = exports.getHashtagsController = exports.resetPasswordController = exports.forgotOtpController = exports.forgotPasswordController = exports.googleAuthController = exports.loginUserController = exports.resendOtpController = exports.verifyOTPController = exports.registerUserController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const speakeasy_1 = __importDefault(require("speakeasy"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const sendVerifyMail_1 = __importDefault(require("../utils/sendVerifyMail"));
const hashtagModel_1 = __importDefault(require("../models/hashtag/hashtagModel"));
const connectionModel_1 = __importDefault(require("../models/connections/connectionModel"));
// @desc    Register new User
// @route   USER /register
// @access  Public
exports.registerUserController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username: userName, email, password } = req.body;
    const otp = speakeasy_1.default.totp({
        secret: speakeasy_1.default.generateSecret({ length: 20 }).base32,
        digits: 4,
    });
    const sessionData = req.session;
    sessionData.userDetails = { userName, email, password };
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now();
    console.log(sessionData.otp);
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    sessionData.userDetails.password = hashedPassword;
    (0, sendVerifyMail_1.default)(req, userName, email);
    res.status(200).json({ message: "OTP sent for verification", email });
}));
// @desc    Register OTP Verification
// @route   USER /register-otp
// @access  Public
exports.verifyOTPController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    console.log(req.session);
    const sessionData = req.session;
    const storedOTP = sessionData.otp;
    console.log(storedOTP);
    if (!storedOTP || otp !== storedOTP) {
        res.status(400);
        throw new Error("Invalid OTP");
    }
    const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
    const currentTime = Date.now();
    const otpExpirationTime = 60 * 1000;
    if (currentTime - otpGeneratedTime > otpExpirationTime) {
        res.status(400);
        throw new Error("OTP has expired");
    }
    const userDetails = sessionData.userDetails;
    if (!userDetails) {
        res.status(400);
        throw new Error("User details not found in session");
    }
    const user = yield userModel_1.default.create({
        userName: userDetails.userName,
        email: userDetails.email,
        password: userDetails.password,
    });
    yield connectionModel_1.default.create({
        userId: user._id,
    });
    delete sessionData.userDetails;
    delete sessionData.otp;
    delete sessionData.otpGeneratedTime;
    res.status(200).json({ message: "OTP verified, user created", user });
}));
// @desc    Resend OTP
// @route   USER /resend-otp
// @access  Public
exports.resendOtpController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    console.log(email);
    const otp = speakeasy_1.default.totp({
        secret: speakeasy_1.default.generateSecret({ length: 20 }).base32,
        digits: 4,
    });
    const sessionData = req.session;
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now();
    const userDetails = sessionData.userDetails;
    if (!userDetails) {
        res.status(400);
        throw new Error("User details not found in session");
        return;
    }
    console.log(otp);
    (0, sendVerifyMail_1.default)(req, userDetails.userName, userDetails.email);
    res.status(200).json({ message: "OTP sent for verification", email });
}));
// @desc    User Login
// @route   USER /login
// @access  Public
exports.loginUserController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const user = yield userModel_1.default.findOne({ email });
    if (user && (yield bcryptjs_1.default.compare(password, user.password))) {
        res.json({
            message: "Login Successful",
            _id: user.id,
            userName: user.userName,
            email: user.email,
            profileImg: user.profileImg,
            savedPost: user.savedPost,
            bio: user.bio,
            phone: user.phone,
            isPrivate: user.isPrivate,
            isVerified: user.isVerified,
            token: (0, generateToken_1.default)(user.id),
        });
    }
    else {
        res.status(400);
        throw new Error("Invalid Credentials");
    }
}));
// @desc    Google Authentication
// @route   USER /google-auth
// @access  Public
exports.googleAuthController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, email, imageUrl } = req.body;
    try {
        const userExist = yield userModel_1.default.findOne({ email });
        if (userExist) {
            if (userExist.isBlocked) {
                res.status(400);
                throw new Error("User is blocked");
            }
            if (userExist.isGoogle) {
                res.json({
                    message: "Login Successful",
                    _id: userExist.id,
                    userName: userExist.userName,
                    email: userExist.email,
                    profileImg: userExist.profileImg,
                    savedPost: userExist.savedPost,
                    bio: userExist.bio,
                    phone: userExist.phone,
                    isPrivate: userExist.isPrivate,
                    isVerified: userExist.isVerified,
                    token: (0, generateToken_1.default)(userExist.id),
                });
                return;
            }
            else {
                res.status(400);
                throw new Error("User already Exist with that email. Try a differeny email");
            }
        }
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = yield bcryptjs_1.default.hash(randomPassword, 10);
        const newUser = yield userModel_1.default.create({
            userName: username,
            email,
            password: hashedPassword,
            profileImg: imageUrl,
            isGoogle: true,
        });
        yield connectionModel_1.default.create({
            userId: newUser._id,
        });
        const token = (0, generateToken_1.default)(newUser.id);
        res.status(200).json({
            message: "Login Successful",
            _id: newUser.id,
            userName: newUser.userName,
            email: newUser.email,
            profileImg: newUser.profileImg,
            savedPost: newUser.savedPost,
            bio: newUser.bio,
            phone: newUser.phone,
            isPrivate: newUser.isPrivate,
            isVerified: newUser.isVerified,
            token: token,
        });
    }
    catch (error) {
        console.error("Error in Google authentication:", error);
        res.status(500).json({ message: "Server error" });
    }
}));
// @desc    Forgot Password
// @route   USER /forgot-password
// @access  Public
exports.forgotPasswordController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield userModel_1.default.findOne({ email });
    if (!user) {
        res.status(400);
        throw new Error("User not found");
    }
    if (user) {
        const otp = speakeasy_1.default.totp({
            secret: speakeasy_1.default.generateSecret({ length: 20 }).base32,
            digits: 4,
        });
        const sessionData = req.session;
        sessionData.otp = otp;
        sessionData.otpGeneratedTime = Date.now();
        sessionData.email = email;
        (0, sendVerifyMail_1.default)(req, user.userName, user.email);
        console.log(otp);
        res
            .status(200)
            .json({ message: `OTP has been send to your email`, email });
    }
    else {
        res.status(400);
        throw new Error("Not User Found");
    }
}));
// @desc    Forgot Password OTP verification
// @route   USER /forgot-otp
// @access  Public
exports.forgotOtpController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { otp } = req.body;
    if (!otp) {
        res.status(400);
        throw new Error("Please provide OTP");
    }
    const sessionData = req.session;
    const storedOTP = sessionData.otp;
    console.log(storedOTP);
    if (!storedOTP || otp !== storedOTP) {
        res.status(400);
        throw new Error("Invalid OTP");
    }
    const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
    const currentTime = Date.now();
    const otpExpirationTime = 60 * 1000;
    if (currentTime - otpGeneratedTime > otpExpirationTime) {
        res.status(400);
        throw new Error("OTP has expired");
    }
    delete sessionData.otp;
    delete sessionData.otpGeneratedTime;
    res.status(200).json({
        message: "OTP has been verified. Please reset password",
        email: sessionData === null || sessionData === void 0 ? void 0 : sessionData.email,
    });
}));
// @desc    Reset-Password
// @route   USER /reset-passwordt
// @access  Public
exports.resetPasswordController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, confirmPassword } = req.body;
    const sessionData = req.session;
    if (!sessionData || !sessionData.email) {
        res.status(400);
        throw new Error("No session data found");
    }
    if (password !== confirmPassword) {
        res.status(400);
        throw new Error("Password do not match");
    }
    const user = yield userModel_1.default.findOne({ email: sessionData.email });
    if (!user) {
        res.status(400);
        throw new Error("User Not Found");
    }
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    user.password = hashedPassword;
    yield user.save();
    res.status(200).json({ message: "Password has been reset successfully" });
}));
// @desc    Get all hashtags
// @route   User /get-hashtags
// @access  Public
exports.getHashtagsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hashtags = yield hashtagModel_1.default.find({ isBlocked: false }).sort({
        date: -1,
    });
    if (hashtags) {
        res.status(200).json({ hashtags });
    }
    else {
        res.status(404);
        throw new Error(" No Hashtags Found");
    }
}));
// @desc    Get all hashtags
// @route   User /get-hashtags
// @access  Public
exports.getUserDetailsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const user = yield userModel_1.default.findById(userId);
    const connections = yield connectionModel_1.default.findOne({ userId });
    if (user) {
        res.status(200).json({ user, connections });
    }
    else {
        res.status(404);
        throw new Error(" user Not found");
    }
}));
// @desc    Edit User Profile
// @route   User /edit-profile
// @access  Public
exports.editProfileController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, image, name, phone, bio, gender, isPrivate } = req.body;
    const user = yield userModel_1.default.findById(userId);
    console.log(userId, image, name, phone, bio, gender, isPrivate);
    if (!user) {
        res.status(400);
        throw new Error("User cannot be found");
    }
    if (name)
        user.userName = name;
    if (image)
        user.profileImg = image;
    if (phone)
        user.phone = phone;
    if (bio)
        user.bio = bio;
    if (gender)
        user.gender = gender;
    if (isPrivate !== undefined)
        user.isPrivate = isPrivate;
    yield user.save();
    res.status(200).json({
        _id: user.id,
        userName: user.userName,
        email: user.email,
        profileImg: user.profileImg,
        savedPost: user.savedPost,
        bio: user.bio,
        phone: user.phone,
        isPrivate: user.isPrivate,
        isVerified: user.isVerified,
        token: (0, generateToken_1.default)(user.id),
    });
}));
exports.userSuggestionsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, searchTerm } = req.body;
    const connection = yield connectionModel_1.default.findOne({ userId });
    if (!connection ||
        ((connection === null || connection === void 0 ? void 0 : connection.followers.length) === 0 && (connection === null || connection === void 0 ? void 0 : connection.following.length) === 0)) {
        let users;
        if (!searchTerm) {
            users = yield userModel_1.default.find({ _id: { $ne: userId } });
        }
        else {
            users = yield userModel_1.default.find({
                userName: { $regex: searchTerm, $options: "i" },
                _id: { $ne: userId },
            });
        }
        res.status(200).json({ suggestedUsers: users });
        return;
    }
    const followingIds = connection.following.map((user) => user._id);
    const requestedIds = connection.requestSent.map((user) => user._id);
    let suggestedUsers;
    if (searchTerm) {
        suggestedUsers = yield userModel_1.default.find({
            userName: { $regex: searchTerm, $options: "i" },
            // _id: { $nin: [...followingIds, ...requestedIds, userId] }
            isBlocked: false,
        })
            .limit(6)
            .sort({ isVerified: -1 });
    }
    else {
        suggestedUsers = yield userModel_1.default.find({
            _id: { $nin: [...followingIds, ...requestedIds, userId] },
        })
            .limit(6)
            .sort({ isVerified: -1 });
    }
    res.status(200).json({ suggestedUsers });
}));
exports.userSearchController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { searchTerm } = req.body;
    console.log(req.body);
    let suggestedUsers = [];
    if (searchTerm) {
        suggestedUsers = yield userModel_1.default.find({
            userName: { $regex: searchTerm, $options: "i" },
            isBlocked: false,
        })
            .limit(6)
            .sort({ isVerified: -1 });
    }
    else {
        suggestedUsers = yield userModel_1.default.find({
            isBlocked: false,
        })
            .limit(6)
            .sort({ isVerified: -1 });
    }
    res.status(200).json(suggestedUsers);
}));
