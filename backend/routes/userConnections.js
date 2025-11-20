import express from 'express';
import UserConnection from '../models/UserConnection.js';

const router = express.Router();

// POST /api/user-connections - Record a user's first connection
// This endpoint is idempotent - if the address already exists, it returns the existing record
router.post('/', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ 
        error: 'Missing required field: address' 
      });
    }

    // Use findOneAndUpdate with upsert to create only if doesn't exist
    // This ensures we only track the first connection
    const connection = await UserConnection.findOneAndUpdate(
      { address },
      {
        $setOnInsert: {
          address,
          firstConnectedAt: new Date()
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(201).json({
      success: true,
      data: connection,
      isNewConnection: connection.firstConnectedAt.getTime() === connection.createdAt.getTime()
    });
  } catch (error) {
    // Handle duplicate key error (shouldn't happen with findOneAndUpdate, but just in case)
    if (error.code === 11000) {
      // Address already exists, return existing record
      const existing = await UserConnection.findOne({ address: req.body.address });
      return res.status(200).json({
        success: true,
        data: existing,
        isNewConnection: false
      });
    }
    
    console.error('Error creating user connection:', error);
    res.status(500).json({ 
      error: 'Failed to create user connection',
      message: error.message 
    });
  }
});

// GET /api/user-connections - Get all connected users
router.get('/', async (req, res) => {
  try {
    const { limit = 1000, skip = 0 } = req.query;

    const connections = await UserConnection.find()
      .sort({ firstConnectedAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    res.json({
      success: true,
      data: connections,
      count: connections.length
    });
  } catch (error) {
    console.error('Error fetching user connections:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user connections',
      message: error.message 
    });
  }
});

// GET /api/user-connections/:address - Check if an address has connected
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;

    const connection = await UserConnection.findOne({ address });

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      data: connection
    });
  } catch (error) {
    console.error('Error fetching user connection:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user connection',
      message: error.message 
    });
  }
});

export default router;

