.PHONY: cloud-setup edge-setup verify docker-up all

cloud:
	sudo ./shell/cloud-setup.sh

cloud-nodes:
	sudo docker ps --filter "name=cloud-cluster" --format "table {{.Names}}\t{{.Status}}" 

edge:
	sudo -E ./shell/edge-setup.sh

verify:
	sudo ./shell/verify.sh

docker-up:
	sudo docker-compose up -d

all: docker-up cloud-setup edge-setup verify 