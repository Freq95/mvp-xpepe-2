import express from 'express';
import ScoringSession from '../models/ScoringSession.js';
import UserConnection from '../models/UserConnection.js';

const router = express.Router();

// GET /api/addresses - Get all addresses with summary statistics
// Now includes all connected users, not just those who played
router.get('/', async (req, res) => {
  try {
    // Get all unique addresses from scoring sessions (players)
    const playerAddresses = await ScoringSession.distinct('address');
    
    // Get all unique addresses from user connections (all connected users)
    const connectedAddresses = await UserConnection.distinct('address');
    
    // Combine and deduplicate addresses
    const allAddressesSet = new Set([...playerAddresses, ...connectedAddresses]);
    const allAddresses = Array.from(allAddressesSet);

    // Get statistics for each address
    const addressesWithStats = await Promise.all(
      allAddresses.map(async (address) => {
        const sessions = await ScoringSession.find({ address }).sort({ timestamp: -1 });

        const totalGames = sessions.length;
        
        const scores = sessions.map(s => s.score);
        const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
        const lastGame = sessions[0]?.timestamp || null;

        return {
          address,
          totalGames,
          bestScore: Math.floor(bestScore),
          lastGameTimestamp: lastGame
        };
      })
    );

    // Sort by best score descending
    addressesWithStats.sort((a, b) => b.bestScore - a.bestScore);

    res.json({
      success: true,
      data: addressesWithStats,
      count: addressesWithStats.length
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ 
      error: 'Failed to fetch addresses',
      message: error.message 
    });
  }
});

// GET /api/addresses/:address - Get detailed information for a specific address
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;

    const sessions = await ScoringSession.find({ address }).sort({ timestamp: -1 });

    const totalGames = sessions.length;
    
    const scores = sessions.map(s => s.score);
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lastGame = sessions[0]?.timestamp || null;

    res.json({
      success: true,
      data: {
        address,
        statistics: {
          totalGames,
          bestScore: Math.floor(bestScore),
          lastGameTimestamp: lastGame
        },
        sessions: sessions.map(s => ({
          sessionId: s.sessionId,
          score: s.score,
          timestamp: s.timestamp,
          duration: s.duration
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching address details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch address details',
      message: error.message 
    });
  }
});

export default router;

