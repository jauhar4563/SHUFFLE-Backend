import Post from "../models/post/postModel";
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import User from "../models/user/userModel";
import generateToken from "../utils/generateToken";
import Connections from "../models/connections/connectionModel";

// @desc    Create new post
// @route   POST /post/create-post
// @access  Public

export const addPost = asyncHandler(async (req: Request, res: Response) => {
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

  if (!userId.trim() || !imageUrls || !description.trim()) {
    res.status(400);
    throw new Error("Provide all details");
  }
  const hashtagsArray = hashtag.map((tag: { value: string }) => tag.value);
  const post = await Post.create({
    userId,
    imageUrl:imageUrls,
    title,
    description,
    hideComment,
    hideLikes,
    hashtags: hashtagsArray
  });

  if (!post) {
    res.status(400);
    throw new Error("Cannot add post");
  }
  const posts = await Post.find({ isBlocked: false, isDeleted: false })
  .populate({
    path: "userId",
    select: "userName profileImg",
  })
  .populate({
    path: "likes",
    select: "userName profileImg",
  })
  .sort({ date: -1 });
  res.status(200).json({ message: "Post added successfully" ,posts});
});

// @desc    post all Posts
// @route   post /post/get-post
// @access  Public

export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const {userId}  = req.body;
  const connections = await Connections.findOne({userId},{following:1});
  const followingUsers = connections?.following;
  const users = await User.find({
    $or: [
      { isPrivate: false },
      { _id: { $in: followingUsers } } 
    ]
  });
  const userIds = users.map(user => user._id);
  
  const posts = await Post.find({ userId: { $in: [...userIds,userId] },isBlocked: false, isDeleted: false })
    .populate({
      path: "userId",
      select: "userName profileImg",
    })
    .populate({
      path: "likes",
      select: "userName profileImg",
    })
    .sort({ date: -1 });

  res.status(200).json(posts);
});

// @desc    Get User Posts
// @route   get /post/get-post
// @access  Public

export const getUserPost = asyncHandler(async (req: Request, res: Response) => {
  const id = req.body.userId;
  const posts = await Post.find({
    userId: id,
    isBlocked: false,
    isDeleted: false,
  })
    .populate({
      path: "userId",
      select: "userName profileImg",
    })
    .sort({ date: -1 });
  res.status(200).json(posts);
});

// @desc    Update Post
// @route   POST /post/update-post
// @access  Public

export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.body.postId;
  const { userId, title, description,hashtags, hideComment, hideLikes } = req.body;
  const post = await Post.findById(postId);

  if (!post) {
    res.status(400);
    throw new Error("Post cannot be found");
  }

  if (title) post.title = title;
  if (description) post.description = description;
  if (hideComment !== undefined) post.hideComment = hideComment;
  if (hideLikes !== undefined) post.hideLikes = hideLikes;
  if (hashtags !==undefined){
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
      select: "userName profileImg",
    })
    .sort({ date: -1 });
  res.status(200).json({ posts });
});

// @desc    Delete Post
// @route   POST /post/delete-post
// @access  Public

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { postId, userId } = req.body;
  console.log(postId, userId);
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
      select: "userName profileImg",
    })
    .sort({ date: -1 });

  res.status(200).json({ posts });
});


// @desc    Like Post
// @route   POST /post/like-post
// @access  Public

export const likePost = asyncHandler(async (req: Request, res: Response) => {
  const { postId, userId } = req.body;
  const post = await Post.findById(postId);
  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }
  const isLiked = post.likes.includes(userId);

  if (isLiked) {
    await Post.findOneAndUpdate({_id: postId}, {$pull: {likes: userId}}, {new: true})
  } else {
    await Post.findOneAndUpdate({_id: postId}, {$push: {likes: userId }}, {new: true})
  }

  const posts = await Post.find({userId:userId, isBlocked: false ,isDeleted:false }).populate({
    path: 'userId',
    select: 'userName profileImg'
  }).sort({date:-1});
  console.log(posts)
  res.status(200).json({ posts });
});


// @desc    Save Post
// @route   POST /post/like-post
// @access  Public

export const savePost = asyncHandler(async (req: Request, res: Response) => {
  const { postId, userId } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isSaved = user.savedPost.includes(postId);

  if (isSaved) {
  
    await User.findOneAndUpdate({_id: userId}, {$pull: {savedPost: postId}}, {new: true})
  } else {
 
    await User.findOneAndUpdate({_id: userId}, {$push: {savedPost: postId }}, {new: true})
  }


  const userData = await User.find({userId:userId, isBlocked: false }).sort({date:-1});
  res.status(200).json({  
    _id: user.id,
    userName: user.userName,
    email: user.email,
    profileImg: user.profileImg,
    savedPost:user.savedPost,
    token: generateToken(user.id),});
});



// @desc    Get User Saved Posts
// @route   get /post/get-saved-post
// @access  Public

export const getSavedPost = asyncHandler(async (req: Request, res: Response) => {
  const id = req.body.userId;
  const user =  await User.findOne({_id:id, isBlocked: false },{savedPost:1,_id:0});
  if(user){

    const savedPostIds = user.savedPost; 
    const posts = await Post.find({ _id: { $in: savedPostIds } }).populate('userId');
    console.log(posts)
    res.status(200).json(posts);
  }else{
    res.status(400);
    throw new Error("User Not Found")
  }
});