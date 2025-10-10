export interface Flight {
  id: number;
  flight_number: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  airline: string;
  status: string;
  price: number;
  passengers: number;
  created_at?: string;
  updated_at?: string;
}

export interface FlightStats {
  total_flights: number;
  total_passengers: number;
  average_price: number;
  on_time_percentage: number;
  delayed_percentage: number;
  cancelled_percentage: number;
}

export interface AirlineStats {
  airline: string;
  total_flights: number;
  total_passengers: number;
  average_price: number;
  on_time_percentage: number;
}

export interface RouteStats {
  origin: string;
  destination: string;
  total_flights: number;
  average_price: number;
  total_passengers: number;
}
