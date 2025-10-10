"""
API Routes - FastAPI endpoints
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List
from datetime import datetime
from .schemas import (
    FlightResponse,
    FlightCreate,
    FlightStatsResponse,
    AirlineStatsResponse,
    RouteStatsResponse
)
from ..application.services import FlightService, StatsService
from ..domain.entities import Flight


# Create routers
flights_router = APIRouter(prefix="/api/flights", tags=["flights"])
stats_router = APIRouter(prefix="/api/stats", tags=["statistics"])


def create_flight_routes(flight_service: FlightService):
    """Create flight routes with dependency injection"""

    @flights_router.get("", response_model=List[FlightResponse])
    async def get_flights(
        limit: int = Query(100, ge=1, le=1000),
        offset: int = Query(0, ge=0)
    ):
        """Get all flights with pagination"""
        flights = await flight_service.get_all_flights(limit, offset)
        return flights

    @flights_router.get("/{flight_id}", response_model=FlightResponse)
    async def get_flight(flight_id: int):
        """Get flight by ID"""
        flight = await flight_service.get_flight_by_id(flight_id)
        if not flight:
            raise HTTPException(status_code=404, detail="Flight not found")
        return flight

    @flights_router.get("/airline/{airline}", response_model=List[FlightResponse])
    async def get_flights_by_airline(airline: str):
        """Get flights by airline"""
        flights = await flight_service.get_flights_by_airline(airline)
        return flights

    @flights_router.get("/route/{origin}/{destination}", response_model=List[FlightResponse])
    async def get_flights_by_route(origin: str, destination: str):
        """Get flights by route"""
        flights = await flight_service.get_flights_by_route(origin, destination)
        return flights

    @flights_router.post("", response_model=FlightResponse, status_code=201)
    async def create_flight(flight_data: FlightCreate):
        """Create new flight"""
        flight = Flight(
            id=None,
            flight_number=flight_data.flight_number,
            origin=flight_data.origin,
            destination=flight_data.destination,
            departure_time=flight_data.departure_time,
            arrival_time=flight_data.arrival_time,
            airline=flight_data.airline,
            status=flight_data.status,
            price=flight_data.price,
            passengers=flight_data.passengers
        )
        created_flight = await flight_service.create_flight(flight)
        return created_flight

    return flights_router


def create_stats_routes(stats_service: StatsService):
    """Create statistics routes with dependency injection"""

    @stats_router.get("/general", response_model=FlightStatsResponse)
    async def get_general_stats():
        """Get general flight statistics"""
        stats = await stats_service.get_general_statistics()
        return stats

    @stats_router.get("/airlines", response_model=List[AirlineStatsResponse])
    async def get_airline_stats():
        """Get statistics per airline"""
        stats = await stats_service.get_airline_statistics()
        return stats

    @stats_router.get("/routes", response_model=List[RouteStatsResponse])
    async def get_route_stats():
        """Get statistics per route"""
        stats = await stats_service.get_route_statistics()
        return stats

    @stats_router.get("/date-range", response_model=FlightStatsResponse)
    async def get_stats_by_date_range(
        start_date: datetime = Query(..., description="Start date in ISO format"),
        end_date: datetime = Query(..., description="End date in ISO format")
    ):
        """Get statistics for specific date range"""
        stats = await stats_service.get_statistics_by_date_range(start_date, end_date)
        return stats

    return stats_router
