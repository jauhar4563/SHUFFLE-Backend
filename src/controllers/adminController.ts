import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import Admin from "../models/admin/adminModel";
import generateToken from "../utils/generateToken";
import User from "../models/user/userModel";
import Post from "../models/post/postModel";
import Hashtag from "../models/hashtag/hashtagModel";


// @desc    Admin Login
// @route   ADMIN /Admin/login
// @access  Public

export const Login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    
    if (admin && password=== admin.password) {
        res.json({message:"Authorisation Successful.",
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


// @desc    Get all users
// @route   ADMIN /admin/get-users
// @access  Public

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
    const users = await User.find({}).sort({date:-1});
  
    if (users) {
      res.status(200).json({ users });
    } else {
      res.status(404);
      throw new Error("Users Not Found");
    }
  });


  // @desc    Get all users
// @route   ADMIN /admin/get-users
// @access  Public

export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const posts = await Post.find({}).sort({date:-1});

  if (posts) {
    res.status(200).json({ posts });
  } else {
    res.status(404);
    throw new Error(" No Post Found");
  }
});

// @desc    Block Users
// @route   ADMIN /admin/block-user
// @access  Public

  export const userBlock = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.body.userId; 
    console.log(req.body)
    const user = await User.findById(userId)
  
    if (!user) {
      res.status(400);
      throw new Error('User not found');
    }
  
    user.isBlocked = !user.isBlocked;
    await user.save();
  
    const users = await User.find({}).sort({date:-1});
    const blocked = user.isBlocked?"Blocked":"Unblocked"
    res.status(200).json({ users,message: `You have ${blocked} ${user.userName}`});
  });



      // @desc    Get all hashtags
// @route   ADMIN /admin/get-users
// @access  Public

export const addHashtags = asyncHandler(async (req: Request, res: Response) => {
  const { hashtag } = req.body;
  const existingHashtags = await Hashtag.find({ hashtag });
  if (existingHashtags.length > 0) {
    res.status(404);
    throw new Error("Hashtag Already Exist");
  } else {
    await Hashtag.create({ hashtag });

    const allTags = await Hashtag.find({}).sort({date:-1});
    res.status(200).json({ message: "Hashtag added", hashtags: allTags });
  }
});





    // @desc    Get all hashtags
// @route   ADMIN /admin/get-users
// @access  Public

export const getHashtags = asyncHandler(async (req: Request, res: Response) => {
  const hashtags = await Hashtag.find({}).sort({date:-1});;

  if (hashtags) {
    res.status(200).json({ hashtags });
  } else {
    res.status(404);
    throw new Error(" No Hashtags Found");
  }
});



// @desc    Block Hashtag
// @route   ADMIN /admin/block-hashtag
// @access  Public

export const hashtagBlock = asyncHandler(async (req: Request, res: Response) => {
  const hashtagId = req.body.hashtagId; 
  console.log(req.body)
  const hashtag = await Hashtag.findById(hashtagId)

  if (!hashtag) {
    res.status(400);
    throw new Error('User not found');
  }

  hashtag.isBlocked = !hashtag.isBlocked;
  await hashtag.save();

  const hashtags = await Hashtag.find({}).sort({date:-1});
  const blocked = hashtag.isBlocked?"Blocked":"Unblocked"
  res.status(200).json({ hashtags,message: `You have ${blocked} ${hashtag.hashtag}`});
});
