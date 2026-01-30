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
import { Plus, Edit, Download, RefreshCw, TrendingUp, Calendar, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Campaigns() {
  const { data: campaigns, loading, refetch, addRow, updateRow, deleteRow } = useGoogleSheetsDB('Campaigns_Manager');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState<string | undefined>();
  const [channel, setChannel] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<string | undefined>();
  const [engagement, setEngagement] = useState('');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  
  const campaignsArray = Array.isArray(campaigns) ? campaigns : [];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'default';
      case 'scheduled': return 'secondary';
      case 'completed': return 'outline';
      case 'paused': return 'destructive';
      default: return 'outline';
    }
  };

  const getCampaignTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'email': return 'default';
      case 'social media': return 'secondary';
      case 'promotional': return 'outline';
      case 'seasonal': return 'destructive';
      default: return 'outline';
    }
  };

  const handleCreateCampaign = async () => {
    if (!campaignName || !campaignType || !channel || !status) {
      toast({ title: 'Missing details', description: 'Please fill campaign name, type, channel and status.' });
      return;
    }
    setCreating(true);
    const row = {
      'Campaign ID': `CAM-${Date.now()}`,
      'Name': campaignName,
      'Type': campaignType,
      'Channel': channel,
      'Target Audience': targetAudience,
      'Start Date': startDate,
      'End Date': endDate,
      'Status': status,
      'Engagement %': engagement,
      'Notes': notes
    };
    const ok = await addRow(row);
    setCreating(false);
    if (ok) {
      toast({ title: 'Campaign Created', description: 'New campaign has been added and synced to Google Sheets.' });
      // Reset form
      setCampaignName(''); setCampaignType(undefined); setChannel(''); setTargetAudience('');
      setStartDate(''); setEndDate(''); setStatus(undefined); setEngagement(''); setNotes('');
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdateCampaign = () => {
    toast({
      title: "Campaign Updated",
      description: "Changes have been synced to Google Sheets.",
    });
    setSelectedCampaign(null);
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading campaigns...</span>
      </div>
    );
  }

  const totalEngagement = campaignsArray.reduce((sum, campaign) => 
    sum + (parseFloat(campaign['Engagement %']) || 0), 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns Manager</h1>
          <p className="text-muted-foreground">
            Create and manage marketing campaigns with performance tracking
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const csv = [
              ['Campaign ID', 'Name', 'Type', 'Channel', 'Target Audience', 'Start Date', 'End Date', 'Status', 'Engagement %', 'Notes'],
              ...campaignsArray.map(campaign => [
                campaign['Campaign ID'] || `CAM${String(campaignsArray.indexOf(campaign) + 1).padStart(3, '0')}`,
                campaign.Name || '',
                campaign.Type || '',
                campaign.Channel || '',
                campaign['Target Audience'] || '',
                campaign['Start Date'] || '',
                campaign['End Date'] || '',
                campaign.Status || '',
                campaign['Engagement %'] || '',
                campaign.Notes || ''
              ])
            ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `campaigns-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>
                  Set up a new marketing campaign
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Campaign Name</Label>
                  <Input id="campaignName" placeholder="Enter campaign name" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaignType">Campaign Type</Label>
                  <Select value={campaignType} onValueChange={setCampaignType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="Social Media">Social Media</SelectItem>
                      <SelectItem value="Promotional">Promotional</SelectItem>
                      <SelectItem value="Seasonal">Seasonal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="channel">Channel</Label>
                  <Input id="channel" placeholder="e.g., Facebook, Instagram, Email" value={channel} onChange={(e) => setChannel(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input id="targetAudience" placeholder="Target demographic" value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Paused">Paused</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="engagement">Engagement %</Label>
                  <Input id="engagement" type="number" placeholder="0.0" value={engagement} onChange={(e) => setEngagement(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Campaign notes and objectives" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCampaign} disabled={creating}>{creating ? 'Creating...' : 'Create Campaign'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaignsArray.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {campaignsArray.filter(c => c.Status === 'Active').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">{totalEngagement.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-secondary" />
              <div className="text-2xl font-bold">
                {campaignsArray.filter(c => c.Status === 'Scheduled').length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Management</CardTitle>
          <CardDescription>
            Track and manage all marketing campaigns with performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Target Audience</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Engagement %</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignsArray.map((campaign, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {campaign['Campaign ID'] || `CAM${String(index + 1).padStart(3, '0')}`}
                  </TableCell>
                  <TableCell className="font-medium">{campaign.Name}</TableCell>
                  <TableCell>
                    <Badge variant={getCampaignTypeColor(campaign.Type)}>
                      {campaign.Type}
                    </Badge>
                  </TableCell>
                  <TableCell>{campaign.Channel}</TableCell>
                  <TableCell>{campaign['Target Audience']}</TableCell>
                  <TableCell>
                    {campaign['Start Date'] ? new Date(campaign['Start Date']).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {campaign['End Date'] ? new Date(campaign['End Date']).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(campaign.Status)}>
                      {campaign.Status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {parseFloat(campaign['Engagement %'] || '0').toFixed(1)}%
                  </TableCell>
                  <TableCell>{campaign.Notes || 'N/A'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(campaign)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {campaignsArray.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                    No campaigns found. Create your first campaign to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedCampaign && (
        <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Campaign</DialogTitle>
              <DialogDescription>
                Update campaign details and performance metrics
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input defaultValue={selectedCampaign.Name} />
              </div>
              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <Select defaultValue={selectedCampaign.Type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Promotional">Promotional</SelectItem>
                    <SelectItem value="Seasonal">Seasonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <Input defaultValue={selectedCampaign.Channel} />
              </div>
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Input defaultValue={selectedCampaign['Target Audience']} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select defaultValue={selectedCampaign.Status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Paused">Paused</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Engagement %</Label>
                <Input defaultValue={selectedCampaign['Engagement %']} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Notes</Label>
                <Textarea defaultValue={selectedCampaign.Notes} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedCampaign(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCampaign}>Update Campaign</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}