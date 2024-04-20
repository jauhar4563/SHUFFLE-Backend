import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Conversation from "../models/Conversations/ConversationsModel";
import Message from "../models/Messages/MessagesModel";
import Connections from "../models/connections/connectionModel";
import User from "../models/user/userModel";
import GroupChat from "../models/GroupChats/GroupChatSchema";
import GroupMessages from "../models/GroupMessages/GroupMessegesSchema";

// @desc    Add a new conversation
// @route   get /chat/add-conversation
// @access  Public

export const addGroupController = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, image, users, description, admins } = req.body;
    const usersArray = users.map((user: { value: string }) => user.value);

    const newConversation = new GroupChat({
      name,
      members: [...usersArray],
      description,
      admins,
      profile: image,
    });

    try {
      const savedGroupchat = await newConversation.save();
      const groups = await GroupChat.find({
        _id: savedGroupchat._id,
      }).populate({
        path: "members",
        select: "userName profileImg isVerified",
      });
      res.status(200).json(groups);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// @desc    Get conversations of a user
// @route   get /chat/get-conversation
// @access  Public

export const getGroupsController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      console.log(req.params.userId + "groups");
      const groups = await GroupChat.find({
        $or: [
          { members: { $in: [req.params.userId] } },
          { admins: { $in: [req.params.userId] } },
        ],
      }).populate({
        path: "members",
        select: "userName profileImg isVerified",
      }).sort({updated_at:-1});
      res.status(200).json(groups);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// @desc    Add new Message
// @route   get /chat/add-message
// @access  Public

export const addGroupMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const { groupId, sender, text } = req.body;
    let content = text;
    let attachment = null;
    console.log(req.file);
    if (req.file) {
      attachment = {
        type: req.file.mimetype.startsWith("image/") ? "image" : "video",
        url: req.file.path,
        filename: req.file.filename,
        size: req.file.size,
      };
      content = req.body.messageType;
    }
    const newMessage = new GroupMessages({
      groupId,
      sender,
      text: content,
      attachment,
    });
    await GroupChat.findByIdAndUpdate(
      groupId,
      { updated_at: Date.now() },
      { new: true }
    );


    try {
      const savedMessage = await newMessage.save();
      res.status(200).json(savedMessage);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// @desc    Get User Message
// @route   get /chat/get-message
// @access  Public

export const getGroupMessagesController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      console.log(req.params.groupId);

      const messages = await GroupMessages.find({
        groupId: req.params.groupId,
      }).populate({
        path: "sender",
        select: "userName profileImg isVerified",
      });

      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// @desc    Get Last group messages
// @route   get /chat/last-group-messages
// @access  Public

export const getLastGroupMessagesController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const pipeline: any[] = [
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

      const lastGroupMessages = await GroupMessages.aggregate(pipeline);
      res.status(200).json(lastGroupMessages);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);
