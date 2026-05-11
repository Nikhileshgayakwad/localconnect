import mongoose from 'mongoose';

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
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80',
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
