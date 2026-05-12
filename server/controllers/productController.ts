import mongoose from 'mongoose';
import { Request, Response } from 'express';
import Product from '../models/Product.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 8;
    const {
      search = '',
      category = '',
      location = '',
      minPrice = '',
      maxPrice = '',
      seller = '',
    } = req.query as Record<string, string>;

    const query: Record<string, any> = {};

    const sellerId = typeof seller === 'string' ? seller.trim() : '';
    if (sellerId && mongoose.Types.ObjectId.isValid(sellerId)) {
      query.owner = new mongoose.Types.ObjectId(sellerId);
    }

    if (search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const categories = category
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (categories.length === 1) {
      query.category = { $regex: `^${categories[0]}$`, $options: 'i' };
    } else if (categories.length > 1) {
      query.category = {
        $in: categories.map((item) => new RegExp(`^${item}$`, 'i')),
      };
    }

    if (location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    const rawMin = typeof minPrice === 'string' ? minPrice.trim() : '';
    const rawMax = typeof maxPrice === 'string' ? maxPrice.trim() : '';
    const parsedMin = rawMin ? Number(rawMin) : Number.NaN;
    const parsedMax = rawMax ? Number(rawMax) : Number.NaN;

    if (!Number.isNaN(parsedMin) || !Number.isNaN(parsedMax)) {
      query.price = {};
      if (!Number.isNaN(parsedMin)) query.price.$gte = parsedMin;
      if (!Number.isNaN(parsedMax)) query.price.$lte = parsedMax;
    }

    const products = await Product.find(query).sort({ createdAt: -1 }).limit(Math.min(limit, 50));

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'owner',
      'name shopName whatsappNumber location profileImage avatar'
    );

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    product.views = (product.views || 0) + 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    const products = await Product.find({ owner: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    const { title, description, category, price, stock, image, location } = req.body;

    const product = await Product.create({
      title,
      description,
      category,
      price,
      stock,
      image,
      location,
      sellerName: req.user.name,
      owner: req.user._id,
      likes: 0,
      views: 0,
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    if (product.owner.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, error: 'Not authorized to modify this product' });
      return;
    }

    const allowedUpdates = ['title', 'description', 'category', 'price', 'stock', 'image', 'location'];
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        (product as any)[field] = req.body[field];
      }
    });

    await product.save();

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found' });
      return;
    }

    if (product.owner.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, error: 'Not authorized to delete this product' });
      return;
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      data: { id: req.params.id },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
