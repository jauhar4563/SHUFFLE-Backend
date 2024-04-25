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
exports.getCommentsCount = exports.addReplyCommentController = exports.deletePostCommentController = exports.addCommentController = exports.getCommentsByPostIdController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const commentModel_1 = __importDefault(require("../models/comment/commentModel"));
const notificationHelper_1 = require("../helpers/notificationHelper");
const postModel_1 = __importDefault(require("../models/post/postModel"));
// @desc    Get all comments of a post
// @route   GET /post/get-comment
// @access  Private
exports.getCommentsByPostIdController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.postId;
    console.log(postId);
    const comments = yield commentModel_1.default.find({ postId: postId, isDeleted: false })
        .populate({
        path: "userId",
        select: "userName profileImg",
    })
        .populate({
        path: "replyComments.userId",
        select: "userName profileImg",
    })
        .sort({ createdAt: -1 });
    console.log(comments);
    res.status(200).json({ comments });
}));
// @desc    Add a comment
// @route   POST /post/add-comment
// @access  Private
exports.addCommentController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, userId, comment } = req.body;
    const newComment = yield commentModel_1.default.create({
        postId,
        userId,
        comment,
    });
    yield newComment.save();
    const postUploader = yield postModel_1.default.findById(postId);
    if (postUploader && postUploader.userId !== userId) {
        const notificationData = {
            senderId: userId,
            receiverId: postUploader.userId,
            message: "Commented on your post",
            link: `/users-profile/${postUploader.userId}/`,
            read: false,
        };
        (0, notificationHelper_1.createNotification)(notificationData);
    }
    const comments = yield commentModel_1.default.find({ postId: postId, isDeleted: false })
        .populate({
        path: "userId",
        select: "userName profileImg",
    })
        .populate({
        path: "replyComments.userId",
        select: "userName profileImg",
    });
    res.status(200).json({ message: "Comment added successfully", comments });
}));
// @desc    Delete a comment
// @route   POST /post/delete-comment
// @access  Private
exports.deletePostCommentController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("reaced deleted");
    const { commentId } = req.body;
    console.log(req.body);
    const comment = yield commentModel_1.default.findById(commentId);
    if (!comment) {
        res.status(404);
        throw new Error("Comment not found");
    }
    comment.isDeleted = true;
    yield comment.save();
    const comments = yield commentModel_1.default.find({
        postId: comment.postId,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "userName profileImg isVerified",
    })
        .populate({
        path: "replyComments.userId",
        select: "userName profileImg isVerified",
    })
        .sort({ createdAt: -1 });
    console.log("hello");
    res.status(200).json({ message: "Comment deleted successfully", comments });
}));
// @desc    reply comment
// @route   POST /post/reply-comment
// @access  Private
exports.addReplyCommentController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { commentId, userId, replyComment } = req.body;
    const comment = yield commentModel_1.default.findById(commentId);
    if (!comment) {
        res.status(404);
        throw new Error("Comment not found");
    }
    const newReplyComment = {
        userId,
        replyComment,
        timestamp: new Date(),
    };
    comment.replyComments.push(newReplyComment);
    yield comment.save();
    const postUploader = comment.userId;
    if (postUploader && postUploader !== userId) {
        const notificationData = {
            senderId: userId,
            receiverId: postUploader,
            message: "Replied to your comment",
            link: `/users-profile/${postUploader}/`,
            read: false,
        };
        (0, notificationHelper_1.createNotification)(notificationData);
    }
    const comments = yield commentModel_1.default.find({
        postId: comment.postId,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "userName profileImg isVerified",
    })
        .populate({
        path: "replyComments.userId",
        select: "userName profileImg isVerified",
    });
    res
        .status(200)
        .json({ message: "Reply comment added successfully", comments });
}));
// @desc    Comments count
// @route   POST /post/commentsCount
// @access  Public
exports.getCommentsCount = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.params.postId;
    const commentCounts = yield commentModel_1.default.countDocuments({
        postId,
        isDeleted: false,
    });
    res.status(200).json(commentCounts);
}));
