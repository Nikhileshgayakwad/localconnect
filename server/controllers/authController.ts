import { Request, Response } from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import FeedPost from '../models/FeedPost.js';
import { DEFAULT_PROFILE_AVATAR } from '../constants/avatar.js';

// Generate JWT
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const normalizedRole = role === 'seller' ? 'seller' : 'buyer';

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400).json({ success: false, error: 'User already exists' });
      return;
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: normalizedRole,
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id.toString()),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          shopName: user.shopName,
          whatsappNumber: user.whatsappNumber,
          location: user.location,
          address: user.address,
          city: user.city,
          latitude: user.latitude,
          longitude: user.longitude,
          profileImage: user.profileImage,
        }
      });
    } else {
      res.status(400).json({ success: false, error: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user: any = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
      return;
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id.toString()),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        shopName: user.shopName,
        whatsappNumber: user.whatsappNumber,
        location: user.location,
        address: user.address,
        city: user.city,
        latitude: user.latitude,
        longitude: user.longitude,
        profileImage: user.profileImage,
      }
    });

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current logged in user
// @route   POST /api/auth/me
// @access  Private
export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Role cannot be updated from profile edit.
    const allowedFields = ['name', 'shopName', 'whatsappNumber', 'location', 'address', 'city'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (user as any)[field] = req.body[field];
      }
    });

    if (req.body.profileImage !== undefined) {
      const trimmed = typeof req.body.profileImage === 'string' ? req.body.profileImage.trim() : '';
      user.profileImage = trimmed;
      user.avatar = trimmed || DEFAULT_PROFILE_AVATAR;
    }

    if (req.body.latitude !== undefined) {
      if (req.body.latitude === '' || req.body.latitude === null) {
        (user as any).latitude = null;
      } else {
        const v = Number(req.body.latitude);
        if (!Number.isFinite(v) || v < -90 || v > 90) {
          res.status(400).json({ success: false, error: 'Latitude must be a number between -90 and 90' });
          return;
        }
        (user as any).latitude = v;
      }
    }
    if (req.body.longitude !== undefined) {
      if (req.body.longitude === '' || req.body.longitude === null) {
        (user as any).longitude = null;
      } else {
        const v = Number(req.body.longitude);
        if (!Number.isFinite(v) || v < -180 || v > 180) {
          res.status(400).json({ success: false, error: 'Longitude must be a number between -180 and 180' });
          return;
        }
        (user as any).longitude = v;
      }
    }

    // Backward-compatibility: repair legacy invalid roles before save.
    if (user.role !== 'buyer' && user.role !== 'seller') {
      user.role = 'buyer';
    }

    await user.save();

    const nextAvatar = (user.profileImage || '').trim() || user.avatar || DEFAULT_PROFILE_AVATAR;
    await FeedPost.updateMany(
      { userId: user._id },
      {
        $set: {
          authorName: user.name,
          authorAvatar: nextAvatar,
        },
      }
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
