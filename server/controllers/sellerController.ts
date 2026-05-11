import { Request, Response } from 'express';
import Seller from '../models/Seller.js';

export const getSellers = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 6;
    const sellers = await Seller.find().sort({ followers: -1, createdAt: -1 }).limit(Math.min(limit, 20));

    res.status(200).json({
      success: true,
      data: sellers,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSellerProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const sellerName = (req.params.name || '').trim();

    if (!sellerName) {
      res.status(400).json({ success: false, error: 'Seller name is required' });
      return;
    }

    const seller = await Seller.findOne({ name: { $regex: `^${sellerName}$`, $options: 'i' } });

    if (!seller) {
      res.status(404).json({ success: false, error: 'Seller profile not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: seller,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
