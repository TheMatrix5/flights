import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../services/api';
import type { FlightStats, AirlineStats, RouteStats } from '../types';
import { Plane, Users, DollarSign, Clock } from 'lucide-react';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];
const STATUS_MAP: { [key: string]: string } = {
  'On Time': 'on_time',
  'Delayed': 'delayed',
  'Cancelled': 'cancelled'
};

export default function Overview() {
  const [stats, setStats] = useState<FlightStats | null>(null);
  const [airlineStats, setAirlineStats] = useState<AirlineStats[]>([]);
  const [routeStats, setRouteStats] = useState<RouteStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [generalData, airlinesData, routesData] = await Promise.all([
          api.getGeneralStats(),
          api.getAirlineStats(),
          api.getRouteStats()
        ]);
        setStats(generalData);
        setAirlineStats(airlinesData);
        setRouteStats(routesData);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!stats) {
    return <div className="flex items-center justify-center h-screen">No data available</div>;
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

  const handleBarClick = (data: any) => {
    if (data && data.name) {
      setSelectedStatus(selectedStatus === data.name ? null : data.name);
    }
  };

  const getPieOpacity = (name: string) => {
    if (!selectedStatus) return 1;
    return name === selectedStatus ? 1 : 0.3;
  };

  const getBarColor = (name: string) => {
    if (!selectedStatus) return '#3b82f6';
    return name === selectedStatus ? '#3b82f6' : '#d1d5db';
  };

  const getBarOpacity = (name: string) => {
    if (!selectedStatus) return 1;
    return name === selectedStatus ? 1 : 0.3;
  };

  // Top 5 airlines and routes
  const topAirlines = airlineStats
    .sort((a, b) => b.total_flights - a.total_flights)
    .slice(0, 5);

  const topRoutes = routeStats
    .sort((a, b) => b.total_flights - a.total_flights)
    .slice(0, 5)
    .map(r => ({
      ...r,
      route: `${r.origin}-${r.destination}`
    }));

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Flights Dashboard</h1>
        <p className="text-gray-500">Overview of flight statistics and metrics</p>
        {selectedStatus && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm font-medium">Filtered by status:</span>
            <Badge
              variant="default"
              className="cursor-pointer"
              onClick={() => setSelectedStatus(null)}
            >
              {selectedStatus} ✕
            </Badge>
          </div>
        )}
      </div>

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
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  onClick={handlePieClick}
                  cursor="pointer"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      opacity={getPieOpacity(entry.name)}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Comparison</CardTitle>
            <CardDescription>Bar chart of flight statuses (click to filter)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Legend />
                <Bar
                  dataKey="value"
                  name="Percentage"
                  onClick={handleBarClick}
                  cursor="pointer"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.name)}
                      opacity={getBarOpacity(entry.name)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Airlines and Routes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 Airlines by Flights</CardTitle>
            <CardDescription>Most active airlines</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topAirlines}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="airline" angle={-15} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_flights" fill="#10b981" name="Total Flights" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Routes by Flights</CardTitle>
            <CardDescription>Most popular routes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topRoutes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="route" angle={-15} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_flights" fill="#8b5cf6" name="Total Flights" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
