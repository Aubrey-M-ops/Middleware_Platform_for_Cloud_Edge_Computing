#!/bin/zsh

echo "🚀 Starting MongoDB locally..."

# check if mongodb is already running
if pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is already running"
    exit 0
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