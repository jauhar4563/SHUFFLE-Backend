import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/user/userModel";
import generateToken from "../utils/generateToken";
import Connections from "../models/connections/connectionModel";
import Story from "../models/story/storyModel";


// @desc    Create new story
// @route   POST /story/create-story
// @access  Public

export const addStoryController = asyncHandler(async (req: Request, res: Response) => {
    const { userId, imageUrls } = req.body;
  
    let story = await Story.findOne({ userId });
  
    if (!story) {
      story = await Story.create({
        userId,
        stories: [{ imageUrl: imageUrls }],
      });
    } else {
      story.stories.push({ imageUrl: imageUrls });
      await story.save();
    }
  
    const stories = await Story.find({ isDeleted: false, "stories.isBlocked": false })
      .populate({
        path: "userId",
        select: "userName profileImg isVerified",
      })
      .sort({ createdAt: -1 });
  
    res.status(200).json({ message: "Story added successfully", stories });
  });

// @desc    get all Stories
// @route   get /Story/get-stories
// @access  Public

export const getStoriesController = asyncHandler(
    async (req: Request, res: Response) => {
      const  userId  = req.params.userId;
      console.log(userId+"Stories User")
      const connections = await Connections.findOne({ userId }, { following: 1 });
      const followingUsers = connections?.following;
      const users = await User.find({
        $or: [ { _id: { $in: followingUsers } }],
      });
      const userIds = users.map((user) => user._id);
  
      const stories = await Story.find({
        userId: { $in: [...userIds, userId] },
      })
        .populate({
          path: "userId",
          select: "userName profileImg isVerified",
        })
        .sort({ date: -1 });
        
    console.log(stories)
      res.status(200).json(stories);
    }
  );

