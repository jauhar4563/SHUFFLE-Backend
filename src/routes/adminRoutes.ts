import express from 'express'
import { Login,getHashtags,getUsers,userBlock } from '../controllers/adminController';
const router = express.Router()

router.post('/login',Login);
router.get('/get-users',getUsers);
router.post('/user-block',userBlock);
router.post('/hashtags',getHashtags);

export default router