import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Plus, Percent, RefreshCw, Filter, Edit, Trash2 } from 'lucide-react';
import { useGoogleSheetsDB } from '@/hooks/useGoogleSheetsDB';
import { useToast } from '@/hooks/use-toast';

interface RateData {
  'Room Type': string;
  Season: string;
  Occupancy: string;
  'Base Price (₹)': number;
  Channel: string;
  'Channel Discount %': number;
  'Rate Plan': string;
  'Final Price (₹)': number;
  Notes: string;
}

export default function RateManagement() {
  // Initialize hook with explicit sheet name
  const { data: ratesData, loading, addRow, updateRow, deleteRow, refetch } = useGoogleSheetsDB('rate_management');
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<any>(null);

  const [formData, setFormData] = useState<RateData>({
    'Room Type': '',
    Season: '',
    Occupancy: '',
    'Base Price (₹)': 0,
    Channel: '',
    'Channel Discount %': 0,
    'Rate Plan': '',
    'Final Price (₹)': 0,
    Notes: ''
  });

  const safeRatesData = Array.isArray(ratesData) ? ratesData : [];

  const roomTypes = ['Deluxe Room', 'Suite', 'Presidential Suite', 'Standard Room'];
  const seasons = ['Peak Season', 'Off Season', 'Festival Season', 'Regular'];
  const occupancyTypes = ['Single', 'Double', 'Triple', 'Family'];
  const channels = ['Direct Booking', 'Online Travel Agent', 'Walk-in', 'Corporate'];
  const ratePlans = ['Room Only', 'Bed & Breakfast', 'Half Board', 'Full Board'];

  useEffect(() => {
    const basePrice = formData['Base Price (₹)'];
    const discount = formData['Channel Discount %'];
    const finalPrice = basePrice - (basePrice * discount / 100);
    setFormData(prev => ({ ...prev, 'Final Price (₹)': finalPrice }));
  }, [formData['Base Price (₹)'], formData['Channel Discount %']]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { sheet: 'rate_management', ...formData };

      if (editingRate) {
        await updateRow(editingRate.rowIndex, payload, 'rate_management');
        toast({ title: "Rate updated successfully!" });
        setEditingRate(null);
      } else {
        await addRow(payload, 'rate_management');
        toast({ title: "Rate added successfully!" });
      }

      setFormData({
        'Room Type': '',
        Season: '',
        Occupancy: '',
        'Base Price (₹)': 0,
        Channel: '',
        'Channel Discount %': 0,
        'Rate Plan': '',
        'Final Price (₹)': 0,
        Notes: ''
      });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save rate. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (rate: any, index: number) => {
    setFormData(rate);
    setEditingRate({ ...rate, rowIndex: index });
    setIsDialogOpen(true);
  };

  // --- THE FIX IS HERE ---
  const handleDelete = async (index: number) => {
    try {
      // We must explicitly pass 'rate_management' here
      await deleteRow(index, 'rate_management');
      toast({ title: "Rate deleted successfully!" });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to delete rate. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold luxury-gradient bg-clip-text text-transparent">
            Rate Management System
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage room rates, seasonal pricing, and channel discounts
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
                Add Rate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRate ? 'Edit Rate' : 'Add New Rate'}
                </DialogTitle>
                <DialogDescription>
                  Enter the pricing details below to configure the rate for a specific room type and season.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="roomType">Room Type</Label>
                    <Select
                      value={formData['Room Type']}
                      onValueChange={(value) => setFormData({ ...formData, 'Room Type': value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="season">Season</Label>
                    <Select
                      value={formData.Season}
                      onValueChange={(value) => setFormData({ ...formData, Season: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select season" />
                      </SelectTrigger>
                      <SelectContent>
                        {seasons.map(season => (
                          <SelectItem key={season} value={season}>{season}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="occupancy">Occupancy</Label>
                    <Select
                      value={formData.Occupancy}
                      onValueChange={(value) => setFormData({ ...formData, Occupancy: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select occupancy" />
                      </SelectTrigger>
                      <SelectContent>
                        {occupancyTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="basePrice">Base Price (₹)</Label>
                    <Input
                      type="number"
                      value={formData['Base Price (₹)']}
                      onChange={(e) => setFormData({ ...formData, 'Base Price (₹)': Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="channel">Channel</Label>
                    <Select
                      value={formData.Channel}
                      onValueChange={(value) => setFormData({ ...formData, Channel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select channel" />
                      </SelectTrigger>
                      <SelectContent>
                        {channels.map(channel => (
                          <SelectItem key={channel} value={channel}>{channel}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discount">Channel Discount (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData['Channel Discount %']}
                      onChange={(e) => setFormData({ ...formData, 'Channel Discount %': Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ratePlan">Rate Plan</Label>
                    <Select
                      value={formData['Rate Plan']}
                      onValueChange={(value) => setFormData({ ...formData, 'Rate Plan': value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select rate plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {ratePlans.map(plan => (
                          <SelectItem key={plan} value={plan}>{plan}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Final Price (₹)</Label>
                    <Input
                      type="number"
                      value={formData['Final Price (₹)']}
                      disabled
                      className="bg-muted"
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
                    {editingRate ? 'Update Rate' : 'Add Rate'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Rate Data Summary
          </CardTitle>
          <CardDescription>
            Showing all rate management data from Google Sheets
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rate Configuration</CardTitle>
          <CardDescription>Current rate settings for all room types and channels</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading rates...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Season</TableHead>
                  <TableHead>Occupancy</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Rate Plan</TableHead>
                  <TableHead>Final Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeRatesData.map((rate, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{rate['Room Type']}</TableCell>
                    <TableCell>
                      <Badge variant={rate.Season === 'Peak Season' ? 'destructive' : 'secondary'}>
                        {rate.Season}
                      </Badge>
                    </TableCell>
                    <TableCell>{rate.Occupancy}</TableCell>
                    <TableCell>₹{rate['Base Price (₹)']?.toLocaleString()}</TableCell>
                    <TableCell>{rate.Channel}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        {rate['Channel Discount %']}
                      </div>
                    </TableCell>
                    <TableCell>{rate['Rate Plan']}</TableCell>
                    <TableCell className="font-semibold text-success">
                      ₹{rate['Final Price (₹)']?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(rate, index)}
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
                {!loading && safeRatesData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-4">
                      No rates found. Add a new rate to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}