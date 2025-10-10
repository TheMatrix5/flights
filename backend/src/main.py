"""
Main FastAPI application with Onion Architecture
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Load environment variables
load_dotenv()

# Import infrastructure
from .infrastructure.database import db
from .infrastructure.repositories import FlightRepository, StatsRepository

# Import application services
from .application.services import FlightService, StatsService

# Import API routes
from .api.routes import create_flight_routes, create_stats_routes


# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan"""
    # Startup
    print("Starting application...")

    # Initialize database
    db.initialize(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "5432")),
        database=os.getenv("DB_NAME", "flights_db"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres")
    )

    print("Database initialized")

    yield

    # Shutdown
    print("Shutting down application...")
    db.close()
    print("Database connections closed")


# Create FastAPI application
app = FastAPI(
    title="Flights Dashboard API",
    description="API for flights dashboard with Onion Architecture",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Initialize repositories
flight_repo = FlightRepository()
stats_repo = StatsRepository()

# Initialize services
flight_service = FlightService(flight_repo)
stats_service = StatsService(stats_repo)

# Create and include routers
flights_router = create_flight_routes(flight_service)
stats_router = create_stats_routes(stats_service)

app.include_router(flights_router)
app.include_router(stats_router)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Flights Dashboard API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
