# Design and Implementation of a Middleware Platform for Managing Heterogeneous Cloud-Edge Deployments

## 📁 Project Structure

```
Middleware_Platform_for_Cloud_Edge_Computing/
├── agents/                          # Go agent implementation
│   ├── main.go                     # Main agent logic
│   ├── go.mod                      # Go module definition (Go 1.21)
│   └── Dockerfile                  # Multi-stage Docker build for agent
├── backend/                        # Node.js backend service
│   ├── index.js                   # Express server entry point
│   ├── package.json               # Node.js dependencies
│   └── node_modules/              # Installed dependencies
├── config/                        # Kubernetes deployment configurations
│   ├── agent-daemonset.yaml      # DaemonSet for agent deployment
│   └── .kube/                    # Kubernetes config files
├── shell/                         # Deployment and setup scripts
│   ├── cloud-setup.sh            # Cloud node setup script
│   ├── edge-setup.sh             # Edge node setup script
│   ├── deploy-agents.sh          # Agent deployment script
│   ├── verify.sh                 # Verification script
│   └── resource-discovery.sh     # Resource discovery script
├── docs/                         # Documentation
│   └── openapi.yaml             # API specification
├── ml/                          # Machine learning models (future)
├── dashboard/                    # Frontend dashboard (future)
├── services/                     # Microservices (future)
├── .github/                      # GitHub Actions CI/CD
│   └── workflows/               # CI/CD pipeline definitions
├── kind-config.yaml             # Kind cluster configuration
├── docker-compose.yml           # Docker Compose for local development
├── Makefile                     # Build and deployment automation
├── .gitignore                   # Git ignore rules
└── README.md                    # This file
```

### 📋 Directory Descriptions

- **`agents/`**: Contains the Go-based agent that runs on each cloud/edge node. The agent is responsible for resource monitoring, service discovery, and communication with the backend.

- **`backend/`**: Node.js Express server that provides the central backend service for the middleware platform, handling service registration, scheduling, and API endpoints.

- **`config/`**: Kubernetes manifests and configuration files for deploying the platform components in a Kubernetes cluster.

- **`shell/`**: Automation scripts for setting up cloud/edge nodes, deploying agents, and managing the platform infrastructure.

- **`docs/`**: Project documentation including API specifications and technical guides.

- **`ml/`**: Reserved for future machine learning models for load prediction and placement optimization.

- **`dashboard/`**: Reserved for future React.js frontend dashboard for monitoring and management.

- **`services/`**: Reserved for future microservices that will run on the platform.

- **`.github/`**: GitHub Actions workflows for continuous integration and deployment.

## Middleware Modules

- **Resource Discovery Service**

  - Collects and maintains **metadata on edge/cloud nodes** (CPU, memory, bandwidth). 
  - Periodically updated via **heartbeat or polling.**

- **Service Registration & Scheduling**

  - Users **register services**: Manual / policy-based automatic deployment 
  - ✨ Train <u>DL model</u>  for <u>load prediction</u> and <u>placement optimization</u> (recommend service nodes)
    - Dataset: [Google Borg trace](https://github.com/google/cluster-data) / [Alibaba Cluster Trace](https://github.com/alibaba/clusterdata)

- **Unified API Interface**

  Exposes consistent APIs to developers, abstracting away the underlying heterogeneity of cloud and edge.

- **Communication Coordinator**

  Inter-node messaging. Service invocation & data consistency.

- **Monitoring & Logging Module**

​	Collects runtime metrics, service statuses, and logs from cloud/edge node. (Visible)

- **Security** (Future work)



| Layer                          | Tech Stack                                                   |
| ------------------------------ | ------------------------------------------------------------ |
| **Middleware Communication**   | `gRPC`, `REST API`                                           |
| **Service Deployment**         | `Docker`, `Kubernetes (K3s for edge)` (nodes simulation )    |
| **Service Registry & Backend** | `Node.js`, `Express`, `MongoDB`                              |
| **Frontend Dashboard**         | `React.js`,  `Chart.js`                                      |
| **Monitoring**                 | `Prometheus`                                                 |
| **DL Model (Optional)**        | `PyTorch` or `TensorFlow` (for load prediction or placement optimization) |



## Simulate Multiple Nodes and Service

### 1. Cloud / Edge Nodes Simulation

> Use `Docker`  to simulate nodes
>
> Use `Kubernetes` to  label nodes as "cloud" or "edge"

- Each node = a Docker container

- Each container runs the same or different microservice instance

- A different CPU/memory limits to mimic heterogeneity

### 2. Service Simulation

> Simulate services to run on the nodes

- REST APIs (Flask / FastAPI)
- gRPC Servers 

## 📌 Comparing to K8s

| Feature                  | Kubernetes Implementation                                    | Project’s Implementation & Innovation                        |
| ------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **Node Configuration**   | Manual K3s / KubeEdge setup; node labels configured `by hand` | `Automatic resource discovery`, `dynamic labeling`, adapted for low-resource edge devices |
| **Scheduling**           | `Static scheduling` based on resource requests and affinity/anti-affinity rules | `Deep-learning–driven predictive scheduling`, dynamically optimizes placement on fluctuating edge nodes |
| **Communication**        | Cloud-centric network model; edge support requires KubeEdge  | gRPC/REST optimized for edge communication with `built-in consistency mechanisms` |
| **Monitoring**           | Prometheus/Grafana must be `configured manually`; limited edge visibility | Integrated edge monitoring with `real-time dashboards `exposing edge metrics |
| **Developer Experience** | Complex toolchain (kubectl, YAML); steep learning curve      | Unified API and visual dashboard streamline operations       |



