import { Request, Response } from 'express';
import FeedPost from '../models/FeedPost.js';
import { AuthRequest } from '../middleware/authMiddleware.js';
import Product from '../models/Product.js';
import { DEFAULT_PROFILE_AVATAR } from '../constants/avatar.js';

export const getFeedPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 5;
    const feedPosts = await FeedPost.find().sort({ createdAt: -1 }).limit(Math.min(limit, 20));
    const normalized = feedPosts.map((post: any) => {
      const likedBy = Array.isArray(post.likedBy) ? post.likedBy : [];
      const commentItems = Array.isArray(post.commentItems) ? post.commentItems : [];
      const rawAuthor = (post.authorAvatar || '').trim();
      return {
        ...post.toObject(),
        authorAvatar: rawAuthor || DEFAULT_PROFILE_AVATAR,
        likes: likedBy.length,
        comments: commentItems.length,
      };
    });

    res.status(200).json({
      success: true,
      data: normalized,
    });
  } catch (error: any) {
    console.error('[Feed:getFeedPosts] Failed to fetch feed posts', {
      query: req.query,
      error: error?.message,
      stack: error?.stack,
    });
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createFeedPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    const {
      postType,
      title,
      content,
      category,
      location,
      image = '',
    } = req.body;

    if (!postType || !title || !content || !category || !location) {
      res.status(400).json({ success: false, error: 'Please provide postType, title, content, category, and location' });
      return;
    }

    const feedPost = await FeedPost.create({
      userId: req.user._id,
      userRole: req.user.role || 'user',
      postType,
      title,
      content,
      category,
      location,
      image,
      authorName: req.user.name,
      authorAvatar:
        (req.user.profileImage || '').trim() ||
        (req.user.avatar || '').trim() ||
        DEFAULT_PROFILE_AVATAR,
      likes: 0,
      comments: 0,
      tags: [],
    });

    res.status(201).json({
      success: true,
      data: feedPost,
    });
  } catch (error: any) {
    console.error('[Feed:createFeedPost] Failed to create feed post', {
      userId: req.user?._id?.toString?.(),
      body: req.body,
      error: error?.message,
      stack: error?.stack,
    });
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addFeedComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    const text = (req.body.text || '').trim();
    if (!text) {
      res.status(400).json({ success: false, error: 'Comment content is required' });
      return;
    }

    const post = await FeedPost.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    const sellerProduct = await Product.findOne({ owner: req.user._id }).select('_id');
    const commenterType: 'buyer' | 'seller' = sellerProduct ? 'seller' : 'buyer';

    if (post.postType === 'Seller Update' && commenterType !== 'buyer') {
      res.status(403).json({ success: false, error: 'Only buyers can comment on seller updates' });
      return;
    }

    if (post.postType === 'Buyer Requirement' && commenterType !== 'seller') {
      res.status(403).json({ success: false, error: 'Only sellers can comment on buyer requirements' });
      return;
    }

    post.commentItems.push({
      userId: req.user._id,
      userName: req.user.name,
      text,
      userAvatar:
        (req.user.profileImage || '').trim() ||
        (req.user.avatar || '').trim() ||
        DEFAULT_PROFILE_AVATAR,
    } as any);

    post.comments = post.commentItems.length;
    await post.save();

    res.status(201).json({
      success: true,
      data: {
        ...post.toObject(),
        likes: (post.likedBy || []).length,
        comments: (post.commentItems || []).length,
      },
    });
  } catch (error: any) {
    console.error('[Feed:addFeedComment] Failed to add comment', {
      postId: req.params.postId,
      userId: req.user?._id?.toString?.(),
      error: error?.message,
      stack: error?.stack,
    });
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getFeedComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const post = await FeedPost.findById(req.params.postId).select('commentItems');
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    const comments = [...(post.commentItems || [])].sort(
      (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const likeFeedPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    const post = await FeedPost.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    const userId = req.user._id.toString();
    const alreadyLiked = (post.likedBy || []).some((id: any) => id.toString() === userId);
    if (!alreadyLiked) {
      post.likedBy.push(req.user._id);
      post.likes = post.likedBy.length;
      await post.save();
    }

    res.status(200).json({
      success: true,
      data: {
        ...post.toObject(),
        likes: (post.likedBy || []).length,
        comments: (post.commentItems || []).length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const unlikeFeedPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user?._id) {
      res.status(401).json({ success: false, error: 'Not authorized to access this route' });
      return;
    }

    const post = await FeedPost.findById(req.params.postId);
    if (!post) {
      res.status(404).json({ success: false, error: 'Post not found' });
      return;
    }

    const userId = req.user._id.toString();
    post.likedBy = (post.likedBy || []).filter((id: any) => id.toString() !== userId);
    post.likes = post.likedBy.length;
    await post.save();

    res.status(200).json({
      success: true,
      data: {
        ...post.toObject(),
        likes: (post.likedBy || []).length,
        comments: (post.commentItems || []).length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
