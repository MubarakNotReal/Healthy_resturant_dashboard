import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import customerRoutes from './api/customers.js';
import subscriptionRoutes from './api/subscriptions.js';
import checkInRoutes from './api/checkins-server.js';
import { db } from './lib/db';
import { users } from './lib/schema';

// Load environment variables
dotenv.config();

// Temporary fix: hardcode DATABASE_URL if not loaded
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:1234@localhost:5432/nourish_hub';
}

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', customerRoutes);
app.use('/api', subscriptionRoutes);
app.use('/api', checkInRoutes);

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test database connection on startup and start server
(async () => {
  try {
    await db.select().from(users).limit(1);
    console.log('✅ Database connection successful');

    // Start server only after database connection is verified
    app.listen(PORT, () => {
      console.log(`🚀 API Server running on http://localhost:${PORT}`);
    }).on('error', (err) => {
      console.error('Failed to start server:', err);
    });
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }
})();