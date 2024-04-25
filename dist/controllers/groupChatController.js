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
exports.getLastGroupMessagesController = exports.getGroupMessagesController = exports.addGroupMessageController = exports.getGroupsController = exports.addGroupController = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const GroupChatSchema_1 = __importDefault(require("../models/GroupChats/GroupChatSchema"));
const GroupMessegesSchema_1 = __importDefault(require("../models/GroupMessages/GroupMessegesSchema"));
// @desc    Add a new conversation
// @route   get /chat/add-conversation
// @access  Public
exports.addGroupController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, image, users, description, admins } = req.body;
    const usersArray = users.map((user) => user.value);
    const newConversation = new GroupChatSchema_1.default({
        name,
        members: [...usersArray],
        description,
        admins,
        profile: image,
    });
    try {
        const savedGroupchat = yield newConversation.save();
        const groups = yield GroupChatSchema_1.default.find({
            _id: savedGroupchat._id,
        }).populate({
            path: "members",
            select: "userName profileImg isVerified",
        });
        res.status(200).json(groups);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// @desc    Get conversations of a user
// @route   get /chat/get-conversation
// @access  Public
exports.getGroupsController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.params.userId + "groups");
        const groups = yield GroupChatSchema_1.default.find({
            $or: [
                { members: { $in: [req.params.userId] } },
                { admins: { $in: [req.params.userId] } },
            ],
        }).populate({
            path: "members",
            select: "userName profileImg isVerified",
        }).sort({ updated_at: -1 });
        res.status(200).json(groups);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
// @desc    Add new Message
// @route   get /chat/add-message
// @access  Public
exports.addGroupMessageController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { groupId, sender, text } = req.body;
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
        attachment = {
            type: type,
            url: req.file.path,
            filename: req.file.filename,
            size: req.file.size,
        };
        content = req.body.messageType;
    }
    const newMessage = new GroupMessegesSchema_1.default({
        groupId,
        sender,
        text: content,
        attachment,
    });
    yield GroupChatSchema_1.default.findByIdAndUpdate(groupId, { updated_at: Date.now() }, { new: true });
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
exports.getGroupMessagesController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.params.groupId);
        const messages = yield GroupMessegesSchema_1.default.find({
            groupId: req.params.groupId,
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
// @desc    Get Last group messages
// @route   get /chat/last-group-messages
// @access  Public
exports.getLastGroupMessagesController = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pipeline = [
            {
                $sort: { createdAt: -1 },
            },
            {
                $group: {
                    _id: "$groupId",
                    lastMessage: { $first: "$$ROOT" },
                },
            },
            {
                $replaceRoot: { newRoot: "$lastMessage" },
            },
        ];
        const lastGroupMessages = yield GroupMessegesSchema_1.default.aggregate(pipeline);
        res.status(200).json(lastGroupMessages);
    }
    catch (err) {
        res.status(500).json(err);
    }
}));
