import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, RefreshCw, Filter, Edit, Trash2, DollarSign } from 'lucide-react';
import { useGoogleSheetsDB } from '@/hooks/useGoogleSheetsDB';
import { useToast } from '@/hooks/use-toast';

interface ChannelData {
  Channel_ID: string;
  Channel_Name: string;
  Commission_Type: string;
  Commission_Value: number;
  Total_Bookings: number;
  Total_Commission: number;
  Net_Amount_to_Channel: number;
  Paid_Amount: number;
  Pending_Amount: number;
  Notes: string;
}

export default function ChannelManagement() {
  const { allData, loading, addRow, updateRow, deleteRow, refetch } = useGoogleSheetsDB();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<any>(null);
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState<ChannelData>({
    Channel_ID: '',
    Channel_Name: '',
    Commission_Type: '',
    Commission_Value: 0,
    Total_Bookings: 0,
    Total_Commission: 0,
    Net_Amount_to_Channel: 0,
    Paid_Amount: 0,
    Pending_Amount: 0,
    Notes: ''
  });

  const channelsData = Array.isArray(allData?.agent_management) ? allData.agent_management : [];
  
  const commissionTypes = ['Percentage', 'Fixed Amount', 'Tiered'];
  const channelNames = [
    'Booking.com',
    'Expedia',
    'Agoda',
    'MakeMyTrip',
    'Goibibo',
    'Cleartrip',
    'Direct Website',
    'Walk-in',
    'Corporate'
  ];

  const generateChannelId = () => {
    const prefix = 'CH';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSubmit = {
        ...formData,
        Channel_ID: formData.Channel_ID || generateChannelId(),
        Pending_Amount: formData.Net_Amount_to_Channel - formData.Paid_Amount
      };

      if (editingChannel) {
        // For Google Sheets, we need to pass the sheet name with the data
        await updateRow(editingChannel.rowIndex, { sheet: 'agent_management', ...dataToSubmit });
        toast({ title: "Channel updated successfully!" });
        setEditingChannel(null);
      } else {
        await addRow({ sheet: 'agent_management', ...dataToSubmit });
        toast({ title: "Channel added successfully!" });
      }
      setFormData({
        Channel_ID: '',
        Channel_Name: '',
        Commission_Type: '',
        Commission_Value: 0,
        Total_Bookings: 0,
        Total_Commission: 0,
        Net_Amount_to_Channel: 0,
        Paid_Amount: 0,
        Pending_Amount: 0,
        Notes: ''
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save channel. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (channel: any, index: number) => {
    setFormData(channel);
    setEditingChannel({ ...channel, rowIndex: index });
    setIsDialogOpen(true);
  };

  const handleDelete = async (index: number) => {
    try {
      await deleteRow(index);
      toast({ title: "Channel deleted successfully!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete channel. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Show all channels by default - remove filtering to show all data
  const filteredChannels = channelsData;

  const totalRevenue = channelsData.reduce((sum, channel) => sum + (channel.Net_Amount_to_Channel || 0), 0);
  const totalPending = channelsData.reduce((sum, channel) => sum + (channel.Pending_Amount || 0), 0);
  const totalBookings = channelsData.reduce((sum, channel) => sum + (channel.Total_Bookings || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold luxury-gradient bg-clip-text text-transparent">
            Channel Management System
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage booking channels, commissions, and revenue tracking
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={refetch}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="gold" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Channel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingChannel ? 'Edit Channel' : 'Add New Channel'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="channelId">Channel ID</Label>
                    <Input
                      value={formData.Channel_ID}
                      onChange={(e) => setFormData({ ...formData, Channel_ID: e.target.value })}
                      placeholder="Auto-generated if empty"
                    />
                  </div>
                  <div>
                    <Label htmlFor="channelName">Channel Name</Label>
                    <Select
                      value={formData.Channel_Name}
                      onValueChange={(value) => setFormData({ ...formData, Channel_Name: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        {channelNames.map(name => (
                          <SelectItem key={name} value={name}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="commissionType">Commission Type</Label>
                    <Select
                      value={formData.Commission_Type}
                      onValueChange={(value) => setFormData({ ...formData, Commission_Type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {commissionTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="commissionValue">Commission Value</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.Commission_Value}
                      onChange={(e) => setFormData({ ...formData, Commission_Value: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalBookings">Total Bookings</Label>
                    <Input
                      type="number"
                      value={formData.Total_Bookings}
                      onChange={(e) => setFormData({ ...formData, Total_Bookings: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalCommission">Total Commission (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.Total_Commission}
                      onChange={(e) => setFormData({ ...formData, Total_Commission: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="netAmount">Net Amount to Channel (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.Net_Amount_to_Channel}
                      onChange={(e) => setFormData({ ...formData, Net_Amount_to_Channel: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="paidAmount">Paid Amount (₹)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.Paid_Amount}
                      onChange={(e) => setFormData({ ...formData, Paid_Amount: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    value={formData.Notes}
                    onChange={(e) => setFormData({ ...formData, Notes: e.target.value })}
                    placeholder="Additional notes..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="gold">
                    {editingChannel ? 'Update Channel' : 'Add Channel'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">₹{totalPending.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Channels</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{channelsData.length}</div>
          </CardContent>
        </Card>
      </div>


      {/* Channels Table */}
      <Card>
        <CardHeader>
          <CardTitle>Channel Overview</CardTitle>
          <CardDescription>Manage all booking channels and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading channels...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel ID</TableHead>
                  <TableHead>Channel Name</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Total Commission</TableHead>
                  <TableHead>Net Amount</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Pending</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredChannels.map((channel, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono">{channel.Channel_ID}</TableCell>
                    <TableCell className="font-medium">{channel.Channel_Name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {channel.Commission_Type === 'Percentage' ? `${channel.Commission_Value}%` : `₹${channel.Commission_Value}`}
                      </Badge>
                    </TableCell>
                    <TableCell>{channel.Total_Bookings}</TableCell>
                    <TableCell>₹{channel.Total_Commission?.toLocaleString()}</TableCell>
                    <TableCell className="text-success">₹{channel.Net_Amount_to_Channel?.toLocaleString()}</TableCell>
                    <TableCell>₹{channel.Paid_Amount?.toLocaleString()}</TableCell>
                    <TableCell className={channel.Pending_Amount > 0 ? "text-destructive font-semibold" : ""}>
                      ₹{channel.Pending_Amount?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(channel, index)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
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