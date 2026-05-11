import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import connectDB from './server/config/db.js';
import authRoutes from './server/routes/authRoutes.js';
import productRoutes from './server/routes/productRoutes.js';
import sellerRoutes from './server/routes/sellerRoutes.js';
import feedRoutes from './server/routes/feedRoutes.js';
import uploadRoutes from './server/routes/uploadRoutes.js';
import cartRoutes from './server/routes/cartRoutes.js';
import wishlistRoutes from './server/routes/wishlistRoutes.js';
import userRoutes from './server/routes/userRoutes.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;
  const uploadsPath = path.join(__dirname, 'uploads');

  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }

  // Connect to database if MONGO_URI is set
  if (process.env.MONGO_URI) {
    await connectDB();
  } else {
    console.warn("MONGO_URI not set in environment variables. Database not connected.");
  }

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static(uploadsPath));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/sellers', sellerRoutes);
  app.use('/api/feed', feedRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/wishlist', wishlistRoutes);
  app.use('/api/users', userRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'LocalConnect API is running' });
  });

  // Vite Integration for Full-Stack Applet
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
