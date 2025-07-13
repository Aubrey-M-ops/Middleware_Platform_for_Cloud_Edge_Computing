#!/bin/zsh

echo "🛑 Stopping Cloud-Edge Platform Services..."

# stop the backend
echo "🔧 Stopping Backend..."
pkill -f "node.*index.js" || true

# stop mongodb
echo "🛑 Stopping MongoDB..."
docker stop mongodb-local 2>/dev/null || true
docker rm mongodb-local 2>/dev/null || true

echo "✅ Services stopped"
echo ""
echo "📋 Cleanup:"
echo "- Backend process killed"
echo "- MongoDB container stopped and removed"
echo "- Data preserved in /tmp/mongodb-data" 