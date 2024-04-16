import express from "express";
const router = express.Router();
import { protect } from "../middlewares/auth";
import Story from "../models/story/storyModel";
import { addStoryController, getStoriesController } from "../controllers/StoryController";

router.post('/add-story',protect,addStoryController);
router.get('/get-stories/:userId',protect,getStoriesController);

export default router;

