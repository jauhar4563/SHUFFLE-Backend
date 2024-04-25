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
exports.otpValidation = exports.registerValidation = exports.userLoginValidation = exports.userExistValidation = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const registerValidation = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username: userName, email, password } = req.body;
        const trimmedUserName = userName.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();
        if (!trimmedUserName || !trimmedEmail || !trimmedPassword) {
            res.status(400);
            throw new Error("Please fill all the forms");
        }
        const userExist = yield userModel_1.default.findOne({ email: trimmedEmail });
        if (userExist) {
            res.status(400);
            throw new Error("User already Exist");
        }
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not authenticated");
    }
}));
exports.registerValidation = registerValidation;
const otpValidation = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp } = req.body;
        if (!otp) {
            res.status(400);
            throw new Error("Please provide OTP");
        }
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not authenticated");
    }
}));
exports.otpValidation = otpValidation;
exports.userExistValidation = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        if (!userId) {
            res.status(400);
            throw new Error("User Id not found");
        }
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not User found");
    }
}));
exports.userLoginValidation = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email.trim() || !password.trim()) {
            res.status(400);
            throw new Error("Please add fields");
        }
        const user = yield userModel_1.default.findOne({ email });
        if (user) {
            if (user.isBlocked) {
                res.status(400);
                throw new Error("User is blocked");
            }
        }
        if (!user) {
            res.status(400);
            throw new Error("User not found");
        }
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not User found");
    }
}));
