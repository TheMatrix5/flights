"""
Application Services - Use Cases
"""
from typing import List, Optional
from datetime import datetime
from ..domain.entities import Flight, FlightStats, AirlineStats, RouteStats
from ..domain.repositories import IFlightRepository, IStatsRepository


class FlightService:
    """Service for flight operations"""

    def __init__(self, flight_repo: IFlightRepository):
        self.flight_repo = flight_repo

    async def get_all_flights(self, limit: int = 100, offset: int = 0) -> List[Flight]:
        """Get all flights with pagination"""
        return await self.flight_repo.get_all(limit, offset)

    async def get_flight_by_id(self, flight_id: int) -> Optional[Flight]:
        """Get flight by ID"""
        return await self.flight_repo.get_by_id(flight_id)

    async def get_flights_by_airline(self, airline: str) -> List[Flight]:
        """Get flights by airline"""
        return await self.flight_repo.get_by_airline(airline)

    async def get_flights_by_route(self, origin: str, destination: str) -> List[Flight]:
        """Get flights by route"""
        return await self.flight_repo.get_by_route(origin, destination)

    async def get_flights_by_date_range(self, start_date: datetime, end_date: datetime) -> List[Flight]:
        """Get flights within date range"""
        return await self.flight_repo.get_by_date_range(start_date, end_date)

    async def create_flight(self, flight: Flight) -> Flight:
        """Create new flight"""
        # Business logic validation could go here
        return await self.flight_repo.create(flight)

    async def update_flight(self, flight: Flight) -> Flight:
        """Update existing flight"""
        # Business logic validation could go here
        existing = await self.flight_repo.get_by_id(flight.id)
        if not existing:
            raise ValueError(f"Flight with id {flight.id} not found")
        return await self.flight_repo.update(flight)

    async def delete_flight(self, flight_id: int) -> bool:
        """Delete flight"""
        return await self.flight_repo.delete(flight_id)


class StatsService:
    """Service for statistics operations"""

    def __init__(self, stats_repo: IStatsRepository):
        self.stats_repo = stats_repo

    async def get_general_statistics(self) -> FlightStats:
        """Get general flight statistics"""
        return await self.stats_repo.get_general_stats()

    async def get_airline_statistics(self) -> List[AirlineStats]:
        """Get statistics per airline"""
        return await self.stats_repo.get_airline_stats()

    async def get_route_statistics(self) -> List[RouteStats]:
        """Get statistics per route"""
        return await self.stats_repo.get_route_stats()

    async def get_statistics_by_date_range(
        self, start_date: datetime, end_date: datetime
    ) -> FlightStats:
        """Get statistics for specific date range"""
        return await self.stats_repo.get_stats_by_date_range(start_date, end_date)
