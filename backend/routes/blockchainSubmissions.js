import express from 'express';
import BlockchainSubmission from '../models/BlockchainSubmission.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// POST /api/blockchain-submissions - Create a new blockchain submission record
router.post('/', async (req, res) => {
  try {
    const { address, score, feePaid, status, transactionHash, errorMessage } = req.body;

    if (!address || score === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: address and score are required' 
      });
    }

    const submissionId = uuidv4();
    
    const submission = new BlockchainSubmission({
      address,
      submissionId,
      score: Number(score),
      feePaid: feePaid ? String(feePaid) : null,
      status: status || 'pending',
      transactionHash: transactionHash || null,
      errorMessage: errorMessage || null,
      timestamp: new Date()
    });

    await submission.save();

    res.status(201).json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error creating blockchain submission:', error);
    res.status(500).json({ 
      error: 'Failed to create blockchain submission',
      message: error.message 
    });
  }
});

// PATCH /api/blockchain-submissions/:submissionId - Update submission status
router.patch('/:submissionId', async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { status, transactionHash, errorMessage } = req.body;

    const submission = await BlockchainSubmission.findOne({ submissionId });
    
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (status) submission.status = status;
    if (transactionHash) submission.transactionHash = transactionHash;
    if (errorMessage !== undefined) submission.errorMessage = errorMessage;

    await submission.save();

    res.json({
      success: true,
      data: submission
    });
  } catch (error) {
    console.error('Error updating blockchain submission:', error);
    res.status(500).json({ 
      error: 'Failed to update blockchain submission',
      message: error.message 
    });
  }
});

// GET /api/blockchain-submissions/:address - Get all submissions for an address
router.get('/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 100, skip = 0 } = req.query;

    const submissions = await BlockchainSubmission.find({ address })
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    res.json({
      success: true,
      data: submissions,
      count: submissions.length
    });
  } catch (error) {
    console.error('Error fetching blockchain submissions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch blockchain submissions',
      message: error.message 
    });
  }
});

export default router;

