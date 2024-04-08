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
      const {name,image,users,description,admins} = req.body;
      const usersArray = users.map((user: { value: string }) => user.value);
  
      const newConversation = new GroupChat({
        name,
        members: [...usersArray],
        description,
        admins,
        profile:image
      });
  
      try {
        const savedGroupchat = await newConversation.save();
        const groups = await GroupChat.find({
          _id:savedGroupchat._id
        }).populate({
          path: 'members',
          select: 'userName profileImg isVerified'
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
  
        const groups = await GroupChat.find({
        }).populate({
          path: 'members',
          select: 'userName profileImg isVerified'
        });
        console.log(groups)
        res.status(200).json(groups);
      } catch (err) {
        res.status(500).json(err);
      }
    }
  );


  // @desc    Add new Message
// @route   get /chat/add-message
// @access  Public

export const addGroupMessageController = asyncHandler(async (req: Request, res: Response) => {
    const {groupId,sender,text} = req.body;
    const newMessage = new GroupMessages({
        groupId,
        sender,
        text
    });
  
    try {
      const savedMessage = await newMessage.save();
      res.status(200).json(savedMessage);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  // @desc    Get User Message
  // @route   get /chat/get-message
  // @access  Public
  
  export const getGroupMessagesController = asyncHandler(async (req: Request, res: Response) => {
    try {
      console.log(req.params.groupId);
      
      const messages = await GroupMessages.find({
        groupId: req.params.groupId,
      }).populate({
          path: 'sender',
          select: 'userName profileImg isVerified'
      });
     
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  