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
import { Plus, Edit, Download, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Edit Ticket Form Component
function EditTicketForm({ ticket, onUpdate, onCancel }: { ticket: any, onUpdate: (data: any) => void, onCancel: () => void }) {
  const [status, setStatus] = useState(ticket.Status);
  const [assignedTo, setAssignedTo] = useState(ticket['Assigned To'] || '');
  const [notes, setNotes] = useState(ticket.Notes || '');
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async () => {
    setUpdating(true);
    const updatedData = {
      ...ticket,
      Status: status,
      'Assigned To': assignedTo,
      Notes: notes,
      'Updated At': new Date().toISOString()
    };
    await onUpdate(updatedData);
    setUpdating(false);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Assigned To</Label>
          <Input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
        </div>
        <div className="col-span-2 space-y-2">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={updating}>
          {updating ? 'Updating...' : 'Update Ticket'}
        </Button>
      </div>
    </div>
  );
}

export default function Tickets() {
  const { data: tickets, loading, refetch, addRow, updateRow, deleteRow } = useGoogleSheetsDB('ticket_management');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [roomNo, setRoomNo] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [priority, setPriority] = useState<string | undefined>();
  const [requestText, setRequestText] = useState('');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const ticketsArray = Array.isArray(tickets) ? tickets : [];

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'destructive';
      case 'in progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

const handleCreateTicket = async () => {
  if (!guestName || !roomNo || !category || !requestText) {
    toast({ title: 'Missing details', description: 'Please fill guest, room, category and request.' })
    return
  }
  setCreating(true)
  const row = {
    'Ticket ID': `TCK-${Date.now()}`,
    'Guest Name': guestName,
    'Room No': roomNo,
    'Category': category,
    'Priority': priority || '',
    'Request': requestText,
    'Status': 'Open',
    'Assigned To': '',
    'Created At': new Date().toISOString(),
    'Notes': ''
  }
  const ok = await addRow(row)
  setCreating(false)
  if (ok) {
    toast({ title: 'Ticket Created', description: 'New ticket has been added and synced to Google Sheets.' })
    // reset
    setGuestName(''); setRoomNo(''); setCategory(undefined); setPriority(undefined); setRequestText('')
    setIsCreateDialogOpen(false)
  }
}

  const handleUpdateTicket = async (updatedData: any) => {
    const ticketIndex = tickets.findIndex((t: any) => t['Ticket ID'] === selectedTicket?.['Ticket ID']);
    if (ticketIndex === -1) {
      toast({ title: "Error", description: "Ticket not found." });
      return;
    }
    
    const success = await updateRow(ticketIndex, updatedData);
    if (success) {
      toast({
        title: "Ticket Updated",
        description: "Changes have been synced to Google Sheets.",
      });
      setSelectedTicket(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading tickets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ticket Management</h1>
          <p className="text-muted-foreground">
            Manage guest requests and issues with real-time sync
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
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Ticket</DialogTitle>
                <DialogDescription>
                  Add a new guest request or issue to the system
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
<Label htmlFor="guestName">Guest Name</Label>
<Input id="guestName" placeholder="Enter guest name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                </div>
                <div className="space-y-2">
<Label htmlFor="roomNo">Room Number</Label>
<Input id="roomNo" placeholder="e.g., 205" value={roomNo} onChange={(e) => setRoomNo(e.target.value)} />
                </div>
                <div className="space-y-2">
<Label htmlFor="category">Category</Label>
<Select value={category} onValueChange={setCategory}>
  <SelectTrigger>
    <SelectValue placeholder="Select category" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Technical">Technical</SelectItem>
    <SelectItem value="Housekeeping">Housekeeping</SelectItem>
    <SelectItem value="Food & Beverage">Food & Beverage</SelectItem>
    <SelectItem value="Concierge">Concierge</SelectItem>
    <SelectItem value="Other">Other</SelectItem>
  </SelectContent>
</Select>
                </div>
                <div className="space-y-2">
<Label htmlFor="priority">Priority</Label>
<Select value={priority} onValueChange={setPriority}>
  <SelectTrigger>
    <SelectValue placeholder="Select priority" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="High">High</SelectItem>
    <SelectItem value="Medium">Medium</SelectItem>
    <SelectItem value="Low">Low</SelectItem>
  </SelectContent>
</Select>
                </div>
                <div className="col-span-2 space-y-2">
<Label htmlFor="request">Request/Query</Label>
<Textarea id="request" placeholder="Describe the issue or request" value={requestText} onChange={(e) => setRequestText(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
<Button onClick={handleCreateTicket} disabled={creating}>{creating ? 'Creating...' : 'Create Ticket'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsArray.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {ticketsArray.filter(t => t.Status === 'Open').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {ticketsArray.filter(t => t.Status === 'In Progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {ticketsArray.filter(t => t.Status === 'Resolved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tickets</CardTitle>
          <CardDescription>
            All guest requests and issues with live updates from Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Guest Name</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ticketsArray.map((ticket, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {ticket['Ticket ID'] || `TK${String(index + 1).padStart(3, '0')}`}
                  </TableCell>
                  <TableCell>{ticket['Guest Name']}</TableCell>
                  <TableCell>{ticket['Room No']}</TableCell>
                  <TableCell>{ticket.Category}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeColor(ticket.Status)}>
                      {ticket.Status}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket['Assigned To']}</TableCell>
                  <TableCell>
                    {ticket['Created At'] ? new Date(ticket['Created At']).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(ticket)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {ticketsArray.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No tickets found. Create your first ticket to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedTicket && (
        <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Ticket #{selectedTicket['Ticket ID']}</DialogTitle>
              <DialogDescription>
                Update ticket information and sync changes to Google Sheets
              </DialogDescription>
            </DialogHeader>
            <EditTicketForm 
              ticket={selectedTicket}
              onUpdate={handleUpdateTicket}
              onCancel={() => setSelectedTicket(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}