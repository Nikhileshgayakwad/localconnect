import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User.js';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    return;
  }

  try {
    // Verify token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    req.user = await User.findById(decoded.id);

    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    return;
  }
};
