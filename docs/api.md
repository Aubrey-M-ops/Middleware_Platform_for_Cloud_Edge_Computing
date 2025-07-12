# Cloud-Edge Platform API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Currently, the API does not require authentication. This will be added in future versions.

## API Endpoints

### Node Management

#### POST /node/heartbeat
Register or update node heartbeat with resource information.

**Request Body:**
```json
{
  "nodeID": "node-123",
  "cpu": "cpu 123456 12345 123456 1234567 12345 12345 12345 12345 0 0",
  "memory": "Mem: 8192 4096 4096 0 0 0",
  "network": "eth0: 123456 12345 0 0 0 0 0 0 123456 12345 0 0 0 0 0 0",
  "nodeType": "edge",
  "timestamp": 1640995200000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Heartbeat received",
  "nodeID": "node-123",
  "parsed": {
    "nodeID": "node-123",
    "nodeType": "edge",
    "timestamp": 1640995200000,
    "cpu": {
      "usage": 25.5,
      "cores": 4,
      "load": {
        "1min": 0.5,
        "5min": 0.3,
        "15min": 0.2
      }
    },
    "memory": {
      "total": 8192,
      "used": 4096,
      "free": 4096,
      "usage": 50.0
    },
    "network": {
      "eth0": {
        "rxBytes": 123456,
        "txBytes": 123456,
        "totalBytes": 246912
      }
    }
  }
}
```

#### GET /api/nodes
Get all active nodes.

