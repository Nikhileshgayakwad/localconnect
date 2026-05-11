import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a product title'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Please add a product description'],
      maxlength: 1000,
    },
    price: {
      type: Number,
      required: [true, 'Please add a product price'],
      min: 0,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1000&q=80',
    },
    location: {
      type: String,
      required: [true, 'Please add a product location'],
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      required: [true, 'Please add a product category'],
      trim: true,
      maxlength: 60,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      min: 0,
      default: 0,
    },
    sellerName: {
      type: String,
      required: [true, 'Please add a seller name'],
      trim: true,
      maxlength: 80,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
