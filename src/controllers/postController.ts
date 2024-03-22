import Post from "../models/post/postModel";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";

// @desc    Create new post
// @route   POST /post/create-post
// @access  Public

export const addPost = asyncHandler(async (req: Request, res: Response) => {
  const { userId, imageUrl,title, description  } = req.body;
  const hideLikes = false;
  const hideComment = false;
    console.log(userId,imageUrl, description,hideLikes,hideComment)
  if (!userId || !imageUrl || !description) {
    res.status(400);
    throw new Error("Provide all details");
  }
  const post = await Post.create({
    userId,
    imageUrl,
    title,
    description,
    hideComment,
    hideLikes,
  });

  if (!post) {
    res.status(400);
    throw new Error("Cannot add post");
  }
  res.status(200).json({ message: "Post added successfully" });
});

// @desc    Get all Posts
// @route   get /post/get-post
// @access  Public

export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const posts = await Post.find({ isBlocked: false });
  res.status(200).json(posts);
});

// @desc    Update Post
// @route   POST /post/update-post
// @access  Public

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.body.postId;
  const { userId, imageUrl, description, hideComment, hideLikes } = req.body;
  const post = await Post.findById(postId);

  if (!post) {
    res.status(400);
    throw new Error("Post cannot be found");
  }

  if (userId) post.userId = userId;
  if (imageUrl) post.imageUrl = imageUrl;
  if (description) post.description = description;
  if (hideComment !== undefined) post.hideComment = hideComment;
  if (hideLikes !== undefined) post.hideLikes = hideLikes;

  await post.save();

  res.status(200).json({ message: "Post Updated Successfully" });
});




export const deletePost = asyncHandler(async (req: Request, res: Response) => {
    
    const postId = req.params.postId;
  
      const post = await Post.findById(postId);
      if (!post) {
        res.status(404);
        throw new Error("Post Cannot be found")
      }
  
    //   await Post.findOneAndDelete(postId);
  
      res.status(200).json({ message: "Post deleted successfully" });
    
  });
  