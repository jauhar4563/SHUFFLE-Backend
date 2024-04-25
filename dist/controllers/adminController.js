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
exports.getTransactionController = exports.dashboardStatsController = exports.chartDataController = exports.hashtagEditController = exports.hashtagBlockController = exports.getHashtagsController = exports.addHashtagsController = exports.userBlockController = exports.postBlockController = exports.getPostReports = exports.getPostController = exports.getUsersController = exports.LoginController = void 0;
const adminModel_1 = __importDefault(require("../models/admin/adminModel"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const postModel_1 = __importDefault(require("../models/post/postModel"));
const hashtagModel_1 = __importDefault(require("../models/hashtag/hashtagModel"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const reportModel_1 = __importDefault(require("../models/reports/reportModel"));
const generateAdminToken_1 = __importDefault(require("../utils/generateAdminToken"));
const transactionModel_1 = __importDefault(require("../models/transactions/transactionModel"));
// @desc    Admin Login
// @route   ADMIN /Admin/login
// @access  Public
exports.LoginController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const admin = yield adminModel_1.default.findOne({ email });
    if (admin && password === admin.password) {
        res.json({
            message: "Authorisation Successful.",
            _id: admin.id,
            name: admin.name,
            email: admin.email,
            profileImg: admin.profileImg,
            token: (0, generateAdminToken_1.default)(admin.id),
        });
    }
    else {
        res.status(400);
        throw new Error("Invalid Credentials");
    }
}));
// @desc    Get all users with pagination
// @route   ADMIN /admin/get-users
// @access  Public
exports.getUsersController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalUsers = yield userModel_1.default.countDocuments({});
    const users = yield userModel_1.default.find({})
        .sort({ date: -1 })
        .limit(limit)
        .skip(startIndex);
    const pagination = {};
    if (endIndex < totalUsers) {
        pagination.next = {
            page: page + 1,
            limit: limit,
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit: limit,
        };
    }
    if (users) {
        res.status(200).json({ users, pagination, totalUsers });
    }
    else {
        res.status(404);
        throw new Error("Users Not Found");
    }
}));
// @desc    Get all users
// @route   ADMIN /admin/get-users
// @access  Public
exports.getPostController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    console.log(page, limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalPosts = yield postModel_1.default.countDocuments({ isBlocked: true });
    const posts = yield postModel_1.default.find({ isBlocked: true })
        .populate({
        path: "userId",
        select: "userName profileImg isVerified",
    })
        .sort({ date: -1 })
        .limit(limit)
        .skip(startIndex);
    const pagination = {};
    if (endIndex < totalPosts) {
        pagination.next = {
            page: page + 1,
            limit: limit,
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit: limit,
        };
    }
    if (posts) {
        res.status(200).json({ posts, pagination, totalPosts });
    }
    else {
        res.status(404);
        throw new Error(" No Post Found");
    }
}));
// @desc    Get all reports
// @route   ADMIN /admin/get-reports
// @access  Public
exports.getPostReports = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalReports = yield reportModel_1.default.countDocuments({});
    const reports = yield reportModel_1.default.find({})
        .populate({
        path: "userId",
        select: "userName profileImg isVerified",
    })
        .populate("postId")
        .sort({ date: -1 })
        .limit(limit)
        .skip(startIndex);
    const pagination = {};
    if (endIndex < totalReports) {
        pagination.next = {
            page: page + 1,
            limit: limit,
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit: limit,
        };
    }
    if (reports) {
        res.status(200).json({ reports, pagination, totalReports });
    }
    else {
        res.status(404);
        throw new Error(" No Post Found");
    }
}));
// @desc    Block Post
// @route   ADMIN /admin/block-post
// @access  Public
exports.postBlockController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.body.postId;
    console.log(req.body + "put");
    const post = yield postModel_1.default.findById(postId);
    if (!post) {
        res.status(400);
        throw new Error("User not found");
    }
    post.isBlocked = !post.isBlocked;
    yield post.save();
    const posts = yield postModel_1.default.find({}).sort({ date: -1 });
    const blocked = post.isBlocked ? "Blocked" : "Unblocked";
    console.log("block post");
    res
        .status(200)
        .json({ posts, message: `You have ${blocked} ${post.title}` });
}));
// @desc    Block Users
// @route   ADMIN /admin/block-user
// @access  Public
exports.userBlockController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.userId;
    console.log(req.body);
    const user = yield userModel_1.default.findById(userId);
    if (!user) {
        res.status(400);
        throw new Error("User not found");
    }
    user.isBlocked = !user.isBlocked;
    yield user.save();
    const users = yield userModel_1.default.find({}).sort({ date: -1 });
    const blocked = user.isBlocked ? "Blocked" : "Unblocked";
    res
        .status(200)
        .json({ users, message: `You have ${blocked} ${user.userName}` });
}));
// @desc    Get all hashtags
// @route   ADMIN /admin/get-users
// @access  Public
exports.addHashtagsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hashtag } = req.body;
    const existingHashtags = yield hashtagModel_1.default.find({ hashtag });
    if (existingHashtags.length > 0) {
        res.status(404);
        throw new Error("Hashtag Already Exist");
    }
    else {
        yield hashtagModel_1.default.create({ hashtag });
        const allTags = yield hashtagModel_1.default.find({}).sort({ date: -1 });
        res.status(200).json({ message: "Hashtag added", hashtags: allTags });
    }
}));
// @desc    Get all hashtags
// @route   ADMIN /admin/get-users
// @access  Public
exports.getHashtagsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    console.log(page, limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalHashtags = yield hashtagModel_1.default.countDocuments({});
    const hashtags = yield hashtagModel_1.default.find({})
        .sort({ date: -1 })
        .limit(limit)
        .skip(startIndex);
    const pagination = {};
    if (endIndex < totalHashtags) {
        pagination.next = {
            page: page + 1,
            limit: limit,
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit: limit,
        };
    }
    if (hashtags) {
        res.status(200).json({ hashtags, pagination, totalHashtags });
    }
    else {
        res.status(404);
        throw new Error(" No Hashtags Found");
    }
}));
// @desc    Block Hashtag
// @route   ADMIN /admin/block-hashtag
// @access  Public
exports.hashtagBlockController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hashtagId = req.body.hashtagId;
    console.log(req.body);
    const hashtag = yield hashtagModel_1.default.findById(hashtagId);
    if (!hashtag) {
        res.status(400);
        throw new Error("Hashtag not found");
    }
    hashtag.isBlocked = !hashtag.isBlocked;
    yield hashtag.save();
    const hashtags = yield hashtagModel_1.default.find({}).sort({ date: -1 });
    const blocked = hashtag.isBlocked ? "Blocked" : "Unblocked";
    res
        .status(200)
        .json({ hashtags, message: `You have ${blocked} ${hashtag.hashtag}` });
}));
// @desc    Edit Hashtag
// @route   ADMIN /admin/edit-hashtag
// @access  Public
exports.hashtagEditController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { hashtagId, hashtag } = req.body;
    console.log(req.body);
    const ExistingTag = yield hashtagModel_1.default.findById(hashtagId);
    if (!ExistingTag) {
        res.status(400);
        throw new Error("Hashtag not found");
    }
    ExistingTag.hashtag = hashtag;
    yield hashtag.save();
    const hashtags = yield hashtagModel_1.default.find({}).sort({ date: -1 });
    res.status(200).json({ hashtags, message: `You have Edited hashtag` });
}));
// @desc    Chart Data
// @route   ADMIN /admin/chart-data
// @access  Public
exports.chartDataController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userJoinStats = yield userModel_1.default.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                userCount: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);
    const postCreationStats = yield postModel_1.default.aggregate([
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                postCount: { $sum: 1 },
            },
        },
        {
            $sort: { _id: 1 },
        },
    ]);
    const chartData = {
        userJoinStats,
        postCreationStats,
    };
    res.json(chartData);
}));
// @desc    Dashboard Stats
// @route   ADMIN /admin/dashboard-stats
// @access  Public
exports.dashboardStatsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const totalUsers = yield userModel_1.default.countDocuments();
    const totalPosts = yield postModel_1.default.countDocuments();
    const blockedPosts = yield postModel_1.default.countDocuments({ isBlocked: true });
    const totalSales = yield transactionModel_1.default.countDocuments();
    const totalHashtags = yield hashtagModel_1.default.countDocuments();
    const totalReports = yield reportModel_1.default.countDocuments();
    const stats = {
        totalUsers,
        totalPosts,
        blockedPosts,
        totalSales,
        totalHashtags,
        totalReports,
    };
    // Send the response
    res.status(200).json(stats);
}));
// @desc    Get all transactions
// @route   ADMIN /admin/get-transactions
// @access  Public
exports.getTransactionController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    console.log(page, limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const totalTransactions = yield transactionModel_1.default.countDocuments();
    const transactions = yield transactionModel_1.default.find()
        .populate({
        path: "userId",
        select: "userName profileImg isVerified",
    })
        .sort({ startDate: -1 })
        .limit(limit)
        .skip(startIndex);
    const pagination = {};
    if (endIndex < totalTransactions) {
        pagination.next = {
            page: page + 1,
            limit: limit,
        };
    }
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit: limit,
        };
    }
    if (transactions) {
        res.status(200).json({ transactions, pagination, totalTransactions });
    }
    else {
        res.status(404);
        throw new Error("No transactions found");
    }
}));
