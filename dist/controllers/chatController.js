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
exports.getUnreadMessagesController = exports.setMessageReadController = exports.getLastMessagesController = exports.getEligibleUsersController = exports.getMessagesController = exports.addMessageController = exports.findConversationController = exports.getUserConversationController = exports.addConversationController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ConversationsModel_1 = __importDefault(require("../models/Conversations/ConversationsModel"));
const MessagesModel_1 = __importDefault(require("../models/Messages/MessagesModel"));
const connectionModel_1 = __importDefault(require("../models/connections/connectionModel"));
const userModel_1 = __importDefault(require("../models/user/userModel"));
const S3Bucket_1 = require("../utils/cloudStorage/S3Bucket");
// @desc    Adda new conversation
// @route   get /chat/add-conversation
// @access  Public
exports.addConversationController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.body);
    const { senderId, receiverId } = req.body;
    const existConversation = yield ConversationsModel_1.default.findOne({
        members: { $all: [senderId, receiverId] },
    }).populate({
        path: "members",
        select: "userName profileImg isVerified",
    });
    if (existConversation) {
        res.status(200).json(existConversation);
        return;
    }
    const newConversation = new ConversationsModel_1.default({
        members: [senderId, receiverId],
    });
    try {
        const savedConversation = yield newConversation.save();
        const conversation = yield ConversationsModel_1.default.findById(savedConversation._id).populate({
            path: "members",
            select: "userName profileImg isVerified",
        });
        res.status(200).json(conversation);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// @desc    Get conversations of a user
// @route   get /chat/get-conversation
// @access  Public
exports.getUserConversationController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversations = yield ConversationsModel_1.default.find({
            members: { $in: [req.params.userId] },
        })
            .populate({
            path: "members",
            select: "userName profileImg isVerified",
        })
            .sort({ updatedAt: -1 });
        const conversationsWithMessages = yield Promise.all(conversations.map((conversation) => __awaiter(void 0, void 0, void 0, function* () {
            const messagesCount = yield MessagesModel_1.default.countDocuments({
                conversationId: conversation._id,
            });
            return messagesCount > 0 ? conversation : null;
        })));
        const filteredConversations = conversationsWithMessages.filter((conversation) => conversation !== null);
        res.status(200).json(filteredConversations);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// @desc    Get conversations of two users
// @route   get /chat/get-conversation
// @access  Public
exports.findConversationController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const conversation = yield ConversationsModel_1.default.findOne({
            members: { $all: [req.params.firstUserId, req.params.secondUserId] },
        });
        res.status(200).json(conversation);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// @desc    Add new Message
// @route   get /chat/add-message
// @access  Public
exports.addMessageController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("message sending");
    console.log(req.body);
    const { conversationId, sender, text } = req.body;
    let content = text;
    let attachment = null;
    console.log(req.file);
    if (req.file) {
        let type;
        if (req.file.mimetype.startsWith("image/")) {
            type = "image";
        }
        else if (req.file.mimetype.startsWith("video/")) {
            type = "video";
        }
        else if (req.file.mimetype.startsWith("audio/")) {
            type = "audio";
        }
        else {
            type = "file";
        }
        const fileUrl = yield (0, S3Bucket_1.s3Upload)(req.file);
        console.log(fileUrl);
        attachment = {
            type: type,
            url: fileUrl,
            filename: fileUrl,
            size: req.file.size,
        };
        content = req.body.messageType;
    }
    const newMessage = new MessagesModel_1.default({
        conversationId,
        sender,
        text: content,
        attachment,
    });
    yield ConversationsModel_1.default.findByIdAndUpdate(conversationId, { updatedAt: Date.now() }, { new: true });
    try {
        const savedMessage = yield newMessage.save();
        res.status(200).json(savedMessage);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// @desc    Get User Message
// @route   get /chat/get-message
// @access  Public
exports.getMessagesController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.params.conversationId);
        const messages = yield MessagesModel_1.default.find({
            conversationId: req.params.conversationId,
        }).populate({
            path: "sender",
            select: "userName profileImg isVerified",
        });
        res.status(200).json(messages);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
exports.getEligibleUsersController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const connections = yield connectionModel_1.default.findOne({ userId }, { following: 1 });
        const followingUsers = connections === null || connections === void 0 ? void 0 : connections.following;
        const users = yield userModel_1.default.find({
            $or: [{ isPrivate: false }, { _id: { $in: followingUsers } }],
        });
        res.status(200).json({ users });
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
exports.getLastMessagesController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pipeline = [
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: "$conversationId",
                    lastMessage: { $first: "$$ROOT" },
                },
            },
            {
                $replaceRoot: { newRoot: "$lastMessage" },
            },
        ];
        const lastMessages = yield MessagesModel_1.default.aggregate(pipeline);
        res.status(200).json(lastMessages);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
exports.setMessageReadController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId, userId } = req.body;
        console.log(conversationId, userId + "Reading Messages");
        const messages = yield MessagesModel_1.default.updateMany({ conversationId: conversationId, sender: { $ne: userId } }, { $set: { isRead: true } });
        res.status(200).json(messages);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
exports.getUnreadMessagesController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId, userId } = req.body;
        console.log(conversationId, userId + "unreadMessages getting....");
        const messages = yield MessagesModel_1.default.find({
            conversationId: conversationId,
            sender: { $ne: userId },
            isRead: false,
        });
        console.log(messages);
        res.status(200).json(messages);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
