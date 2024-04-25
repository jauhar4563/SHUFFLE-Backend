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
exports.reportPostValidation = exports.userAndPostExistValidation = exports.postExistValidation = exports.createPostValidation = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
exports.createPostValidation = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, imageUrls, title, description, hideLikes, hideComment, hashtag, } = req.body;
        if (!userId.trim() || !imageUrls || !description.trim()) {
            res.status(400);
            throw new Error("Provide all details");
        }
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not authenticated");
    }
}));
exports.postExistValidation = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId } = req.body;
        if (!postId.trim()) {
            res.status(400);
            throw new Error("Post Id cannot be found");
        }
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not authenticated");
    }
}));
exports.userAndPostExistValidation = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { postId, userId } = req.body;
        if (!postId.trim() || !userId.trim()) {
            res.status(400);
            throw new Error("Post or user cannot be found");
        }
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not authenticated");
    }
}));
exports.reportPostValidation = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, postId, cause } = req.body;
        if (!postId.trim() || !userId.trim() || !cause.trim()) {
            res.status(400);
            throw new Error("Provide necessary informations");
        }
        next();
    }
    catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not authenticated");
    }
}));
