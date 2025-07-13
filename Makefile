.PHONY: all clean

# =============================================================================
# Simulate cloud and edge infrastructure
# =============================================================================

# Cloud infrastructure setup (Kubernetes)
cloud:
	sudo ./shell/cloud-setup.sh

# Edge infrastructure setup  (K3D)
edge:
	sudo -E ./shell/edge-setup.sh

# Deploy cloud agents 
# (used for reporting the metrics to the backend)
cloud-agent:
	sudo ./shell/deploy-agents.sh

# View cloud nodes
cloud-nodes:
	kubectl --kubeconfig config/.kube/kubeconfig-k8s.yaml get nodes -o wide --show-labels

# Verify infrastructure
verify:
	sudo ./shell/verify.sh

# Start Docker services
docker-up:
	sudo docker-compose up -d

# =============================================================================
# Backend and mongodb management
# =============================================================================

# Start backend and mongodb locally
services-start:
	./shell/start-services-local.sh

# Stop all services locally
services-stop:
	./shell/stop-services-local.sh

# Start MongoDB locally
mongodb-start:
	./shell/start-mongodb-local.sh

# Start backend service locally
backend-start:
	./shell/start-backend-local.sh

# =============================================================================
# MONITORING MODULE
# =============================================================================

# Install monitoring stack
monitoring:
	./shell/install-monitoring.sh

# Uninstall monitoring stack
uninstall-monitoring:
	./shell/uninstall-monitoring.sh

# =============================================================================
# TESTING
# =============================================================================

# Test API endpoints
test-api:
	cd backend && npm install && node ../scripts/test-api.js

# =============================================================================
# UTILITY TARGETS
# =============================================================================

# TODO: Clean build artifacts (placeholder for future use)
clean:
	@echo "Cleaning build artifacts..."
	# Add cleanup commands here as needed 