import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/authMiddleware.js';
import { uploadImage } from '../controllers/uploadController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve('uploads'));
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const baseName = path
      .basename(file.originalname || 'image', extension)
      .replace(/[^a-zA-Z0-9-_]/g, '')
      .slice(0, 40);
    cb(null, `${Date.now()}-${baseName || 'image'}${extension || '.jpg'}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files are allowed'));
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

router.post('/', protect, (req: Request, res: Response, next: NextFunction) => {
  upload.single('image')(req, res, (error: any) => {
    if (error) {
      console.error('[Upload:middleware] Upload validation failed', {
        error: error?.message,
        code: error?.code,
      });

      if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ success: false, error: 'Image must be 5MB or smaller' });
        return;
      }

      res.status(400).json({ success: false, error: error.message || 'Invalid image upload' });
      return;
    }
    next();
  });
}, uploadImage);

export default router;
