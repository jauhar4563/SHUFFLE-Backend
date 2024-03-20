import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import speakeasy from "speakeasy";
import bcrypt from "bcryptjs";
import User from "../models/user/userModel";
import generateToken from "../utils/generateToken";
import CustomSessionData from "../utils/session";
import sendVerifyMail from "../utils/sendVerifyMail";

//Controller for User Registration

export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    
    const { username:userName, email, password } = req.body;
    console.log(userName,email,password);
    
    if (!userName || !email || !password) {
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
    console.log(sessionData.otp)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    sessionData.userDetails!.password = hashedPassword;
    sendVerifyMail(req, userName, email);

    res.status(200).json({ message: "OTP sent for verification" });
  }
);

// OTP VERIFICATION

export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { otp } = req.body;
  if (!otp) { 
    res.status(400);
    throw new Error("Please provide OTP");
  }
  console.log(req.session)
  const sessionData = req.session!;
  
  const storedOTP = sessionData.otp;
  console.log(storedOTP)
  if (!storedOTP || otp !== storedOTP) {
    res.status(400);
    throw new Error("Invalid OTP");
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

  delete sessionData.userDetails;
  delete sessionData.otp;

  res.status(200).json({ message: "OTP verified, user created", user });
});

// User Login

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    if (user.isBlocked) {
      res.status(400);
      throw new Error("User is blocked");
    }
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      name: user.userName,
      email: user.email,
      profileImg: user.profileImg,
      token: generateToken(user.id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid Credentials");
  }
});
