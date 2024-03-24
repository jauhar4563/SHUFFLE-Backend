import express from 'express'
import { Login,addHashtags,getHashtags,getUsers,hashtagBlock,userBlock } from '../controllers/adminController';
const router = express.Router()

router.post('/login',Login);
router.get('/get-users',getUsers);
router.post('/user-block',userBlock);
router.get('/hashtags',getHashtags);
router.post('/add-hashtag',addHashtags)
router.post('/block-hashtag',hashtagBlock)

export default router