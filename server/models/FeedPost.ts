import mongoose from 'mongoose';
import { DEFAULT_PROFILE_AVATAR } from '../constants/avatar.js';

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    userAvatar: {
      type: String,
      default: '',
      maxlength: 2048,
    },
  },
  {
    timestamps: true,
  }
);

const feedPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    userRole: {
      type: String,
      required: true,
      default: 'user',
      trim: true,
      maxlength: 30,
    },
    postType: {
      type: String,
      enum: ['Seller Update', 'Buyer Requirement'],
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a post title'],
      trim: true,
      maxlength: 120,
    },
    authorName: {
      type: String,
      required: [true, 'Please add an author name'],
      trim: true,
      maxlength: 80,
    },
    authorAvatar: {
      type: String,
      default: DEFAULT_PROFILE_AVATAR,
    },
    content: {
      type: String,
      required: [true, 'Please add post content'],
      maxlength: 1000,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      trim: true,
      maxlength: 60,
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
      trim: true,
      maxlength: 100,
    },
    image: {
      type: String,
      default: '',
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    likedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      default: [],
    },
    comments: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentItems: {
      type: [commentSchema],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const FeedPost = mongoose.model('FeedPost', feedPostSchema);

export default FeedPost;
