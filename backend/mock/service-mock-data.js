export const SERVICE_MOCK_DATA = {
  services: [
    {
      serviceID: "agent-monitoring",
      name: "Agent Monitoring Service",
      version: "1.0.0",
      description: "Universal agent for cloud and edge node monitoring",
      serviceType: "DaemonSet",
      status: "running",
      nodeID: "cloud-cluster-worker-1",
      nodeType: "cloud",
      endpoints: [
        {
          protocol: "http",
          port: 8080,
          path: "/metrics",
          healthCheck: "/health"
        }
      ],
      resources: {
        cpu: 0.1,
        memory: 128,
        storage: 1
      },
      environment: {
        BACKEND_URL: "http://192.168.9.100:3000",
        NODE_TYPE: "cloud",
        HEARTBEAT_INTERVAL: "30"
      },
      labels: {
        app: "monitoring",
        tier: "infrastructure",
        component: "agent"
      },
      replicas: {
        desired: 1,
        current: 1,
        available: 1
      },
      pods: [
        {
          podID: "universal-agent-abc123",
          status: "running",
          nodeID: "cloud-cluster-worker-1",
          resources: {
            cpu: 0.05,
            memory: 64
          },
          createdAt: "2023-12-19T10:30:00Z",
          lastHeartbeat: "2023-12-21T10:30:45Z"
        }
      ],
      createdAt: "2023-12-19T10:30:00Z",
      updatedAt: "2023-12-21T10:30:45Z",
      lastHeartbeat: "2023-12-21T10:30:45Z"
    },
    {
      serviceID: "web-frontend",
      name: "Web Frontend Service",
      version: "1.0.0",
      description: "Nginx web frontend service",
      serviceType: "Deployment",
      status: "running",
      nodeID: "cloud-cluster-worker-1",
      nodeType: "cloud",
      endpoints: [
        {
          protocol: "http",
          port: 80,
          path: "/",
          healthCheck: "/health"
        }
      ],
      resources: {
        cpu: 0.2,
        memory: 256,
        storage: 1
      },
      environment: {
        NODE_ENV: "production"
      },
      labels: {
        app: "web",
        tier: "frontend",
        component: "ui"
      },
      replicas: {
        desired: 1,
        current: 1,
        available: 1
      },
      pods: [
        {
          podID: "web-app-def456",
          status: "running",
          nodeID: "cloud-cluster-worker-1",
          resources: {
            cpu: 0.18,
            memory: 220
          },
          createdAt: "2023-12-20T14:20:00Z",
          lastHeartbeat: "2023-12-21T10:30:45Z"
        }
      ],
      createdAt: "2023-12-20T14:20:00Z",
      updatedAt: "2023-12-21T10:30:45Z",
      lastHeartbeat: "2023-12-21T10:30:45Z"
    },
    {
      serviceID: "api-backend",
      name: "API Backend Service",
      version: "1.0.0",
      description: "Node.js API backend service",
      serviceType: "Deployment",
      status: "running",
      nodeID: "cloud-cluster-worker-1",
      nodeType: "cloud",
      endpoints: [
        {
          protocol: "http",
          port: 3000,
          path: "/api",
          healthCheck: "/health"
        }
      ],
      resources: {
        cpu: 0.3,
        memory: 512,
        storage: 1
      },
      environment: {
        MONGODB_URI: "mongodb://admin:123123@mongodb:27017/cloud-edge-platform?authSource=admin",
        NODE_ENV: "production"
      },
      labels: {
        app: "api",
        tier: "backend",
        component: "server"
      },
      replicas: {
        desired: 1,
        current: 1,
        available: 1
      },
      pods: [
        {
          podID: "api-service-ghi789",
          status: "running",
          nodeID: "cloud-cluster-worker-1",
          resources: {
            cpu: 0.25,
            memory: 480
          },
          createdAt: "2023-12-18T09:15:00Z",
          lastHeartbeat: "2023-12-21T10:30:45Z"
        }
      ],
      createdAt: "2023-12-18T09:15:00Z",
      updatedAt: "2023-12-21T10:30:45Z",
      lastHeartbeat: "2023-12-21T10:30:45Z"
    },
    {
      serviceID: "mongodb-database",
      name: "MongoDB Database Service",
      version: "6.0",
      description: "MongoDB database service",
      serviceType: "StatefulSet",
      status: "running",
      nodeID: "cloud-cluster-worker-1",
      nodeType: "cloud",
      endpoints: [
        {
          protocol: "tcp",
          port: 27017,
          path: "/",
          healthCheck: "/health"
        }
      ],
      resources: {
        cpu: 0.5,
        memory: 1024,
        storage: 10
      },
      environment: {
        MONGO_INITDB_ROOT_USERNAME: "admin",
        MONGO_INITDB_ROOT_PASSWORD: "123123"
      },
      labels: {
        app: "database",
        tier: "data",
        component: "db"
      },
      replicas: {
        desired: 1,
        current: 1,
        available: 1
      },
      pods: [
        {
          podID: "database-jkl012",
          status: "running",
          nodeID: "cloud-cluster-worker-1",
          resources: {
            cpu: 0.42,
            memory: 850
          },
          createdAt: "2023-12-16T08:00:00Z",
          lastHeartbeat: "2023-12-21T10:30:45Z"
        }
      ],
      createdAt: "2023-12-16T08:00:00Z",
      updatedAt: "2023-12-21T10:30:45Z",
      lastHeartbeat: "2023-12-21T10:30:45Z"
    },
    {
      serviceID: "redis-cache",
      name: "Redis Cache Service",
      version: "7-alpine",
      description: "Redis cache service",
      serviceType: "StatefulSet",
      status: "running",
      nodeID: "cloud-cluster-worker-2",
      nodeType: "cloud",
      endpoints: [
        {
          protocol: "tcp",
          port: 6379,
          path: "/",
          healthCheck: "/ping"
        }
      ],
      resources: {
        cpu: 0.2,
        memory: 512,
        storage: 5
      },
      environment: {
        REDIS_PASSWORD: "redis123"
      },
      labels: {
        app: "cache",
        tier: "data",
        component: "redis"
      },
      replicas: {
        desired: 1,
        current: 1,
        available: 1
      },
      pods: [
        {
          podID: "cache-service-vwx234",
          status: "running",
          nodeID: "cloud-cluster-worker-2",
          resources: {
            cpu: 0.18,
            memory: 480
          },
          createdAt: "2023-12-20T11:00:00Z",
          lastHeartbeat: "2023-12-21T10:30:45Z"
        }
      ],
      createdAt: "2023-12-20T11:00:00Z",
      updatedAt: "2023-12-21T10:30:45Z",
      lastHeartbeat: "2023-12-21T10:30:45Z"
    },
    {
      serviceID: "nginx-lb",
      name: "Nginx Load Balancer",
      version: "1.21",
      description: "Nginx load balancer service",
      serviceType: "Deployment",
      status: "running",
      nodeID: "cloud-cluster-worker-2",
      nodeType: "cloud",
      endpoints: [
        {
          protocol: "http",
          port: 80,
          path: "/",
          healthCheck: "/health"
        },
        {
          protocol: "https",
          port: 443,
          path: "/",
          healthCheck: "/health"
        }
      ],
      resources: {
        cpu: 0.1,
        memory: 128,
        storage: 1
      },
      environment: {
        NGINX_CONFIG: "/etc/nginx/nginx.conf"
      },
      labels: {
        app: "loadbalancer",
        tier: "frontend",
        component: "lb"
      },
      replicas: {
        desired: 1,
        current: 1,
        available: 1
      },
      pods: [
        {
          podID: "load-balancer-yz3456",
          status: "running",
          nodeID: "cloud-cluster-worker-2",
          resources: {
            cpu: 0.085,
            memory: 110
          },
          createdAt: "2023-12-19T14:00:00Z",
          lastHeartbeat: "2023-12-21T10:30:45Z"
        }
      ],
      createdAt: "2023-12-19T14:00:00Z",
      updatedAt: "2023-12-21T10:30:45Z",
      lastHeartbeat: "2023-12-21T10:30:45Z"
    },
    {
      serviceID: "tensorflow-training",
      name: "TensorFlow Training Service",
      version: "2.12-gpu",
      description: "ML training service with TensorFlow",
      serviceType: "Job",
      status: "running",
      nodeID: "cloud-cluster-worker-3",
      nodeType: "cloud",
      endpoints: [
        {
          protocol: "http",
          port: 6006,
          path: "/",
          healthCheck: "/health"
        }
      ],
      resources: {
        cpu: 2.0,
        memory: 4096,
        storage: 20
      },
      environment: {
        MODEL_PATH: "/app/models",
        TRAINING_DATA: "/app/data"
      },
      labels: {
        app: "ml",
        tier: "compute",
        component: "training"
      },
      replicas: {
        desired: 1,
        current: 1,
        available: 1
      },
      pods: [
        {
          podID: "ml-training-abc789",
          status: "running",
          nodeID: "cloud-cluster-worker-3",
          resources: {
            cpu: 1.8,
            memory: 3584
          },
          createdAt: "2023-12-18T09:00:00Z",
          lastHeartbeat: "2023-12-21T10:30:45Z"
        }
      ],
      createdAt: "2023-12-18T09:00:00Z",
      updatedAt: "2023-12-21T10:30:45Z",
      lastHeartbeat: "2023-12-21T10:30:45Z"
    },
    {
      serviceID: "spark-processor",
      name: "Apache Spark Processor",
      version: "3.4",
      description: "Apache Spark data processing service",
      serviceType: "Deployment",
      status: "running",
      nodeID: "cloud-cluster-worker-3",
      nodeType: "cloud",
      endpoints: [
        {
          protocol: "http",
          port: 7077,
          path: "/",
          healthCheck: "/health"
        },
        {
          protocol: "http",
          port: 8080,
          path: "/ui",
          healthCheck: "/health"
        }
      ],
      resources: {
        cpu: 1.0,
        memory: 2048,
        storage: 10
      },
      environment: {
        SPARK_MASTER: "spark://spark-master:7077"
      },
      labels: {
        app: "spark",
        tier: "compute",
        component: "processor"
      },
      replicas: {
        desired: 1,
        current: 1,
        available: 1
      },
      pods: [
        {
          podID: "data-processing-def012",
          status: "running",
          nodeID: "cloud-cluster-worker-3",
          resources: {
            cpu: 0.95,
            memory: 1843
          },
          createdAt: "2023-12-20T16:00:00Z",
          lastHeartbeat: "2023-12-21T10:30:45Z"
        }
      ],
      createdAt: "2023-12-20T16:00:00Z",
      updatedAt: "2023-12-21T10:30:45Z",
      lastHeartbeat: "2023-12-21T10:30:45Z"
    },
    {
      serviceID: "edge-agent-service",
      name: "Edge Agent Service",
      version: "1.0.0",
      description: "Edge node monitoring agent",
      serviceType: "DaemonSet",
      status: "running",
      nodeID: "edge-cluster-agent-1",
      nodeType: "edge",
      endpoints: [
        {
          protocol: "http",
          port: 8080,
          path: "/metrics",
          healthCheck: "/health"
        }
      ],
      resources: {
        cpu: 0.05,
        memory: 64,
        storage: 1
      },
      environment: {
        BACKEND_URL: "http://192.168.9.100:3000",
        NODE_TYPE: "edge",
        HEARTBEAT_INTERVAL: "30"
      },
      labels: {
        app: "monitoring",
        tier: "infrastructure",
        component: "agent"
      },
      replicas: {
        desired: 1,
        current: 1,
        available: 1
      },
      pods: [
        {
          podID: "edge-agent-pqr678",
          status: "running",
          nodeID: "edge-cluster-agent-1",
          resources: {
            cpu: 0.04,
            memory: 55
          },
          createdAt: "2023-12-20T12:00:00Z",
          lastHeartbeat: "2023-12-21T10:30:45Z"
        }
      ],
      createdAt: "2023-12-20T12:00:00Z",
      updatedAt: "2023-12-21T10:30:45Z",
      lastHeartbeat: "2023-12-21T10:30:45Z"
    },
    {
      serviceID: "iot-data-processor",
      name: "IoT Data Processor Service",
      version: "1.0.0",
      description: "IoT data processing service",
      serviceType: "Deployment",
      status: "running",
      nodeID: "edge-cluster-agent-1",
      nodeType: "edge",
      endpoints: [
        {
          protocol: "http",
          port: 8080,
          path: "/api",
          healthCheck: "/health"
        }
      ],
      resources: {
        cpu: 0.15,
        memory: 256,
        storage: 2
      },
      environment: {
        IOT_TOPIC: "sensors/data",
        PROCESSING_INTERVAL: "5"
      },
      labels: {
        app: "iot",
        tier: "edge",
        component: "processor"
      },
      replicas: {
        desired: 1,
        current: 1,
        available: 1
      },
      pods: [
        {
          podID: "iot-service-stu901",
          status: "running",
          nodeID: "edge-cluster-agent-1",
          resources: {
            cpu: 0.12,
            memory: 200
          },
          createdAt: "2023-12-19T15:30:00Z",
          lastHeartbeat: "2023-12-21T10:30:45Z"
        }
      ],
      createdAt: "2023-12-19T15:30:00Z",
      updatedAt: "2023-12-21T10:30:45Z",
      lastHeartbeat: "2023-12-21T10:30:45Z"
    },
    {
      serviceID: "ffmpeg-processor",
      name: "FFmpeg Video Processor",
      version: "latest",
      description: "Video processing service using FFmpeg",
      serviceType: "Deployment",
      status: "running",
      nodeID: "edge-cluster-agent-2",
      nodeType: "edge",
      endpoints: [
        {
          protocol: "http",
          port: 8080,
          path: "/api",
          healthCheck: "/health"
        }
      ],
      resources: {
        cpu: 0.5,
        memory: 1024,
        storage: 5
      },
      environment: {
        VIDEO_FORMAT: "mp4",
        QUALITY_PRESET: "medium"
      },
      labels: {
        app: "media",
        tier: "edge",
        component: "processor"
      },
      replicas: {
        desired: 1,
        current: 1,
        available: 1
      },
      pods: [
        {
          podID: "video-processing-mno234",
          status: "running",
          nodeID: "edge-cluster-agent-2",
          resources: {
            cpu: 0.45,
            memory: 850
          },
          createdAt: "2023-12-19T13:00:00Z",
          lastHeartbeat: "2023-12-21T10:30:45Z"
        }
      ],
      createdAt: "2023-12-19T13:00:00Z",
      updatedAt: "2023-12-21T10:30:45Z",
      lastHeartbeat: "2023-12-21T10:30:45Z"
    },
    {
      serviceID: "sensor-collector",
      name: "Sensor Data Collector",
      version: "1.0.0",
      description: "Sensor data collection service",
      serviceType: "DaemonSet",
      status: "running",
      nodeID: "edge-cluster-agent-2",
      nodeType: "edge",
      endpoints: [
        {
          protocol: "http",
          port: 9090,
          path: "/metrics",
          healthCheck: "/health"
        }
      ],
      resources: {
        cpu: 0.2,
        memory: 256,
        storage: 1
      },
      environment: {
        SENSOR_INTERVAL: "5",
        DATA_TOPIC: "sensors/raw"
      },
      labels: {
        app: "sensor",
        tier: "edge",
        component: "collector"
      },
      replicas: {
        desired: 1,
        current: 1,
        available: 1
      },
      pods: [
        {
          podID: "sensor-aggregator-pqr567",
          status: "running",
          nodeID: "edge-cluster-agent-2",
          resources: {
            cpu: 0.18,
            memory: 220
          },
          createdAt: "2023-12-20T17:00:00Z",
          lastHeartbeat: "2023-12-21T10:30:45Z"
        }
      ],
      createdAt: "2023-12-20T17:00:00Z",
      updatedAt: "2023-12-21T10:30:45Z",
      lastHeartbeat: "2023-12-21T10:30:45Z"
    },
    {
      serviceID: "api-gateway",
      name: "API Gateway Service",
      version: "1.21",
      description: "API gateway service",
      serviceType: "Deployment",
      status: "running",
      nodeID: "edge-cluster-agent-3",
      nodeType: "edge",
      endpoints: [
        {
          protocol: "http",
          port: 80,
          path: "/",
          healthCheck: "/health"
        },
        {
          protocol: "https",
          port: 443,
          path: "/",
          healthCheck: "/health"
        }
      ],
      resources: {
        cpu: 0.1,
        memory: 128,
        storage: 1
      },
      environment: {
        GATEWAY_CONFIG: "/etc/nginx/gateway.conf"
      },
      labels: {
        app: "gateway",
        tier: "edge",
        component: "api"
      },
      replicas: {
        desired: 1,
        current: 1,
        available: 1
      },
      pods: [
        {
          podID: "gateway-service-stu890",
          status: "running",
          nodeID: "edge-cluster-agent-3",
          resources: {
            cpu: 0.08,
            memory: 100
          },
          createdAt: "2023-12-18T12:00:00Z",
          lastHeartbeat: "2023-12-21T10:30:45Z"
        }
      ],
      createdAt: "2023-12-18T12:00:00Z",
      updatedAt: "2023-12-21T10:30:45Z",
      lastHeartbeat: "2023-12-21T10:30:45Z"
    },
    {
      serviceID: "node-exporter",
      name: "Node Exporter Service",
      version: "v1.5.0",
      description: "Prometheus node exporter for metrics collection",
      serviceType: "DaemonSet",
      status: "running",
      nodeID: "edge-cluster-agent-3",
      nodeType: "edge",
      endpoints: [
        {
          protocol: "http",
          port: 9100,
          path: "/metrics",
          healthCheck: "/health"
        }
      ],
      resources: {
        cpu: 0.05,
        memory: 64,
        storage: 1
      },
      environment: {
        COLLECTORS_ENABLED: "cpu,memory,disk,network"
      },
      labels: {
        app: "monitoring",
        tier: "infrastructure",
        component: "exporter"
      },
      replicas: {
        desired: 1,
        current: 1,
        available: 1
      },
      pods: [
        {
          podID: "monitoring-agent-vwx123",
          status: "running",
          nodeID: "edge-cluster-agent-3",
          resources: {
            cpu: 0.04,
            memory: 55
          },
          createdAt: "2023-12-20T09:00:00Z",
          lastHeartbeat: "2023-12-21T10:30:45Z"
        }
      ],
      createdAt: "2023-12-20T09:00:00Z",
      updatedAt: "2023-12-21T10:30:45Z",
      lastHeartbeat: "2023-12-21T10:30:45Z"
    }
  ],
  summary: {
    totalServices: 15,
    runningServices: 15,
    failedServices: 0,
    pendingServices: 0,
    cloudServices: 8,
    edgeServices: 7,
    totalPods: 15,
    runningPods: 15,
    failedPods: 0,
    pendingPods: 0
  },
  metadata: {
    generatedAt: "2023-12-21T10:30:45.123Z",
    version: "1.0.0",
    description: "Mock data for Cloud-Edge Platform services with pod information"
  }
}; 