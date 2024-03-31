import express from "express";
import {
  addPost,
  deletePost,
  getPost,
  getSavedPost,
  getUserPost,
  likePost,
  savePost,
  updatePost,
} from "../controllers/postController";
import { protect } from "../middlewares/auth";
const router = express.Router();

router.post("/add-post", protect, addPost);
router.get("/get-post", protect, getPost);
router.post("/get-user-post", protect, getUserPost);
router.post("/edit-post", protect, updatePost);
router.post("/delete-post", protect, deletePost);
router.post('/like-post',protect,likePost);
router.post('/save-post',savePost)
router.post('/user-saved-post',getSavedPost)

export default router;
