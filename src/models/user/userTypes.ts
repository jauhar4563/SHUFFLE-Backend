import { Document,ObjectId } from "mongoose";

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
    savedPost: ObjectId[];
    isOnline: boolean;
    isBlocked: boolean;
    DND: boolean;
    isPrivate: boolean;
}


export default UserInterface