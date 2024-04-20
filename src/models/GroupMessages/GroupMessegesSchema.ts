import mongoose, { Schema } from 'mongoose';
import { IGroupMessage } from './GroupMessagesTypes';

// Define the message schema
const messageSchema: Schema<IGroupMessage> = new mongoose.Schema({
  groupId: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String },
  attachment: {
    type: {
      type: String,
      enum: ['image', 'video', 'file'],
    },
    url: String,
    filename: String,
    size: Number,
  },
},{timestamps:true});   

// Define the GroupMessage model
const GroupMessages = mongoose.model<IGroupMessage>('GroupMessages', messageSchema);

export default GroupMessages;
