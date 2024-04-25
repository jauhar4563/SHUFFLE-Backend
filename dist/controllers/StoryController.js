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
exports.readStoryController = exports.getStoriesController = exports.addStoryController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const connectionModel_1 = __importDefault(require("../models/connections/connectionModel"));
const storyModel_1 = __importDefault(require("../models/story/storyModel"));
// @desc    Create new story
// @route   POST /story/create-story
// @access  Public
exports.addStoryController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, imageUrls } = req.body;
    let story = yield storyModel_1.default.findOne({ userId });
    if (!story) {
        story = yield storyModel_1.default.create({
            userId,
            stories: [{ imageUrl: imageUrls }],
        });
    }
    else {
        story.stories.push({ imageUrl: imageUrls, views: [] });
        yield story.save();
    }
    let updatedStory = yield storyModel_1.default.findOne({ userId }).populate({
        path: "userId",
        select: "userName profileImg isVerified",
    });
    res.status(200).json(updatedStory);
}));
// @desc    get all Stories
// @route   get /Story/get-stories
// @access  Public
exports.getStoriesController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    console.log(userId + "Stories User");
    const connections = yield connectionModel_1.default.findOne({ userId }, { following: 1 });
    const followingUsers = connections === null || connections === void 0 ? void 0 : connections.following;
    const users = yield userModel_1.default.find({
        $or: [{ _id: { $in: followingUsers } }],
    });
    const userIds = users.map((user) => user._id);
    const stories = yield storyModel_1.default.find({
        userId: { $in: [...userIds, userId] },
    })
        .populate({
        path: "userId",
        select: "userName profileImg isVerified",
    })
        .sort({ userId: -1 })
        .sort({ createdAt: -1 });
    console.log(stories);
    res.status(200).json(stories);
}));
// @desc    Read Story
// @route   patch /Story/read-story
// @access  Public
exports.readStoryController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { storyId, userId } = req.body;
    const story = yield storyModel_1.default.findById(storyId);
    if (!story) {
        res.status(400);
        throw new Error("Story not found");
    }
    story.stories.forEach((storyItem) => {
        if (!storyItem.views.includes(userId)) {
            storyItem.views.push(userId);
        }
    });
    yield story.save();
    const updatedStory = yield storyModel_1.default.findById(storyId).populate({
        path: "userId",
        select: "userName profileImg isVerified",
    });
    res
        .status(200)
        .json(updatedStory);
}));
