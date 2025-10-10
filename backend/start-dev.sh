#!/bin/bash

echo "========================================="
echo "Starting Flights Backend (Development)"
echo "========================================="
echo ""

# Check if PostgreSQL is running
echo "Checking PostgreSQL connection..."
if ! docker ps | grep -q "flights-postgres"; then
    echo "PostgreSQL container not running. Starting it now..."
    echo ""

    # Check if container exists but is stopped
    if docker ps -a | grep -q "flights-postgres"; then
        echo "Starting existing container..."
        docker start flights-postgres
    else
        echo "Creating and starting new PostgreSQL container..."
        docker run -d \
          --name flights-postgres \
          -e POSTGRES_PASSWORD=postgres \
          -e POSTGRES_DB=flights_db \
          -p 5433:5432 \
          -v "$(cd .. && pwd)/database/init.sql:/docker-entrypoint-initdb.d/init.sql" \
          postgres:16-alpine
    fi

    echo ""
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5

    # Wait for PostgreSQL to be healthy
    for i in {1..30}; do
        if docker exec flights-postgres pg_isready -U postgres > /dev/null 2>&1; then
            echo "✓ PostgreSQL is ready"
            break
        fi
        echo -n "."
        sleep 1
    done
    echo ""
else
    echo "✓ PostgreSQL is already running"
fi

echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Warning: .env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✓ Created .env file"
    else
        echo "Error: .env.example not found"
        exit 1
    fi
    echo ""
fi

# Find uv command (check common locations)
UV_CMD=""
if command -v uv &> /dev/null; then
    UV_CMD="uv"
elif [ -f "$HOME/.local/bin/uv" ]; then
    UV_CMD="$HOME/.local/bin/uv"
else
    echo "Error: 'uv' command not found. Please install uv first."
    echo "Visit: https://github.com/astral-sh/uv"
    exit 1
fi

# Check if virtual environment is set up
if [ ! -d .venv ]; then
    echo "Virtual environment not found. Running 'uv sync'..."
    $UV_CMD sync
    echo "✓ Dependencies installed"
    echo ""
else
    echo "✓ Virtual environment found"
    echo ""
fi

# Activate virtual environment
echo "Activating virtual environment..."
# Support both Unix (bin/) and Windows (Scripts/) venv structures
if [ -f .venv/Scripts/activate ]; then
    source .venv/Scripts/activate
elif [ -f .venv/bin/activate ]; then
    source .venv/bin/activate
else
    echo "Error: Could not find activation script in .venv"
    exit 1
fi

echo "✓ Virtual environment activated"
echo ""

# Start the backend server
echo "Starting backend server..."
echo "Backend will be available at:"
echo "  - API:          http://localhost:8000"
echo "  - API Docs:     http://localhost:8000/docs"
echo "  - Health Check: http://localhost:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================="
echo ""

# Use uvicorn from the activated venv
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
