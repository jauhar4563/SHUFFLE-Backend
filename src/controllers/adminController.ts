import { Request, Response } from "express";
import Admin from "../models/admin/adminModel";
import generateToken from "../utils/generateToken";
import User from "../models/user/userModel";
import Post from "../models/post/postModel";
import Hashtag from "../models/hashtag/hashtagModel";
import asyncHandler from "express-async-handler";
import Report from "../models/reports/reportModel";


interface PaginationMeta {
  next?: {
    page: number;
    limit: number;
  };
  prev?: {
    page: number;
    limit: number;
  };
}

// @desc    Admin Login
// @route   ADMIN /Admin/login
// @access  Public

export const LoginController = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });

  if (admin && password === admin.password) {
    res.json({
      message: "Authorisation Successful.",
      _id: admin.id,
      name: admin.name,
      email: admin.email,
      profileImg: admin.profileImg,
      token: generateToken(admin.id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid Credentials");
  }
});

// @desc    Get all users with pagination
// @route   ADMIN /admin/get-users
// @access  Public

export const getUsersController = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const totalUsers = await User.countDocuments({});

  const users = await User.find({})
    .sort({ date: -1 })
    .limit(limit)
    .skip(startIndex);

  const pagination: PaginationMeta = {};

  if (endIndex < totalUsers) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: limit,
    };
  }

  if (users) {
    res.status(200).json({ users, pagination, totalUsers });
  } else {
    res.status(404);
    throw new Error("Users Not Found");
  }
});

// @desc    Get all users
// @route   ADMIN /admin/get-users
// @access  Public

export const getPostController = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  console.log(page, limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const totalPosts = await Post.countDocuments({isBlocked:true});

  const posts = await Post.find({isBlocked:true})
    .populate({
      path: "userId",
      select: "userName profileImg isVerified",
    })
    .sort({ date: -1 })
    .limit(limit)
    .skip(startIndex);
  const pagination: PaginationMeta = {};

  if (endIndex < totalPosts) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: limit,
    };
  }

  if (posts) {
    res.status(200).json({ posts, pagination, totalPosts });
  } else {
    res.status(404);
    throw new Error(" No Post Found");
  }
});



// @desc    Get all reports
// @route   ADMIN /admin/get-reports
// @access  Public


export const getPostReports = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const totalReports = await Report.countDocuments({});

  const reports = await Report.find({})
    .populate({
      path: "userId",
      select: "userName profileImg isVerified",
    }).
    populate("postId")
    .sort({ date: -1 })
    .limit(limit)
    .skip(startIndex);

  const pagination: PaginationMeta = {};

  if (endIndex < totalReports) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: limit,
    };
  }

  if (reports) {
    res.status(200).json({ reports, pagination, totalReports });
  } else {
    res.status(404);
    throw new Error(" No Post Found");
  }
});


// @desc    Block Post
// @route   ADMIN /admin/block-post
// @access  Public

export const postBlockController = asyncHandler(async (req: Request, res: Response) => {
  const postId = req.body.postId;
  console.log(req.body + "put");
  const post = await Post.findById(postId);

  if (!post) {
    res.status(400);
    throw new Error("User not found");
  }

  post.isBlocked = !post.isBlocked;
  await post.save();

  const posts = await Post.find({}).sort({ date: -1 });
  const blocked = post.isBlocked ? "Blocked" : "Unblocked";
  console.log('block post')
  res.status(200).json({ posts, message: `You have ${blocked} ${post.title}` });
});

// @desc    Block Users
// @route   ADMIN /admin/block-user
// @access  Public

export const userBlockController = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.body.userId;
  console.log(req.body);
  const user = await User.findById(userId);

  if (!user) {
    res.status(400);
    throw new Error("User not found");
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  const users = await User.find({}).sort({ date: -1 });
  const blocked = user.isBlocked ? "Blocked" : "Unblocked";
  res
    .status(200)
    .json({ users, message: `You have ${blocked} ${user.userName}` });
});

// @desc    Get all hashtags
// @route   ADMIN /admin/get-users
// @access  Public

export const addHashtagsController = asyncHandler(async (req: Request, res: Response) => {
  const { hashtag } = req.body;
  const existingHashtags = await Hashtag.find({ hashtag });
  if (existingHashtags.length > 0) {
    res.status(404);
    throw new Error("Hashtag Already Exist");
  } else {
    await Hashtag.create({ hashtag });

    const allTags = await Hashtag.find({}).sort({ date: -1 });
    res.status(200).json({ message: "Hashtag added", hashtags: allTags });
  }
});

// @desc    Get all hashtags
// @route   ADMIN /admin/get-users
// @access  Public

export const getHashtagsController = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  console.log(page, limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const totalHashtags = await Hashtag.countDocuments({});
  const hashtags = await Hashtag.find({})
    .sort({ date: -1 })
    .limit(limit)
    .skip(startIndex);
  const pagination: PaginationMeta = {};
  if (endIndex < totalHashtags) {
    pagination.next = {
      page: page + 1,
      limit: limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit: limit,
    };
  }

  if (hashtags) {
    res.status(200).json({ hashtags, pagination, totalHashtags });
  } else {
    res.status(404);
    throw new Error(" No Hashtags Found");
  }
});

// @desc    Block Hashtag
// @route   ADMIN /admin/block-hashtag
// @access  Public

export const hashtagBlockController = asyncHandler(
  async (req: Request, res: Response) => {
    const hashtagId = req.body.hashtagId;
    console.log(req.body);
    const hashtag = await Hashtag.findById(hashtagId);

    if (!hashtag) {
      res.status(400);
      throw new Error("Hashtag not found");
    }

    hashtag.isBlocked = !hashtag.isBlocked;
    await hashtag.save();

    const hashtags = await Hashtag.find({}).sort({ date: -1 });
    const blocked = hashtag.isBlocked ? "Blocked" : "Unblocked";
    res
      .status(200)
      .json({ hashtags, message: `You have ${blocked} ${hashtag.hashtag}` });
  }
);

// @desc    Edit Hashtag
// @route   ADMIN /admin/edit-hashtag
// @access  Public

export const hashtagEditController = asyncHandler(async (req: Request, res: Response) => {
  const { hashtagId, hashtag } = req.body;
  console.log(req.body);
  const ExistingTag = await Hashtag.findById(hashtagId);

  if (!ExistingTag) {
    res.status(400);
    throw new Error("Hashtag not found");
  }

  ExistingTag.hashtag = hashtag;
  await hashtag.save();

  const hashtags = await Hashtag.find({}).sort({ date: -1 });
  res.status(200).json({ hashtags, message: `You have Edited hashtag` });
});
