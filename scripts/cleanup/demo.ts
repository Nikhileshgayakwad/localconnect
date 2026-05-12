import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../../server/config/db.js';
import User from '../../server/models/User.js';
import Product from '../../server/models/Product.js';
import FeedPost from '../../server/models/FeedPost.js';
import Seller from '../../server/models/Seller.js';
import { feedPosts as seededFeedPosts, products as seededProducts, sellers as seededSellers } from '../seed/data.js';

dotenv.config();

const DEMO_EMAILS = ['seller.demo@localconnect.in', 'buyer.demo@localconnect.in'];
const LOCAL_IMAGE_REGEX = /(\/uploads|localhost)/i;
const DEMO_TEXT_REGEX = /demo/i;

const seededProductFingerprints = seededProducts.map((item) => ({
  title: item.title,
  category: item.category,
  description: item.description,
}));

const seededFeedFingerprints = seededFeedPosts.map((item) => ({
  content: item.content,
  title: item.content.slice(0, 90),
}));

function uniqObjectIds(values: Array<{ _id: any }>) {
  return Array.from(new Set(values.map((item) => item._id.toString())));
}

function logMatches<T>(label: string, docs: T[], toText: (doc: T) => string) {
  console.log(`${label} matched: ${docs.length}`);
  if (!docs.length) return;
  docs.forEach((doc, index) => {
    console.log(`  ${index + 1}. ${toText(doc)}`);
  });
}

async function runCleanupDemo() {
  try {
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB connection is not ready. Check MONGO_URI and retry.');
    }

    console.log('Running safe demo cleanup...');

    const usersToDelete = await User.find({
      $or: [{ email: { $in: DEMO_EMAILS } }, { email: { $regex: DEMO_TEXT_REGEX } }, { name: { $regex: DEMO_TEXT_REGEX } }],
    }).select('_id name email');

    const productsToDelete = await Product.find({
      $or: [
        { image: { $regex: LOCAL_IMAGE_REGEX } },
        { image: { $exists: false } },
        { image: '' },
        { image: null },
        { sellerName: { $regex: DEMO_TEXT_REGEX } },
        ...seededProductFingerprints,
      ],
    }).select('_id title sellerName category image');

    const feedPostsToDelete = await FeedPost.find({
      $or: [{ image: { $regex: LOCAL_IMAGE_REGEX } }, { authorName: { $regex: DEMO_TEXT_REGEX } }, ...seededFeedFingerprints],
    }).select('_id title authorName image content');

    const seededSellerFingerprints = seededSellers.map((seller) => ({ name: seller.name, location: seller.location, verified: seller.verified }));
    const sellersToDelete = await Seller.find({
      $or: [
        { name: { $regex: DEMO_TEXT_REGEX } },
        { profileImage: { $regex: LOCAL_IMAGE_REGEX } },
        { avatar: { $regex: LOCAL_IMAGE_REGEX } },
        ...seededSellerFingerprints,
      ],
    }).select('_id name location profileImage avatar');

    logMatches('Users', usersToDelete, (doc: any) => `${doc.name} <${doc.email}>`);
    logMatches(
      'Products',
      productsToDelete,
      (doc: any) => `${doc.title} | seller=${doc.sellerName} | category=${doc.category} | image=${doc.image || '<empty>'}`
    );
    logMatches(
      'Feed posts',
      feedPostsToDelete,
      (doc: any) => `${doc.title || '<no-title>'} | author=${doc.authorName} | image=${doc.image || '<empty>'}`
    );
    logMatches('Sellers', sellersToDelete, (doc: any) => `${doc.name} | location=${doc.location}`);

    const userIds = uniqObjectIds(usersToDelete);
    const productIds = uniqObjectIds(productsToDelete);
    const feedPostIds = uniqObjectIds(feedPostsToDelete);
    const sellerIds = uniqObjectIds(sellersToDelete);

    const usersDeleteResult = userIds.length
      ? await User.deleteMany({
          _id: { $in: userIds },
        })
      : { deletedCount: 0 };

    const productsDeleteResult = productIds.length
      ? await Product.deleteMany({
          _id: { $in: productIds },
        })
      : { deletedCount: 0 };

    const feedPostsDeleteResult = feedPostIds.length
      ? await FeedPost.deleteMany({
          _id: { $in: feedPostIds },
        })
      : { deletedCount: 0 };

    const sellersDeleteResult = sellerIds.length
      ? await Seller.deleteMany({
          _id: { $in: sellerIds },
        })
      : { deletedCount: 0 };

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
