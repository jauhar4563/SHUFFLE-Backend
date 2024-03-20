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
        default: 'default_profile_image_url'
    },
    bio: {
        type: String,
        default: ''
    },
    savedPost: {
        type: [Schema.Types.ObjectId],
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
    isPrivate: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const User = mongoose.model<user>('User', userSchema);

export default User;
