import express from 'express';
import { getPublicUserProfile } from '../controllers/userController.js';

const router = express.Router();

router.get('/:userId', getPublicUserProfile);

export default router;
