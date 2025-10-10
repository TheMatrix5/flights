import type { Flight, FlightStats, AirlineStats, RouteStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  // Flights
  async getFlights(limit = 100, offset = 0): Promise<Flight[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/flights?limit=${limit}&offset=${offset}`
    );
    if (!response.ok) throw new Error('Failed to fetch flights');
    return response.json();
  },

  async getFlightById(id: number): Promise<Flight> {
    const response = await fetch(`${API_BASE_URL}/api/flights/${id}`);
    if (!response.ok) throw new Error('Failed to fetch flight');
    return response.json();
  },

  async getFlightsByAirline(airline: string): Promise<Flight[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/flights/airline/${encodeURIComponent(airline)}`
    );
    if (!response.ok) throw new Error('Failed to fetch flights by airline');
    return response.json();
  },

  async getFlightsByRoute(origin: string, destination: string): Promise<Flight[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/flights/route/${origin}/${destination}`
    );
    if (!response.ok) throw new Error('Failed to fetch flights by route');
    return response.json();
  },

  // Statistics
  async getGeneralStats(): Promise<FlightStats> {
    const response = await fetch(`${API_BASE_URL}/api/stats/general`);
    if (!response.ok) throw new Error('Failed to fetch general stats');
    return response.json();
  },

  async getAirlineStats(): Promise<AirlineStats[]> {
    const response = await fetch(`${API_BASE_URL}/api/stats/airlines`);
    if (!response.ok) throw new Error('Failed to fetch airline stats');
    return response.json();
  },

  async getRouteStats(): Promise<RouteStats[]> {
    const response = await fetch(`${API_BASE_URL}/api/stats/routes`);
    if (!response.ok) throw new Error('Failed to fetch route stats');
    return response.json();
  },
};
