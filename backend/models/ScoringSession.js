import mongoose from 'mongoose';

const scoringSessionSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  score: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  duration: {
    type: Number,
    default: null // in milliseconds, if we can track it
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
scoringSessionSchema.index({ address: 1, timestamp: -1 });

export default mongoose.model('ScoringSession', scoringSessionSchema);

