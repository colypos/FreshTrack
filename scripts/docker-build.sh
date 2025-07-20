#!/bin/bash

# FreshTrack Docker Build Script
# Usage: ./scripts/docker-build.sh [tag]

set -e

# Default values
IMAGE_NAME="freshtrack-web"
TAG=${1:-"latest"}
FULL_IMAGE_NAME="$IMAGE_NAME:$TAG"

echo "🚀 Building FreshTrack Docker Image: $FULL_IMAGE_NAME"

# Build the Docker image
docker build \
  --tag "$FULL_IMAGE_NAME" \
  --build-arg NODE_ENV=production \
  --progress=plain \
  .

echo "✅ Docker image built successfully: $FULL_IMAGE_NAME"

# Show image size
echo "📦 Image size:"
docker images "$IMAGE_NAME" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

echo ""
echo "🔧 To run the container:"
echo "docker run -p 3000:80 $FULL_IMAGE_NAME"
echo ""
echo "🐳 Or use docker-compose:"
echo "docker-compose up -d"