import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import scoringSessionRoutes from './routes/scoringSessions.js';
import blockchainSubmissionRoutes from './routes/blockchainSubmissions.js';
import addressRoutes from './routes/addresses.js';
import userConnectionRoutes from './routes/userConnections.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection helper
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/xpepe-analytics';

let isConnected = false;

async function connectToMongoDB() {
  if (isConnected) {
    return;
  }
  
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
}

// Health check (works even without MongoDB)
app.get('/api/health', async (req, res) => {
  try {
    await connectToMongoDB();
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      mongodb: 'connected'
    });
  } catch (error) {
    // Log full error for debugging
    console.error('Health check MongoDB error:', error.message);
    console.error('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.error('MONGODB_URI starts with:', process.env.MONGODB_URI?.substring(0, 20) || 'NOT SET');
    
    res.status(500).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      mongodb: 'disconnected',
      error: error.message || 'Database connection failed',
      hasUri: !!process.env.MONGODB_URI
    });
  }
});

// Middleware to ensure MongoDB connection before API routes (except health check)
app.use('/api', async (req, res, next) => {
  // Skip health check - it handles its own connection
  if (req.path === '/health') {
    return next();
  }
  
  try {
    await connectToMongoDB();
    next();
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    res.status(503).json({ 
      error: 'Database unavailable',
      message: 'Unable to connect to database. Please try again later.'
    });
  }
});

// Routes
app.use('/api/scoring-sessions', scoringSessionRoutes);
app.use('/api/blockchain-submissions', blockchainSubmissionRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/user-connections', userConnectionRoutes);

// For Vercel serverless, we don't call app.listen()
// Vercel will handle the server
// For local development, we still need to listen
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

export default app;

