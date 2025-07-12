import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  serviceID: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  description: {
    type: String,
    default: ''
  },
  serviceType: {
    type: String,
    required: true,
    enum: ['rest', 'grpc', 'websocket', 'custom', 'DaemonSet', 'Deployment', 'StatefulSet', 'Job', 'CronJob']
  },
  status: {
    type: String,
    required: true,
    enum: ['registered', 'deploying', 'running', 'stopped', 'error'],
    default: 'registered'
  },
  nodeID: {
    type: String,
    required: true
  },
  nodeType: {
    type: String,
    required: true,
    enum: ['cloud', 'edge']
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
    healthCheck: {
      type: String,
      default: '/health'
    }
  }],
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
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  pods: [{
    podID: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'running', 'stopped', 'failed', 'terminating'],
      default: 'pending'
    },
    nodeID: {
      type: String,
      required: true
    },
    resources: {
      cpu: {
        type: Number,
        default: 0.1
      },
      memory: {
        type: Number,
        default: 128
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastHeartbeat: {
      type: Date,
      default: Date.now
    }
  }],
  replicas: {
    desired: {
      type: Number,
      default: 1
    },
    current: {
      type: Number,
      default: 0
    },
    available: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastHeartbeat: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
serviceSchema.index({ nodeID: 1, status: 1 });
serviceSchema.index({ serviceType: 1, status: 1 });
serviceSchema.index({ lastHeartbeat: 1 });

// Pre-save middleware to update timestamps
serviceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for service URL
serviceSchema.virtual('serviceURL').get(function() {
  if (this.endpoints && this.endpoints.length > 0) {
    const endpoint = this.endpoints[0];
    return `${endpoint.protocol}://${this.nodeID}:${endpoint.port}${endpoint.path}`;
  }
  return null;
});

// Static method to find services by node
serviceSchema.statics.findByNode = function(nodeID) {
  return this.find({ nodeID });
};

// Static method to find services by status
serviceSchema.statics.findByStatus = function(status) {
  return this.find({ status });
};

// Static method to find services by type
serviceSchema.statics.findByType = function(serviceType) {
  return this.find({ serviceType });
};

// Instance method to update heartbeat
serviceSchema.methods.updateHeartbeat = function() {
  this.lastHeartbeat = new Date();
  return this.save();
};

// Instance method to update status
serviceSchema.methods.updateStatus = function(status) {
  this.status = status;
  return this.save();
};

// Instance method to add pod
serviceSchema.methods.addPod = function(podData) {
  this.pods.push(podData);
  this.replicas.current = this.pods.length;
  this.replicas.available = this.pods.filter(pod => pod.status === 'running').length;
  return this.save();
};

// Instance method to remove pod
serviceSchema.methods.removePod = function(podID) {
  this.pods = this.pods.filter(pod => pod.podID !== podID);
  this.replicas.current = this.pods.length;
  this.replicas.available = this.pods.filter(pod => pod.status === 'running').length;
  return this.save();
};

// Instance method to update pod status
serviceSchema.methods.updatePodStatus = function(podID, status) {
  const pod = this.pods.find(p => p.podID === podID);
  if (pod) {
    pod.status = status;
    pod.lastHeartbeat = new Date();
    this.replicas.available = this.pods.filter(pod => pod.status === 'running').length;
    return this.save();
  }
  return Promise.reject(new Error('Pod not found'));
};

// Instance method to update pod resources
serviceSchema.methods.updatePodResources = function(podID, resources) {
  const pod = this.pods.find(p => p.podID === podID);
  if (pod) {
    pod.resources = { ...pod.resources, ...resources };
    pod.lastHeartbeat = new Date();
    return this.save();
  }
  return Promise.reject(new Error('Pod not found'));
};

// Instance method to get running pods
serviceSchema.methods.getRunningPods = function() {
  return this.pods.filter(pod => pod.status === 'running');
};

// Instance method to get pod by ID
serviceSchema.methods.getPod = function(podID) {
  return this.pods.find(pod => pod.podID === podID);
};

const Service = mongoose.model('Service', serviceSchema);

export default Service; 