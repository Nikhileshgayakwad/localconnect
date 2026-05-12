import { Request, Response } from 'express';
import User from '../models/User.js';
import Product from '../models/Product.js';
import FeedPost from '../models/FeedPost.js';

export const getPublicUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId).select(
      '_id name role location address city latitude longitude shopName whatsappNumber profileImage avatar createdAt'
    );

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const [products, recentPosts] = await Promise.all([
      user.role === 'seller' ? Product.find({ owner: user._id }).sort({ createdAt: -1 }).limit(20) : [],
      FeedPost.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10),
    ]);

    res.status(200).json({
      success: true,
      data: {
        user,
        products,
        recentPosts,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
