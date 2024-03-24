import mongoose, { Schema } from "mongoose";
import HashtagInterface from "./hashtagTypes";


const HashtagSchema: Schema = new Schema({
    hashtag: { type: String, required: true },
    posts: { type: [Schema.Types.ObjectId], ref: 'Post',defalut:[] },
    date: { type: Date, default: Date.now },
    isBlocked: { type: Boolean, default: false }
  });
  
  const Hashtag = mongoose.model<HashtagInterface>('Hashtag', HashtagSchema);
  
  export default Hashtag;