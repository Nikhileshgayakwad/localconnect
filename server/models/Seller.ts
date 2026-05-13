import mongoose from 'mongoose';
import { DEFAULT_PROFILE_AVATAR } from '../constants/avatar.js';

const sellerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a seller name'],
      trim: true,
      maxlength: 80,
    },
    shopName: {
      type: String,
      required: [true, 'Please add a shop name'],
      trim: true,
      maxlength: 120,
      default: 'LocalConnect Shop',
    },
    whatsappNumber: {
      type: String,
      required: [true, 'Please add a WhatsApp number'],
      trim: true,
      maxlength: 20,
      default: '919999999999',
    },
    profileImage: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: DEFAULT_PROFILE_AVATAR,
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
      trim: true,
      maxlength: 100,
    },
    followers: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
    },
    specialties: {
      type: [String],
      default: [],
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;
