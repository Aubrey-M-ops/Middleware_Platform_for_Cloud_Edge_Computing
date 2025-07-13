# Cloud-Edge Platform Monitoring Configuration

## 📋 Overview

This directory contains the complete monitoring configuration for the Cloud-Edge Platform using Prometheus + Node-Exporter with Helm charts.

## 📁 Files

### 1. `values-prometheus.yaml`
Main Helm values configuration for Prometheus stack:
- **Prometheus Server**: Core monitoring server configuration
- **Node Exporter**: System metrics collection
- **Grafana**: Visualization dashboard (optional)
- **Alertmanager**: Alert management
- **Kube-state-metrics**: Kubernetes metrics
- **Custom Scrape Configs**: Cloud-Edge specific targets

### 2. `service-monitor.yaml`
ServiceMonitor configurations for automatic service discovery:
- **Cloud-Edge Backend**: API metrics
- **Cloud-Edge Agents**: Agent metrics
- **MongoDB**: Database metrics
- **Node Exporter**: System metrics

### 3. `prometheus-rules.yaml`
Alert rules for the platform:
- **Node Health**: CPU, memory, disk usage alerts
- **Service Health**: Backend, database, agent alerts
- **Network Health**: Network errors and drops
- **Edge-Specific**: Edge node offline alerts
- **Performance**: Response time and latency alerts

## 🚀 Installation

### Prerequisites

1. **Kubernetes Cluster**: Running Kind or K3s cluster
2. **kubectl**: Configured to access the cluster
3. **Helm**: Version 3.x installed

### Quick Installation

```bash
# Make script executable
chmod +x shell/install-monitoring.sh

# Install monitoring stack
./shell/install-monitoring.sh
```

### Manual Installation

```bash
# 1. Create monitoring namespace
kubectl create namespace monitoring

# 2. Add Prometheus Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# 3. Install Prometheus stack
helm install prometheus prometheus-community/kube-prometheus-stack \
    --namespace monitoring \
    --values config/monitoring/values-prometheus.yaml

# 4. Apply ServiceMonitor configurations
kubectl apply -f config/monitoring/service-monitor.yaml

# 5. Apply alert rules
kubectl apply -f config/monitoring/prometheus-rules.yaml
```

## 🔧 Configuration

### Scrape Targets

The configuration includes scrape targets for:

1. **Cloud-Edge Backend** (`cloud-edge-backend`)
   - Endpoint: `/metrics`
   - Port: `3000`
   - Interval: `30s`

2. **Cloud-Edge Agents** (`cloud-edge-agents`)
   - Endpoint: `/metrics`
   - Port: `3000`
   - Interval: `30s`

3. **MongoDB** (`mongodb`)
   - Endpoint: `/metrics`
   - Port: `27017`
   - Interval: `30s`

4. **Node Exporter** (`node-exporter`)
   - Endpoint: `/metrics`
   - Port: `9100`
   - Interval: `30s`

### Custom Metrics

The backend exposes custom metrics:

```javascript
// Node metrics
node_heartbeat_total{node_id, node_type, status}
node_resource_usage{node_id, node_type, resource_type}

// Agent metrics
agent_heartbeat_total{agent_id, node_type, status}
agent_resource_usage{agent_id, node_type, resource_type}

// API metrics
api_request_total{method, route, status_code}
api_request_duration_seconds{method, route, status_code}

// Database metrics
database_operations_total{database, operation, status}
database_operation_duration_seconds{database, operation}
```

## 📊 Dashboards

### Accessing Grafana

```bash
# Port forward Grafana
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring

# Access at http://localhost:3000
# Credentials: admin / admin123
```

### Default Dashboards

1. **Cloud-Edge Overview**
   - Node health status
   - Resource usage charts
   - Service availability
   - Agent status

2. **Node Metrics**
   - CPU, memory, disk usage
   - Network statistics
   - System load

