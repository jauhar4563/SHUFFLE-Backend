import { Document,Types } from "mongoose";

export enum Gender {
    Male = 'male',
    Female = 'female',
    Other = 'other'
}

interface UserInterface extends Document {
    userName: string;
    email: string;
    phone?: string;
    password: string;
    gender?: Gender;
    profileImg?: string;
    bio?: string;
    savedPost: Types.ObjectId[];
    isOnline: boolean;
    isBlocked: boolean;
    DND: boolean;
    isPrivate: boolean;
    isGoogle:boolean;
    isFacebook:boolean;
}


export default UserInterface