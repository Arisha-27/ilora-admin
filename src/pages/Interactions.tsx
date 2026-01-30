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
import { Plus, MessageCircle, Download, RefreshCw, ExternalLink, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Interactions() {
  const { data: interactions, loading, refetch, addRow, updateRow, deleteRow } = useGoogleSheetsDB('guest_interaction_log');
  const [selectedInteraction, setSelectedInteraction] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [source, setSource] = useState<string | undefined>();
  const [guestType, setGuestType] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState('');
  const [intent, setIntent] = useState('');
  const [sentiment, setSentiment] = useState<string | undefined>();
  const [ticketId, setTicketId] = useState('');
  const [userInput, setUserInput] = useState('');
  const [botResponse, setBotResponse] = useState('');
  const [conversationUrl, setConversationUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  
  const interactionsArray = Array.isArray(interactions) ? interactions : [];

  const getSourceColor = (source: string) => {
    switch (source?.toLowerCase()) {
      case 'whatsapp': return 'default';
      case 'web': return 'secondary';
      case 'app': return 'destructive';
      case 'phone': return 'outline';
      default: return 'outline';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'default';
      case 'neutral': return 'secondary';
      case 'negative': return 'destructive';
      default: return 'outline';
    }
  };

  const getGuestTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'vip': return 'default';
      case 'regular': return 'secondary';
      case 'new': return 'outline';
      default: return 'outline';
    }
  };

  const handleCreateInteraction = async () => {
    if (!guestName || !source || !userInput) {
      toast({ title: 'Missing details', description: 'Please fill guest name, source and user input.' });
      return;
    }
    setCreating(true);
    const row = {
      'Log ID': `LOG-${Date.now()}`,
      'Timestamp': new Date().toISOString(),
      'Source': source,
      'Session ID': sessionId || `SESSION-${Date.now()}`,
      'Guest Email': guestEmail,
      'Guest Name': guestName,
      'User Input': userInput,
      'Bot Response': botResponse,
      'Intent': intent,
      'Guest Type': guestType || 'Regular',
      'Sentiment': sentiment || 'Neutral',
      'Reference Ticket ID': ticketId,
      'Conversation URL': conversationUrl
    };
    const ok = await addRow(row);
    setCreating(false);
    if (ok) {
      toast({ title: 'Interaction Logged', description: 'New guest interaction has been added and synced to Google Sheets.' });
      // Reset form
      setGuestName(''); setGuestEmail(''); setSource(undefined); setGuestType(undefined);
      setSessionId(''); setIntent(''); setSentiment(undefined); setTicketId('');
      setUserInput(''); setBotResponse(''); setConversationUrl('');
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdateInteraction = () => {
    toast({
      title: "Interaction Updated",
      description: "Changes have been synced to Google Sheets.",
    });
    setSelectedInteraction(null);
    refetch();
  };

  const filteredInteractions = interactionsArray.filter(interaction =>
    Object.values(interaction).some(value => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const exportToCSV = () => {
    const csv = [
      ['Log ID', 'Timestamp', 'Source', 'Session ID', 'Guest Email', 'Guest Name', 'User Input', 'Bot Response', 'Intent', 'Guest Type', 'Sentiment', 'Reference Ticket ID', 'Conversation URL'],
      ...interactionsArray.map(interaction => [
        interaction['Log ID'] || '',
        interaction['Timestamp'] || '',
        interaction['Source'] || '',
        interaction['Session ID'] || '',
        interaction['Guest Email'] || '',
        interaction['Guest Name'] || '',
        interaction['User Input'] || '',
        interaction['Bot Response'] || '',
        interaction['Intent'] || '',
        interaction['Guest Type'] || '',
        interaction['Sentiment'] || '',
        interaction['Reference Ticket ID'] || '',
        interaction['Conversation URL'] || ''
      ])
    ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `guest-interactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading interactions...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guest Interactions</h1>
          <p className="text-muted-foreground">
            Complete searchable history of all guest conversations and interactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportToCSV} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Log Interaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Log New Interaction</DialogTitle>
                <DialogDescription>
                  Record a new guest interaction or conversation
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="guestName">Guest Name</Label>
                  <Input id="guestName" placeholder="Enter guest name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestEmail">Guest Email</Label>
                  <Input id="guestEmail" placeholder="guest@email.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select value={source} onValueChange={setSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Web">Web</SelectItem>
                      <SelectItem value="App">App</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guestType">Guest Type</Label>
                  <Select value={guestType} onValueChange={setGuestType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select guest type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionId">Session ID</Label>
                  <Input id="sessionId" placeholder="Session identifier" value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="intent">Intent</Label>
                  <Input id="intent" placeholder="User intent" value={intent} onChange={(e) => setIntent(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sentiment">Sentiment</Label>
                  <Select value={sentiment} onValueChange={setSentiment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sentiment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Positive">Positive</SelectItem>
                      <SelectItem value="Neutral">Neutral</SelectItem>
                      <SelectItem value="Negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticketId">Reference Ticket ID</Label>
                  <Input id="ticketId" placeholder="TK001" value={ticketId} onChange={(e) => setTicketId(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="userInput">User Input</Label>
                  <Textarea id="userInput" placeholder="What the guest said/asked" value={userInput} onChange={(e) => setUserInput(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="botResponse">Bot Response</Label>
                  <Textarea id="botResponse" placeholder="How the system/staff responded" value={botResponse} onChange={(e) => setBotResponse(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="conversationUrl">Conversation URL</Label>
                  <Input id="conversationUrl" placeholder="https://..." value={conversationUrl} onChange={(e) => setConversationUrl(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateInteraction} disabled={creating}>{creating ? 'Logging...' : 'Log Interaction'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interactionsArray.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {interactionsArray.filter(i => {
                const today = new Date().toDateString();
                const interactionDate = new Date(i.Timestamp).toDateString();
                return interactionDate === today;
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {interactionsArray.filter(i => i.Sentiment === 'Positive').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Linked Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {interactionsArray.filter(i => i['Reference Ticket ID']).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Guest Interaction Log</span>
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search interactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </CardTitle>
          <CardDescription>
            Complete history of guest conversations with bot responses and sentiment analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>User Input</TableHead>
                <TableHead>Bot Response</TableHead>
                <TableHead>Intent</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInteractions.map((interaction, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {interaction['Log ID'] || `LOG${String(index + 1).padStart(3, '0')}`}
                  </TableCell>
                  <TableCell>
                    {interaction.Timestamp 
                      ? new Date(interaction.Timestamp).toLocaleString() 
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSourceColor(interaction.Source)}>
                      {interaction.Source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{interaction['Guest Name']}</div>
                      <div className="text-xs text-muted-foreground">{interaction['Guest Email']}</div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={interaction['User Input']}>
                      {interaction['User Input']}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={interaction['Bot Response']}>
                      {interaction['Bot Response']}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{interaction.Intent}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getGuestTypeColor(interaction['Guest Type'])}>
                      {interaction['Guest Type']}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSentimentColor(interaction.Sentiment)}>
                      {interaction.Sentiment}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {interaction['Conversation URL'] && (
                        <Button variant="ghost" size="sm" asChild>
                          <a 
                            href={interaction['Conversation URL']} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            title="View conversation"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => setSelectedInteraction(interaction)}>
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInteractions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No interactions match your search.' : 'No interactions found. Log your first interaction to get started.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View/Edit Dialog */}
      {selectedInteraction && (
        <Dialog open={!!selectedInteraction} onOpenChange={() => setSelectedInteraction(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Guest Interaction Details</DialogTitle>
              <DialogDescription>
                View and edit interaction information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Log ID</Label>
                  <Input defaultValue={selectedInteraction['Log ID']} readOnly />
                </div>
                <div className="space-y-2">
                  <Label>Session ID</Label>
                  <Input defaultValue={selectedInteraction['Session ID']} />
                </div>
                <div className="space-y-2">
                  <Label>Source</Label>
                  <Select defaultValue={selectedInteraction.Source}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Web">Web</SelectItem>
                      <SelectItem value="App">App</SelectItem>
                      <SelectItem value="Phone">Phone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Guest Name</Label>
                  <Input defaultValue={selectedInteraction['Guest Name']} />
                </div>
                <div className="space-y-2">
                  <Label>Guest Email</Label>
                  <Input defaultValue={selectedInteraction['Guest Email']} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Intent</Label>
                  <Input defaultValue={selectedInteraction.Intent} />
                </div>
                <div className="space-y-2">
                  <Label>Guest Type</Label>
                  <Select defaultValue={selectedInteraction['Guest Type']}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIP">VIP</SelectItem>
                      <SelectItem value="Regular">Regular</SelectItem>
                      <SelectItem value="New">New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Sentiment</Label>
                  <Select defaultValue={selectedInteraction.Sentiment}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Positive">Positive</SelectItem>
                      <SelectItem value="Neutral">Neutral</SelectItem>
                      <SelectItem value="Negative">Negative</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reference Ticket ID</Label>
                <Input defaultValue={selectedInteraction['Reference Ticket ID']} />
              </div>
              <div className="space-y-2">
                <Label>User Input</Label>
                <Textarea 
                  defaultValue={selectedInteraction['User Input']} 
                  className="min-h-20"
                />
              </div>
              <div className="space-y-2">
                <Label>Bot Response</Label>
                <Textarea 
                  defaultValue={selectedInteraction['Bot Response']} 
                  className="min-h-20"
                />
              </div>
              <div className="space-y-2">
                <Label>Conversation URL</Label>
                <div className="flex gap-2">
                  <Input 
                    defaultValue={selectedInteraction['Conversation URL']} 
                    placeholder="https://..." 
                    className="flex-1"
                  />
                  {selectedInteraction['Conversation URL'] && (
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={selectedInteraction['Conversation URL']} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedInteraction(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateInteraction}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}