import { Document } from 'mongoose';

export interface Message {
  conversationId: string;
  sender: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageDocument extends Message, Document {}
