import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { api } from '../services/api';
import type { AirlineStats } from '../types';

export default function Airlines() {
  const [stats, setStats] = useState<AirlineStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAirline, setSelectedAirline] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await api.getAirlineStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching airline stats:', error);
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

  const handleBarClick = (data: any) => {
    if (data && data.airline) {
      setSelectedAirline(selectedAirline === data.airline ? null : data.airline);
    }
  };

  const handleTableRowClick = (airline: string) => {
    setSelectedAirline(selectedAirline === airline ? null : airline);
  };

  const getBarColor = (airline: string, defaultColor: string) => {
    if (!selectedAirline) return defaultColor;
    return airline === selectedAirline ? defaultColor : '#d1d5db';
  };

  const getBarOpacity = (airline: string) => {
    if (!selectedAirline) return 1;
    return airline === selectedAirline ? 1 : 0.3;
  };

  const colors = {
    flights: '#3b82f6',
    passengers: '#10b981',
    price: '#f59e0b',
    ontime: '#8b5cf6'
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Airlines Dashboard</h1>
        <p className="text-gray-500">Statistics and performance by airline</p>
        {selectedAirline && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm font-medium">Filtered by:</span>
            <Badge
              variant="default"
              className="cursor-pointer"
              onClick={() => setSelectedAirline(null)}
            >
              {selectedAirline} ✕
            </Badge>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Flights by Airline</CardTitle>
            <CardDescription>Total number of flights per airline (click to filter)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="airline" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="total_flights"
                  name="Total Flights"
                  onClick={handleBarClick}
                  cursor="pointer"
                >
                  {stats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.airline, colors.flights)}
                      opacity={getBarOpacity(entry.airline)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Passengers by Airline</CardTitle>
            <CardDescription>Total passengers carried by each airline (click to filter)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="airline" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="total_passengers"
                  name="Total Passengers"
                  onClick={handleBarClick}
                  cursor="pointer"
                >
                  {stats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.airline, colors.passengers)}
                      opacity={getBarOpacity(entry.airline)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Price by Airline</CardTitle>
            <CardDescription>Average ticket price per airline (click to filter)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="airline" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Legend />
                <Bar
                  dataKey="average_price"
                  name="Average Price"
                  onClick={handleBarClick}
                  cursor="pointer"
                >
                  {stats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.airline, colors.price)}
                      opacity={getBarOpacity(entry.airline)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>On-Time Performance</CardTitle>
            <CardDescription>Percentage of on-time flights by airline (click to filter)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="airline" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Legend />
                <Bar
                  dataKey="on_time_percentage"
                  name="On-Time %"
                  onClick={handleBarClick}
                  cursor="pointer"
                >
                  {stats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getBarColor(entry.airline, colors.ontime)}
                      opacity={getBarOpacity(entry.airline)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Airline Statistics Table</CardTitle>
          <CardDescription>Detailed statistics for each airline (click row to filter)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Airline</TableHead>
                <TableHead className="text-right">Flights</TableHead>
                <TableHead className="text-right">Passengers</TableHead>
                <TableHead className="text-right">Avg Price</TableHead>
                <TableHead className="text-right">On-Time %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((airline, idx) => (
                <TableRow
                  key={idx}
                  onClick={() => handleTableRowClick(airline.airline)}
                  className={`cursor-pointer transition-all ${
                    selectedAirline === airline.airline
                      ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                      : selectedAirline
                        ? 'opacity-40'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <TableCell className="font-medium">{airline.airline}</TableCell>
                  <TableCell className="text-right">{airline.total_flights}</TableCell>
                  <TableCell className="text-right">{airline.total_passengers.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${airline.average_price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{airline.on_time_percentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
