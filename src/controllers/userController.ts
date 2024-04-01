import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import speakeasy from "speakeasy";
import bcrypt from "bcryptjs";
import User from "../models/user/userModel";
import generateToken from "../utils/generateToken";
import sendVerifyMail from "../utils/sendVerifyMail";
import Hashtag from "../models/hashtag/hashtagModel";
import Connections from "../models/connections/connectionModel";

// @desc    Register new User
// @route   USER /register
// @access  Public

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { username: userName, email, password } = req.body;
    console.log(userName, email, password);

    if (!userName.trim() || !email.trim() || !password.trim()) {
      res.status(400);
      throw new Error("Please add fields");
    }
    console.log(userName, email, password);

    const userExist = await User.findOne({ email });

    if (userExist) {
      res.status(400);
      throw new Error("User already exists");
    }
    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret({ length: 20 }).base32,
      digits: 4,
    });
    const sessionData = req.session!;
    sessionData.userDetails = { userName, email, password };
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now();
    console.log(sessionData.otp);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    sessionData.userDetails!.password = hashedPassword;
    sendVerifyMail(req, userName, email);

    res.status(200).json({ message: "OTP sent for verification", email });
  }
);

// @desc    Register OTP Verification
// @route   USER /register-otp
// @access  Public

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { otp } = req.body;
  if (!otp) {
    res.status(400);
    throw new Error("Please provide OTP");
  }
  console.log(req.session);
  const sessionData = req.session!;

  const storedOTP = sessionData.otp;
  console.log(storedOTP);
  if (!storedOTP || otp !== storedOTP) {
    res.status(400);
    throw new Error("Invalid OTP");
  }
  const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
  const currentTime = Date.now();
  const otpExpirationTime = 60 * 1000;
  if (currentTime - otpGeneratedTime > otpExpirationTime) {
    res.status(400);
    throw new Error("OTP has expired");
  }

  const userDetails = sessionData.userDetails;
  if (!userDetails) {
    res.status(400);
    throw new Error("User details not found in session");
  }
  const user = await User.create({
    userName: userDetails.userName,
    email: userDetails.email,
    password: userDetails.password,
  });
  await Connections.create({
    userId: user._id,
  });

  delete sessionData.userDetails;
  delete sessionData.otp;
  delete sessionData.otpGeneratedTime;

  res.status(200).json({ message: "OTP verified, user created", user });
});

// @desc    Resend OTP
// @route   USER /resend-otp
// @access  Public

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  console.log(email);
  const otp = speakeasy.totp({
    secret: speakeasy.generateSecret({ length: 20 }).base32,
    digits: 4,
  });

  const sessionData = req.session!;
  sessionData.otp = otp;
  sessionData.otpGeneratedTime = Date.now();

  const userDetails = sessionData.userDetails;
  if (!userDetails) {
    res.status(400);
    throw new Error("User details not found in session");
    return;
  }
  console.log(otp);
  sendVerifyMail(req, userDetails.userName, userDetails.email);
  res.status(200).json({ message: "OTP sent for verification", email });
});

// @desc    User Login
// @route   USER /login
// @access  Public

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email.trim() || !password.trim()) {
    res.status(400);
    throw new Error("Please add fields");
  }
  const user = await User.findOne({ email });

  if (user) {
    if (user.isBlocked) {
      res.status(400);
      throw new Error("User is blocked");
    }
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      message: "Login Successful",
      _id: user.id,
      userName: user.userName,
      email: user.email,
      profileImg: user.profileImg,
      savedPost: user.savedPost,
      bio: user.bio,
      phone: user.phone,
      isPrivate: user.isPrivate,
      token: generateToken(user.id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid Credentials");
  }
});

// @desc    Google Authentication
// @route   USER /google-auth
// @access  Public

export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { username, email, imageUrl } = req.body;

  try {
    const userExist = await User.findOne({ email });

    if (userExist) {
      if (userExist.isBlocked) {
        res.status(400);
        throw new Error("User is blocked");
      }

      if (userExist.isGoogle) {
        res.json({
          message: "Login Successful",
          _id: userExist.id,
          userName: userExist.userName,
          email: userExist.email,
          profileImg: userExist.profileImg,
          savedPost: userExist.savedPost,
          bio: userExist.bio,
          phone: userExist.phone,
          isPrivate: userExist.isPrivate,
          token: generateToken(userExist.id),
        });
        return;
      } else {
        res.status(400);
        throw new Error(
          "User already Exist with that email. Try a differeny email"
        );
      }
    }

    const randomPassword = Math.random().toString(36).slice(-8);

    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const newUser = await User.create({
      userName: username,
      email,
      password: hashedPassword,
      profileImg: imageUrl,
      isGoogle: true,
    });
    await Connections.create({
      userId: newUser._id,
    });

    const token = generateToken(newUser.id);

    res.status(200).json({
      message: "Login Successful",
      _id: newUser.id,
      userName: newUser.userName,
      email: newUser.email,
      profileImg: newUser.profileImg,
      savedPost: newUser.savedPost,
      bio: newUser.bio,
      phone: newUser.phone,
      isPrivate: newUser.isPrivate,
      token: token,
    });
  } catch (error) {
    console.error("Error in Google authentication:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Forgot Password
// @route   USER /forgot-password
// @access  Public

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(400);
      throw new Error("User not found");
    }
    if (user) {
      const otp = speakeasy.totp({
        secret: speakeasy.generateSecret({ length: 20 }).base32,
        digits: 4,
      });

      const sessionData = req.session!;
      sessionData.otp = otp;
      sessionData.otpGeneratedTime = Date.now();
      sessionData.email = email;
      sendVerifyMail(req, user.userName, user.email);
      console.log(otp);
      res
        .status(200)
        .json({ message: `OTP has been send to your email`, email });
    } else {
      res.status(400);
      throw new Error("Not User Found");
    }
  }
);

