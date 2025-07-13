import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { metricsMiddleware } from './metrics.js';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:123123@localhost:27017/cloud-edge-platform?authSource=admin';

// Middleware
app.use(cors());
app.use(express.json());
app.use(metricsMiddleware);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('[INFO] Connected to MongoDB');
  })
  .catch((error) => {
    console.error('[ERROR] MongoDB connection failed:', error);
  });

// Use all routes
app.use('/', routes);

// Start server
app.listen(PORT, () => {
  console.log(`[INFO] Backend server started on port ${PORT}`);
});