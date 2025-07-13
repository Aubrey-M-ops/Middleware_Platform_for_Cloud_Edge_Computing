# API Reference Documentation

## Overview

This document provides a comprehensive reference for all API endpoints in the Cloud-Edge Platform backend.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error description"
}
```

---

## Node Management

### POST /node/heartbeat

Receive heartbeat from a node.

**Request Body:**
```json
{
  "nodeID": "node-123",
  "nodeType": "edge",
  "cpu": "cpu  0  0  0  0  0  0  0  0  0  0",
  "memory": "Mem: 8192 4096 4096 0 0 0",
  "network": "eth0: 1000 500 0 0 0 0 0 0 0 0",
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
    "cpu": { "usage": 45.2 },
    "memory": { "usage": 67.8 },
    "network": { "rx": 1000, "tx": 500 }
  }
}
```

### GET /api/nodes

Get all active nodes.

**Query Parameters:**
- `nodeType` (optional): Filter by node type (`cloud` or `edge`)
- `status` (optional): Filter by node status

**Response:**
```json
{
  "success": true,
  "nodes": [
    {
      "nodeID": "node-123",
      "nodeType": "edge",
      "cpu": { "usage": 45.2 },
      "memory": { "usage": 67.8 },
      "network": { "rx": 1000, "tx": 500 },
      "lastSeen": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

## Service Management

### POST /api/registerService

Register a new service.

**Request Body:**
```json
{
  "name": "user-service",
  "version": "1.0.0",
  "description": "User management service",
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
      "podID": "user-service-pod-1",
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
    "serviceID": "user-service-1.0.0-1640995200000",
    "name": "user-service",
    "version": "1.0.0",
    "status": "registered",
    "nodeID": "node-123",
    "nodeType": "edge",
    "pods": [...],
    "replicas": {
      "desired": 1,
      "current": 1,
      "available": 1
    }
  }
}
```

### GET /api/services

Get all services with optional filtering.

**Query Parameters:**
- `nodeID` (optional): Filter by node ID
- `status` (optional): Filter by service status
- `serviceType` (optional): Filter by service type

**Response:**
```json
{
  "success": true,
  "services": [
    {
      "serviceID": "user-service-1.0.0-1640995200000",
      "name": "user-service",
      "status": "running",
      "nodeID": "node-123",
      "nodeType": "edge"
    }
  ],
  "count": 1
}
```

### GET /api/getService/:serviceID

Get a specific service by ID.

**Response:**
```json
{
  "success": true,
  "service": {
    "serviceID": "user-service-1.0.0-1640995200000",
    "name": "user-service",
    "version": "1.0.0",
    "status": "running",
    "nodeID": "node-123",
    "nodeType": "edge",
    "endpoints": [...],
    "pods": [...],
    "replicas": {...}
  }
}
```

### PUT /api/updateService/:serviceID

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

**Response:**
```json
{
  "success": true,
  "message": "Service updated successfully",
  "service": { ... }
}
```

### DELETE /api/deleteService/:serviceID

Delete a service.

**Response:**
```json
{
  "success": true,
  "message": "Service deleted successfully"
}
```

---

## Pod Management

### POST /api/createPod

Create a new Pod.

**Request Body:**
```json
{
  "serviceID": "user-service-1.0.0-1640995200000",
  "nodeID": "node-123",
  "nodeType": "edge",
  "resources": {
    "cpu": 0.5,
    "memory": 512
  },
  "environment": {
    "NODE_ENV": "production"
  },
  "labels": {
    "app": "user-service"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pod created successfully",
  "pod": {
    "podID": "user-service-1.0.0-1640995200000-pod-1640995200000",
    "serviceID": "user-service-1.0.0-1640995200000",
    "nodeID": "node-123",
    "nodeType": "edge",
    "status": "pending",
    "resources": {
      "cpu": 0.5,
      "memory": 512
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/pods

Get all Pods with optional filtering.

**Query Parameters:**
- `serviceID` (optional): Filter by service ID
- `nodeID` (optional): Filter by node ID
- `status` (optional): Filter by Pod status

**Response:**
```json
{
  "success": true,
  "pods": [
    {
      "podID": "user-service-pod-1",
      "serviceID": "user-service-1.0.0-1640995200000",
      "nodeID": "node-123",
      "status": "running",
      "resources": {
        "cpu": 0.3,
        "memory": 256
      }
    }
  ],
  "count": 1
}
```

### GET /api/getPod/:podID

Get a specific Pod by ID.

**Response:**
```json
{
  "success": true,
  "pod": {
    "podID": "user-service-pod-1",
    "serviceID": "user-service-1.0.0-1640995200000",
    "nodeID": "node-123",
    "status": "running",
    "resources": {
      "cpu": 0.3,
      "memory": 256
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastHeartbeat": "2024-01-01T00:30:00.000Z"
  }
}
```

### PUT /api/updatePod/:podID

Update a Pod.

**Request Body:**
```json
{
  "status": "running",
  "resources": {
    "cpu": 0.4,
    "memory": 300
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Pod updated successfully",
  "pod": { ... }
}
```

### DELETE /api/deletePod/:podID

Delete a Pod.

**Response:**
```json
{
  "success": true,
  "message": "Pod deleted successfully"
}
```

### POST /api/pods/:podID/restart

Restart a Pod.

**Response:**
```json
{
  "success": true,
  "message": "Pod restarted successfully",
  "pod": { ... }
}
```

---

## Service Pod Management

### POST /api/addPodToService/:serviceID

Add a Pod to a service.

**Request Body:**
```json
{
  "podID": "user-service-pod-2",
  "status": "pending",
  "nodeID": "node-124",
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
    "serviceID": "user-service-1.0.0-1640995200000",
    "pods": [
      {
        "podID": "user-service-pod-1",
        "status": "running"
      },
      {
        "podID": "user-service-pod-2",
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

### PUT /api/updatePodInService/:serviceID/:podID

Update a Pod in a service.

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

**Response:**
```json
{
  "success": true,
  "message": "Pod updated successfully",
  "service": { ... }
}
```

### DELETE /api/removePodFromService/:serviceID/:podID

Remove a Pod from a service.

**Response:**
```json
{
  "success": true,
  "message": "Pod removed successfully",
  "service": { ... }
}
```

### GET /api/getPodsForService/:serviceID

Get all Pods for a specific service.

**Response:**
```json
{
  "success": true,
  "pods": [
    {
      "podID": "user-service-pod-1",
      "status": "running",
      "nodeID": "node-123",
      "resources": {
        "cpu": 0.3,
        "memory": 256
      }
    }
  ],
  "count": 1
}
```

---

## Scheduling Management

### POST /api/schedule

Schedule a service to the best available node.

**Request Body:**
```json
{
  "name": "user-service",
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
    "serviceID": "user-service-1.0.0-1640995200000",
    "name": "user-service",
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

### GET /api/schedule/stats

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

### POST /api/schedule/rebalance

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

---

## Monitoring and Health Check

### GET /healthz

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

### GET /metrics

Prometheus metrics endpoint.

**Response:**
```
# HELP node_heartbeat_total Total number of node heartbeats received
# TYPE node_heartbeat_total counter
node_heartbeat_total{node_id="node-123",node_type="edge",status="success"} 10

# HELP node_resource_usage Current resource usage by node
# TYPE node_resource_usage gauge
node_resource_usage{node_id="node-123",node_type="edge",resource_type="cpu"} 45.2
node_resource_usage{node_id="node-123",node_type="edge",resource_type="memory"} 67.8

# HELP api_request_total Total number of API requests
# TYPE api_request_total counter
api_request_total{method="GET",route="/api/services",status_code="200"} 150
```

---

## Mock Data Management

### GET /api/mock/services

Get mock service data.

**Response:**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "serviceID": "agent-monitoring",
        "name": "Agent Monitoring Service",
        "version": "1.0.0",
        "description": "Universal agent for cloud and edge node monitoring",
        "serviceType": "DaemonSet",
        "status": "running",
        "nodeID": "cloud-cluster-worker-1",
        "nodeType": "cloud",
        "endpoints": [...],
        "resources": {...},
        "pods": [...]
      }
    ]
  }
}
```

### POST /api/mock/services/seed

Import mock services to database.

**Response:**
```json
{
  "success": true,
  "message": "Mock services seeded successfully",
  "results": [
    {
      "serviceID": "agent-monitoring",
      "action": "created",
      "service": { ... }
    }
  ]
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Missing required fields or invalid data |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |

## Rate Limiting

Currently, there are no rate limits implemented. All endpoints are accessible without restrictions.

## Versioning

The API is currently at version 1.0. Future versions will be available at `/api/v2/` endpoints.

## Support

For API support and questions, please refer to the project documentation or create an issue in the repository. 