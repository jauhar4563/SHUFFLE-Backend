import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import User from "../models/user/userModel";

const registerValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username: userName, email, password } = req.body;

      const trimmedUserName = userName.trim();
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();

      if (!trimmedUserName || !trimmedEmail || !trimmedPassword) {
        res.status(400);
        throw new Error("Please fill all the forms");
      }

      const userExist = await User.findOne({ email: trimmedEmail });
      if (userExist) {
        res.status(400);
        throw new Error("User already Exist");
      }

      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not authenticated");
    }
  }
);

const otpValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { otp } = req.body;
      if (!otp) {
        res.status(400);
        throw new Error("Please provide OTP");
      }

      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not authenticated");
    }
  }
);

export const userExistValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        res.status(400);
        throw new Error("User Id not found");
      }

      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not User found");
    }
  }
);

export const userLoginValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
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
      if (!user) {
        res.status(400);
        throw new Error("User not found");
      }

      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not User found");
    }
  }
);

export { registerValidation, otpValidation };
