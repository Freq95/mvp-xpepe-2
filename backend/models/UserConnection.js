import mongoose from 'mongoose';

const userConnectionSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true, // Only one entry per address (first connection)
    index: true
  },
  firstConnectedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Ensure address is unique
userConnectionSchema.index({ address: 1 }, { unique: true });

export default mongoose.model('UserConnection', userConnectionSchema);

