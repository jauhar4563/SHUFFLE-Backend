import { Document, Schema, Types } from "mongoose";

interface PostInterface extends Document {
    userId: Types.ObjectId;
    imageUrl: string;
    description: string;
    date: Date;
    likes: Types.ObjectId[];
    isHidden: boolean;
    isBlocked: boolean;
}

export default PostInterface;