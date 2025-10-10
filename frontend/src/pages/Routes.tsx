import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';
import { api } from '../services/api';
import type { RouteStats } from '../types';

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

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Routes Dashboard</h1>
        <p className="text-gray-500">Statistics by flight route</p>
        {selectedRoute && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm font-medium">Filtered by:</span>
            <Badge
              variant="default"
              className="cursor-pointer"
              onClick={() => setSelectedRoute(null)}
            >
              {selectedRoute} ✕
            </Badge>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Routes by Flight Count</CardTitle>
            <CardDescription>Most popular routes by number of flights (click to filter)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="route" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="total_flights"
                  name="Total Flights"
                  onClick={handleBarClick}
                  cursor="pointer"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.route, colors.flights)}
                      opacity={getBarOpacity(entry.route)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Average Price by Route</CardTitle>
              <CardDescription>Average ticket price for each route (click to filter)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="route" type="category" width={80} />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  <Legend />
                  <Bar
                    dataKey="average_price"
                    name="Average Price"
                    onClick={handleBarClick}
                    cursor="pointer"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getBarColor(entry.route, colors.price)}
                        opacity={getBarOpacity(entry.route)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Passengers by Route</CardTitle>
              <CardDescription>Total passengers on each route (click to filter)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={500}>
                <BarChart data={chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="route" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="total_passengers"
                    name="Total Passengers"
                    onClick={handleBarClick}
                    cursor="pointer"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getBarColor(entry.route, colors.passengers)}
                        opacity={getBarOpacity(entry.route)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Price vs Passengers</CardTitle>
            <CardDescription>Relationship between average price and passenger count (click to filter)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="average_price" name="Average Price" type="number" />
                <YAxis dataKey="total_passengers" name="Total Passengers" type="number" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Legend />
                <Scatter
                  name="Routes"
                  data={chartData}
                  onClick={handleScatterClick}
                  cursor="pointer"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.route, colors.scatter)}
                      opacity={getBarOpacity(entry.route)}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
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
