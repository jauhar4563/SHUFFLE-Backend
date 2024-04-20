import { Document, Types } from "mongoose";

export interface Message {
  conversationId: string;
  sender: Types.ObjectId;
  text: string;
  attachment: {
    type: string;
    url: string;
    filename: string;
    size: number;
  };
  isRead:boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageDocument extends Message, Document {}
