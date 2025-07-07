#!/bin/zsh
# Deploy agents to cloud nodes

set -e

echo "🚀 Deploying agents to cloud nodes..."

# Define project paths
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(dirname "$SCRIPT_DIR")
AGENTS_DIR="$ROOT_DIR/agents"
CONFIG_DIR="$ROOT_DIR/config"

# Build agent image
echo "🔨 Building agent Docker image..."
cd "$AGENTS_DIR"

# Create go.mod if it doesn't exist
if [ ! -f "go.mod" ]; then
    echo "Creating go.mod..."
    go mod init cloud-edge-agent
    go mod tidy
fi

# Build the Docker image
docker build -t cloud-edge-agent:latest .

# Load the image to Kind cluster
kind load docker-image cloud-edge-agent:latest --name cloud-cluster

echo "✅ Agent image built successfully"

# Deploy to cloud cluster
echo "📦 Deploying agent DaemonSet to cloud cluster..."

# Apply the DaemonSet
kubectl apply -f "$CONFIG_DIR/agent-daemonset.yaml"

# Wait for DaemonSet to be ready
echo "⏳ Waiting for DaemonSet to be ready..."
kubectl rollout status daemonset/universal-agent --timeout=300s

# Check deployment status
echo "📊 Agent deployment status:"
kubectl get daemonset universal-agent
kubectl get pods -l app=universal-agent

echo "✅ Agents deployed successfully to all cloud nodes!"

# Show agent logs (optional)
echo "📋 Recent agent logs:"
kubectl logs -l app=universal-agent --tail=10 