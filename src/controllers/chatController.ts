import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Conversation from "../models/Conversations/ConversationsModel";
import Message from "../models/Messages/MessagesModel";
import Connections from "../models/connections/connectionModel";
import User from "../models/user/userModel";

// @desc    Adda new conversation
// @route   get /chat/add-conversation
// @access  Public

export const addConversationController = asyncHandler(
  async (req: Request, res: Response) => {
    console.log(req.body);
    const { senderId, receiverId } = req.body;
    const existConversation = await Conversation.findOne({
      members: { $all: [senderId, receiverId] },
    }).populate({
      path: "members",
      select: "userName profileImg isVerified",
    });
    if (existConversation) {
      res.status(200).json(existConversation);
      return;
    }

    const newConversation = new Conversation({
      members: [senderId, receiverId],
    });

    try {
      const savedConversation = await newConversation.save();
      const conversation = await Conversation.findById(
        savedConversation._id
      ).populate({
        path: "members",
        select: "userName profileImg isVerified",
      });
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// @desc    Get conversations of a user
// @route   get /chat/get-conversation
// @access  Public

export const getUserConversationController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const conversations = await Conversation.find({
        members: { $in: [req.params.userId] },
      })
        .populate({
          path: "members",
          select: "userName profileImg isVerified",
        })
        .sort({ updatedAt: -1 });

      const conversationsWithMessages = await Promise.all(
        conversations.map(async (conversation) => {
          const messagesCount = await Message.countDocuments({
            conversationId: conversation._id,
          });
          return messagesCount > 0 ? conversation : null;
        })
      );

      const filteredConversations = conversationsWithMessages.filter(
        (conversation) => conversation !== null
      );

      res.status(200).json(filteredConversations);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// @desc    Get conversations of two users
// @route   get /chat/get-conversation
// @access  Public

export const findConversationController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const conversation = await Conversation.findOne({
        members: { $all: [req.params.firstUserId, req.params.secondUserId] },
      });
      res.status(200).json(conversation);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

// @desc    Add new Message
// @route   get /chat/add-message
// @access  Public

export const addMessageController = asyncHandler(
  async (req: Request, res: Response) => {
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
      } else if (req.file.mimetype.startsWith("video/")) {
        type = "video";
      } else if (req.file.mimetype.startsWith("audio/")) {
        type = "audio";
      } else {
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

    const newMessage = new Message({
      conversationId,
      sender,
      text: content,
      attachment,
    });
    await Conversation.findByIdAndUpdate(
      conversationId,
      { updatedAt: Date.now() },
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

export const getMessagesController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      console.log(req.params.conversationId);

      const messages = await Message.find({
        conversationId: req.params.conversationId,
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

export const getEligibleUsersController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const connections = await Connections.findOne(
        { userId },
        { following: 1 }
      );
      const followingUsers = connections?.following;
      const users = await User.find({
        $or: [{ isPrivate: false }, { _id: { $in: followingUsers } }],
      });
      res.status(200).json({ users });
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

export const getLastMessages = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const pipeline: any[] = [
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

      const lastMessages = await Message.aggregate(pipeline);
      res.status(200).json(lastMessages);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

export const setMessageReadController = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { conversationId, userId } = req.body;
      console.log(conversationId, userId + "Reading Messages");
      const messages = await Message.updateMany(
        { conversationId: conversationId, sender: { $ne: userId } },
        { $set: { isRead: true } }
      );
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

export const getUnreadMessages = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const { conversationId, userId } = req.body;
      console.log(conversationId, userId + "unreadMessages getting....");
      const messages = await Message.find({
        conversationId: conversationId,
        sender: { $ne: userId },
        isRead: false,
      });
      console.log(messages);
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);
