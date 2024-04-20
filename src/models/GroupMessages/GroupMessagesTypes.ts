import { Document, Types } from 'mongoose';

// Interface for the GroupMessage document
export interface IGroupMessage extends Document {
    groupId: Types.ObjectId;
  sender: Types.ObjectId;
  text?: string;
  attachment: {
    type: string;
    url: string;
    filename: string;
    size: number;
  };
}
