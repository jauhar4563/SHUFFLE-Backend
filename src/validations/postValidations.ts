import asyncHandler from "express-async-handler";
import { Request, Response, NextFunction } from "express";
import Post from "../models/post/postModel";

export const createPostValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        userId,
        imageUrls,
        title,
        description,
        hideLikes,
        hideComment,
        hashtag,
      } = req.body;

      if (!userId.trim() || !imageUrls || !description.trim()) {
        res.status(400);
        throw new Error("Provide all details");
      }

      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not authenticated");
    }
  }
);


export const postExistValidation = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { postId } = req.body;

      if (!postId.trim()) {
        res.status(400);
        throw new Error("Post Id cannot be found");
      }

      next();
    } catch (error) {
      console.log(error);
      res.status(401);
      throw new Error("Not authenticated");
    }
  }
);


export const userAndPostExistValidation = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { postId,userId } = req.body;
  
        if (!postId.trim() || !userId.trim()) {
          res.status(400);
          throw new Error("Post or user cannot be found");
        }
  
        next();
      } catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not authenticated");
      }
    }
  );
  
  export const reportPostValidation = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { userId, postId, cause } = req.body;

        if (!postId.trim() || !userId.trim() || !cause.trim()) {
            res.status(400);
            throw new Error("Provide necessary informations");
          }

        next();
      } catch (error) {
        console.log(error);
        res.status(401);
        throw new Error("Not authenticated");
      }
    }
  );
  

