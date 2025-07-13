#!/bin/bash

echo "🚀 Starting Backend locally..."

# check if the backend is already running
if pgrep -f "node.*index.js" > /dev/null; then
    echo "⚠️  Backend is already running"
    exit 0
fi

# enter the backend directory
cd "$(dirname "$0")/../backend"

# install dependencies
echo "📦 Installing dependencies..."
npm install

# set environment variables
export MONGODB_URI="mongodb://admin:123123@localhost:27017/cloud-edge-platform?authSource=admin"
export PORT=3000
export NODE_ENV=production

# start the backend
echo "💻 Starting Backend server..."
node index.js &

# wait for the server to start
sleep 3

# check if the server is running
if curl -s http://localhost:3000/healthz > /dev/null; then
    echo "✅ Backend started successfully on port 3000"
    echo "📊 Health check: http://localhost:3000/healthz"
    echo "🔗 API endpoints:"
    echo "  - POST http://localhost:3000/node/heartbeat"
    echo "  - GET  http://localhost:3000/api/nodes"
else
    echo "❌ Backend failed to start"
    exit 1
fi 