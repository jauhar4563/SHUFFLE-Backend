import express from "express";
import { upload } from "../utils/multer/multer";
import {
  addConversationController,
  addMessageController,
  findConversationController,
  getEligibleUsersController,
  getLastMessages,
  getMessagesController,
  getUnreadMessages,
  getUserConversationController,
  setMessageReadController,
} from "../controllers/chatController";
import { addGroupController, addGroupMessageController, getGroupMessagesController, getGroupsController, getLastGroupMessagesController } from "../controllers/groupChatController";

const router = express.Router();

// Conversation Routes
router.post("/add-conversation", addConversationController);
router.get("/get-conversations/:userId", getUserConversationController);
router.get("/find-conversation/:firstUserId/:secondUserId",findConversationController);
// router.post('/add-chat-group',addGroupController);

// Messages Routes

router.post('/add-message',upload.single('file'),addMessageController);
router.get('/get-messages/:conversationId',getMessagesController)

router.post('/chat-eligible-users',getEligibleUsersController)
router.get('/get-last-messages',getLastMessages);
router.patch('/set-message-read',setMessageReadController);
router.post('/get-unread-messages',getUnreadMessages)
// GroupChat

router.post('/add-chat-group',addGroupController);
router.get("/get-groups/:userId", getGroupsController);

// Group Messages

router.post('/add-group-message',upload.single('file'),addGroupMessageController)
router.get('/get-group-messages/:groupId',getGroupMessagesController)
router.get('/last-group-messages',getLastGroupMessagesController);



export default router;
