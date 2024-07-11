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
exports.reportPostController = exports.getSavedPostController = exports.savePostController = exports.likePostController = exports.deletePostController = exports.updatePostController = exports.getUserPostController = exports.getPostController = exports.addPostController = void 0;
const postModel_1 = __importDefault(require("../models/post/postModel"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const generateToken_1 = __importDefault(require("../utils/generateToken"));
const connectionModel_1 = __importDefault(require("../models/connections/connectionModel"));
const reportModel_1 = __importDefault(require("../models/reports/reportModel"));
const notificationHelper_1 = require("../helpers/notificationHelper");
// @desc    Create new post
// @route   POST /post/create-post
// @access  Public
exports.addPostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, imageUrls, title, description, hideLikes, hideComment, hashtag, } = req.body;
    console.log(hashtag);
    const hashtagsArray = hashtag.map((tag) => tag.value);
    const post = yield postModel_1.default.create({
        userId,
        imageUrl: imageUrls,
        title,
        description,
        hideComment,
        hideLikes,
        hashtags: hashtagsArray,
    });
    if (!post) {
        res.status(400);
        throw new Error("Cannot add post");
    }
    const posts = yield postModel_1.default.find({ isBlocked: false, isDeleted: false })
        .populate({
        path: "userId",
        select: "userName profileImg isVerified",
    })
        .populate({
        path: "likes",
        select: "userName profileImg isVerified",
    })
        .sort({ date: -1 });
    res.status(200).json({ message: "Post added successfully", posts });
}));
// @desc    post all Posts
// @route   post /post/get-post
// @access  Public
exports.getPostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, searchTerm, page } = req.body;
    console.log(`${userId} postsUser`);
    const connections = yield connectionModel_1.default.findOne({ userId }, { following: 1 });
    const followingUsers = (connections === null || connections === void 0 ? void 0 : connections.following) || [];
    const usersQuery = searchTerm
        ? {
            $or: [
                { isPrivate: false },
                { _id: { $in: followingUsers } },
                { userName: { $regex: searchTerm, $options: "i" } },
            ],
        }
        : {
            $or: [{ isPrivate: false }, { _id: { $in: followingUsers } }],
        };
    const users = yield userModel_1.default.find(usersQuery);
    const userIds = users.map((user) => user._id.toString());
    const postsQuery = {
        userId: { $in: [...userIds, userId] },
        isBlocked: false,
        isDeleted: false,
    };
    if (searchTerm) {
        const regexArray = searchTerm
            .split(" ")
            .map((tag) => new RegExp(tag, "i"));
        postsQuery["$or"] = [
            { title: { $regex: searchTerm, $options: "i" } },
            { description: { $regex: searchTerm, $options: "i" } },
            { hashtags: { $in: regexArray } },
        ];
    }
    const limit = 5;
    const skip = (page - 1) * limit;
    const posts = yield postModel_1.default.find(postsQuery)
        .populate({
        path: "userId",
        select: "userName profileImg isVerified",
    })
        .populate({
        path: "likes",
        select: "userName profileImg isVerified",
    })
        .skip(skip)
        .limit(limit)
        .sort({ date: -1 });
    res.status(200).json(posts);
}));
// @desc    Get User Posts
// @route   get /post/get-post
// @access  Public
exports.getUserPostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.userId;
    const posts = yield postModel_1.default.find({
        userId: id,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "userName profileImg isVerified",
    })
        .sort({ date: -1 });
    console.log(posts);
    res.status(200).json(posts);
}));
// @desc    Update Post
// @route   POST /post/update-post
// @access  Public
exports.updatePostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.body.postId;
    const { userId, title, description, hashtags, hideComment, hideLikes } = req.body;
    const post = yield postModel_1.default.findById(postId);
    if (!post) {
        res.status(400);
        throw new Error("Post cannot be found");
    }
    if (title)
        post.title = title;
    if (description)
        post.description = description;
    if (hideComment !== undefined)
        post.hideComment = hideComment;
    if (hideLikes !== undefined)
        post.hideLikes = hideLikes;
    if (hashtags !== undefined) {
        const hashtagsArray = hashtags.map((tag) => tag.value);
        post.hashtags = hashtagsArray;
    }
    yield post.save();
    const posts = yield postModel_1.default.find({
        userId: userId,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "userName profileImg isVerified",
    })
        .sort({ date: -1 });
    res.status(200).json({ posts });
}));
// @desc    Delete Post
// @route   POST /post/delete-post
// @access  Public
exports.deletePostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, userId } = req.body;
    const post = yield postModel_1.default.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error("Post Cannot be found");
    }
    post.isDeleted = true;
    yield post.save();
    const posts = yield postModel_1.default.find({
        userId: userId,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "userName profileImg isVerified",
    })
        .sort({ date: -1 });
    res.status(200).json({ posts });
}));
// @desc    Like Post
// @route   POST /post/like-post
// @access  Public
exports.likePostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, userId } = req.body;
    const post = yield postModel_1.default.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error("Post not found");
    }
    const isLiked = post.likes.includes(userId);
    if (isLiked) {
        yield postModel_1.default.findOneAndUpdate({ _id: postId }, { $pull: { likes: userId } }, { new: true });
        // await Notification.findOneAndDelete({senderId:userId,receiverId:post.userId,message:'liked your post'})
    }
    else {
        if (post.userId !== userId) {
            const notificationData = {
                senderId: userId,
                receiverId: post.userId,
                message: "liked your post",
                link: `/profile`,
                read: false,
                postId: postId,
            };
            (0, notificationHelper_1.createNotification)(notificationData);
        }
        yield postModel_1.default.findOneAndUpdate({ _id: postId }, { $push: { likes: userId } }, { new: true });
    }
    const posts = yield postModel_1.default.find({
        userId: userId,
        isBlocked: false,
        isDeleted: false,
    })
        .populate({
        path: "userId",
        select: "userName profileImg isVerified",
    })
        .sort({ date: -1 });
    res.status(200).json({ posts });
}));
// @desc    Save Post
// @route   POST /post/like-post
// @access  Public
exports.savePostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, userId } = req.body;
    const user = yield userModel_1.default.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    const isSaved = user.savedPost.includes(postId);
    if (isSaved) {
        yield userModel_1.default.findOneAndUpdate({ _id: userId }, { $pull: { savedPost: postId } }, { new: true });
    }
    else {
        yield userModel_1.default.findOneAndUpdate({ _id: userId }, { $push: { savedPost: postId } }, { new: true });
    }
    const userData = yield userModel_1.default.find({ userId: userId, isBlocked: false }).sort({ date: -1 });
    res.status(200).json({
        _id: user.id,
        userName: user.userName,
        email: user.email,
        profileImg: user.profileImg,
        savedPost: user.savedPost,
        token: (0, generateToken_1.default)(user.id),
    });
}));
// @desc    Get User Saved Posts
// @route   get /post/get-saved-post
// @access  Public
exports.getSavedPostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.userId;
    const user = yield userModel_1.default.findOne({ _id: id, isBlocked: false }, { savedPost: 1, _id: 0 });
    if (user) {
        const savedPostIds = user.savedPost;
        const posts = yield postModel_1.default.find({ _id: { $in: savedPostIds } }).populate("userId");
        console.log(posts);
        res.status(200).json(posts);
    }
    else {
        res.status(400);
        throw new Error("User Not Found");
    }
}));
// @desc   Post Report
// @route   POST /post/Report-Post
// @access  Public
exports.reportPostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, postId, cause } = req.body;
    console.log(req.body);
    const existingReport = yield reportModel_1.default.findOne({ userId, postId });
    if (existingReport) {
        res.status(400);
        throw new Error("You have already reported this post.");
    }
    const report = new reportModel_1.default({
        userId,
        postId,
        cause,
    });
    yield report.save();
    const reportCount = yield reportModel_1.default.countDocuments({ postId });
    const REPORT_THRESHOLD = 3;
    if (reportCount >= REPORT_THRESHOLD) {
        yield postModel_1.default.findByIdAndUpdate(postId, { isBlocked: true });
        res
            .status(200)
            .json({ message: "Post has been blocked due to multiple reports." });
        return;
    }
    res.status(200).json({ message: "Post has been reported successfully." });
}));
