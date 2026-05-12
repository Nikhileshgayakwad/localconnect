import express from 'express';
import { getNearbySellers, getSellerProfile, getSellers } from '../controllers/sellerController.js';

const router = express.Router();

router.get('/nearby', getNearbySellers);
router.get('/', getSellers);
router.get('/profile/:name', getSellerProfile);

export default router;
