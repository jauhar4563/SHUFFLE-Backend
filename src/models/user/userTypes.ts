import { Document,Types } from "mongoose";

export enum Gender {
    Male = 'Male',
    Female = 'Female',
    Other = 'Other'
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
    isVerified:boolean;
    premiumExpiryDate:Date;
    isPrivate: boolean;
    isGoogle:boolean;
    isFacebook:boolean;
}


export default UserInterface