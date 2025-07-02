#!/bin/zsh
# set error handling
set -e

################################## K3s cluster setup ##################################

# K3s server
K3S_SERVER="k3s-server"
K3S_PORT="6443"

# get K3s token
K3S_TOKEN=$(docker exec $K3S_SERVER cat /var/lib/rancher/k3s/server/node-token)
echo "K3s Token: $K3S_TOKEN"

# get K3s server IP (through Docker network)
K3S_SERVER_IP=$(docker inspect $K3S_SERVER | grep -A 20 "cloud-edge-net" | grep "IPAddress" | head -1 | awk '{print $2}' | tr -d '",')
echo "K3s Server IP: $K3S_SERVER_IP"

######################################################################################################



############################## K8s cluster setup (Kind) ##################################
echo "Setting up Kind cluster for cloud nodes..."

# install Kind
if ! command -v kind &> /dev/null; then
  echo "Installing Kind..."
  curl -Lo ./kind https://kind.sigs.k8s.io/dl/v0.23.0/kind-linux-amd64
  chmod +x ./kind
  sudo mv ./kind /usr/local/bin/kind
fi

# create Kind cluster  --- cloud cluster
# 1. create control node and worker node
# 2. export control node port 3000 to host port 3000

# Check if cluster already exists and delete it if it does
if kind get clusters | grep -q "cloud-cluster"; then
  echo "Cloud cluster already exists. Deleting it..."
  kind delete cluster --name cloud-cluster
fi

cat <<EOF > kind-config.yaml # create kind-config.yaml file
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes: 
- role: control-plane
- role: worker
  extraPortMappings:
  - containerPort: 3000
    hostPort: 3000
EOF

kind create cluster --name cloud-cluster --config kind-config.yaml
echo "Kind cluster created."

# get Kind kubeconfig
KUBECONFIG_FILE=~/.kube/config
mkdir -p ~/.kube
kind get kubeconfig --name cloud-cluster > $KUBECONFIG_FILE
chmod 600 $KUBECONFIG_FILE
########################################################################################## 


############################## 1. ☁️ cloud nodes ➡️ K8s(Kind) cluster ##################################
# install kubelet for cloud nodes, the cloud node becomes a ✨K8s node✨
CLOUD_NODES=("cloud-node1" "cloud-node2" "cloud-node3")
for node in "${CLOUD_NODES[@]}"; do
  echo "Configuring kubelet for $node..."
  # Add Kubernetes repository and install kubelet
  # install docker service and cri-dockerd
  docker exec -it $node bash -c "
    apt-get update && apt-get install -y curl apt-transport-https ca-certificates gnupg lsb-release
    curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.28/deb/Release.key | gpg --dearmor -o /usr/share/keyrings/kubernetes-apt-keyring.gpg
    echo 'deb [signed-by=/usr/share/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.28/deb/ /' | tee /etc/apt/sources.list.d/kubernetes.list
    apt-get update && apt-get install -y kubelet docker.io cri-dockerd
    cri-dockerd --container-runtime-endpoint unix:///var/run/docker.sock \
                --network-plugin=cni &>/var/log/cri-dockerd.log &
  "
  # copy kubeconfig to node
  docker cp $KUBECONFIG_FILE $node:/etc/kubernetes/kubeconfig
  # configure kubelet (make it a K8s node)
  docker exec -it $node bash -c "kubelet --kubeconfig=/etc/kubernetes/kubeconfig --node-ip=$(docker inspect $node | grep IPAddress | grep -v 172 | awk '{print $2}' | tr -d '\"') --container-runtime-endpoint=unix:///var/run/cri-dockerd.sock --container-runtime=docker --cgroup-driver=cgroupfs --fail-swap-on=false &"
done

# verify cloud nodes
echo "Verifying cloud nodes in Kind cluster..."
# Install kubectl if not present
if ! command -v kubectl &> /dev/null; then
  echo "Installing kubectl..."
  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
  chmod +x kubectl
  sudo mv kubectl /usr/local/bin/
fi
kubectl get nodes

# Add labels to cloud nodes
echo "Adding labels to cloud nodes..."
sleep 10  # Wait for nodes to be ready
kubectl label nodes cloud-node1 node-type=cloud --overwrite || echo "Warning: Could not label cloud-node1"
kubectl label nodes cloud-node2 node-type=cloud --overwrite || echo "Warning: Could not label cloud-node2"
kubectl label nodes cloud-node3 node-type=cloud --overwrite || echo "Warning: Could not label cloud-node3"
##########################################################################################



############################## 2. 🌍 edge nodes ➡️ K3s cluster ###########################
echo "Configuring K3s agents for edge nodes..."
EDGE_NODES=("edge-node1" "edge-node2" "edge-node3")
# install K3s agent for edge nodes, the edge node becomes a ✨K3s node✨
for node in "${EDGE_NODES[@]}"; do
  echo "Installing K3s agent on $node..."
  # Download k3s binary
  curl -L https://github.com/k3s-io/k3s/releases/download/v1.30.0%2Bk3s1/k3s -o /usr/local/bin/k3s
  chmod +x /usr/local/bin/k3s

  # Start k3s agent manually in background
  docker exec -d $node bash -c "k3s agent --server https://$K3S_SERVER_IP:$K3S_PORT --token $K3S_TOKEN --node-ip $(hostname -i) --flannel-backend none &>/var/log/k3s-agent.log &"
done

# verify edge nodes
echo "Verifying edge nodes in K3s cluster..."
docker cp k3s-server:/etc/rancher/k3s/k3s.yaml ~/.kube/k3s-config
sed -i "s/127.0.0.1/$K3S_SERVER_IP/" ~/.kube/k3s-config
KUBECONFIG=~/.kube/k3s-config kubectl get nodes

# TODO: Add labels to edge nodes  label没加上呃呃呃呃呃呃啊啊啊啊啊啊啊啊啊啊啊
echo "Adding labels to edge nodes..."
sleep 10  # Wait for nodes to be ready
KUBECONFIG=~/.kube/k3s-config kubectl label nodes edge-node1 node-type=edge --overwrite || echo "Warning: Could not label edge-node1"
KUBECONFIG=~/.kube/k3s-config kubectl label nodes edge-node2 node-type=edge --overwrite || echo "Warning: Could not label edge-node2"
KUBECONFIG=~/.kube/k3s-config kubectl label nodes edge-node3 node-type=edge --overwrite || echo "Warning: Could not label edge-node3"
##########################################################################################

#TODO: 用于资源发现
# 3. 启动 node-agent.js
# echo "Starting node-agent.js on all nodes..."
# ALL_NODES=("${CLOUD_NODES[@]}" "${EDGE_NODES[@]}")
# for node in "${ALL_NODES[@]}"; do
#   docker exec $node npm install axios
#   docker exec -d $node node /node-agent.js
# done

# 4. 验证资源发现
# echo "Verifying resource discovery..."
# sleep 10 # 等待 node-agent.js 发送数据
# docker exec -it mongodb mongo cloud_edge_db --eval "db.nodes.find().pretty()"

# 5. 验证节点标签
echo "Verifying node labels..."
KUBECONFIG=~/.kube/k3s-config kubectl get nodes --show-labels
kubectl get nodes --show-labels