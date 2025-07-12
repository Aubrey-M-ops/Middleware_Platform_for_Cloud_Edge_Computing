import prometheus from 'prom-client';

// Create a Registry to register the metrics
const register = new prometheus.Registry();

// Enable the collection of default metrics
prometheus.collectDefaultMetrics({ register });

//################################## 💻 Custom metrics for Cloud-Edge Platform ############################################
// NOTE: imagine each metric is a table, the labels are columns, you can find a specific row by the labels
const nodeHeartbeatTotal = new prometheus.Counter({
  name: 'node_heartbeat_total',
  help: 'Total number of node heartbeats received',
  labelNames: ['node_id', 'node_type', 'status'],
  registers: [register]
});

const nodeResourceUsage = new prometheus.Gauge({
  name: 'node_resource_usage',
  help: 'Current resource usage by node',
  labelNames: ['node_id', 'node_type', 'resource_type'],
  registers: [register]
});

const podCount = new prometheus.Gauge({
  name: 'pod_count',
  help: 'Number of pods by node',
  labelNames: ['node_id', 'node_type', 'status'],
  registers: [register]
});

const serviceCount = new prometheus.Gauge({
  name: 'service_count',
  help: 'Number of services by node',
  labelNames: ['node_id', 'node_type', 'service_type'],
  registers: [register]
});

const apiRequestDuration = new prometheus.Histogram({
  name: 'api_request_duration_seconds',
  help: 'Duration of API requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register]
});

const apiRequestTotal = new prometheus.Counter({
  name: 'api_request_total',
  help: 'Total number of API requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const databaseConnections = new prometheus.Gauge({
  name: 'database_connections_current',
  help: 'Current number of database connections',
  labelNames: ['database'],
  registers: [register]
});

const databaseOperations = new prometheus.Counter({
  name: 'database_operations_total',
  help: 'Total number of database operations',
  labelNames: ['database', 'operation', 'status'],
  registers: [register]
});

const databaseOperationDuration = new prometheus.Histogram({
  name: 'database_operation_duration_seconds',
  help: 'Duration of database operations in seconds',
  labelNames: ['database', 'operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register]
});

// Agent-specific metrics
const agentHeartbeatTotal = new prometheus.Counter({
  name: 'agent_heartbeat_total',
  help: 'Total number of agent heartbeats',
  labelNames: ['agent_id', 'node_type', 'status'],
  registers: [register]
});

const agentResourceUsage = new prometheus.Gauge({
  name: 'agent_resource_usage',
  help: 'Current resource usage by agent',
  labelNames: ['agent_id', 'node_type', 'resource_type'],
  registers: [register]
});

const agentUptime = new prometheus.Gauge({
  name: 'agent_uptime_seconds',
  help: 'Agent uptime in seconds',
  labelNames: ['agent_id', 'node_type'],
  registers: [register]
});

// Edge-specific metrics
const edgeNodeLatency = new prometheus.Histogram({
  name: 'edge_node_latency_seconds',
  help: 'Latency to edge nodes in seconds',
  labelNames: ['edge_node_id', 'operation'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [register]
});

const edgeDataTransferred = new prometheus.Counter({
  name: 'edge_data_transferred_bytes',
  help: 'Total data transferred to/from edge nodes',
  labelNames: ['edge_node_id', 'direction'],
  registers: [register]
});

// Cloud-specific metrics
const cloudNodeLoad = new prometheus.Gauge({
  name: 'cloud_node_load',
  help: 'Load on cloud nodes',
  labelNames: ['cloud_node_id', 'load_type'],
  registers: [register]
});

const cloudServiceAvailability = new prometheus.Gauge({
  name: 'cloud_service_availability',
  help: 'Availability of cloud services',
  labelNames: ['service_name', 'service_type'],
  registers: [register]
});
// #########################################################################################################################




// ############################################ Operations to update the metrics ###############################################################
// Metrics middleware
export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    // Record API request metrics
    // NOTE: inc IS INCREMENT/ ADD 1 TO THE VALUE
    // NOTE: observe IS OBSERVE/ AVERAGE OF THE VALUE
    apiRequestTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    });
    
    apiRequestDuration.observe({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode
    }, duration);
  });
  
  next();
};

// Metrics endpoint
export const metricsEndpoint = async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    console.error('[ERROR] Failed to generate metrics:', error);
    res.status(500).json({ error: 'Failed to generate metrics' });
  }
};

// Helper functions to update metrics
export const updateNodeMetrics = (nodeData) => {
  const { nodeID, nodeType, cpu, memory, network } = nodeData;
  
  // Update heartbeat counter
  nodeHeartbeatTotal.inc({
    node_id: nodeID,
    node_type: nodeType,
    status: 'success'
  });
  
  // Update resource usage
  if (cpu) {
    const cpuUsage = parseFloat(cpu.match(/cpu\s+\d+\s+\d+\s+(\d+)/)?.[1] || 0);
    nodeResourceUsage.set({
      node_id: nodeID,
      node_type: nodeType,
      resource_type: 'cpu'
    }, cpuUsage);
  }
  
  if (memory) {
    const memMatch = memory.match(/Mem:\s+(\d+)\s+(\d+)/);
    if (memMatch) {
      const total = parseInt(memMatch[1]);
      const used = parseInt(memMatch[2]);
      const usagePercent = (used / total) * 100;
      nodeResourceUsage.set({
        node_id: nodeID,
        node_type: nodeType,
        resource_type: 'memory'
      }, usagePercent);
    }
  }
};

export const updateAgentMetrics = (agentData) => {
  const { nodeID, nodeType, timestamp } = agentData;
  
  // Update agent heartbeat
  agentHeartbeatTotal.inc({
    agent_id: nodeID,
    node_type: nodeType,
    status: 'success'
  });
  
  // Update agent uptime (simplified)
  const uptime = Date.now() - timestamp;
  agentUptime.set({
    agent_id: nodeID,
    node_type: nodeType
  }, uptime / 1000);
};

export const updateDatabaseMetrics = (operation, duration, status = 'success') => {
  databaseOperations.inc({
    database: 'mongodb',
    operation,
    status
  });
  
  databaseOperationDuration.observe({
    database: 'mongodb',
    operation
  }, duration);
};

export const updatePodMetrics = (nodeID, nodeType, podCount, serviceCount) => {
  // NOTE：the first param is to find the proper service to update the metrics
  this.podCount.set({
    node_id: nodeID,
    node_type: nodeType,
    status: 'running'
  }, podCount);
  
  this.serviceCount.set({
    node_id: nodeID,
    node_type: nodeType,
    service_type: 'total'
  }, serviceCount);
};
// #########################################################################################################################

// Export all metrics for use in other modules
export {
  register,
  nodeHeartbeatTotal,
  nodeResourceUsage,
  podCount,
  serviceCount,
  apiRequestDuration,
  apiRequestTotal,
  databaseConnections,
  databaseOperations,
  databaseOperationDuration,
  agentHeartbeatTotal,
  agentResourceUsage,
  agentUptime,
  edgeNodeLatency,
  edgeDataTransferred,
  cloudNodeLoad,
  cloudServiceAvailability
}; 