import Post from "../models/post/postModel";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/user/userModel";
import generateToken from "../utils/generateToken";
import Connections from "../models/connections/connectionModel";
import Report from "../models/reports/reportModel";
import { createNotification } from "../helpers/notificationHelper";
import Notification from "../models/notifications/notificastionModel";

// @desc    Create new post
// @route   POST /post/create-post
// @access  Public

export const addPostController = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      userId,
      imageUrls,
      title,
      description,
      hideLikes,
      hideComment,
      hashtag,
    } = req.body;
    console.log(hashtag);

    const hashtagsArray = hashtag.map((tag: { value: string }) => tag.value);
    const post = await Post.create({
      userId,
      imageUrl: imageUrls,
      title,
      description,
      hideComment,
      hideLikes,
      hashtags: hashtagsArray,
    });

    if (!post) {
      res.status(400);
      throw new Error("Cannot add post");
    }
    const posts = await Post.find({ isBlocked: false, isDeleted: false })
      .populate({
        path: "userId",
        select: "userName profileImg isVerified",
      })
      .populate({
        path: "likes",
        select: "userName profileImg isVerified",
      })
      .sort({ date: -1 });
    res.status(200).json({ message: "Post added successfully", posts });
  }
);

// @desc    post all Posts
// @route   post /post/get-post
// @access  Public

export const getPostController = asyncHandler(async (req: Request, res: Response) => {
  const { userId, searchTerm, page } = req.body;
  console.log(userId + "postsUser");
  
  const connections = await Connections.findOne({ userId }, { following: 1 });
  const followingUsers = connections?.following;
  
  const usersQuery = searchTerm
    ? { $or: [{ isPrivate: false }, { _id: { $in: followingUsers } }, { userName: { $regex: searchTerm, $options: "i" } }] }
    : { $or: [{ isPrivate: false }, { _id: { $in: followingUsers } }] };
  const users = await User.find(usersQuery);
  const userIds = users.map((user) => user._id);

  interface PostsQuery {
    userId: { $in: string[] };
    isBlocked: boolean;
    isDeleted: boolean;
    $or?: { [key: string]: any }[];
  }

  const postsQuery: PostsQuery = {
    userId: { $in: [...userIds, userId] },
    isBlocked: false,
    isDeleted: false,
  };

  if (searchTerm) {
    const regexArray = searchTerm.split(' ').map((tag:string) => new RegExp(tag, 'i'));
    postsQuery['$or'] = [
      { title: { $regex: searchTerm, $options: "i" } },
      {description:{$regex: searchTerm, $options: "i" }},
      { hashtags:  { $in: regexArray }  }
    ];
  }

  const limit = 5;
  const skip = (page - 1) * limit;

  const posts = await Post.find(postsQuery)
    .populate({
      path: "userId",
      select: "userName profileImg isVerified",
    })
    .populate({
      path: "likes",
      select: "userName profileImg isVerified",
    })
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 });

  res.status(200).json(posts);
});




// @desc    Get User Posts
// @route   get /post/get-post
// @access  Public

export const getUserPostController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.userId;
    const posts = await Post.find({
      userId: id,
      isBlocked: false,
      isDeleted: false,
    })
      .populate({
        path: "userId",
        select: "userName profileImg isVerified",
      })
      .sort({ date: -1 });
    console.log(posts);
    res.status(200).json(posts);
  }
);

// @desc    Update Post
// @route   POST /post/update-post
// @access  Public

export const updatePostController = asyncHandler(
  async (req: Request, res: Response) => {
    const postId = req.body.postId;
    const { userId, title, description, hashtags, hideComment, hideLikes } =
      req.body;
    const post = await Post.findById(postId);

    if (!post) {
      res.status(400);
      throw new Error("Post cannot be found");
    }

    if (title) post.title = title;
    if (description) post.description = description;
    if (hideComment !== undefined) post.hideComment = hideComment;
    if (hideLikes !== undefined) post.hideLikes = hideLikes;
    if (hashtags !== undefined) {
      const hashtagsArray = hashtags.map((tag: { value: string }) => tag.value);
      post.hashtags = hashtagsArray;
    }

    await post.save();

    const posts = await Post.find({
      userId: userId,
      isBlocked: false,
      isDeleted: false,
    })
      .populate({
        path: "userId",
        select: "userName profileImg isVerified",
      })
      .sort({ date: -1 });
    res.status(200).json({ posts });
  }
);

