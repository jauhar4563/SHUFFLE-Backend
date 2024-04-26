"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const auth_1 = require("../middlewares/auth");
const StoryController_1 = require("../controllers/StoryController");
router.post("/add-story", auth_1.protect, StoryController_1.addStoryController);
router.get("/get-stories/:userId", auth_1.protect, StoryController_1.getStoriesController);
router.get("/get-user-story/:userId", StoryController_1.getUserStory);
router.patch("/read-story", auth_1.protect, StoryController_1.readStoryController);
exports.default = router;
