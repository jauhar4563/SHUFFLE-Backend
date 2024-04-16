import { Schema, model } from "mongoose";
import StoryInterface from "./storyTypes";

const StorySchema = new Schema<StoryInterface>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stories: [{
    imageUrl: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  }],
}, { timestamps: true });


StorySchema.index({ "stories.createdAt": 1 }, { expireAfterSeconds: 24 * 60 * 60 });

const Story = model<StoryInterface>('Story', StorySchema);

export default Story;
