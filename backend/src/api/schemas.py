"""
API Schemas (DTOs) for request/response
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class FlightResponse(BaseModel):
    """Flight response schema"""
    id: int
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


class FlightCreate(BaseModel):
    """Flight creation schema"""
    flight_number: str = Field(..., min_length=1)
    origin: str = Field(..., min_length=3, max_length=3)
    destination: str = Field(..., min_length=3, max_length=3)
    departure_time: datetime
    arrival_time: datetime
    airline: str = Field(..., min_length=1)
    status: str = Field(default="scheduled")
    price: float = Field(..., gt=0)
    passengers: int = Field(..., ge=0)


class FlightStatsResponse(BaseModel):
    """Flight statistics response"""
    total_flights: int
    total_passengers: int
    average_price: float
    on_time_percentage: float
    delayed_percentage: float
    cancelled_percentage: float


class AirlineStatsResponse(BaseModel):
    """Airline statistics response"""
    airline: str
    total_flights: int
    total_passengers: int
    average_price: float
    on_time_percentage: float


class RouteStatsResponse(BaseModel):
    """Route statistics response"""
    origin: str
    destination: str
    total_flights: int
    average_price: float
    total_passengers: int
