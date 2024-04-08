import mongoose, { Schema } from 'mongoose';
import user from './userTypes'
import { Gender } from './userTypes';

const userSchema: Schema = new Schema<user>({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique : true,
        required: true
    },
    phone: {
        type: String,
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: Object.values(Gender),
    },
    profileImg: {
        type: String,
        default: 'https://cdn-icons-png.flaticon.com/512/1053/1053244.png'
    },
    bio: {
        type: String,
        default: ''
    },
    savedPost: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
        default: []
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    DND: {
        type: Boolean,
        default: false
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    isGoogle:{
        type:Boolean,
        default: false
    },
    isFacebook:{
        type:Boolean,
        default: false
    }
}, { timestamps: true });

const User = mongoose.model<user>('User', userSchema);

export default User;
