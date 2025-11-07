import express from 'express';
import ScoringSession from '../models/ScoringSession.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// POST /api/scoring-sessions - Create a new scoring session
router.post('/', async (req, res) => {
  try {
    const { address, score, duration } = req.body;

    if (!address || score === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: address and score are required' 
      });
    }

    const scoreValue = Number(score);
    const sessionId = uuidv4();
    
    const session = new ScoringSession({
      address,
      sessionId,
      score: scoreValue,
      duration: duration ? Number(duration) : null,
      timestamp: new Date()
    });

    await session.save();

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error creating scoring session:', error);
    res.status(500).json({ 
      error: 'Failed to create scoring session',
      message: error.message 
    });
  }
});

// GET /api/scoring-sessions/:address - Get all sessions for an address
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 100, skip = 0 } = req.query;

    const sessions = await ScoringSession.find({ address })
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    res.json({
      success: true,
      data: sessions,
      count: sessions.length
    });
  } catch (error) {
    console.error('Error fetching scoring sessions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch scoring sessions',
      message: error.message 
    });
  }
});

export default router;

