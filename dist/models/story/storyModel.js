"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const StorySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    stories: [{
            imageUrl: {
                type: String,
                required: true
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            views: {
                type: [String],
                default: []
            },
            isDeleted: {
                type: Boolean,
                default: false
            },
        }],
}, { timestamps: true });
StorySchema.index({ "stories.createdAt": 1 }, { expireAfterSeconds: 24 * 60 * 60 });
const Story = (0, mongoose_1.model)('Story', StorySchema);
exports.default = Story;
