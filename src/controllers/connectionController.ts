import asyncHandler from "express-async-handler";
import { Request, Response } from "express";
import Connections from "../models/connections/connectionModel";
import User from "../models/user/userModel";



export const getConnection = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.body;
    console.log(userId +"hello");

    const connection = await Connections.findOne({ userId }).populate({
      path: "followers",
      select: "userName profileImg",
    })
    .populate({
      path: "following",
      select: "userName profileImg",
    })
    res.status(200).json({ connection });
  }
);



export const getFollowRequests = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.body;
    console.log(userId);

    const requests = await Connections.findOne({ userId }).populate({
      path: "requested",
      select: "userName profileImg",
    });
    console.log(requests?.requested);
    res.status(200).json({ requests: requests?.requested });
  }
);




export const followUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId, followingUser } = req.body;
  console.log(userId, followingUser);
  const followingUserInfo = await User.findById(followingUser);
  let followed = false;
  if (!followingUserInfo) {
    res.status(400);
    throw new Error("User not found");
  }

  if (followingUserInfo.isPrivate) {
    await Connections.findOneAndUpdate(
      { userId: followingUser },
      { $addToSet: { requested: userId } },
      { upsert: true }
    );
    await Connections.findOneAndUpdate(
      { userId },
      { $addToSet: { requestSent: followingUser } },
      { upsert: true }
    );
  } else {
    await Connections.findOneAndUpdate(
      { userId: followingUser },
      { $addToSet: { followers: userId } },
      { upsert: true }
    );
    await Connections.findOneAndUpdate(
      { userId },
      { $addToSet: { following: followingUser } },
      { upsert: true }
    );
    followed = true;
  }
  const followingUserConnections = await Connections.find({
    userId: followingUser,
  });
  console.log(followingUserConnections);
  res
    .status(200)
    .json({ success: true, message: "User followed successfully", followed });
});




export const unFollowUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, unfollowingUser } = req.body;

    await Connections.findOneAndUpdate(
      { userId: unfollowingUser },
      { $pull: { followers: userId, requestSent: userId } }
    );

    await Connections.findOneAndUpdate(
      { userId },
      { $pull: { following: unfollowingUser, requested: unfollowingUser } }
    );

    res
      .status(200)
      .json({ success: true, message: "User unfollowed successfully" });
  }
);


export const acceptRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, requestedUser } = req.body;
    console.log(userId,requestedUser)
    await Connections.findOneAndUpdate(
      { userId },
      {
        $pull: { requested: requestedUser },
        $addToSet: { followers: requestedUser },
      },
      { new: true }
    );
    await Connections.findOneAndUpdate(
      { userId: requestedUser },
      {
        $pull: { requestSent: userId },
        $addToSet: { following: userId },
      },
      { new: true }
    );
    const connections = await Connections.findOne({ userId }).populate({
        path: "requested",
        select: "userName profileImg",
      });
          res
      .status(200)
      .json({ success: true, message: "Follow request accepted successfully",connections:connections?.requested });
  }
);



export const rejectRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, requestedUser } = req.body;

    await Connections.findOneAndUpdate(
      { userId },
      { $pull: { requestSent: requestedUser } },
      { new: true }
    );

    await Connections.findOneAndUpdate(
      { userId: requestedUser },
      { $pull: { requested: userId } },
      { new: true }
    );
    const connections = await Connections.findOne({ userId }).populate({
        path: "requested",
        select: "userName profileImg",
      });

    res
      .status(200)
      .json({ success: true, message: "Follow request rejected successfully" ,connections:connections?.requested});
  }
);


