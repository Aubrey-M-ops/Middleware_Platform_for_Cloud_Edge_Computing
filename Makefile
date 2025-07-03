.PHONY: cloud-setup edge-setup verify docker-up all

cloud:
	sudo ./shell/cloud-setup.sh

edge:
	sudo ./shell/edge-setup.sh

verify:
	sudo ./shell/verify.sh

docker-up:
	sudo docker-compose up -d

all: docker-up cloud-setup edge-setup verify 