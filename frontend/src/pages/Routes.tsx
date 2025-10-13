import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ScatterChart, Scatter, Cell, AreaChart, Area, LineChart, Line } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../components/ui/chart';
import { api } from '../services/api';
import type { RouteStats } from '../types';
import { Filter, X } from 'lucide-react';

// Chart configurations with distinct shadcn colors - using passengers as main metric
const passengersPerRouteChartConfig = {
  total_passengers: {
    label: "Passengers",
    color: "hsl(var(--chart-1))",  // Blue
  },
} satisfies ChartConfig;

const priceChartConfig = {
  average_price: {
    label: "Avg Price",
    color: "hsl(var(--chart-3))",  // Orange
  },
} satisfies ChartConfig;

const passengersChartConfig = {
  total_passengers: {
    label: "Passengers",
    color: "hsl(var(--chart-2))",  // Green
  },
} satisfies ChartConfig;

const scatterChartConfig = {
  route: {
    label: "Route",
    color: "hsl(var(--chart-5))",  // Pink/Red
  },
} satisfies ChartConfig;

export default function Routes() {
  const [stats, setStats] = useState<RouteStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.getRouteStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching route stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (stats.length === 0) {
    return <div className="flex items-center justify-center h-screen">No data available</div>;
  }

  const routeLabels = stats.map(r => `${r.origin}-${r.destination}`);
  const chartData = stats.map((r, idx) => ({
    ...r,
    route: routeLabels[idx]
  }));

  const handleBarClick = (data: any) => {
    if (data && data.route) {
      setSelectedRoute(selectedRoute === data.route ? null : data.route);
    }
  };

  const handleScatterClick = (data: any) => {
    if (data && data.route) {
      setSelectedRoute(selectedRoute === data.route ? null : data.route);
    }
  };

  const handleTableRowClick = (origin: string, destination: string) => {
    const route = `${origin}-${destination}`;
    setSelectedRoute(selectedRoute === route ? null : route);
  };

  const getBarColor = (route: string, defaultColor: string) => {
    if (!selectedRoute) return defaultColor;
    return route === selectedRoute ? defaultColor : '#d1d5db';
  };

  const getBarOpacity = (route: string) => {
    if (!selectedRoute) return 1;
    return route === selectedRoute ? 1 : 0.3;
  };

  const colors = {
    flights: '#3b82f6',
    passengers: '#10b981',
    price: '#f59e0b',
    scatter: '#8b5cf6'
  };

  const topRoutesByPassengers = chartData
    .sort((a, b) => b.total_passengers - a.total_passengers)
    .slice(0, 10);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Routes Dashboard</h1>
        <p className="text-gray-500">Statistics by flight route - Click to filter</p>
      </div>

      {/* Horizontal Filters Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                <Filter className="h-3 w-3" />
                Top 10 Routes by Passengers
              </label>
              <div className="flex flex-wrap gap-1.5">
                {topRoutesByPassengers.map(route => (
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

            {/* Clear Filter Button */}
            {selectedRoute && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedRoute(null)}
                  className="h-8"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Routes by Passenger Volume</CardTitle>
            <CardDescription>Routes with the highest number of passengers</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={passengersPerRouteChartConfig} className="h-[500px] w-full aspect-auto">
              <BarChart data={chartData.sort((a, b) => b.total_passengers - a.total_passengers).slice(0, 10)} layout="vertical" width={500} height={500}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis
                  dataKey="route"
                  type="category"
                  width={100}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="total_passengers"
                  fill="var(--color-total_passengers)"
                  radius={[0, 8, 8, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Most Expensive Routes</CardTitle>
              <CardDescription>Routes with highest average ticket prices</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={priceChartConfig} className="h-[500px] w-full aspect-auto">
                <BarChart data={chartData.sort((a, b) => b.average_price - a.average_price).slice(0, 10)} width={500} height={500}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="route"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    angle={-45}
                    textAnchor="end"
                    height={120}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(value) => `$${Number(value).toFixed(2)}`} />}
                  />
                  <Bar
                    dataKey="average_price"
                    fill="var(--color-average_price)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top 10 Cheapest Routes</CardTitle>
              <CardDescription>Most affordable routes by average price</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={priceChartConfig} className="h-[500px] w-full aspect-auto">
                <BarChart data={chartData.sort((a, b) => a.average_price - b.average_price).slice(0, 10)} width={500} height={500}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="route"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    angle={-45}
                    textAnchor="end"
                    height={120}
                  />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                  <ChartTooltip
                    content={<ChartTooltipContent formatter={(value) => `$${Number(value).toFixed(2)}`} />}
                  />
                  <Bar
                    dataKey="average_price"
                    fill="var(--color-average_price)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Price vs Passengers</CardTitle>
            <CardDescription>Relationship between average price and passenger count (click to filter)</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={scatterChartConfig} className="h-[400px] w-full aspect-auto">
              <ScatterChart width={500} height={400}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="average_price"
                  name="Average Price"
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  dataKey="total_passengers"
                  name="Total Passengers"
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
                <Scatter
                  data={chartData}
                  onClick={handleScatterClick}
                  cursor="pointer"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={selectedRoute && entry.route !== selectedRoute ? "hsl(var(--muted))" : "var(--color-route)"}
                      opacity={getBarOpacity(entry.route)}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Route Statistics Table</CardTitle>
          <CardDescription>Detailed statistics for each route (click row to filter)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead className="text-right">Flights</TableHead>
                <TableHead className="text-right">Passengers</TableHead>
                <TableHead className="text-right">Avg Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((route, idx) => {
                const routeLabel = `${route.origin}-${route.destination}`;
                return (
                  <TableRow
                    key={idx}
                    onClick={() => handleTableRowClick(route.origin, route.destination)}
                    className={`cursor-pointer transition-all ${
                      selectedRoute === routeLabel
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                        : selectedRoute
                          ? 'opacity-40'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <TableCell className="font-medium">{route.origin}</TableCell>
                    <TableCell className="font-medium">{route.destination}</TableCell>
                    <TableCell className="text-right">{route.total_flights}</TableCell>
                    <TableCell className="text-right">{route.total_passengers.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${route.average_price.toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
