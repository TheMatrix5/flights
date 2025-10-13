import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, LabelList, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from '../components/ui/chart';
import { api } from '../services/api';
import type { Flight, FlightStats, AirlineStats, RouteStats } from '../types';
import { Plane, Users, DollarSign, Clock, Filter, X } from 'lucide-react';

// Chart configurations with semantic colors for status
const statusChartConfig = {
  "On Time": {
    label: "On Time",
    color: "hsl(var(--chart-success))",  // Green
  },
  "Delayed": {
    label: "Delayed",
    color: "hsl(var(--chart-warning))",  // Yellow/Orange
  },
  "Cancelled": {
    label: "Cancelled",
    color: "hsl(var(--chart-danger))",  // Red
  },
} satisfies ChartConfig;

const airlinesChartConfig = {
  total_passengers: {
    label: "Passengers",
    color: "hsl(var(--chart-2))",  // Green
  },
} satisfies ChartConfig;

const routesChartConfig = {
  total_passengers: {
    label: "Passengers",
    color: "hsl(var(--chart-4))",  // Purple
  },
} satisfies ChartConfig;

export default function Overview() {
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedAirline, setSelectedAirline] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function fetchFlights() {
      try {
        const flights = await api.getFlights(1000, 0); // Get all flights
        setAllFlights(flights);
      } catch (error) {
        console.error('Error fetching flights:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchFlights();
  }, []);

  // Filter flights based on selections
  const filteredFlights = useMemo(() => {
    let filtered = allFlights;

    if (selectedStatus) {
      filtered = filtered.filter(f => {
        if (selectedStatus === 'On Time') return f.status === 'on_time';
        if (selectedStatus === 'Delayed') return f.status === 'delayed';
        if (selectedStatus === 'Cancelled') return f.status === 'cancelled';
        return true;
      });
    }

    if (selectedAirline) {
      filtered = filtered.filter(f => f.airline === selectedAirline);
    }

    if (selectedRoute) {
      const [origin, dest] = selectedRoute.split('-');
      filtered = filtered.filter(f => f.origin === origin && f.destination === dest);
    }

    return filtered;
  }, [allFlights, selectedStatus, selectedAirline, selectedRoute]);

  // Calculate stats from filtered flights
  const stats = useMemo<FlightStats>(() => {
    const totalFlights = filteredFlights.length;
    const totalPassengers = filteredFlights.reduce((sum, f) => sum + f.passengers, 0);
    const averagePrice = totalFlights > 0
      ? filteredFlights.reduce((sum, f) => sum + f.price, 0) / totalFlights
      : 0;

    const onTimeCount = filteredFlights.filter(f => f.status === 'on_time').length;
    const delayedCount = filteredFlights.filter(f => f.status === 'delayed').length;
    const cancelledCount = filteredFlights.filter(f => f.status === 'cancelled').length;

    return {
      total_flights: totalFlights,
      total_passengers: totalPassengers,
      average_price: averagePrice,
      on_time_percentage: totalFlights > 0 ? (onTimeCount / totalFlights) * 100 : 0,
      delayed_percentage: totalFlights > 0 ? (delayedCount / totalFlights) * 100 : 0,
      cancelled_percentage: totalFlights > 0 ? (cancelledCount / totalFlights) * 100 : 0,
    };
  }, [filteredFlights]);

  // Calculate airline stats from filtered flights
  const airlineStats = useMemo<AirlineStats[]>(() => {
    const airlineMap = new Map<string, Flight[]>();

    filteredFlights.forEach(flight => {
      if (!airlineMap.has(flight.airline)) {
        airlineMap.set(flight.airline, []);
      }
      airlineMap.get(flight.airline)!.push(flight);
    });

    return Array.from(airlineMap.entries()).map(([airline, flights]) => {
      const totalFlights = flights.length;
      const totalPassengers = flights.reduce((sum, f) => sum + f.passengers, 0);
      const averagePrice = totalFlights > 0
        ? flights.reduce((sum, f) => sum + f.price, 0) / totalFlights
        : 0;
      const onTimeCount = flights.filter(f => f.status === 'on_time').length;

      return {
        airline,
        total_flights: totalFlights,
        total_passengers: totalPassengers,
        average_price: averagePrice,
        on_time_percentage: totalFlights > 0 ? (onTimeCount / totalFlights) * 100 : 0,
      };
    });
  }, [filteredFlights]);

  // Calculate route stats from filtered flights
  const routeStats = useMemo<RouteStats[]>(() => {
    const routeMap = new Map<string, Flight[]>();

    filteredFlights.forEach(flight => {
      const routeKey = `${flight.origin}-${flight.destination}`;
      if (!routeMap.has(routeKey)) {
        routeMap.set(routeKey, []);
      }
      routeMap.get(routeKey)!.push(flight);
    });

    return Array.from(routeMap.entries()).map(([route, flights]) => {
      const [origin, destination] = route.split('-');
      const totalFlights = flights.length;
      const totalPassengers = flights.reduce((sum, f) => sum + f.passengers, 0);
      const averagePrice = totalFlights > 0
        ? flights.reduce((sum, f) => sum + f.price, 0) / totalFlights
        : 0;

      return {
        origin,
        destination,
        total_flights: totalFlights,
        average_price: averagePrice,
        total_passengers: totalPassengers,
      };
    });
  }, [filteredFlights]);

  // Get unique airlines and routes for filters (MUST be before early return)
  const uniqueAirlines = useMemo(() => {
    return Array.from(new Set(allFlights.map(f => f.airline))).sort();
  }, [allFlights]);

  const uniqueRoutes = useMemo(() => {
    return Array.from(new Set(allFlights.map(f => `${f.origin}-${f.destination}`))).sort();
  }, [allFlights]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const statusData = [
    { name: 'On Time', value: stats.on_time_percentage, count: Math.round(stats.total_flights * stats.on_time_percentage / 100) },
    { name: 'Delayed', value: stats.delayed_percentage, count: Math.round(stats.total_flights * stats.delayed_percentage / 100) },
    { name: 'Cancelled', value: stats.cancelled_percentage, count: Math.round(stats.total_flights * stats.cancelled_percentage / 100) },
  ];

  const handlePieClick = (data: any) => {
    if (data && data.name) {
      setSelectedStatus(selectedStatus === data.name ? null : data.name);
    }
  };

  const handleAirlineClick = (data: any) => {
    if (data && data.airline) {
      setSelectedAirline(selectedAirline === data.airline ? null : data.airline);
    }
  };

  const handleRouteClick = (data: any) => {
    if (data && data.route) {
      setSelectedRoute(selectedRoute === data.route ? null : data.route);
    }
  };

  const clearAllFilters = () => {
    setSelectedStatus(null);
    setSelectedAirline(null);
    setSelectedRoute(null);
  };

  const getPieOpacity = (name: string) => {
    if (!selectedStatus) return 1;
    return name === selectedStatus ? 1 : 0.3;
  };

  const getAirlineOpacity = (airline: string) => {
    if (!selectedAirline) return 1;
    return airline === selectedAirline ? 1 : 0.3;
  };

  const getRouteOpacity = (route: string) => {
    if (!selectedRoute) return 1;
    return route === selectedRoute ? 1 : 0.3;
  };

  // Top 5 airlines by passengers and routes by passengers
  const topAirlines = airlineStats
    .sort((a, b) => b.total_passengers - a.total_passengers)
    .slice(0, 5);

  const topRoutes = routeStats
    .sort((a, b) => b.total_passengers - a.total_passengers)
    .slice(0, 5)
    .map(r => ({
      ...r,
      route: `${r.origin}-${r.destination}`
    }));

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Flights Dashboard</h1>
        <p className="text-gray-500">Overview of flight statistics and metrics - Click any chart to filter</p>
      </div>

      {/* Horizontal Filters Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-6 flex-wrap">
            {/* Status Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                <Filter className="h-3 w-3" />
                Status
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['On Time', 'Delayed', 'Cancelled'].map(status => (
                  <Badge
                    key={status}
                    variant={selectedStatus === status ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs transition-all ${
                      selectedStatus === status
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                  >
                    {status}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Airline Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs font-medium text-gray-500 mb-2 block">Airlines</label>
              <div className="flex flex-wrap gap-1.5">
                {uniqueAirlines.slice(0, 4).map(airline => (
                  <Badge
                    key={airline}
                    variant={selectedAirline === airline ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs transition-all ${
                      selectedAirline === airline
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedAirline(selectedAirline === airline ? null : airline)}
                  >
                    {airline.split(' ')[0]}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Route Filter */}
            <div className="flex-1 min-w-[250px]">
              <label className="text-xs font-medium text-gray-500 mb-2 block">Top Routes</label>
              <div className="flex flex-wrap gap-1.5">
                {topRoutes.slice(0, 6).map(route => (
                  <Badge
                    key={route.route}
                    variant={selectedRoute === route.route ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs transition-all ${
                      selectedRoute === route.route
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedRoute(selectedRoute === route.route ? null : route.route)}
                  >
                    {route.route}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Clear Filters Button */}
            {(selectedStatus || selectedAirline || selectedRoute) && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="h-8"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flights</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_flights}</div>
            <p className="text-xs text-muted-foreground">All tracked flights</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Passengers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_passengers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all flights</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.average_price.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per ticket</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.on_time_percentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Punctuality rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Flight Status Distribution</CardTitle>
            <CardDescription>Percentage of flights by status (click to filter)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusChartConfig} className="h-[300px] w-full aspect-auto">
              <PieChart width={500} height={300}>
                <ChartTooltip
                  content={<ChartTooltipContent nameKey="name" hideLabel />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  strokeWidth={2}
                  onClick={handlePieClick}
                  cursor="pointer"
                >
                  {statusData.map((entry) => {
                    let color = 'hsl(var(--chart-1))';
                    if (entry.name === 'On Time') color = 'hsl(var(--chart-success))';
                    else if (entry.name === 'Delayed') color = 'hsl(var(--chart-warning))';
                    else if (entry.name === 'Cancelled') color = 'hsl(var(--chart-danger))';

                    return (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={color}
                        opacity={getPieOpacity(entry.name)}
                      />
                    );
                  })}
                  <LabelList
                    dataKey="value"
                    position="inside"
                    fill="white"
                    stroke="none"
                    fontSize={14}
                    fontWeight="bold"
                    formatter={(value: number) => `${value.toFixed(1)}%`}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Comparison</CardTitle>
            <CardDescription>Radar view of flight statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={statusChartConfig} className="h-[300px] w-full aspect-auto">
              <RadarChart data={statusData} width={500} height={300} cx="50%" cy="50%" outerRadius="80%">
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Radar
                  name="Percentage"
                  dataKey="value"
                  stroke="hsl(var(--chart-1))"
                  fill="hsl(var(--chart-1))"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Airlines and Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Airlines by Passengers</CardTitle>
            <CardDescription>Airlines carrying the most passengers (click to filter)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={airlinesChartConfig} className="h-[300px] w-full aspect-auto">
              <BarChart data={topAirlines} width={500} height={300}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="airline"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  angle={-20}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="total_passengers"
                  radius={[8, 8, 0, 0]}
                  onClick={handleAirlineClick}
                  cursor="pointer"
                >
                  {topAirlines.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill="var(--color-total_passengers)"
                      opacity={getAirlineOpacity(entry.airline)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Routes by Passengers</CardTitle>
            <CardDescription>Routes with highest passenger volume (click to filter)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={routesChartConfig} className="h-[300px] w-full aspect-auto">
              <BarChart data={topRoutes} width={500} height={300}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="route"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  angle={-20}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="total_passengers"
                  radius={[8, 8, 0, 0]}
                  onClick={handleRouteClick}
                  cursor="pointer"
                >
                  {topRoutes.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill="var(--color-total_passengers)"
                      opacity={getRouteOpacity(entry.route)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
