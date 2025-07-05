#!/bin/zsh
# 1️⃣ Create/refresh K3d-based edge cluster (3 agent nodes) and label as edge
# 2️⃣ use K3d to create K3s node(docker as container)

set -e

echo "🌍 Setting up K3d edge cluster..."

# k3d >= v5.8.0 fixes a bug where the tools container could still generate an
# "invalid IP" error even when K3D_HOST_IP is set. Use the latest 5.8.x.
REQUIRED_K3D_VERSION="v5.8.3"
if ! command -v k3d &> /dev/null || [[ $(k3d --version | awk '{print $3}') != $REQUIRED_K3D_VERSION ]]; then
  echo "⚙️  Installing/upgrading k3d to $REQUIRED_K3D_VERSION ..."
  curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | TAG=$REQUIRED_K3D_VERSION bash
fi

CLUSTER_NAME="edge-cluster"
AGENT_COUNT=5

# Delete existing cluster if any
if k3d cluster list | grep -q $CLUSTER_NAME; then
  echo "Removing existing $CLUSTER_NAME ..."
  k3d cluster delete $CLUSTER_NAME
fi

############################# 🌍 create 5 edge nodes ##################################
export K3D_HOST_IP=$(ip route get 1 | awk '/src/ {print $7}')
k3d cluster create $CLUSTER_NAME --host-alias ${K3D_HOST_IP}:host.k3d.internal --servers 1 --agents $AGENT_COUNT
#######################################################################################

# Define project paths
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(dirname "$SCRIPT_DIR")
CONFIG_DIR="$ROOT_DIR/config/.kube"
mkdir -p "$CONFIG_DIR"

# export kubeconfig to project kubeconfigs directory
echo "Fetching kubeconfig..."
KUBECFG="$CONFIG_DIR/k3s-edge-config"
k3d kubeconfig get $CLUSTER_NAME > "$KUBECFG"
chmod 600 "$KUBECFG"
echo "🔑 Kubeconfig saved to $KUBECFG"

# label all agent nodes as edge (exclude server)
for node in $(kubectl --kubeconfig "$KUBECFG" get nodes -o name | grep agent); do
  kubectl --kubeconfig "$KUBECFG" label $node node-type=edge --overwrite || true
done

echo "✅ Edge cluster ready. Nodes:"
kubectl --kubeconfig "$KUBECFG" get nodes --show-labels

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