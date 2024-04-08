import mongoose, { Schema } from "mongoose";
import { IGroup } from "./GroupChatTypes";

const groupSchema: Schema<IGroup> = new mongoose.Schema({
  name: { type: String, required: true },
  members: {type: [{ type: Schema.Types.ObjectId, ref: 'User' }] },
  created_at: { type: Date, default: Date.now },
  description: { type: String },
  admins: {type:[{ type: Schema.Types.ObjectId, ref: "User" }]},
  profile: { type: String },
});

const GroupChat = mongoose.model<IGroup>("GroupChat", groupSchema);

export default GroupChat;
