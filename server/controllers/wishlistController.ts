import { Response } from 'express';
import mongoose from 'mongoose';
import Wishlist from '../models/Wishlist.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    const items = await Wishlist.find({ user: req.user._id }).populate('product');

    res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      res.status(400).json({ success: false, error: 'Invalid product id' });
      return;
    }

    const existing = await Wishlist.findOne({ user: req.user._id, product: productId });
    if (existing) {
      await existing.populate('product');
      res.status(200).json({ success: true, data: existing });
      return;
    }

    const created = await Wishlist.create({
      user: req.user._id,
      product: productId,
    });
    await created.populate('product');

    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    const { productId } = req.params;
    await Wishlist.findOneAndDelete({ user: req.user._id, product: productId });

    res.status(200).json({
      success: true,
      data: { productId },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
