import express from "express";
import {
  Login,
  addHashtags,
  getHashtags,
  getPost,
  getUsers,
  hashtagBlock,
  hashtagEdit,
  postBlock,
  userBlock,
} from "../controllers/adminController";
import { protectAdmin } from "../middlewares/adminAuth";

const router = express.Router();

router.post("/login", Login);
router.get("/get-users", protectAdmin, getUsers);
router.post("/user-block", protectAdmin, userBlock);
router.get("/hashtags", protectAdmin, getHashtags);
router.post("/add-hashtag", protectAdmin, addHashtags);
router.post("/block-hashtag", protectAdmin, hashtagBlock);
router.post("/edit-hashtag", hashtagEdit);
router.get('/get-posts',protectAdmin,getPost);
router.post('/post-block',protectAdmin,postBlock)

export default router;
