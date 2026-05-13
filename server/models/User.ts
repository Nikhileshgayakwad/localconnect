import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { DEFAULT_PROFILE_AVATAR } from '../constants/avatar.js';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['buyer', 'seller'],
    default: 'buyer'
  },
  avatar: {
    type: String,
    default: DEFAULT_PROFILE_AVATAR,
  },
  shopName: {
    type: String,
    trim: true,
    maxlength: 120,
    default: ''
  },
  whatsappNumber: {
    type: String,
    trim: true,
    maxlength: 20,
    default: ''
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    maxlength: 300,
    default: ''
  },
  city: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  latitude: {
    type: Number,
    default: undefined,
  },
  longitude: {
    type: Number,
    default: undefined,
  },
  profileImage: {
    type: String,
    default: ''
  }
}, {
  timestamps: true // adds createdAt and updatedAt
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;
