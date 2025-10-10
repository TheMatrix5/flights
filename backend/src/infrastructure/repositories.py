"""
Repository implementations using PostgreSQL
"""
from typing import List, Optional
from datetime import datetime
from ..domain.entities import Flight, FlightStats, AirlineStats, RouteStats
from ..domain.repositories import IFlightRepository, IStatsRepository
from .database import db


class FlightRepository(IFlightRepository):
    """PostgreSQL implementation of flight repository"""

    async def get_all(self, limit: int = 100, offset: int = 0) -> List[Flight]:
        """Get all flights with pagination"""
        query = """
            SELECT id, flight_number, origin, destination, departure_time,
                   arrival_time, airline, status, price, passengers,
                   created_at, updated_at
            FROM flights
            ORDER BY departure_time DESC
            LIMIT %s OFFSET %s
        """
        with db.get_cursor() as cursor:
            cursor.execute(query, (limit, offset))
            rows = cursor.fetchall()
            return [self._map_to_entity(row) for row in rows]

    async def get_by_id(self, flight_id: int) -> Optional[Flight]:
        """Get flight by ID"""
        query = """
            SELECT id, flight_number, origin, destination, departure_time,
                   arrival_time, airline, status, price, passengers,
                   created_at, updated_at
            FROM flights
            WHERE id = %s
        """
        with db.get_cursor() as cursor:
            cursor.execute(query, (flight_id,))
            row = cursor.fetchone()
            return self._map_to_entity(row) if row else None

    async def get_by_airline(self, airline: str) -> List[Flight]:
        """Get flights by airline"""
        query = """
            SELECT id, flight_number, origin, destination, departure_time,
                   arrival_time, airline, status, price, passengers,
                   created_at, updated_at
            FROM flights
            WHERE airline = %s
            ORDER BY departure_time DESC
        """
        with db.get_cursor() as cursor:
            cursor.execute(query, (airline,))
            rows = cursor.fetchall()
            return [self._map_to_entity(row) for row in rows]

    async def get_by_route(self, origin: str, destination: str) -> List[Flight]:
        """Get flights by route"""
        query = """
            SELECT id, flight_number, origin, destination, departure_time,
                   arrival_time, airline, status, price, passengers,
                   created_at, updated_at
            FROM flights
            WHERE origin = %s AND destination = %s
            ORDER BY departure_time DESC
        """
        with db.get_cursor() as cursor:
            cursor.execute(query, (origin, destination))
            rows = cursor.fetchall()
            return [self._map_to_entity(row) for row in rows]

    async def get_by_date_range(self, start_date: datetime, end_date: datetime) -> List[Flight]:
        """Get flights within date range"""
        query = """
            SELECT id, flight_number, origin, destination, departure_time,
                   arrival_time, airline, status, price, passengers,
                   created_at, updated_at
            FROM flights
            WHERE departure_time BETWEEN %s AND %s
            ORDER BY departure_time DESC
        """
        with db.get_cursor() as cursor:
            cursor.execute(query, (start_date, end_date))
            rows = cursor.fetchall()
            return [self._map_to_entity(row) for row in rows]

    async def create(self, flight: Flight) -> Flight:
        """Create new flight"""
        query = """
            INSERT INTO flights (flight_number, origin, destination, departure_time,
                               arrival_time, airline, status, price, passengers)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, flight_number, origin, destination, departure_time,
                      arrival_time, airline, status, price, passengers,
                      created_at, updated_at
        """
        with db.get_cursor() as cursor:
            cursor.execute(query, (
                flight.flight_number,
                flight.origin,
                flight.destination,
                flight.departure_time,
                flight.arrival_time,
                flight.airline,
                flight.status,
                flight.price,
                flight.passengers
            ))
            row = cursor.fetchone()
            return self._map_to_entity(row)

    async def update(self, flight: Flight) -> Flight:
        """Update existing flight"""
        query = """
            UPDATE flights
            SET flight_number = %s, origin = %s, destination = %s,
                departure_time = %s, arrival_time = %s, airline = %s,
                status = %s, price = %s, passengers = %s, updated_at = NOW()
            WHERE id = %s
            RETURNING id, flight_number, origin, destination, departure_time,
                      arrival_time, airline, status, price, passengers,
                      created_at, updated_at
        """
        with db.get_cursor() as cursor:
            cursor.execute(query, (
                flight.flight_number,
                flight.origin,
                flight.destination,
                flight.departure_time,
                flight.arrival_time,
                flight.airline,
                flight.status,
                flight.price,
                flight.passengers,
                flight.id
            ))
            row = cursor.fetchone()
            return self._map_to_entity(row)

    async def delete(self, flight_id: int) -> bool:
        """Delete flight"""
        query = "DELETE FROM flights WHERE id = %s"
        with db.get_cursor() as cursor:
            cursor.execute(query, (flight_id,))
            return cursor.rowcount > 0

    def _map_to_entity(self, row: dict) -> Flight:
        """Map database row to Flight entity"""
        return Flight(
            id=row['id'],
            flight_number=row['flight_number'],
            origin=row['origin'],
            destination=row['destination'],
            departure_time=row['departure_time'],
            arrival_time=row['arrival_time'],
            airline=row['airline'],
            status=row['status'],
            price=float(row['price']),
            passengers=row['passengers'],
            created_at=row.get('created_at'),
            updated_at=row.get('updated_at')
        )


