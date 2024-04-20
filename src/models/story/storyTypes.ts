import { Document,Types } from "mongoose";

interface StoryInterface extends Document {
  userId: Types.ObjectId;
  stories: {
    imageUrl: string;
    createdAt?: Date;
    views:string[];
    isDeleted?: boolean;
  }[];
}

export default StoryInterface;
