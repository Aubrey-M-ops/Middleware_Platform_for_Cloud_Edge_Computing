.PHONY: cloud-setup edge-setup verify docker-up all

cloud:
	sudo ./shell/cloud-setup.sh

cloud-agent:
	sudo ./shell/deploy-agents.sh

cloud-nodes:
	   kubectl --kubeconfig config/.kube/kubeconfig-k8s.yaml get nodes -o wide --show-labels

edge:
	sudo -E ./shell/edge-setup.sh

verify:
	sudo ./shell/verify.sh

docker-up:
	sudo docker-compose up -d

all: docker-up cloud-setup edge-setup verify 