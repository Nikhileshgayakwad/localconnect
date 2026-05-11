import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
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

function resolveClientStaticRoot(): string {
  // Bundled production: server.mjs lives next to Vite output (index.html) in dist/
  if (fs.existsSync(path.join(__dirname, 'index.html'))) {
    return __dirname;
  }
  // Dev / unbundled: repo root; Vite build output is in dist/
  return path.join(__dirname, 'dist');
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
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

  // Vite: only load in development — never statically import vite (breaks bundled production / Render).
  if (process.env.NODE_ENV === 'production') {
    const clientRoot = resolveClientStaticRoot();
    app.use(express.static(clientRoot));
    app.get('*', (req, res) => {
      if (req.path.startsWith('/api')) {
        res.status(404).json({ success: false, error: 'Not found' });
        return;
      }
      res.sendFile(path.join(clientRoot, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
