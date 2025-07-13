#!/bin/zsh

echo "🌟 Starting Cloud-Edge Platform Services Locally..."

# check if the script is running from the correct directory
if [ ! -f "shell/start-services-local.sh" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# start mongodb
echo "📊 Starting MongoDB..."
./shell/start-mongodb-local.sh

# wait for mongodb to start
echo "⏳ Waiting for MongoDB to be ready..."
sleep 5

# start the backend
echo "🔧 Starting Backend..."
./shell/start-backend-local.sh

# check the service status
echo ""
echo "📋 Service Status:"
echo "=================="

# check mongodb
if docker ps | grep -q mongodb-local; then
    echo "✅ MongoDB: Running on port 27017"
else
    echo "❌ MongoDB: Not running"
fi

# check the backend
if curl -s http://localhost:3000/healthz > /dev/null; then
    echo "✅ Backend: Running on port 3000"
    echo "📊 Health: $(curl -s http://localhost:3000/healthz | jq -r '.activeNodes // "N/A"') active nodes"
else
    echo "❌ Backend: Not running"
fi

echo ""
echo "🎯 Agent Configuration:"
echo "======================"
echo "BACKEND_URL: http://192.168.9.100:3000"
echo "MONGODB_URI: mongodb://admin:123123@192.168.9.100:27017/cloud-edge-platform?authSource=admin"

echo ""
echo "🚀 Services are ready for Agent connections!" 