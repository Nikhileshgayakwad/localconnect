import mongoose from 'mongoose';

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
      default: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
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
