import express from "express";
import {
  addPostController,
  deletePostController,
  getPostController,
  getSavedPostController,
  getUserPostController,
  likePostController,
  reportPostController,
  savePostController,
  updatePostController,
} from "../controllers/postController";
import { protect } from "../middlewares/auth";
import {
  addCommentController,
  addReplyCommentController,
  deletePostCommentController,
  getCommentsByPostIdController,
  getCommentsCount,
} from "../controllers/commentController";
import {
  createPostValidation,
  postExistValidation,
  reportPostValidation,
  userAndPostExistValidation,
} from "../validations/postValidations";
const router = express.Router();

router.post("/add-post", createPostValidation, protect, addPostController);
router.post("/get-post", protect, getPostController);
router.get("/get-user-post/:userId", protect, getUserPostController);
router.put("/edit-post", postExistValidation, protect, updatePostController);
router.delete(
  "/delete-post",
  userAndPostExistValidation,
  protect,
  deletePostController
);
router.post(
  "/like-post",
  userAndPostExistValidation,
  protect,
  likePostController
);
router.post(
  "/save-post",
  userAndPostExistValidation,
  protect,
  savePostController
);
router.get("/user-saved-post/:userId", getSavedPostController);
router.post(
  "/report-post",
  reportPostValidation,
  protect,
  reportPostController
);

router.get(
  "/get-post-comments/:postId",
  protect,
  getCommentsByPostIdController
);
router.post("/add-comment", protect, addCommentController);
router.post("/reply-comment", protect, addReplyCommentController);
router.delete("/delete-post-comment", protect, deletePostCommentController);
router.get("/get-comments-count/:postId", protect, getCommentsCount);

export default router;
