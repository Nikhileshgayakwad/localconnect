import { Response } from 'express';
import type { UploadApiResponse } from 'cloudinary';
import { AuthRequest } from '../middleware/authMiddleware.js';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

function uploadBufferToCloudinary(buffer: Buffer): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'localconnect',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result) {
          reject(new Error('Cloudinary upload returned no result'));
          return;
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    if (!isCloudinaryConfigured()) {
      res.status(503).json({
        success: false,
        error: 'Image upload is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      });
      return;
    }

    if (!req.file?.buffer) {
      res.status(400).json({ success: false, error: 'Please upload an image file' });
      return;
    }

    const result = await uploadBufferToCloudinary(req.file.buffer);
    const imageUrl = result.secure_url;

    res.status(201).json({
      success: true,
      data: {
        imageUrl,
        publicId: result.public_id,
      },
    });
  } catch (error: any) {
    console.error('[Upload:uploadImage] Failed to upload image', {
      userId: req.user?._id?.toString?.(),
      error: error?.message,
      stack: error?.stack,
    });
    res.status(500).json({ success: false, error: error.message || 'Upload failed' });
  }
};
