#!/bin/zsh

echo "🚀 Starting MongoDB locally..."

# check if mongodb container already exists
if docker ps -a --format "table {{.Names}}" | grep -q "mongodb-local"; then
    echo "⚠️  MongoDB container already exists"
    
    # check if container is running
    if docker ps --format "table {{.Names}}" | grep -q "mongodb-local"; then
        echo "✅ MongoDB container is already running"
        exit 0
    else
        echo "🔄 Starting existing MongoDB container..."
        docker start mongodb-local
        echo "✅ MongoDB container started"
        exit 0
    fi
fi

# create data directory
mkdir -p /tmp/mongodb-data

# start mongodb
docker run -d \
  --name mongodb-local \
  -p 27017:27017 \
  -v /tmp/mongodb-data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=123123 \
  -e MONGO_INITDB_DATABASE=cloud-edge-platform \
  mongo:6.0

echo "✅ MongoDB started on port 27017"
echo "📊 Connection string: mongodb://admin:123123@localhost:27017/cloud-edge-platform?authSource=admin" 