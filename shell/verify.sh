set -e
sudo ./shell/cloud-setup.sh
sudo ./shell/edge-setup.sh
kubectl --kubeconfig config/.kube/kubeconfig-k8s.yaml get nodes | grep edge
echo "✅ Cluster OK"