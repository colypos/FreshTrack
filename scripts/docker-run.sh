#!/bin/bash

# FreshTrack Docker Run Script
# Usage: ./scripts/docker-run.sh [port]

set -e

# Default values
IMAGE_NAME="freshtrack-web:latest"
PORT=${1:-3000}
CONTAINER_NAME="freshtrack-app"

echo "🚀 Starting FreshTrack container on port $PORT"

# Stop and remove existing container if it exists
if docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "🛑 Stopping existing container..."
    docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
    docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true
fi

# Run the container
docker run \
  --detach \
  --name "$CONTAINER_NAME" \
  --port "$PORT:80" \
  --restart unless-stopped \
  --health-cmd="curl -f http://localhost/health || exit 1" \
  --health-interval=30s \
  --health-timeout=3s \
  --health-retries=3 \
  "$IMAGE_NAME"

echo "✅ Container started successfully!"
echo "🌐 Access the app at: http://localhost:$PORT"
echo "📊 Check container status: docker ps"
echo "📋 View logs: docker logs $CONTAINER_NAME"
echo "🛑 Stop container: docker stop $CONTAINER_NAME"