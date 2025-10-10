"""
Domain Repository Interfaces - Contracts for data access
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime
from .entities import Flight, FlightStats, AirlineStats, RouteStats


class IFlightRepository(ABC):
    """Interface for flight data access"""

    @abstractmethod
    async def get_all(self, limit: int = 100, offset: int = 0) -> List[Flight]:
        """Get all flights with pagination"""
        pass

    @abstractmethod
    async def get_by_id(self, flight_id: int) -> Optional[Flight]:
        """Get flight by ID"""
        pass

    @abstractmethod
    async def get_by_airline(self, airline: str) -> List[Flight]:
        """Get flights by airline"""
        pass

    @abstractmethod
    async def get_by_route(self, origin: str, destination: str) -> List[Flight]:
        """Get flights by route"""
        pass

    @abstractmethod
    async def get_by_date_range(self, start_date: datetime, end_date: datetime) -> List[Flight]:
        """Get flights within date range"""
        pass

    @abstractmethod
    async def create(self, flight: Flight) -> Flight:
        """Create new flight"""
        pass

    @abstractmethod
    async def update(self, flight: Flight) -> Flight:
        """Update existing flight"""
        pass

    @abstractmethod
    async def delete(self, flight_id: int) -> bool:
        """Delete flight"""
        pass


class IStatsRepository(ABC):
    """Interface for statistics data access"""

    @abstractmethod
    async def get_general_stats(self) -> FlightStats:
        """Get general flight statistics"""
        pass

    @abstractmethod
    async def get_airline_stats(self) -> List[AirlineStats]:
        """Get statistics per airline"""
        pass

    @abstractmethod
    async def get_route_stats(self) -> List[RouteStats]:
        """Get statistics per route"""
        pass

    @abstractmethod
    async def get_stats_by_date_range(self, start_date: datetime, end_date: datetime) -> FlightStats:
        """Get statistics for specific date range"""
        pass