// @desc    Delete Post
// @route   POST /post/delete-post
// @access  Public

export const deletePostController = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId, userId } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404);
      throw new Error("Post Cannot be found");
    }

    post.isDeleted = true;
    await post.save();
    const posts = await Post.find({
      userId: userId,
      isBlocked: false,
      isDeleted: false,
    })
      .populate({
        path: "userId",
        select: "userName profileImg isVerified",
      })
      .sort({ date: -1 });

    res.status(200).json({ posts });
  }
);

// @desc    Like Post
// @route   POST /post/like-post
// @access  Public

export const likePostController = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId, userId } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      res.status(404);
      throw new Error("Post not found");
    }
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      await Post.findOneAndUpdate(
        { _id: postId },
        { $pull: { likes: userId } },
        { new: true }
      );

      // await Notification.findOneAndDelete({senderId:userId,receiverId:post.userId,message:'liked your post'})
    } else {
      if (post.userId !== userId) {
        const notificationData = {
          senderId: userId,
          receiverId: post.userId,
          message: "liked your post",
          link: `/profile`,
          read: false,
          postId: postId,
        };

        createNotification(notificationData);
      }

      await Post.findOneAndUpdate(
        { _id: postId },
        { $push: { likes: userId } },
        { new: true }
      );
    }

    const posts = await Post.find({
      userId: userId,
      isBlocked: false,
      isDeleted: false,
    })
      .populate({
        path: "userId",
        select: "userName profileImg isVerified",
      })
      .sort({ date: -1 });
    res.status(200).json({ posts });
  }
);

// @desc    Save Post
// @route   POST /post/like-post
// @access  Public

export const savePostController = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    const isSaved = user.savedPost.includes(postId);

    if (isSaved) {
      await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { savedPost: postId } },
        { new: true }
      );
    } else {
      await User.findOneAndUpdate(
        { _id: userId },
        { $push: { savedPost: postId } },
        { new: true }
      );
    }

    const userData = await User.find({ userId: userId, isBlocked: false }).sort(
      { date: -1 }
    );
    res.status(200).json({
      _id: user.id,
      userName: user.userName,
      email: user.email,
      profileImg: user.profileImg,
      savedPost: user.savedPost,
      token: generateToken(user.id),
    });
  }
);

// @desc    Get User Saved Posts
// @route   get /post/get-saved-post
// @access  Public

export const getSavedPostController = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.userId;
    const user = await User.findOne(
      { _id: id, isBlocked: false },
      { savedPost: 1, _id: 0 }
    );
    if (user) {
      const savedPostIds = user.savedPost;
      const posts = await Post.find({ _id: { $in: savedPostIds } }).populate(
        "userId"
      );
      console.log(posts);
      res.status(200).json(posts);
    } else {
      res.status(400);
      throw new Error("User Not Found");
    }
  }
);

// @desc   Post Report
// @route   POST /post/Report-Post
// @access  Public

export const reportPostController = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, postId, cause } = req.body;
    console.log(req.body);
    const existingReport = await Report.findOne({ userId, postId });
    if (existingReport) {
      res.status(400);
      throw new Error("You have already reported this post.");
    }

    const report = new Report({
      userId,
      postId,
      cause,
    });

    await report.save();

    const reportCount = await Report.countDocuments({ postId });

    const REPORT_THRESHOLD = 3;

    if (reportCount >= REPORT_THRESHOLD) {
      await Post.findByIdAndUpdate(postId, { isBlocked: true });
      res
        .status(200)
        .json({ message: "Post has been blocked due to multiple reports." });
      return;
    }

    res.status(200).json({ message: "Post has been reported successfully." });
  }
);
