"""
Domain Entities - Core business objects
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class Flight:
    """Flight entity representing a flight record"""
    id: Optional[int]
    flight_number: str
    origin: str
    destination: str
    departure_time: datetime
    arrival_time: datetime
    airline: str
    status: str
    price: float
    passengers: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


@dataclass
class FlightStats:
    """Aggregated flight statistics"""
    total_flights: int
    total_passengers: int
    average_price: float
    on_time_percentage: float
    delayed_percentage: float
    cancelled_percentage: float


@dataclass
class AirlineStats:
    """Statistics per airline"""
    airline: str
    total_flights: int
    total_passengers: int
    average_price: float
    on_time_percentage: float


@dataclass
class RouteStats:
    """Statistics per route"""
    origin: str
    destination: str
    total_flights: int
    average_price: float
    total_passengers: int
