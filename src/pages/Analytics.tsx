import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  MessageSquare,
  Clock,
  Star,
  Ticket,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
  ChefHat,
} from "lucide-react";
import { useGoogleSheetsDB } from '@/hooks/useGoogleSheetsDB';

export default function Analytics() {
  const { allData, loading, error, refetch } = useGoogleSheetsDB();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading analytics data from database...</span>
      </div>
    );
  }

  // Extract data from multiple Google Sheets for comprehensive analysis
  const sheetsData = allData as any;
  const analyticsRows = Array.isArray(sheetsData?.Analytics_Dashboard) ? sheetsData.Analytics_Dashboard : [];
  const ticketsData = Array.isArray(sheetsData?.ticket_management) ? sheetsData.ticket_management : [];
  const reviewsData = Array.isArray(sheetsData?.review_managment) ? sheetsData.review_managment : [];
  const bookingsData = Array.isArray(sheetsData?.Booking_Info) ? sheetsData.Booking_Info : [];
  const menuData = Array.isArray(sheetsData?.Menu_Manager) ? sheetsData.Menu_Manager : [];
  const usersData = Array.isArray(sheetsData?.user_information) ? sheetsData.user_information : [];
  const interactionsData = sheetsData?.guest_interaction_log || [];
  const roomChartData = Array.isArray(sheetsData?.room_chart) ? sheetsData.room_chart : [];

  // Helper functions
  const parsePercent = (val: any): number => {
    if (val == null || val === '') return 0;
    if (typeof val === 'number') return Math.max(0, Math.min(100, val));
    const s = String(val).trim();
    const num = parseFloat(s.replace('%', ''));
    if (isNaN(num)) return 0;
    return Math.max(0, Math.min(100, num));
  };

  const parseDurationHours = (val: any): number => {
    if (val == null || val === '') return 0;
    if (typeof val === 'number') return val;
    const s = String(val).trim().toLowerCase();
    const hm = s.match(/^(\d{1,2}):(\d{2})$/);
    if (hm) { 
      return parseFloat(hm[1]) + parseFloat(hm[2]) / 60; 
    }
    const m = s.match(/([\d.]+)\s*(d|day|days|h|hr|hrs|hour|hours|m|min|mins|minute|minutes)$/);
    if (m) {
      const n = parseFloat(m[1]);
      const unit = m[2];
      if (['d', 'day', 'days'].includes(unit)) return n * 24;
      if (['h', 'hr', 'hrs', 'hour', 'hours'].includes(unit)) return n;
      if (['m', 'min', 'mins', 'minute', 'minutes'].includes(unit)) return n / 60;
    }
    const num = parseFloat(s);
    return isNaN(num) ? 0 : num;
  };

  // Computed metrics from Analytics_Dashboard
  const toNumber = (val: any): number => {
    if (val == null || val === '') return 0;
    const n = typeof val === 'number' ? val : parseFloat(String(val).replace(/,/g, ''));
    return isNaN(n) ? 0 : n;
  };

  const analyticsCount = Array.isArray(analyticsRows) ? analyticsRows.length : 0;

  // Enhanced metrics from multiple sheets
  const totalInteractions = analyticsCount
    ? analyticsRows.reduce((sum: number, row: any) => {
        const v = row['Total Interactions'] ?? row['Total_Interactions'] ?? row['Interactions'];
        return sum + toNumber(v);
      }, 0)
    : (Array.isArray(interactionsData) ? interactionsData.length : 0);

  // Calculate active tickets from ticket management sheet
  const activeTickets = ticketsData.filter(ticket => 
    ticket.Status === 'Open' || ticket.Status === 'In Progress'
  ).length;

  // Calculate total revenue from bookings
  const totalRevenue = bookingsData.reduce((sum: number, booking: any) => {
    const revenue = toNumber(booking.Revenue || booking['Total Amount'] || booking.Amount || 0);
    return sum + revenue;
  }, 0);

  // Calculate average rating from reviews
  const reviewRatings = reviewsData
    .map((review: any) => toNumber(review.Rating))
    .filter((rating: number) => rating > 0);
  const avgRating = reviewRatings.length > 0 
    ? reviewRatings.reduce((a: number, b: number) => a + b, 0) / reviewRatings.length 
    : 0;

  // Filter room chart data for selected date
  const filteredRoomChart = roomChartData.filter((room: any) => {
    // For now, show all room data. In a real implementation, 
    // you would filter by date or check booking dates
    return room['Room Type'] === 'Luxury Tent';
  });
  const totalRooms = 14;
  const today = new Date().toISOString().split('T')[0];
  const currentOccupancy = bookingsData.filter((booking: any) => {
    const checkIn = booking['Check-In'];
    const checkOut = booking['Check-Out'];
    return checkIn <= today && checkOut >= today;
  }).length;
  
  // Room status breakdown from room_chart (only Luxury Tent)
  const roomStatusCounts = filteredRoomChart.reduce((acc: any, room: any) => {
    const status = room.Status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  
  const roomStatusData = Object.entries(roomStatusCounts).map(([status, count]) => ({
    status,
    count: count as number,
    percentage: Math.round(((count as number) / totalRooms) * 100)
  }));
  
  // Room availability by type (Luxury Tent only)
  const roomTypeData = filteredRoomChart.reduce((acc: any, room: any) => {
    const type = 'Luxury Tent'; // Only one room type
    const status = room.Status || 'Unknown';
    
    if (!acc[type]) {
      acc[type] = { type, available: 0, occupied: 0, maintenance: 0, cleaning: 0 };
    }
    
    if (status === 'Available' || status === 'Ready') {
      acc[type].available++;
    } else if (status === 'Occupied') {
      acc[type].occupied++;
    } else if (status === 'Maintenance' || status === 'Under Maintenance') {
      acc[type].maintenance++;
    } else if (status === 'Cleaning' || status === 'To be Cleaned') {
      acc[type].cleaning++;
    }
    
    return acc;
  }, {});
  
  const roomAvailabilityData = Object.values(roomTypeData);
  
  // Day-specific room status calculation
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const getDaySpecificRoomStatus = (date: string) => {
    // For now, we'll use the current room chart data
    // In a real implementation, you would filter by date or check-in/check-out dates
    const dayRoomStatus = {
      available: 0,
      occupied: 0,
      maintenance: 0,
      cleaning: 0
    };
    
    filteredRoomChart.forEach((room: any) => {
      const status = room.Status || 'Unknown';
      if (status === 'Available' || status === 'Ready') {
        dayRoomStatus.available++;
      } else if (status === 'Occupied') {
        dayRoomStatus.occupied++;
      } else if (status === 'Maintenance' || status === 'Under Maintenance') {
        dayRoomStatus.maintenance++;
      } else if (status === 'Cleaning' || status === 'To be Cleaned') {
        dayRoomStatus.cleaning++;
      }
    });
    
    return dayRoomStatus;
  };
  
  const daySpecificStatus = getDaySpecificRoomStatus(selectedDateStr);

  // Get the latest analytics record for chart data
  const latestAnalytics = analyticsRows.length ? analyticsRows[analyticsRows.length - 1] : {};
  
  const satisfactionValues = analyticsCount
    ? analyticsRows
        .map((row: any) => {
          const v = row['Guest Satisfaction %'] ?? row['Guest Satisfaction'] ?? row['Satisfaction %'];
          return parsePercent(v);
        })
        .filter((n: number) => n > 0)
    : [];
  
  const guestSatisfaction = satisfactionValues.length ? 
    (satisfactionValues.reduce((a: number, b: number) => a + b, 0) / satisfactionValues.length) : 0;

  const resolutionCandidates = analyticsCount
    ? analyticsRows
        .map((row: any) => {
          const v = row['Average Resolution Time'] ?? row['Avg Resolution Time'] ?? row['Avg_Resolution_Time'];
          return parseDurationHours(v);
        })
        .filter((n: number) => n > 0)
    : [];
  
  const avgResolutionTime = resolutionCandidates.length ? 
    (resolutionCandidates.reduce((a: number, b: number) => a + b, 0) / resolutionCandidates.length) : 0;

  // Chart data from Analytics Dashboard or fallbacks
  const uniqueSessions = analyticsCount
    ? analyticsRows.reduce((sum: number, row: any) => {
        const v = row['Unique Sessions'] ?? row['Unique_Sessions'];
        return sum + toNumber(v);
      }, 0)
    : toNumber(latestAnalytics['Unique Sessions']);
  const intentsTriggered = analyticsCount
    ? analyticsRows.reduce((sum: number, row: any) => {
        const v = row['Intents Triggered'] ?? row['Intents'];
        return sum + toNumber(v);
      }, 0)
    : toNumber(latestAnalytics['Intents Triggered']);

  const guestNeeds = latestAnalytics['Guest Needs Breakdown'] || 'Food: 40%, Room: 35%, Service: 15%, Other: 10%';
  const guestNeedsData = guestNeeds.split(',').map((item: string) => {
    const [category, percentage] = item.split(':').map(s => s.trim());
    const value = parseInt(percentage?.replace('%', '') || '0');
    return {
      category: category,
      count: Math.round((value / 100) * totalInteractions),
      percentage: value
    };
  }).filter(item => item.count > 0);

  const guestSatisfactionPct = Number(guestSatisfaction.toFixed(1));
  
  // Mock weekly data for trends chart
  const interactionTrends = [
    { date: 'Mon', interactions: Math.round(totalInteractions * 0.3), sessions: Math.round(uniqueSessions * 0.3), satisfaction: 92 },
    { date: 'Tue', interactions: Math.round(totalInteractions * 0.4), sessions: Math.round(uniqueSessions * 0.4), satisfaction: 94 },
    { date: 'Wed', interactions: Math.round(totalInteractions * 0.5), sessions: Math.round(uniqueSessions * 0.5), satisfaction: 88 },
    { date: 'Thu', interactions: Math.round(totalInteractions * 0.4), sessions: Math.round(uniqueSessions * 0.4), satisfaction: 96 },
    { date: 'Fri', interactions: Math.round(totalInteractions * 0.7), sessions: Math.round(uniqueSessions * 0.7), satisfaction: 95 },
    { date: 'Sat', interactions: totalInteractions, sessions: uniqueSessions, satisfaction: guestSatisfactionPct },
    { date: 'Sun', interactions: Math.round(totalInteractions * 0.8), sessions: Math.round(uniqueSessions * 0.8), satisfaction: 93 },
  ];

  // Enhanced KPI cards with multi-sheet data
  const kpiData = [
    {
      title: "Total Interactions",
      value: totalInteractions.toLocaleString(),
      change: "+12.5%",
      trend: "up",
      icon: MessageSquare,
      description: "Guest interactions across all channels",
    },
    {
      title: "Active Tickets",
      value: activeTickets.toString(),
      change: "-8.2%",
      trend: "down",
      icon: Ticket,
      description: "Open and in-progress tickets",
    },
    {
      title: "Average Rating",
      value: avgRating > 0 ? avgRating.toFixed(1) : "N/A",
      change: "+0.3%",
      trend: "up",
      icon: Star,
      description: "From guest reviews",
    },
    {
      title: "Current Occupancy",
      value: `${currentOccupancy}/${totalRooms}`,
      change: "+5.8%",
      trend: "up",
      icon: Users,
      description: "Occupied rooms out of 14 total",
    },
    {
      title: "Total Revenue",
      value: totalRevenue > 0 ? `$${totalRevenue.toLocaleString()}` : "$0",
      change: "+18.2%",
      trend: "up",
      icon: TrendingUp,
      description: "From bookings",
    },
    {
      title: "Menu Items",
      value: menuData.length.toString(),
      change: "+2",
      trend: "up",
      icon: ChefHat,
      description: "Available menu items",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold luxury-gradient bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time insights, room availability status, and performance metrics for ILORA RETREATS
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button variant="gold" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiData.map((kpi) => (
          <Card key={kpi.title} className="elegant-shadow hover:shadow-lg smooth-transition">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className="p-2 bg-hotel-gold/10 rounded-lg">
                <kpi.icon className="h-4 w-4 text-hotel-gold" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge 
                  variant={kpi.trend === "up" ? "default" : "secondary"}
                  className={`${
                    kpi.trend === "up" 
                      ? "bg-success/10 text-success border-success/20" 
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {kpi.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {kpi.change}
                </Badge>
                <span className="text-xs text-muted-foreground">{kpi.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Day-specific Room Status */}
      <Card className="elegant-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-hotel-gold" />
            Daily Room Status
          </CardTitle>
          <CardDescription>Select a date to view room availability breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {daySpecificStatus.available}
                </div>
                <div className="text-sm text-muted-foreground">Available</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {daySpecificStatus.occupied}
                </div>
                <div className="text-sm text-muted-foreground">Occupied</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {daySpecificStatus.maintenance}
                </div>
                <div className="text-sm text-muted-foreground">Maintenance</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {daySpecificStatus.cleaning}
                </div>
                <div className="text-sm text-muted-foreground">Cleaning</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interaction Trends */}
        <Card className="lg:col-span-2 elegant-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-hotel-gold" />
              Interaction Trends
            </CardTitle>
            <CardDescription>Daily interaction volume and satisfaction rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={interactionTrends}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="interactions"
                  stackId="1"
                  stroke="hsl(var(--hotel-navy))"
                  fill="hsl(var(--hotel-navy))"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stackId="1"
                  stroke="hsl(var(--hotel-gold))"
                  fill="hsl(var(--hotel-gold))"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Room Status Overview */}
        <Card className="elegant-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-hotel-gold" />
              Room Status Overview
            </CardTitle>
            <CardDescription>Current room availability and maintenance status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roomStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {roomStatusData.map((entry, index) => {
                    const colors = {
                      'Available': '#22C55E',
                      'Ready': '#22C55E', 
                      'Occupied': '#EF4444',
                      'Maintenance': '#F59E0B',
                      'Under Maintenance': '#F59E0B',
                      'Cleaning': '#3B82F6',
                      'To be Cleaned': '#3B82F6'
                    };
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={colors[entry.status as keyof typeof colors] || '#6B7280'} 
                      />
                    );
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {roomStatusData.map((status) => (
                <div key={status.status} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ 
                        backgroundColor: {
                          'Available': '#22C55E',
                          'Ready': '#22C55E', 
                          'Occupied': '#EF4444',
                          'Maintenance': '#F59E0B',
                          'Under Maintenance': '#F59E0B',
                          'Cleaning': '#3B82F6',
                          'To be Cleaned': '#3B82F6'
                        }[status.status] || '#6B7280'
                      }}
                    />
                    <span>{status.status}</span>
                  </div>
                  <span className="font-medium">{status.count} rooms</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Availability by Type */}
        <Card className="elegant-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-hotel-gold" />
              Room Availability by Type
            </CardTitle>
            <CardDescription>Room status breakdown by room type</CardDescription>
          </CardHeader>
          <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roomAvailabilityData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="type" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="available" stackId="a" fill="#22C55E" name="Available" />
                  <Bar dataKey="occupied" stackId="a" fill="#EF4444" name="Occupied" />
                  <Bar dataKey="maintenance" stackId="a" fill="#F59E0B" name="Maintenance" />
                  <Bar dataKey="cleaning" stackId="a" fill="#3B82F6" name="Cleaning" />
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Guest Needs Breakdown */}
        <Card className="elegant-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-hotel-gold" />
              Guest Needs Breakdown
            </CardTitle>
            <CardDescription>Most common guest service categories</CardDescription>
          </CardHeader>
          <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={guestNeedsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="category" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--hotel-navy))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}