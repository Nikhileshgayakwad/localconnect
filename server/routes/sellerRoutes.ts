import express from 'express';
import { getSellerProfile, getSellers } from '../controllers/sellerController.js';

const router = express.Router();

router.get('/', getSellers);
router.get('/profile/:name', getSellerProfile);

export default router;
