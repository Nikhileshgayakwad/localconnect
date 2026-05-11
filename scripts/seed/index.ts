import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../../server/config/db.js';
import Product from '../../server/models/Product.js';
import Seller from '../../server/models/Seller.js';
import FeedPost from '../../server/models/FeedPost.js';
import User from '../../server/models/User.js';
import { feedPosts, products, sellers } from './data.js';

dotenv.config();

async function upsertCollection<T extends Record<string, unknown>>(
  items: T[],
  getFilter: (item: T) => Record<string, unknown>,
  model: mongoose.Model<any>,
  label: string
) {
  if (!items.length) {
    return;
  }

  const operations = items.map((item) => ({
    updateOne: {
      filter: getFilter(item),
      update: { $set: item },
      upsert: true,
    },
  }));

  const result = await model.bulkWrite(operations);
  console.log(
    `${label}: inserted=${result.upsertedCount}, updated=${result.modifiedCount}, matched=${result.matchedCount}`
  );
}

async function runSeed() {
  try {
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB connection is not ready. Check MONGO_URI and retry.');
    }

    console.log('Seeding LocalConnect demo marketplace data...');

    const seedUserEmail = 'seller.demo@localconnect.in';
    let seedUser = await User.findOne({ email: seedUserEmail });
    if (!seedUser) {
      seedUser = await User.create({
        name: 'LocalConnect Seller Demo',
        email: seedUserEmail,
        password: 'seller123',
        role: 'seller',
      });
      console.log(`Created seed owner user: ${seedUser.email}`);
    } else if (seedUser.role !== 'seller') {
      seedUser.role = 'seller';
      await seedUser.save();
      console.log(`Updated seed owner role to seller: ${seedUser.email}`);
    }

    const buyerSeedEmail = 'buyer.demo@localconnect.in';
    const buyerSeedUser = await User.findOne({ email: buyerSeedEmail });
    if (!buyerSeedUser) {
      await User.create({
        name: 'LocalConnect Buyer Demo',
        email: buyerSeedEmail,
        password: 'buyer123',
        role: 'buyer',
      });
      console.log(`Created seed buyer user: ${buyerSeedEmail}`);
    }

    const productsWithOwnership = products.map((item, index) => ({
      ...item,
      stock: 12 + index * 3,
      views: item.likes * 4,
      owner: seedUser!._id,
    }));

    await upsertCollection(
      productsWithOwnership,
      (item) => ({ title: item.title, sellerName: item.sellerName }),
      Product,
      'Products'
    );
    await upsertCollection(sellers, (item) => ({ name: item.name, location: item.location }), Seller, 'Sellers');

    const feedPostsWithRequiredFields = feedPosts.map((item) => {
      const matchingSeller = sellers.find((seller) => seller.name === item.authorName);
      return {
        ...item,
        userId: seedUser!._id,
        userRole: 'seller',
        postType: 'Seller Update',
        title: item.content.slice(0, 90),
        category: matchingSeller?.specialties?.[0] || 'General',
        location: matchingSeller?.location || 'India',
        commentItems: [],
      };
    });

    await upsertCollection(
      feedPostsWithRequiredFields,
      (item) => ({ authorName: item.authorName, content: item.content }),
      FeedPost,
      'Feed posts'
    );

    console.log('Seed completed successfully.');
  } catch (error: any) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
}

runSeed();
