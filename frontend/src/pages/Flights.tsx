import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { api } from '../services/api';
import type { Flight } from '../types';
import { Plane, Filter, X } from 'lucide-react';

export default function Flights() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAirline, setSelectedAirline] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFlights() {
      try {
        const data = await api.getFlights();
        setFlights(data);
        setFilteredFlights(data);
      } catch (error) {
        console.error('Error fetching flights:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFlights();
  }, []);

  useEffect(() => {
    let filtered = [...flights];

    if (selectedAirline) {
      filtered = filtered.filter(f => f.airline === selectedAirline);
    }

    if (selectedStatus) {
      filtered = filtered.filter(f => f.status === selectedStatus);
    }

    if (selectedRoute) {
      const [origin, destination] = selectedRoute.split('-');
      filtered = filtered.filter(f => f.origin === origin && f.destination === destination);
    }

    setFilteredFlights(filtered);
  }, [selectedAirline, selectedStatus, selectedRoute, flights]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const getStatusVariant = (status: string): "success" | "warning" | "destructive" | "default" => {
    switch (status) {
      case 'on_time':
        return 'success';
      case 'delayed':
        return 'warning';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const airlines = Array.from(new Set(flights.map(f => f.airline))).sort();
  const statuses = Array.from(new Set(flights.map(f => f.status))).sort();
  const routes = Array.from(new Set(flights.map(f => `${f.origin}-${f.destination}`))).sort();

  const clearAllFilters = () => {
    setSelectedAirline(null);
    setSelectedStatus(null);
    setSelectedRoute(null);
  };

  const hasActiveFilters = selectedAirline || selectedStatus || selectedRoute;

  return (
    <div className="p-8 space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">All Flights</h1>
            <p className="text-gray-500">
              Showing {filteredFlights.length} of {flights.length} flights
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Plane className="h-6 w-6" />
            <span className="text-2xl font-bold">{filteredFlights.length}</span>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">Active filters:</span>
            {selectedAirline && (
              <Badge
                variant="default"
                className="cursor-pointer hover:bg-blue-600"
                onClick={() => setSelectedAirline(null)}
              >
                Airline: {selectedAirline} ✕
              </Badge>
            )}
            {selectedStatus && (
              <Badge
                variant={getStatusVariant(selectedStatus)}
                className="cursor-pointer"
                onClick={() => setSelectedStatus(null)}
              >
                Status: {selectedStatus.replace('_', ' ')} ✕
              </Badge>
            )}
            {selectedRoute && (
              <Badge
                variant="default"
                className="cursor-pointer hover:bg-blue-600"
                onClick={() => setSelectedRoute(null)}
              >
                Route: {selectedRoute} ✕
              </Badge>
            )}
            <Badge
              variant="destructive"
              className="cursor-pointer"
              onClick={clearAllFilters}
            >
              Clear All ✕
            </Badge>
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription>Click to filter flights by airline, status, or route</CardDescription>
            </div>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Airline Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Airlines</h3>
            <div className="flex flex-wrap gap-2">
              {airlines.map(airline => (
                <Badge
                  key={airline}
                  variant={selectedAirline === airline ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    selectedAirline === airline
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-2 border-gray-400 dark:border-gray-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedAirline(selectedAirline === airline ? null : airline)}
                >
                  {airline}
                  {selectedAirline === airline && ' ✓'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Status</h3>
            <div className="flex flex-wrap gap-2">
              {statuses.map(status => (
                <Badge
                  key={status}
                  variant={selectedStatus === status ? 'secondary' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    selectedStatus === status
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-2 border-gray-400 dark:border-gray-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                >
                  {status.replace('_', ' ')}
                  {selectedStatus === status && ' ✓'}
                </Badge>
              ))}
            </div>
          </div>

          {/* Route Filter */}
          <div>
            <h3 className="text-sm font-medium mb-2">Routes (Top 10)</h3>
            <div className="flex flex-wrap gap-2">
              {routes.slice(0, 10).map(route => (
                <Badge
                  key={route}
                  variant={selectedRoute === route ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    selectedRoute === route
                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-2 border-gray-400 dark:border-gray-500'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedRoute(selectedRoute === route ? null : route)}
                >
                  {route}
                  {selectedRoute === route && ' ✓'}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flights Table */}
      <Card>
        <CardHeader>
          <CardTitle>Flight List</CardTitle>
          <CardDescription>
            {hasActiveFilters ? 'Filtered flights' : 'All flights with details'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFlights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No flights match the selected filters
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Flight #</TableHead>
                  <TableHead>Airline</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Passengers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFlights.map((flight) => (
                  <TableRow key={flight.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <TableCell className="font-medium">{flight.flight_number}</TableCell>
                    <TableCell>{flight.airline}</TableCell>
                    <TableCell>
                      <span className="font-mono">{flight.origin}</span>
                      {' → '}
                      <span className="font-mono">{flight.destination}</span>
                    </TableCell>
                    <TableCell className="text-sm">{formatDateTime(flight.departure_time)}</TableCell>
                    <TableCell className="text-sm">{formatDateTime(flight.arrival_time)}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getStatusVariant(flight.status)}>
                        {flight.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">${flight.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{flight.passengers}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
