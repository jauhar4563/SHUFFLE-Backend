import express from "express";
const router = express.Router();
import { protect } from "../middlewares/auth";
import { addStoryController, getStoriesController, readStoryController } from "../controllers/StoryController";

router.post('/add-story',protect,addStoryController);
router.get('/get-stories/:userId',protect,getStoriesController);
router.patch('/read-story',protect,readStoryController);

export default router;

