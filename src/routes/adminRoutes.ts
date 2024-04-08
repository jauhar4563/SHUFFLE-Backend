import express from "express";
import {
  LoginController,
  addHashtagsController,
  getHashtagsController,
  getPostController,
  getPostReports,
  getUsersController,
  hashtagBlockController,
  hashtagEditController,
  postBlockController,
  userBlockController,
} from "../controllers/adminController";
import { protectAdmin } from "../middlewares/adminAuth";

const router = express.Router();

router.post("/login", LoginController);
router.get("/get-users", protectAdmin, getUsersController);
router.put("/user-block", protectAdmin, userBlockController);
router.get("/hashtags", protectAdmin, getHashtagsController);
router.post("/add-hashtag", protectAdmin, addHashtagsController);
router.put("/block-hashtag", protectAdmin, hashtagBlockController);
router.patch("/edit-hashtag", hashtagEditController);
router.get('/get-posts',protectAdmin,getPostController);
router.put('/post-block',protectAdmin,postBlockController);
router.get('/get-reports',protectAdmin,getPostReports);

export default router;
