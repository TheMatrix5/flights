-- Database is created via POSTGRES_DB environment variable in docker-compose.yml
-- We're already connected to flights_db

-- Create flights table
CREATE TABLE IF NOT EXISTS flights (
    id SERIAL PRIMARY KEY,
    flight_number VARCHAR(20) NOT NULL,
    origin VARCHAR(3) NOT NULL,
    destination VARCHAR(3) NOT NULL,
    departure_time TIMESTAMP NOT NULL,
    arrival_time TIMESTAMP NOT NULL,
    airline VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    price DECIMAL(10, 2) NOT NULL,
    passengers INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_flights_airline ON flights(airline);
CREATE INDEX idx_flights_origin ON flights(origin);
CREATE INDEX idx_flights_destination ON flights(destination);
CREATE INDEX idx_flights_departure_time ON flights(departure_time);
CREATE INDEX idx_flights_status ON flights(status);

-- Insert sample data
INSERT INTO flights (flight_number, origin, destination, departure_time, arrival_time, airline, status, price, passengers) VALUES
('AA101', 'JFK', 'LAX', '2024-01-15 08:00:00', '2024-01-15 11:30:00', 'American Airlines', 'on_time', 450.00, 180),
('UA202', 'LAX', 'ORD', '2024-01-15 09:00:00', '2024-01-15 15:00:00', 'United Airlines', 'on_time', 380.00, 150),
('DL303', 'ATL', 'MIA', '2024-01-15 10:00:00', '2024-01-15 12:30:00', 'Delta Airlines', 'delayed', 280.00, 120),
('SW404', 'DEN', 'PHX', '2024-01-15 11:00:00', '2024-01-15 13:00:00', 'Southwest Airlines', 'on_time', 180.00, 100),
('AA505', 'BOS', 'SFO', '2024-01-15 12:00:00', '2024-01-15 15:30:00', 'American Airlines', 'on_time', 520.00, 190),
('UA606', 'SEA', 'NYC', '2024-01-15 13:00:00', '2024-01-15 21:00:00', 'United Airlines', 'on_time', 580.00, 200),
('DL707', 'MIA', 'ATL', '2024-01-15 14:00:00', '2024-01-15 16:30:00', 'Delta Airlines', 'on_time', 250.00, 140),
('SW808', 'LAS', 'LAX', '2024-01-15 15:00:00', '2024-01-15 16:15:00', 'Southwest Airlines', 'delayed', 120.00, 90),
('AA909', 'DFW', 'MIA', '2024-01-15 16:00:00', '2024-01-15 20:00:00', 'American Airlines', 'on_time', 410.00, 175),
('UA010', 'SFO', 'DEN', '2024-01-15 17:00:00', '2024-01-15 20:30:00', 'United Airlines', 'cancelled', 340.00, 0),
('DL111', 'NYC', 'LAX', '2024-01-16 08:00:00', '2024-01-16 11:30:00', 'Delta Airlines', 'on_time', 490.00, 185),
('SW212', 'PHX', 'SAN', '2024-01-16 09:00:00', '2024-01-16 10:00:00', 'Southwest Airlines', 'on_time', 95.00, 85),
('AA313', 'LAX', 'JFK', '2024-01-16 10:00:00', '2024-01-16 18:30:00', 'American Airlines', 'on_time', 460.00, 195),
('UA414', 'ORD', 'SFO', '2024-01-16 11:00:00', '2024-01-16 13:30:00', 'United Airlines', 'delayed', 420.00, 160),
('DL515', 'ATL', 'LAX', '2024-01-16 12:00:00', '2024-01-16 14:30:00', 'Delta Airlines', 'on_time', 440.00, 170),
('SW616', 'SAN', 'LAS', '2024-01-16 13:00:00', '2024-01-16 14:15:00', 'Southwest Airlines', 'on_time', 110.00, 95),
('AA717', 'MIA', 'BOS', '2024-01-16 14:00:00', '2024-01-16 17:30:00', 'American Airlines', 'on_time', 380.00, 165),
('UA818', 'DEN', 'SEA', '2024-01-16 15:00:00', '2024-01-16 17:00:00', 'United Airlines', 'on_time', 290.00, 145),
('DL919', 'LAX', 'ATL', '2024-01-16 16:00:00', '2024-01-16 23:30:00', 'Delta Airlines', 'delayed', 430.00, 180),
('SW020', 'LAS', 'PHX', '2024-01-16 17:00:00', '2024-01-16 18:15:00', 'Southwest Airlines', 'on_time', 105.00, 88),
('AA121', 'JFK', 'MIA', '2024-01-17 08:00:00', '2024-01-17 11:00:00', 'American Airlines', 'on_time', 320.00, 155),
('UA222', 'SFO', 'LAX', '2024-01-17 09:00:00', '2024-01-17 10:30:00', 'United Airlines', 'on_time', 180.00, 130),
('DL323', 'ATL', 'ORD', '2024-01-17 10:00:00', '2024-01-17 12:00:00', 'Delta Airlines', 'on_time', 310.00, 150),
('SW424', 'PHX', 'DEN', '2024-01-17 11:00:00', '2024-01-17 13:00:00', 'Southwest Airlines', 'cancelled', 200.00, 0),
('AA525', 'BOS', 'ATL', '2024-01-17 12:00:00', '2024-01-17 15:00:00', 'American Airlines', 'on_time', 290.00, 160),
('UA626', 'LAX', 'SEA', '2024-01-17 13:00:00', '2024-01-17 15:30:00', 'United Airlines', 'on_time', 250.00, 140),
('DL727', 'MIA', 'NYC', '2024-01-17 14:00:00', '2024-01-17 17:00:00', 'Delta Airlines', 'delayed', 340.00, 165),
('SW828', 'LAS', 'SAN', '2024-01-17 15:00:00', '2024-01-17 16:15:00', 'Southwest Airlines', 'on_time', 115.00, 92),
('AA929', 'DFW', 'LAX', '2024-01-17 16:00:00', '2024-01-17 18:00:00', 'American Airlines', 'on_time', 330.00, 175),
('UA030', 'ORD', 'BOS', '2024-01-17 17:00:00', '2024-01-17 20:30:00', 'United Airlines', 'on_time', 360.00, 155),
('DL131', 'ATL', 'DEN', '2024-01-18 08:00:00', '2024-01-18 10:00:00', 'Delta Airlines', 'on_time', 320.00, 150),
('SW232', 'PHX', 'LAX', '2024-01-18 09:00:00', '2024-01-18 10:15:00', 'Southwest Airlines', 'on_time', 125.00, 98),
('AA333', 'JFK', 'SFO', '2024-01-18 10:00:00', '2024-01-18 13:30:00', 'American Airlines', 'delayed', 510.00, 195),
('UA434', 'SEA', 'LAX', '2024-01-18 11:00:00', '2024-01-18 13:30:00', 'United Airlines', 'on_time', 240.00, 135),
('DL535', 'MIA', 'LAX', '2024-01-18 12:00:00', '2024-01-18 15:00:00', 'Delta Airlines', 'on_time', 480.00, 185),
('SW636', 'SAN', 'PHX', '2024-01-18 13:00:00', '2024-01-18 14:00:00', 'Southwest Airlines', 'on_time', 95.00, 82),
('AA737', 'LAX', 'DFW', '2024-01-18 14:00:00', '2024-01-18 19:30:00', 'American Airlines', 'on_time', 350.00, 170),
('UA838', 'DEN', 'ORD', '2024-01-18 15:00:00', '2024-01-18 18:30:00', 'United Airlines', 'delayed', 280.00, 145),
('DL939', 'ATL', 'SFO', '2024-01-18 16:00:00', '2024-01-18 18:30:00', 'Delta Airlines', 'on_time', 470.00, 190),
('SW040', 'LAS', 'DEN', '2024-01-18 17:00:00', '2024-01-18 19:00:00', 'Southwest Airlines', 'on_time', 155.00, 102);

GRANT ALL PRIVILEGES ON DATABASE flights_db TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
