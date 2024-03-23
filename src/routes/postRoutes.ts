import express from 'express'
import { addPost,getPost,getUserPost,updatePost } from '../controllers/postController';
const router = express.Router()

router.post('/add-post',addPost);
router.get('/get-post',getPost);
router.post('/get-user-post',getUserPost);
router.post('/update-post',updatePost);

export default router;