#!/bin/zsh

# Cloud-Edge Platform Monitoring Installation Script
# Installs Prometheus + Node-Exporter using Helm

set -e

echo "🔧 Installing Cloud-Edge Platform Monitoring..."

# Define project paths
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(dirname "$SCRIPT_DIR")
CONFIG_DIR="$ROOT_DIR/config/monitoring"

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if helm is available
if ! command -v helm &> /dev/null; then
    echo "❌ helm is not installed. Installing helm..."
    curl https://get.helm.sh/helm-v3.12.0-linux-amd64.tar.gz | tar xz
    sudo mv linux-amd64/helm /usr/local/bin/
    rm -rf linux-amd64
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

echo "✅ Kubernetes cluster is accessible"

# Create monitoring namespace
echo "📦 Creating monitoring namespace..."
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

# Add Prometheus Helm repository
echo "📚 Adding Prometheus Helm repository..."
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus with custom values
echo "🚀 Installing Prometheus with Node-Exporter..."
helm install prometheus prometheus-community/kube-prometheus-stack \
    --namespace monitoring \
    --create-namespace \
    --values "$CONFIG_DIR/values-prometheus.yaml" \
    --wait \
    --timeout 10m

# Apply ServiceMonitor configurations
echo "📸 Applying ServiceMonitor configurations..."
kubectl apply -f "$CONFIG_DIR/service-monitor.yaml"

# Apply Prometheus rules
echo "🚨 Applying Prometheus alert rules..."
kubectl apply -f "$CONFIG_DIR/prometheus-rules.yaml"

# Wait for all pods to be ready
echo "⏳ Waiting for monitoring pods to be ready..."
kubectl wait --for=condition=ready pod -l app=prometheus -n monitoring --timeout=300s
kubectl wait --for=condition=ready pod -l app=node-exporter -n monitoring --timeout=300s

# Get service information
echo "📋 Monitoring services information:"
kubectl get svc -n monitoring

# Get pod status
echo "📊 Pod status:"
kubectl get pods -n monitoring

# Port forward Prometheus (optional)
echo "🌐 To access Prometheus UI, run:"
echo "kubectl port-forward svc/prometheus-operated 9090:9090 -n monitoring"
echo ""
echo "🌐 To access Grafana UI, run:"
echo "kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring"
echo "Grafana credentials: admin / admin123"
echo ""
echo "📊 To access Alertmanager UI, run:"
echo "kubectl port-forward svc/prometheus-alertmanager 9093:9093 -n monitoring"

# Show monitoring endpoints
echo ""
echo "🔗 Monitoring Endpoints:"
echo "Prometheus: http://localhost:9090"
echo "Grafana: http://localhost:3000 (admin/admin123)"
echo "Alertmanager: http://localhost:9093"

# Show useful commands
echo ""
echo "📝 Useful Commands:"
echo "kubectl get pods -n monitoring"
echo "kubectl logs -f deployment/prometheus -n monitoring"
echo "kubectl logs -f daemonset/node-exporter -n monitoring"
echo "kubectl get servicemonitors -n monitoring"
echo "kubectl get prometheusrules -n monitoring"

echo ""
echo "✅ Cloud-Edge Platform Monitoring installed successfully!"
echo ""
echo "🎯 Next Steps:"
echo "1. Access Prometheus UI to verify targets are being scraped"
echo "2. Access Grafana UI to create dashboards"
echo "3. Configure alert notifications in Alertmanager"
echo "4. Add custom metrics to your applications" 