// @desc    Forgot Password OTP verification
// @route   USER /forgot-otp
// @access  Public

export const forgotOtp = asyncHandler(async (req: Request, res: Response) => {
  const { otp } = req.body;
  if (!otp) {
    res.status(400);
    throw new Error("Please provide OTP");
  }
  const sessionData = req.session!;

  const storedOTP = sessionData.otp;
  console.log(storedOTP);
  if (!storedOTP || otp !== storedOTP) {
    res.status(400);
    throw new Error("Invalid OTP");
  }
  const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
  const currentTime = Date.now();
  const otpExpirationTime = 60 * 1000;
  if (currentTime - otpGeneratedTime > otpExpirationTime) {
    res.status(400);
    throw new Error("OTP has expired");
  }

  delete sessionData.otp;
  delete sessionData.otpGeneratedTime;

  res.status(200).json({
    message: "OTP has been verified. Please reset password",
    email: sessionData?.email,
  });
});

// @desc    Reset-Password
// @route   USER /reset-passwordt
// @access  Public

export const resetPassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { password, confirmPassword } = req.body;
    const sessionData = req.session;

    if (!sessionData || !sessionData.email) {
      res.status(400);
      throw new Error("No session data found");
    }

    if (password !== confirmPassword) {
      res.status(400);
      throw new Error("Password do not match");
    }

    const user = await User.findOne({ email: sessionData.email });
    if (!user) {
      res.status(400);
      throw new Error("User Not Found");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password has been reset successfully" });
  }
);

// @desc    Get all hashtags
// @route   User /get-hashtags
// @access  Public

export const getHashtags = asyncHandler(async (req: Request, res: Response) => {
  const hashtags = await Hashtag.find({ isBlocked: false }).sort({ date: -1 });
  console.log("got request");
  if (hashtags) {
    res.status(200).json({ hashtags });
  } else {
    res.status(404);
    throw new Error(" No Hashtags Found");
  }
});

// @desc    Get all hashtags
// @route   User /get-hashtags
// @access  Public

export const getUserDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params;
    console.log(userId + "hello");
    const user = await User.findById(userId);
    const connections = await Connections.findOne({ userId });
    console.log("got request");
    if (user) {
      res.status(200).json({ user, connections });
    } else {
      res.status(404);
      throw new Error(" user Not found");
    }
  }
);

// @desc    Edit User Profile
// @route   User /edit-profile
// @access  Public

export const editProfile = asyncHandler(async (req: Request, res: Response) => {
  const { userId,image, name, phone, bio, gender, isPrivate } = req.body;
  const user = await User.findById(userId);
  console.log(userId,image, name, phone, bio, gender, isPrivate);

  if (!user) {
    res.status(400);
    throw new Error("Post cannot be found");
  }

  if (name) user.userName = name;
  if(image) user.profileImg=image;
  if (phone) user.phone = phone;
  if (bio) user.bio = bio;
  if (gender) user.gender = gender;
  if (isPrivate !== undefined) user.isPrivate = isPrivate;

  await user.save();

  res.status(200).json({
    _id: user.id,
    userName: user.userName,
    email: user.email,
    profileImg: user.profileImg,
    savedPost: user.savedPost,
    bio: user.bio,
    phone: user.phone,
    isPrivate: user.isPrivate,
    token: generateToken(user.id),
  });
});

export const userSuggestions = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.body;

    const connection = await Connections.findOne({ userId });
    if (!connection) {
      const users = await User.find({ _id: { $ne: userId } });
      res.status(200).json({ suggestedUsers:users });
      return;
    }
    const followingIds = connection.following.map((user) => user._id);
    const requestedIds = connection.requestSent.map((user) => user._id);

    const suggestedUsers = await User.find({
      _id: { $nin: [...followingIds, ...requestedIds, userId] },
    }).limit(5);
    console.log(suggestedUsers)
    res
      .status(200)
      .json({  suggestedUsers });
  }
);
