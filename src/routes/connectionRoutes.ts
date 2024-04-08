import express from "express";
import {
  followUserController,
  unFollowUserController,
  acceptRequestController,
  rejectRequestController,
  getFollowRequestsController,
  getConnectionController,
} from "../controllers/connectionController";
const router = express.Router();


router.post('/follow',followUserController);
router.post('/unfollow',unFollowUserController);
router.post('/accept-request',acceptRequestController);
router.post('/reject-request',rejectRequestController);
router.post('/get-requested-users',getFollowRequestsController);
router.post('/get-connection',getConnectionController);

export default router;
