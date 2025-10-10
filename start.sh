#!/bin/bash

echo "Starting Flights Dashboard Application..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Stop and remove existing containers
echo "Cleaning up existing containers..."
docker-compose down

# Build and start all services
echo ""
echo "Building and starting all services..."
docker-compose up --build -d

# Wait for services to be healthy
echo ""
echo "Waiting for services to be ready..."
sleep 10

# Check if services are running
echo ""
echo "Checking services status..."
docker-compose ps

echo ""
echo "========================================="
echo "Flights Dashboard is ready!"
echo "========================================="
echo ""
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:8000"
echo "API Docs:  http://localhost:8000/docs"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop:      docker-compose down"
echo ""
