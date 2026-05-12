import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../../server/config/db.js';
import User from '../../server/models/User.js';
import Product from '../../server/models/Product.js';
import FeedPost from '../../server/models/FeedPost.js';
import Seller from '../../server/models/Seller.js';
import { sellers as seededSellers } from '../seed/data.js';

dotenv.config();

const DEMO_EMAILS = ['seller.demo@localconnect.in', 'buyer.demo@localconnect.in'];
const LOCAL_IMAGE_PREFIX_REGEX = /^(\/uploads|http:\/\/localhost)/i;

async function runCleanupDemo() {
  try {
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB connection is not ready. Check MONGO_URI and retry.');
    }

    console.log('Running safe demo cleanup...');

    const usersDeleteResult = await User.deleteMany({
      email: { $in: DEMO_EMAILS },
    });

    const productsDeleteResult = await Product.deleteMany({
      image: { $regex: LOCAL_IMAGE_PREFIX_REGEX },
    });

    const feedPostsDeleteResult = await FeedPost.deleteMany({
      image: { $regex: LOCAL_IMAGE_PREFIX_REGEX },
    });

    // Delete only known seeded seller records by exact identifying fingerprints.
    const seededSellerFingerprints = seededSellers.map((seller) => ({
      name: seller.name,
      location: seller.location,
      verified: seller.verified,
    }));

    const sellersDeleteResult = await Seller.deleteMany({
      $or: seededSellerFingerprints,
    });

    console.log(`Deleted users: ${usersDeleteResult.deletedCount}`);
    console.log(`Deleted products with broken local image URLs: ${productsDeleteResult.deletedCount}`);
    console.log(`Deleted feed posts with broken local image URLs: ${feedPostsDeleteResult.deletedCount}`);
    console.log(`Deleted seeded demo sellers: ${sellersDeleteResult.deletedCount}`);
    console.log('Demo cleanup completed.');
  } catch (error: any) {
    console.error('Demo cleanup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

runCleanupDemo();
