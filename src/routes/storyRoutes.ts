import express from "express";
const router = express.Router();
import { protect } from "../middlewares/auth";
import {
  addStoryController,
  getStoriesController,
  getUserStory,
  readStoryController,
} from "../controllers/StoryController";

router.post("/add-story", protect, addStoryController);
router.get("/get-stories/:userId", protect, getStoriesController);
router.get("/get-user-story/:userId", getUserStory);
router.patch("/read-story", protect, readStoryController);

export default router;
