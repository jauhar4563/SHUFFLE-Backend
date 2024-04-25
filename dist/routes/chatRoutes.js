"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = require("../utils/multer/multer");
const chatController_1 = require("../controllers/chatController");
const groupChatController_1 = require("../controllers/groupChatController");
const router = express_1.default.Router();
// Conversation Routes
router.post("/add-conversation", chatController_1.addConversationController);
router.get("/get-conversations/:userId", chatController_1.getUserConversationController);
router.get("/find-conversation/:firstUserId/:secondUserId", chatController_1.findConversationController);
// router.post('/add-chat-group',addGroupController);
// Messages Routes
router.post('/add-message', multer_1.upload.single('file'), chatController_1.addMessageController);
router.get('/get-messages/:conversationId', chatController_1.getMessagesController);
router.post('/chat-eligible-users', chatController_1.getEligibleUsersController);
router.get('/get-last-messages', chatController_1.getLastMessages);
router.patch('/set-message-read', chatController_1.setMessageReadController);
router.post('/get-unread-messages', chatController_1.getUnreadMessages);
// GroupChat
router.post('/add-chat-group', groupChatController_1.addGroupController);
router.get("/get-groups/:userId", groupChatController_1.getGroupsController);
// Group Messages
router.post('/add-group-message', multer_1.upload.single('file'), groupChatController_1.addGroupMessageController);
router.get('/get-group-messages/:groupId', groupChatController_1.getGroupMessagesController);
router.get('/last-group-messages', groupChatController_1.getLastGroupMessagesController);
exports.default = router;
