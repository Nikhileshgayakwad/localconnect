import express from 'express';
import {
  addFeedComment,
  createFeedPost,
  getFeedComments,
  getFeedPosts,
  likeFeedPost,
  unlikeFeedPost,
} from '../controllers/feedController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getFeedPosts);
router.post('/', protect, createFeedPost);
router.post('/:postId/like', protect, likeFeedPost);
router.delete('/:postId/like', protect, unlikeFeedPost);
router.get('/:postId/comments', protect, getFeedComments);
router.post('/:postId/comments', protect, addFeedComment);

export default router;
