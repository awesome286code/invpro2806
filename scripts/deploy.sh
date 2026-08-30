#!/bin/bash

# Quick Deployment Script
# Use this for manual deployments or troubleshooting

set -e

echo "🚀 Deploying Investment V2..."

# Pull latest code
echo "📦 Pulling latest code..."
git pull origin main

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build new images
echo "🔨 Building Docker images..."
docker-compose build --no-cache

# Start containers
echo "▶️  Starting containers..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services to start..."
sleep 15

# Check status
echo "📊 Checking container status..."
docker-compose ps

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=50

# Cleanup
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment complete!"
echo ""
echo "Check application at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
