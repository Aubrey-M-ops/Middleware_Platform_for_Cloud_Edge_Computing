#!/bin/zsh
# 1️⃣ K8s cluster setup (Kind)
# 2️⃣ create K8s node(docker as container)

set -e

echo "☁️ Setting up Kind-based cloud cluster..."

# install Kind if missing
if ! command -v kind &> /dev/null; then
  echo "Installing Kind..."
  curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-amd64
  chmod +x ./kind
  sudo mv ./kind /usr/local/bin/kind
fi

# Recreate cluster to ensure clean state
if kind get clusters | grep -q "cloud-cluster"; then
  echo "Removing existing cloud-cluster..."
  kind delete cluster --name cloud-cluster
fi

WORKER_COUNT=5

# 检查宿主机资源
echo "🔍 Checking host resources..."
TOTAL_CPU=$(nproc)
TOTAL_MEM=$(free -g | grep Mem | awk '{print $2}')
echo "Host: $TOTAL_CPU CPU cores, ${TOTAL_MEM}GB RAM"

# 检查 Docker 资源限制
echo "🔍 Checking Docker resource limits..."
DOCKER_MEM=$(docker info --format '{{.MemTotal}}' 2>/dev/null | numfmt --from=iec --to=iec-i 2>/dev/null || echo "unknown")
DOCKER_CPU=$(docker info --format '{{.NCPU}}' 2>/dev/null || echo "unknown")
echo "Docker: $DOCKER_CPU CPU cores, ${DOCKER_MEM} RAM"

if [ "$TOTAL_CPU" -lt 4 ] || [ "$TOTAL_MEM" -lt 8 ]; then
  echo "⚠️  Warning: Host resources may be insufficient for $WORKER_COUNT workers"
  echo "   Consider reducing WORKER_COUNT or increasing host resources"
fi

# generate kind-config.yaml dynamically
cat <<EOF > kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
EOF
for i in $(seq 1 $WORKER_COUNT); do
  echo "- role: worker" >> kind-config.yaml
done

kind create cluster --name cloud-cluster --config kind-config.yaml

# 等待集群完全就绪
echo "⏳ Waiting for cluster to be ready..."
sleep 10
kubectl wait --for=condition=Ready nodes --all --timeout=300s || echo "Warning: Some nodes may not be ready yet"

# ensure kubectl is present
if ! command -v kubectl &> /dev/null; then
  echo "Installing kubectl..."
  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
  chmod +x kubectl
  sudo mv kubectl /usr/local/bin/
fi

# label all nodes as cloud (skip control-plane)
for node in $(kubectl get nodes -o name); do
  kubectl label $node node-type=cloud --overwrite || true
done

echo "✅ Cloud cluster ready. Nodes:"
kubectl get nodes --show-labels

########################resource + network constraints ##################################
echo "⛰️☁️  Applying resource limits to cloud worker containers..."
for cname in $(docker ps --filter "name=${CLUSTER_NAME:-cloud-cluster}-worker" --format '{{.Names}}'); do
  case $cname in
    *worker)       docker update --cpus 0.8 --memory 1.5g --memory-swap 1.5g $cname;;   # first worker
    *worker2)      docker update --cpus 0.6 --memory 1.2g --memory-swap 1.2g $cname;;   # second
    *)             docker update --cpus 0.5 --memory 1g --memory-swap 1g $cname;;     # others
  esac
  echo "  ↳ $cname updated"
done
