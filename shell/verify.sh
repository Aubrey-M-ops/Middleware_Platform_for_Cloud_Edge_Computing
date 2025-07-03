#!/bin/zsh
# set error handling
set -e

# K3s server
K3S_SERVER="k3s-server"
K3S_PORT="6443"

# define output colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# define check_command function
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}Error: $1 is not installed or not in PATH${NC}"
    exit 1
  fi
}

# check Docker container running status
echo "🐬 Verifying Docker containers..."
check_command docker
docker ps --format "{{.Names}} {{.Status}}" | grep -E "k3s-server|mongodb|resource-discovery|cloud-node|edge-node" | while read -r line; do
  if [[ $line == *"Up"* ]]; then
    echo -e "${GREEN}Container $line is running${NC}"
  else
    echo -e "${RED}Container $line is not running${NC}"
    exit 1
  fi
done

# check network connectivity
echo "🛜 Verifying network connectivity in cloud-edge-net..."
docker network inspect cloud-edge-net > /dev/null || { echo -e "${RED}Error: cloud-edge-net does not exist${NC}"; exit 1; }
ALL_NODES=("cloud-node1" "cloud-node2" "cloud-node3" "edge-node1" "edge-node2" "edge-node3")
# TODO: for node in "${ALL_NODES[@]}"; do
#   echo "Checking network from $node to mongodb..."
#   docker exec $node ping -c 3 mongodb > /dev/null && echo -e "${GREEN}Ping mongodb from $node: OK${NC}" || { echo -e "${RED}Ping mongodb from $node: Failed${NC}"; exit 1; }
#   echo "Checking network from $node to resource-discovery..."
#   docker exec $node curl -s http://resource-discovery:3000/register > /dev/null && echo -e "${GREEN}Curl resource-discovery from $node: OK${NC}" || { echo -e "${RED}Curl resource-discovery from $node: Failed${NC}"; exit 1; }
# done
docker exec edge-node1 curl -s --insecure https://$K3S_SERVER:$K3S_PORT > /dev/null && echo -e "${GREEN}Curl k3s-server from edge-node1: OK${NC}" || { echo -e "${RED}Curl k3s-server from edge-node1: Failed${NC}"; exit 1; }

# configure K3s kubeconfig
echo "Configuring K3s kubeconfig..."
K3S_SERVER_IP=$(docker inspect $K3S_SERVER | grep -A 20 "cloud-edge-net" | grep "IPAddress" | head -1 | awk '{print $2}' | tr -d '",')
docker cp k3s-server:/etc/rancher/k3s/k3s.yaml ~/.kube/k3s-config
sed -i "s/127.0.0.1/$K3S_SERVER_IP/" ~/.kube/k3s-config
chmod 600 ~/.kube/k3s-config

# verify cloud nodes (Kind cluster)
echo "☁️☁️☁️ Verifying cloud (Kind) cluster..."
check_command kind
kind get clusters | grep cloud-cluster > /dev/null || { echo -e "${RED}cloud-cluster not found${NC}"; exit 1; }
kubectl get nodes --show-labels | grep "node-type=cloud" && echo -e "${GREEN}Cloud node labels OK${NC}" || { echo -e "${RED}Cloud node labels missing${NC}"; exit 1; }

# verify edge nodes (K3d cluster)
echo "🌍🌍🌍 Verifying edge (K3d) cluster..."
check_command k3d
k3d cluster list | grep edge-cluster > /dev/null || { echo -e "${RED}edge-cluster not found${NC}"; exit 1; }
KUBECONFIG=~/.kube/k3s-edge-config kubectl get nodes --show-labels | grep "node-type=edge" && echo -e "${GREEN}Edge node labels OK${NC}" || { echo -e "${RED}Edge node labels missing${NC}"; exit 1; }

# TODO: verify node-agent.js
# echo "Verifying node-agent.js on all nodes..."
# for node in "${ALL_NODES[@]}"; do
#   echo "Checking $node..."
#   docker exec $node ps aux | grep node-agent.js > /dev/null && echo -e "${GREEN}node-agent.js running on $node${NC}" || { echo -e "${RED}node-agent.js not running on $node${NC}"; exit 1; }
# done

# TODO: verify resource discovery service
# echo "Verifying resource discovery service..."
# docker logs resource-discovery | grep "Server running on port 3000" > /dev/null && echo -e "${GREEN}resource-discovery service is running${NC}" || { echo -e "${RED}resource-discovery service not running${NC}"; exit 1; }
# sleep 10
# docker exec -it mongodb mongo cloud_edge_db --quiet --eval "db.nodes.find().toArray()" | grep nodeId | while read -r line; do
#   echo -e "${GREEN}MongoDB entry: $line${NC}"
# done
# for node in "${ALL_NODES[@]}"; do
#   docker exec -it mongodb mongo cloud_edge_db --quiet --eval "db.nodes.find({nodeId: '$node'}).toArray()" | grep $node > /dev/null && echo -e "${GREEN}MongoDB data for $node found${NC}" || { echo -e "${RED}MongoDB data for $node missing${NC}"; exit 1; }
# done
