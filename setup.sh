#!/bin/bash

echo "🚀 Setting up Project Learning Platform..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose and try again."
    exit 1
fi

echo "✅ Docker is running"

# Create frontend environment file if it doesn't exist
if [ ! -f "frontend/.env.local" ]; then
    echo "📝 Creating frontend environment file..."
    echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1" > frontend/.env.local
fi

# Start the backend services
echo "🐳 Starting backend services (PostgreSQL, Redis, FastAPI)..."
docker compose up -d postgres redis backend

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if backend is responding
echo "🔍 Checking if backend is ready..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend is running at http://localhost:8000"
    echo "📚 API documentation: http://localhost:8000/docs"
else
    echo "❌ Backend is not responding. Check Docker logs with: docker compose logs backend"
    exit 1
fi

echo ""
echo "🎉 Setup complete! You can now:"
echo "1. Start the frontend: cd frontend && npm install && npm run dev"
echo "2. Access the app at http://localhost:3000"
echo "3. View API docs at http://localhost:8000/docs"
echo ""
echo "To stop all services: docker compose down"
echo "To view logs: docker compose logs -f"