class StatsRepository(IStatsRepository):
    """PostgreSQL implementation of statistics repository"""

    async def get_general_stats(self) -> FlightStats:
        """Get general flight statistics"""
        query = """
            SELECT
                COUNT(*) as total_flights,
                COALESCE(SUM(passengers), 0) as total_passengers,
                COALESCE(AVG(price), 0) as average_price,
                COALESCE(SUM(CASE WHEN status = 'on_time' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0) as on_time_percentage,
                COALESCE(SUM(CASE WHEN status = 'delayed' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0) as delayed_percentage,
                COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0) as cancelled_percentage
            FROM flights
        """
        with db.get_cursor() as cursor:
            cursor.execute(query)
            row = cursor.fetchone()
            return FlightStats(
                total_flights=row['total_flights'],
                total_passengers=row['total_passengers'],
                average_price=float(row['average_price']),
                on_time_percentage=float(row['on_time_percentage']),
                delayed_percentage=float(row['delayed_percentage']),
                cancelled_percentage=float(row['cancelled_percentage'])
            )

    async def get_airline_stats(self) -> List[AirlineStats]:
        """Get statistics per airline"""
        query = """
            SELECT
                airline,
                COUNT(*) as total_flights,
                COALESCE(SUM(passengers), 0) as total_passengers,
                COALESCE(AVG(price), 0) as average_price,
                COALESCE(SUM(CASE WHEN status = 'on_time' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0) as on_time_percentage
            FROM flights
            GROUP BY airline
            ORDER BY total_flights DESC
        """
        with db.get_cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()
            return [
                AirlineStats(
                    airline=row['airline'],
                    total_flights=row['total_flights'],
                    total_passengers=row['total_passengers'],
                    average_price=float(row['average_price']),
                    on_time_percentage=float(row['on_time_percentage'])
                )
                for row in rows
            ]

    async def get_route_stats(self) -> List[RouteStats]:
        """Get statistics per route"""
        query = """
            SELECT
                origin,
                destination,
                COUNT(*) as total_flights,
                COALESCE(AVG(price), 0) as average_price,
                COALESCE(SUM(passengers), 0) as total_passengers
            FROM flights
            GROUP BY origin, destination
            ORDER BY total_flights DESC
            LIMIT 20
        """
        with db.get_cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()
            return [
                RouteStats(
                    origin=row['origin'],
                    destination=row['destination'],
                    total_flights=row['total_flights'],
                    average_price=float(row['average_price']),
                    total_passengers=row['total_passengers']
                )
                for row in rows
            ]

    async def get_stats_by_date_range(self, start_date: datetime, end_date: datetime) -> FlightStats:
        """Get statistics for specific date range"""
        query = """
            SELECT
                COUNT(*) as total_flights,
                COALESCE(SUM(passengers), 0) as total_passengers,
                COALESCE(AVG(price), 0) as average_price,
                COALESCE(SUM(CASE WHEN status = 'on_time' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0) as on_time_percentage,
                COALESCE(SUM(CASE WHEN status = 'delayed' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0) as delayed_percentage,
                COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 0) as cancelled_percentage
            FROM flights
            WHERE departure_time BETWEEN %s AND %s
        """
        with db.get_cursor() as cursor:
            cursor.execute(query, (start_date, end_date))
            row = cursor.fetchone()
            return FlightStats(
                total_flights=row['total_flights'],
                total_passengers=row['total_passengers'],
                average_price=float(row['average_price']),
                on_time_percentage=float(row['on_time_percentage']),
                delayed_percentage=float(row['delayed_percentage']),
                cancelled_percentage=float(row['cancelled_percentage'])
            )
