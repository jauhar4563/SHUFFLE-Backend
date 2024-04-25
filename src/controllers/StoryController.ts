import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/user/userModel";
import Connections from "../models/connections/connectionModel";
import Story from "../models/story/storyModel";

// @desc    Create new story
// @route   POST /story/create-story
// @access  Public

export const addStoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, imageUrls } = req.body;

    let story = await Story.findOne({ userId });

    if (!story) {
      story = await Story.create({
        userId,
        stories: [{ imageUrl: imageUrls }],
      });
    } else {
      story.stories.push({ imageUrl: imageUrls,views:[] });
      await story.save();
    }
    let updatedStory = await Story.findOne({ userId }) .populate({
      path: "userId",
      select: "userName profileImg isVerified",
    });
    res.status(200).json(updatedStory);
  }
);

// @desc    get all Stories
// @route   get /Story/get-stories
// @access  Public

export const getStoriesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.params.userId;
    console.log(userId + "Stories User");
    const connections = await Connections.findOne({ userId }, { following: 1 });
    const followingUsers = connections?.following;
    const users = await User.find({
      $or: [{ _id: { $in: followingUsers } }],
    });
    const userIds = users.map((user) => user._id);

    const stories = await Story.find({
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
  }
);

// @desc    Read Story
// @route   patch /Story/read-story
// @access  Public

export const readStoryController = asyncHandler(
  async (req: Request, res: Response) => {
    const { storyId,userId } = req.body;
    const story = await Story.findById(storyId);
    if (!story) {
      res.status(400);
      throw new Error("Story not found");
    }
    story.stories.forEach((storyItem: any) => {
      if (!storyItem.views.includes(userId)) {
        storyItem.views.push(userId);
      }
    });
    await story.save();
    const updatedStory = await Story.findById(storyId).populate({
      path: "userId",
      select: "userName profileImg isVerified",
    });
    res
      .status(200)
      .json(updatedStory);
  }
);
