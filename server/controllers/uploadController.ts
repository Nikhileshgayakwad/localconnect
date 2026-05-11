import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: 'Please upload an image file' });
      return;
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      data: {
        imageUrl,
        filename: req.file.filename,
      },
    });
  } catch (error: any) {
    console.error('[Upload:uploadImage] Failed to upload image', {
      userId: req.user?._id?.toString?.(),
      error: error?.message,
      stack: error?.stack,
    });
    res.status(500).json({ success: false, error: error.message });
  }
};
