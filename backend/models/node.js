import mongoose from 'mongoose';

const nodeSchema = new mongoose.Schema({
  nodeID: {
    type: String,
    required: true,
    unique: true
  },
  nodeType: {
    type: String,
    required: true,
    enum: ['cloud', 'edge']
  },
  cpu: {
    type: String,
    required: true
  },
  memory: {
    type: String,
    required: true
  },
  network: {
    type: String,
    required: true
  },
  timestamp: {
    type: Number,
    required: true
  },
  lastSeen: {
    type: Date,
    default: Date.now,
    expires: 90 // TTL 90 seconds
  }
}, {
  timestamps: true
});

// use lastseen as ascending order and expire after 90 seconds
nodeSchema.index({ lastSeen: 1 }, { expireAfterSeconds: 90 });

const Node = mongoose.model('Node', nodeSchema);

export default Node; 