3. **Service Metrics**
   - API response times
   - Database performance
   - Error rates

## 🚨 Alerts

### Critical Alerts

- **NodeDown**: Node offline for >5 minutes
- **BackendServiceDown**: Backend service unavailable
- **MongoDBServiceDown**: Database service unavailable
- **AgentHeartbeatMissing**: Agent not responding

### Warning Alerts

- **HighCPUUsage**: CPU usage >80%
- **HighMemoryUsage**: Memory usage >85%
- **HighDiskUsage**: Disk usage >85%
- **ServiceResponseTimeHigh**: Response time >2s

### Edge-Specific Alerts

- **EdgeNodeOffline**: Edge node offline for >3 minutes
- **CloudNodeOffline**: Cloud node offline for >2 minutes

## 🔍 Monitoring Endpoints

### Prometheus UI
```bash
kubectl port-forward svc/prometheus-operated 9090:9090 -n monitoring
# Access at http://localhost:9090
```

### Grafana UI
```bash
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
# Access at http://localhost:3000
```

### Alertmanager UI
```bash
kubectl port-forward svc/prometheus-alertmanager 9093:9093 -n monitoring
# Access at http://localhost:9093
```

## 📈 Metrics Collection

### Node Exporter Metrics

- **System Metrics**: CPU, memory, disk, network
- **Process Metrics**: Running processes, system load
- **Network Metrics**: Network interfaces, connections
- **File System**: Mount points, disk usage

### Application Metrics

- **API Metrics**: Request count, duration, error rates
- **Database Metrics**: Connections, operations, performance
- **Agent Metrics**: Heartbeat, resource usage, uptime
- **Service Metrics**: Availability, response times

## 🔧 Customization

### Adding New Metrics

1. **Backend Metrics**: Add to `backend/metrics.js`
2. **Agent Metrics**: Add to agent code
3. **Custom Collectors**: Create new exporters

### Modifying Alerts

Edit `prometheus-rules.yaml`:
```yaml
- alert: CustomAlert
  expr: your_promql_expression
  for: 5m
  labels:
    severity: warning
  annotations:
    summary: "Custom alert"
    description: "Custom alert description"
```

### Adding ServiceMonitors

Create new ServiceMonitor in `service-monitor.yaml`:
```yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: your-service
spec:
  selector:
    matchLabels:
      app: your-service
  endpoints:
  - port: metrics
    path: /metrics
    interval: 30s
```

## 🛠️ Troubleshooting

### Common Issues

1. **Prometheus not scraping targets**
   ```bash
   kubectl get servicemonitors -n monitoring
   kubectl describe servicemonitor <name> -n monitoring
   ```

2. **Alerts not firing**
   ```bash
   kubectl get prometheusrules -n monitoring
   kubectl describe prometheusrule <name> -n monitoring
   ```

3. **Metrics not appearing**
   ```bash
   kubectl logs -f deployment/prometheus -n monitoring
   kubectl logs -f daemonset/node-exporter -n monitoring
   ```

### Useful Commands

```bash
# Check pod status
kubectl get pods -n monitoring

# Check service status
kubectl get svc -n monitoring

# Check ServiceMonitors
kubectl get servicemonitors -n monitoring

# Check PrometheusRules
kubectl get prometheusrules -n monitoring

# View Prometheus logs
kubectl logs -f deployment/prometheus -n monitoring

# View Node Exporter logs
kubectl logs -f daemonset/node-exporter -n monitoring
```

## 🗑️ Uninstallation

```bash
# Use the uninstall script
./shell/uninstall-monitoring.sh

# Or manually
helm uninstall prometheus -n monitoring
kubectl delete namespace monitoring
```

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Node Exporter Documentation](https://github.com/prometheus/node_exporter)
- [Grafana Documentation](https://grafana.com/docs/)
- [Kubernetes Monitoring](https://kubernetes.io/docs/tasks/debug-application-cluster/resource-usage-monitoring/) 