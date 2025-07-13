#!/bin/bash

# Cloud-Edge Platform Monitoring Uninstallation Script

set -e

echo "🗑️  Uninstalling Cloud-Edge Platform Monitoring..."

# Check if helm is available
if ! command -v helm &> /dev/null; then
    echo "❌ helm is not installed. Cannot uninstall monitoring."
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

echo "✅ Kubernetes cluster is accessible"

# Uninstall Prometheus stack
echo "🚀 Uninstalling Prometheus stack..."
helm uninstall prometheus -n monitoring

# Remove monitoring namespace
echo "📦 Removing monitoring namespace..."
kubectl delete namespace monitoring --ignore-not-found=true

# Remove any remaining resources
echo "🧹 Cleaning up remaining resources..."
kubectl delete servicemonitors --all --ignore-not-found=true
kubectl delete prometheusrules --all --ignore-not-found=true
kubectl delete configmaps -l app=prometheus --ignore-not-found=true
kubectl delete secrets -l app=prometheus --ignore-not-found=true

echo ""
echo "✅ Cloud-Edge Platform Monitoring uninstalled successfully!"
echo ""
echo "📝 Note: Persistent volumes may need to be manually deleted if you want to remove all data." 