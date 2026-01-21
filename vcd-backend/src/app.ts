import express from 'express';
import cors from 'cors';
import path from 'path';

import authRoutes, { authMiddleware } from './routes/auth';
import releasesRoutes from './routes/releases';
import userCollectionRoutes from './routes/userCollection';
import publisherLogosRoutes from './routes/publisherLogos';
import uploadsRoutes from './routes/uploads';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(authMiddleware);

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/releases', releasesRoutes);
app.use('/api/user-collection', userCollectionRoutes);
app.use('/api/publisher-logos', publisherLogosRoutes);
app.use('/api/upload', uploadsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

export default app;
