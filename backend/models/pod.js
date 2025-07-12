import mongoose from 'mongoose';

// TODO: Simplify the pod schema, remove the unnecessary fields

const podSchema = new mongoose.Schema({
  podID: {
    type: String,
    required: true,
    unique: true
  },
  serviceID: {
    type: String,
    required: true,
    index: true
  },
  nodeID: {
    type: String,
    required: true,
    index: true
  },
  nodeType: {
    type: String,
    required: true,
    enum: ['cloud', 'edge']
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'running', 'stopped', 'failed', 'terminating'],
    default: 'pending'
  },
  phase: {
    type: String,
    required: true,
    enum: ['pending', 'running', 'succeeded', 'failed', 'unknown'],
    default: 'pending'
  },
  resources: {
    cpu: {
      type: Number,
      default: 0.1
    },
    memory: {
      type: Number,
      default: 128
    },
    storage: {
      type: Number,
      default: 1
    }
  },
  actualResources: {
    cpu: {
      type: Number,
      default: 0
    },
    memory: {
      type: Number,
      default: 0
    }
  },
  endpoints: [{
    protocol: {
      type: String,
      required: true,
      enum: ['http', 'https', 'grpc', 'tcp', 'udp']
    },
    port: {
      type: Number,
      required: true
    },
    path: {
      type: String,
      default: '/'
    },
    externalPort: {
      type: Number
    }
  }],
  environment: {
    type: Map,
    of: String,
    default: {}
  },
  labels: {
    type: Map,
    of: String,
    default: {}
  },
  annotations: {
    type: Map,
    of: String,
    default: {}
  },
  restartCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date
  },
  lastHeartbeat: {
    type: Date,
    default: Date.now
  },
  terminationGracePeriod: {
    type: Number,
    default: 30
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
podSchema.index({ serviceID: 1, status: 1 });
podSchema.index({ nodeID: 1, status: 1 });
podSchema.index({ lastHeartbeat: 1 });
podSchema.index({ createdAt: 1 });

// Virtual for pod URL
podSchema.virtual('podURL').get(function() {
  if (this.endpoints && this.endpoints.length > 0) {
    const endpoint = this.endpoints[0];
    const port = endpoint.externalPort || endpoint.port;
    return `${endpoint.protocol}://${this.nodeID}:${port}${endpoint.path}`;
  }
  return null;
});

// Virtual for uptime
podSchema.virtual('uptime').get(function() {
  if (this.startedAt) {
    return Date.now() - this.startedAt.getTime();
  }
  return 0;
});

// Static methods
podSchema.statics.findByService = function(serviceID) {
  return this.find({ serviceID });
};

podSchema.statics.findByNode = function(nodeID) {
  return this.find({ nodeID });
};

podSchema.statics.findRunning = function() {
  return this.find({ status: 'running' });
};

podSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Instance methods
podSchema.methods.updateHeartbeat = function() {
  this.lastHeartbeat = new Date();
  return this.save();
};

podSchema.methods.updateStatus = function(status, phase = null) {
  this.status = status;
  if (phase) this.phase = phase;
  
  if (status === 'running' && !this.startedAt) {
    this.startedAt = new Date();
  }
  
  return this.save();
};

podSchema.methods.updateResources = function(actualResources) {
  this.actualResources = actualResources;
  return this.save();
};

podSchema.methods.restart = function() {
  this.restartCount += 1;
  this.status = 'pending';
  this.phase = 'pending';
  this.startedAt = null;
  return this.save();
};

// Pre-save middleware
podSchema.pre('save', function(next) {
  // Generate podID if not provided
  if (!this.podID) {
    this.podID = `${this.serviceID}-pod-${Date.now()}`;
  }
  next();
});

const Pod = mongoose.model('Pod', podSchema);

export default Pod; 