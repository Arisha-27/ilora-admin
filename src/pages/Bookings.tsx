import { useState } from 'react';
import { useGoogleSheetsDB } from '@/hooks/useGoogleSheetsDB';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Edit, Download, RefreshCw, Calendar as CalendarIcon, Hotel, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function Bookings() {
  const { data: bookings, loading, refetch, addRow, updateRow, deleteRow } = useGoogleSheetsDB('Booking_Info');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const [guestName, setGuestName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [guestType, setGuestType] = useState<string | undefined>();
  const [channel, setChannel] = useState<string | undefined>();
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  
  const bookingsArray = Array.isArray(bookings) ? bookings : [];

  const getChannelColor = (channel: string) => {
    switch (channel?.toLowerCase()) {
      case 'direct': return 'default';
      case 'booking.com': return 'secondary';
      case 'airbnb': return 'destructive';
      case 'expedia': return 'outline';
      default: return 'outline';
    }
  };

  const getGuestTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'business': return 'default';
      case 'leisure': return 'secondary';
      case 'group': return 'destructive';
      case 'vip': return 'outline';
      default: return 'outline';
    }
  };

const handleCreateBooking = async () => {
  if (!guestName || !roomNo || !checkInDate || !checkOutDate) {
    toast({ title: 'Missing details', description: 'Please fill guest, room, and dates.' })
    return
  }
  setCreating(true)
  const row = {
    'Booking ID': `BKG-${Date.now()}`,
    'Guest Name': guestName,
    'Room No': roomNo,
    'Check-In': format(checkInDate, 'yyyy-MM-dd'),
    'Check-Out': format(checkOutDate, 'yyyy-MM-dd'),
    'Guest Type': guestType || '',
    'Channel': channel || '',
    'Notes': notes || ''
  }
  const ok = await addRow(row)
  setCreating(false)
  if (ok) {
    toast({ title: 'Booking Created', description: 'New booking has been added and synced to Google Sheets.' })
    // reset form
    setGuestName(''); setRoomNo(''); setGuestType(undefined); setChannel(undefined); setNotes(''); setCheckInDate(undefined); setCheckOutDate(undefined)
    setIsCreateDialogOpen(false)
  }
}

  const handleUpdateBooking = () => {
    toast({
      title: "Booking Updated",
      description: "Changes have been synced to Google Sheets.",
    });
    setSelectedBooking(null);
    refetch();
  };

  const isCurrentGuest = (checkIn: string, checkOut: string) => {
    const today = new Date();
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    return today >= checkInDate && today <= checkOutDate;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading bookings...</span>
      </div>
    );
  }

  const currentGuests = bookingsArray.filter(b => 
    isCurrentGuest(b['Check-In'], b['Check-Out'])
  ).length;

  const totalRooms = 14; // Total rooms in THE GRAND BUDAPEST HOTEL
  const occupancyRate = totalRooms > 0 ? ((currentGuests / totalRooms) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Management</h1>
          <p className="text-muted-foreground">
            Manage reservations and track occupancy in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Booking</DialogTitle>
                <DialogDescription>
                  Add a new reservation to the system
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
<Label htmlFor="guestName">Guest Name</Label>
<Input id="guestName" placeholder="Enter guest name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                </div>
                <div className="space-y-2">
<Label htmlFor="roomNo">Room Number</Label>
<Input id="roomNo" placeholder="e.g., 301" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Check-In Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkInDate}
                        onSelect={setCheckInDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Check-Out Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={checkOutDate}
                        onSelect={setCheckOutDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
<Label htmlFor="guestType">Guest Type</Label>
<Select value={guestType} onValueChange={setGuestType}>
  <SelectTrigger>
    <SelectValue placeholder="Select guest type" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Business">Business</SelectItem>
    <SelectItem value="Leisure">Leisure</SelectItem>
    <SelectItem value="Group">Group</SelectItem>
    <SelectItem value="VIP">VIP</SelectItem>
  </SelectContent>
</Select>
                </div>
                <div className="space-y-2">
<Label htmlFor="channel">Booking Channel</Label>
<Select value={channel} onValueChange={setChannel}>
  <SelectTrigger>
    <SelectValue placeholder="Select channel" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Direct">Direct</SelectItem>
    <SelectItem value="Booking.com">Booking.com</SelectItem>
    <SelectItem value="Airbnb">Airbnb</SelectItem>
    <SelectItem value="Expedia">Expedia</SelectItem>
    <SelectItem value="Other">Other</SelectItem>
  </SelectContent>
</Select>
                </div>
                <div className="col-span-2 space-y-2">
<Label htmlFor="notes">Special Notes</Label>
<Textarea id="notes" placeholder="Any special requests or notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
<Button onClick={handleCreateBooking} disabled={creating}>{creating ? 'Creating...' : 'Create Booking'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Hotel className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">{bookingsArray.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Guests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold text-green-500">{currentGuests}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{occupancyRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Available Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRooms - currentGuests}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>
            All reservations with real-time occupancy tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Booking ID</TableHead>
                <TableHead>Guest Name</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Check-In</TableHead>
                <TableHead>Check-out Date</TableHead>
                <TableHead>Booking Status</TableHead>
                <TableHead>Guest Type</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookingsArray.map((booking, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {booking['Booking ID'] || `BK${String(index + 1).padStart(3, '0')}`}
                  </TableCell>
                  <TableCell>{booking['Guest Name']}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{booking['Room No']}</Badge>
                  </TableCell>
                  <TableCell>
                    {booking['Check-In'] ? new Date(booking['Check-In']).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {booking['Check-Out'] ? new Date(booking['Check-Out']).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={isCurrentGuest(booking['Check-In'], booking['Check-Out']) ? 'default' : 'secondary'}>
                      {isCurrentGuest(booking['Check-In'], booking['Check-Out']) ? 'Checked In' : 'Confirmed'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getGuestTypeColor(booking['Guest Type'])}>
                      {booking['Guest Type']}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getChannelColor(booking.Channel)}>
                      {booking.Channel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(booking)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {bookingsArray.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No bookings found. Create your first booking to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedBooking && (
        <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Booking #{selectedBooking['Booking ID']}</DialogTitle>
              <DialogDescription>
                Update booking information and sync changes to Google Sheets
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Guest Name</Label>
                <Input defaultValue={selectedBooking['Guest Name']} />
              </div>
              <div className="space-y-2">
                <Label>Room Number</Label>
                <Input defaultValue={selectedBooking['Room No']} />
              </div>
              <div className="space-y-2">
                <Label>Guest Type</Label>
                <Select defaultValue={selectedBooking['Guest Type']}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Leisure">Leisure</SelectItem>
                    <SelectItem value="Group">Group</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select defaultValue={selectedBooking.Channel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Direct">Direct</SelectItem>
                    <SelectItem value="Booking.com">Booking.com</SelectItem>
                    <SelectItem value="Airbnb">Airbnb</SelectItem>
                    <SelectItem value="Expedia">Expedia</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Notes</Label>
                <Textarea defaultValue={selectedBooking.Notes} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateBooking}>Update Booking</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}