import mongoose from 'mongoose';

const blockchainSubmissionSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    index: true
  },
  submissionId: {
    type: String,
    required: true,
    unique: true
  },
  transactionHash: {
    type: String,
    default: null,
    index: true
  },
  score: {
    type: Number,
    required: true
  },
  feePaid: {
    type: String, // Store as string to handle large BigInt values
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending'
  },
  errorMessage: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
blockchainSubmissionSchema.index({ address: 1, timestamp: -1 });
blockchainSubmissionSchema.index({ transactionHash: 1 });

export default mongoose.model('BlockchainSubmission', blockchainSubmissionSchema);

