#!/bin/zsh
# 1️⃣ Create/refresh K3d-based edge cluster (3 agent nodes) and label as edge
# 2️⃣ use K3d to create K3s node(docker as container)

set -e

echo "🌍 Setting up K3d edge cluster..."

# install k3d if missing
if ! command -v k3d &> /dev/null; then
  echo "Installing k3d..."
  curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash -s -- --version v5.6.0
fi

CLUSTER_NAME="edge-cluster"
AGENT_COUNT=5

# Delete existing cluster if any
if k3d cluster list | grep -q $CLUSTER_NAME; then
  echo "Removing existing $CLUSTER_NAME ..."
  k3d cluster delete $CLUSTER_NAME
fi

############################# 🌍 create 5 edge nodes ##################################
k3d cluster create $CLUSTER_NAME --servers 1 --agents $AGENT_COUNT
#######################################################################################

echo "Fetching kubeconfig..."
mkdir -p ~/.kube
k3d kubeconfig get $CLUSTER_NAME > ~/.kube/k3s-edge-config
chmod 600 ~/.kube/k3s-edge-config

# label all agent nodes as edge (exclude server)
for node in $(kubectl --kubeconfig ~/.kube/k3s-edge-config get nodes -o name | grep agent); do
  kubectl --kubeconfig ~/.kube/k3s-edge-config label $node node-type=edge --overwrite || true
done

echo "✅ Edge cluster ready. Nodes:"
kubectl --kubeconfig ~/.kube/k3s-edge-config get nodes --show-labels

########################resource + network constraints ##################################
echo "⛰️🌍  Applying resource + network constraints to edge agent containers..."
for cname in $(docker ps --filter "name=k3d-${CLUSTER_NAME}-agent" --format '{{.Names}}'); do
  # resource: set resource limits to 0.5 CPU / 512Mi
  docker update --cpus 0.5 --memory 512m --memory-swap 512m $cname
  # network: add 80ms delay and 3Mbit bandwidth to network
  docker exec $cname sh -c "which tc || (apt-get update && apt-get install -y iproute2)"
  docker exec $cname tc qdisc replace dev eth0 root tbf rate 3mbit burst 32kbit latency 80ms
  echo "  ↳ $cname limited"
done
######################################################################################