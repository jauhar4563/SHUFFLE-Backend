import { model, Schema } from 'mongoose';
import { MessageDocument } from './MessagesTypes';

const MessageSchema = new Schema<MessageDocument>(
  {
    conversationId: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Message = model<MessageDocument>('Message', MessageSchema);

export default Message;
