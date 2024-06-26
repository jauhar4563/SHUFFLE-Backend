import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Comment from "../models/comment/commentModel";
import { createNotification } from "../helpers/notificationHelper";
import Post from "../models/post/postModel";

// @desc    Get all comments of a post
// @route   GET /post/get-comment
// @access  Private

export const getCommentsByPostIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const postId = req.params.postId;
    console.log(postId);

    const comments = await Comment.find({ postId: postId, isDeleted: false })
      .populate({
        path: "userId",
        select: "userName profileImg",
      })
      .populate({
        path: "replyComments.userId",
        select: "userName profileImg",
      })
      .sort({ createdAt: -1 });
    console.log(comments);

    res.status(200).json({ comments });
  }
);

// @desc    Add a comment
// @route   POST /post/add-comment
// @access  Private

export const addCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId, userId, comment } = req.body;

    const newComment = await Comment.create({
      postId,
      userId,
      comment,
    });

    await newComment.save();
    const postUploader = await Post.findById(postId);
    if (postUploader && postUploader.userId !== userId) {
      const notificationData = {
        senderId: userId,
        receiverId: postUploader.userId,
        message: "Commented on your post",
        link: `/users-profile/${postUploader.userId}/`,
        read: false,
      };

      createNotification(notificationData);
    }

    const comments = await Comment.find({ postId: postId, isDeleted: false })
      .populate({
        path: "userId",
        select: "userName profileImg",
      })
      .populate({
        path: "replyComments.userId",
        select: "userName profileImg",
      });

    res.status(200).json({ message: "Comment added successfully", comments });
  }
);

// @desc    Delete a comment
// @route   POST /post/delete-comment
// @access  Private
export const deletePostCommentController = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("reaced deleted");
    const { commentId } = req.body;
    console.log(req.body);

    const comment = await Comment.findById(commentId);
    if (!comment) {
      res.status(404);
      throw new Error("Comment not found");
    }
    comment.isDeleted = true;
    await comment.save();

    const comments = await Comment.find({
      postId: comment.postId,
      isDeleted: false,
    })
      .populate({
        path: "userId",
        select: "userName profileImg isVerified",
      })
      .populate({
        path: "replyComments.userId",
        select: "userName profileImg isVerified",
      })
      .sort({ createdAt: -1 });
    console.log("hello");

    res.status(200).json({ message: "Comment deleted successfully", comments });
  }
);

// @desc    reply comment
// @route   POST /post/reply-comment
// @access  Private
export const addReplyCommentController = asyncHandler(async (req, res) => {
  const { commentId, userId, replyComment } = req.body;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    res.status(404);
    throw new Error("Comment not found");
  }

  const newReplyComment = {
    userId,
    replyComment,
    timestamp: new Date(),
  };

  comment.replyComments.push(newReplyComment);
  await comment.save();
  const postUploader = comment.userId;
  if (postUploader && postUploader !== userId) {
    const notificationData = {
      senderId: userId,
      receiverId: postUploader,
      message: "Replied to your comment",
      link: `/users-profile/${postUploader}/`,
      read: false,
    };

    createNotification(notificationData);
  }

  const comments = await Comment.find({
    postId: comment.postId,
    isDeleted: false,
  })
    .populate({
      path: "userId",
      select: "userName profileImg isVerified",
    })
    .populate({
      path: "replyComments.userId",
      select: "userName profileImg isVerified",
    });

  res
    .status(200)
    .json({ message: "Reply comment added successfully", comments });
});

// @desc    Comments count
// @route   POST /post/commentsCount
// @access  Public

export const getCommentsCount = asyncHandler(
  async (req: Request, res: Response) => {
    const postId = req.params.postId;

    const commentCounts = await Comment.countDocuments({
      postId,
      isDeleted: false,
    });
    res.status(200).json(commentCounts);
  }
);
