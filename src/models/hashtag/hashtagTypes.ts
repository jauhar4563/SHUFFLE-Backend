import { Document, Types } from "mongoose";

interface HashtagInterface extends Document {   
    hashtag: string;
    posts: Types.ObjectId[];
    date: Date;
    isBlocked: boolean;
}

export default HashtagInterface;
