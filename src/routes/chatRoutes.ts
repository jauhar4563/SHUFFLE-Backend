import express from "express";
import {
  addConversationController,
  addMessageController,
  findConversationController,
  getEligibleUsersController,
  getMessagesController,
  getUserConversationController,
} from "../controllers/chatController";
import GroupChat from "../models/GroupChats/GroupChatSchema";
import { addGroupController, addGroupMessageController, getGroupMessagesController, getGroupsController } from "../controllers/groupChatController";

const router = express.Router();

// Conversation Routes
router.post("/add-conversation", addConversationController);
router.get("/get-conversations/:userId", getUserConversationController);
router.get("/find-conversation/:firstUserId/:secondUserId",findConversationController);
// router.post('/add-chat-group',addGroupController);

// Messages Routes

router.post('/add-message',addMessageController);
router.get('/get-messages/:conversationId',getMessagesController)

router.post('/chat-eligible-users',getEligibleUsersController)


// GroupChat

router.post('/add-chat-group',addGroupController);
router.get("/get-groups/:userId", getGroupsController);

// Group Messages

router.post('/add-group-message',addGroupMessageController)
router.get('/get-group-messages/:groupId',getGroupMessagesController)


export default router;
