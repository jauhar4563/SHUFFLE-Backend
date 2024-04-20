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
        default: 'https://as1.ftcdn.net/v2/jpg/03/46/83/96/1000_F_346839683_6nAPzbhpSkIpb8pmAwufkC7c5eD7wYws.jpg'
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
    premiumExpiryDate:{type:Date},
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
