import express from 'express'
import { getFeedPosts, getUserPosts, likePost } from '../controllers/posts.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

/* Note: createPost() is placed in the index.js as it needs the multer upload*/

/* Read Routes */
router.get('/', verifyToken, getFeedPosts)
router.get('/:userId/posts', verifyToken, getUserPosts)

/* Update Routes */
router.patch('/:id/like', verifyToken, likePost)

export default router