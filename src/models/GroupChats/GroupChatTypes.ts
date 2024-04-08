import { Document, Types } from 'mongoose';

// Interface for the Group document
export interface IGroup extends Document {
  name: string;
  members: Types.ObjectId[];
  created_at: Date;
  description?: string;
  admins: Types.ObjectId[];
  profile?: string;
}
