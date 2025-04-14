# Design and Implementation of a Middleware Platform for Managing Heterogeneous Cloud-Edge Deployments

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