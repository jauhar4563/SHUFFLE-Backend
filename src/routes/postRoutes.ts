import express from 'express'
import { addPost,deletePost,getPost,getUserPost,updatePost } from '../controllers/postController';
const router = express.Router()

router.post('/add-post',addPost);
router.get('/get-post',getPost);
router.post('/get-user-post',getUserPost);
router.post('/edit-post',updatePost);
router.post('/delete-post',deletePost)

export default router;