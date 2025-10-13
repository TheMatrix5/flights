import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell, AreaChart, Area, LineChart, Line, ComposedChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '../components/ui/chart';
import { api } from '../services/api';
import type { AirlineStats } from '../types';
import { Filter, X } from 'lucide-react';

// Chart configurations with distinct shadcn colors
const passengersPerAirlineChartConfig = {
  total_passengers: {
    label: "Passengers",
    color: "hsl(var(--chart-1))",  // Blue
  },
} satisfies ChartConfig;

const passengersChartConfig = {
  total_passengers: {
    label: "Passengers",
    color: "hsl(var(--chart-2))",  // Green
  },
} satisfies ChartConfig;

const priceChartConfig = {
  average_price: {
    label: "Avg Price",
    color: "hsl(var(--chart-3))",  // Orange
  },
} satisfies ChartConfig;

const ontimeChartConfig = {
  on_time_percentage: {
    label: "On-Time %",
    color: "hsl(var(--chart-4))",  // Purple
  },
} satisfies ChartConfig;

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
        <p className="text-gray-500">Statistics and performance by airline - Click to filter</p>
      </div>

      {/* Horizontal Filters Bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-2">
                <Filter className="h-3 w-3" />
                Select Airline
              </label>
              <div className="flex flex-wrap gap-1.5">
                {stats.map(airline => (
                  <Badge
                    key={airline.airline}
                    variant={selectedAirline === airline.airline ? 'default' : 'outline'}
                    className={`cursor-pointer text-xs transition-all ${
                      selectedAirline === airline.airline
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedAirline(selectedAirline === airline.airline ? null : airline.airline)}
                  >
                    {airline.airline.split(' ')[0]}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Clear Filter Button */}
            {selectedAirline && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAirline(null)}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Passengers by Airline</CardTitle>
            <CardDescription>Total passengers carried by each airline</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={passengersPerAirlineChartConfig} className="h-[400px] w-full aspect-auto">
              <BarChart data={stats} width={500} height={400}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="airline"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  angle={-35}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="total_passengers"
                  fill="var(--color-total_passengers)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Price by Airline</CardTitle>
            <CardDescription>Comparison of average ticket prices</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={priceChartConfig} className="h-[400px] w-full aspect-auto">
              <BarChart data={stats} width={500} height={400}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="airline"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  angle={-35}
                  textAnchor="end"
                  height={100}
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
            <CardTitle>Total Passengers vs Average Price</CardTitle>
            <CardDescription>Relationship between passenger volume and pricing</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={passengersChartConfig} className="h-[400px] w-full aspect-auto">
              <AreaChart data={stats} width={500} height={400}>
                <defs>
                  <linearGradient id="fillPassengers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-total_passengers)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-total_passengers)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="airline"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  angle={-35}
                  textAnchor="end"
                  height={100}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="total_passengers"
                  stroke="var(--color-total_passengers)"
                  fill="url(#fillPassengers)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>On-Time Performance</CardTitle>
            <CardDescription>Percentage of on-time flights by airline</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={ontimeChartConfig} className="h-[400px] w-full aspect-auto">
              <BarChart data={stats} width={500} height={400}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="airline"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  angle={-35}
                  textAnchor="end"
                  height={100}
                />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip
                  content={<ChartTooltipContent formatter={(value) => `${Number(value).toFixed(1)}%`} />}
                />
                <Bar
                  dataKey="on_time_percentage"
                  fill="var(--color-on_time_percentage)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
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
