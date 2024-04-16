import { Document,Types } from "mongoose";

interface StoryInterface extends Document {
  userId: Types.ObjectId;
  stories: {
    imageUrl: string;
    createdAt?: Date;
    isDeleted?: boolean;
  }[];
}

export default StoryInterface;