**Response:**
```json
{
  "success": true,
  "nodes": [
    {
      "nodeID": "node-123",
      "nodeType": "edge",
      "cpu": {
        "usage": 25.5,
        "cores": 4
      },
      "memory": {
        "total": 8192,
        "used": 4096,
        "usage": 50.0
      },
      "network": {
        "eth0": {
          "rxBytes": 123456,
          "txBytes": 123456
        }
      },
      "lastSeen": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

### Service Management

#### POST /api/services
Register a new service.

**Request Body:**
```json
{
  "name": "my-service",
  "version": "1.0.0",
  "description": "A sample service",
  "serviceType": "rest",
  "nodeID": "node-123",
  "nodeType": "edge",
  "endpoints": [
    {
      "protocol": "http",
      "port": 8080,
      "path": "/api",
      "healthCheck": "/health"
    }
  ],
  "resources": {
    "cpu": 0.5,
    "memory": 512,
    "storage": 1
  },
  "environment": {
    "NODE_ENV": "production"
  },
  "labels": {
    "latency": "low",
    "priority": "high"
  },
  "pods": [
    {
      "podID": "my-service-pod-1",
      "status": "running",
      "nodeID": "node-123",
      "resources": {
        "cpu": 0.3,
        "memory": 256
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Service registered successfully",
  "service": {
    "serviceID": "my-service-1.0.0-1640995200000",
    "name": "my-service",
    "version": "1.0.0",
    "status": "registered",
    "nodeID": "node-123",
    "nodeType": "edge",
    "pods": [
      {
        "podID": "my-service-pod-1",
        "status": "running",
        "nodeID": "node-123",
        "resources": {
          "cpu": 0.3,
          "memory": 256
        }
      }
    ],
    "replicas": {
      "desired": 1,
      "current": 1,
      "available": 1
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### GET /api/services
Get all services with optional filtering.

**Query Parameters:**
- `nodeID`: Filter by node ID
- `status`: Filter by service status
- `serviceType`: Filter by service type

**Response:**
```json
{
  "success": true,
  "services": [
    {
      "serviceID": "my-service-1.0.0-1640995200000",
      "name": "my-service",
      "status": "running",
      "nodeID": "node-123",
      "nodeType": "edge"
    }
  ],
  "count": 1
}
```

#### GET /api/services/:serviceID
Get a specific service by ID.

**Response:**
```json
{
  "success": true,
  "service": {
    "serviceID": "my-service-1.0.0-1640995200000",
    "name": "my-service",
    "version": "1.0.0",
    "status": "running",
    "nodeID": "node-123",
    "nodeType": "edge",
    "endpoints": [
      {
        "protocol": "http",
        "port": 8080,
        "path": "/api"
      }
    ]
  }
}
```

#### PUT /api/services/:serviceID
Update a service.

**Request Body:**
```json
{
  "status": "running",
  "resources": {
    "cpu": 0.75,
    "memory": 1024
  }
}
```

#### DELETE /api/services/:serviceID
Delete a service.

### Service Pod Management

#### POST /api/services/:serviceID/pods - Add pod to service
Add a new pod to an existing service.

**Request Body:**
```json
{
  "podID": "my-service-pod-2",
  "status": "pending",
  "nodeID": "node-123",
  "resources": {
    "cpu": 0.2,
    "memory": 128
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pod added successfully",
  "service": {
    "serviceID": "my-service-1.0.0-1640995200000",
    "pods": [
      {
        "podID": "my-service-pod-1",
        "status": "running"
      },
      {
        "podID": "my-service-pod-2",
        "status": "pending"
      }
    ],
    "replicas": {
      "desired": 2,
      "current": 2,
      "available": 1
    }
  }
}
```

#### PUT /api/services/:serviceID/pods/:podID - Update pod in service
Update a specific pod in a service.

**Request Body:**
```json
{
  "status": "running",
  "resources": {
    "cpu": 0.25,
    "memory": 150
  }
}
```

#### DELETE /api/services/:serviceID/pods/:podID - Remove pod from service
Remove a specific pod from a service.

#### GET /api/services/:serviceID/pods - Get pods for service
Get all pods for a specific service.

**Response:**
```json
{
  "success": true,
  "pods": [
    {
      "podID": "my-service-pod-1",
      "status": "running",
      "nodeID": "node-123",
      "resources": {
        "cpu": 0.3,
        "memory": 256
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastHeartbeat": "2024-01-01T00:30:00.000Z"
    }
  ],
  "count": 1
}
```

### Service Scheduling

#### POST /api/schedule
Schedule a service to the best available node.

**Request Body:**
```json
{
  "name": "my-service",
  "serviceType": "rest",
  "nodeType": "edge",
  "resources": {
    "cpu": 0.5,
    "memory": 512
  },
  "labels": {
    "latency": "low"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Service scheduled successfully",
  "service": {
    "serviceID": "my-service-1.0.0-1640995200000",
    "name": "my-service",
    "status": "scheduled",
    "nodeID": "node-123",
    "nodeType": "edge"
  },
  "node": {
    "nodeID": "node-123",
    "nodeType": "edge",
    "score": 85.5
  },
  "score": 85.5
}
```

#### GET /api/schedule/stats
Get scheduling statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 10,
    "running": 8,
    "scheduled": 1,
    "error": 1,
    "byNodeType": {
      "cloud": 6,
      "edge": 4
    }
  }
}
```

#### POST /api/schedule/rebalance
Analyze and suggest service rebalancing.

**Response:**
```json
{
  "success": true,
  "result": {
    "success": true,
    "rebalancedCount": 2,
    "recommendations": [
      {
        "serviceID": "service-1",
        "fromNode": "node-1",
        "toNode": "node-2",
        "scoreImprovement": 15.5
      }
    ]
  }
}
```

### Monitoring

#### GET /metrics
Get Prometheus metrics.

**Response:**
```
# HELP node_heartbeat_total Total number of node heartbeats received
# TYPE node_heartbeat_total counter
node_heartbeat_total{node_id="node-123",node_type="edge",status="success"} 10

# HELP node_resource_usage Current resource usage by node
# TYPE node_resource_usage gauge
node_resource_usage{node_id="node-123",node_type="edge",resource_type="cpu"} 25.5
```

#### GET /healthz
Health check endpoint.

**Response:**
```json
{
  "ok": 1,
  "timestamp": 1640995200000,
  "activeNodes": 5,
  "activeServices": 10,
  "database": "MongoDB"
}
```

## Error Responses

All endpoints return error responses in the following format:

```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

## Rate Limiting

Currently, there is no rate limiting implemented. This will be added in future versions.

## Data Models

### Node Model
```javascript
{
  nodeID: String,        // Unique node identifier
  nodeType: String,      // 'cloud' or 'edge'
  cpu: Object,           // CPU usage and cores
  memory: Object,        // Memory usage and total
  network: Object,       // Network interfaces
  timestamp: Number,     // Unix timestamp
  lastSeen: Date         // Last heartbeat time
}
```

### Service Model
```javascript
{
  serviceID: String,     // Unique service identifier
  name: String,          // Service name
  version: String,       // Service version
  description: String,   // Service description
  serviceType: String,   // 'rest', 'grpc', 'websocket', 'custom', 'DaemonSet', 'Deployment', 'StatefulSet', 'Job', 'CronJob'
  status: String,        // 'registered', 'deploying', 'running', 'stopped', 'error'
  nodeID: String,        // Assigned node ID
  nodeType: String,      // 'cloud' or 'edge'
  endpoints: Array,      // Service endpoints
  resources: Object,     // Resource requirements
  environment: Object,   // Environment variables
  labels: Object,        // Service labels
  metadata: Object,      // Additional metadata
  pods: Array,          // Array of pod instances
  replicas: Object,     // Replica management
  createdAt: Date,       // Creation timestamp
  updatedAt: Date,       // Last update timestamp
  lastHeartbeat: Date    // Last service heartbeat
}
```

### Pod Model (within Service)
```javascript
{
  podID: String,         // Unique pod identifier
  status: String,        // 'pending', 'running', 'stopped', 'failed', 'terminating'
  nodeID: String,        // Node where pod is running
  resources: Object,     // Actual resource usage
  createdAt: Date,       // Pod creation timestamp
  lastHeartbeat: Date    // Last pod heartbeat
}
``` 