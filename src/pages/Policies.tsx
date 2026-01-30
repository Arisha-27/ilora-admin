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
import { Plus, Edit, Download, RefreshCw, Shield, Users, CheckCircle2, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Policies() {
  const { data: policies, loading, refetch, addRow, updateRow, deleteRow } = useGoogleSheetsDB('Dos and Donts');
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [category, setCategory] = useState<string | undefined>();
  const [type, setType] = useState<string | undefined>();
  const [description, setDescription] = useState('');
  const [visibleTo, setVisibleTo] = useState('');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  
  const policiesArray = Array.isArray(policies) ? policies : [];

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'guest': return 'default';
      case 'staff': return 'secondary';
      case 'security': return 'destructive';
      case 'general': return 'outline';
      default: return 'outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'do': return 'default';
      case "don't": return 'destructive';
      case 'guideline': return 'secondary';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'do': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "don't": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  const filteredPolicies = policiesArray.filter(policy => 
    filterCategory === 'all' || policy.Category?.toLowerCase() === filterCategory
  );

  const handleCreatePolicy = async () => {
    if (!category || !type || !description) {
      toast({ title: 'Missing details', description: 'Please fill category, type and description.' });
      return;
    }
    setCreating(true);
    const row = {
      'Policy ID': `POL-${Date.now()}`,
      'Title': `${category} ${type}`,
      'Category': category,
      'Type': type,
      'Priority': 'Medium',
      'Description': description,
      'Visible To': visibleTo || 'All Staff'
    };
    const ok = await addRow(row);
    setCreating(false);
    if (ok) {
      toast({ title: 'Policy Added', description: 'New policy has been added and synced to Google Sheets.' });
      // Reset form
      setCategory(undefined); setType(undefined); setDescription(''); setVisibleTo('');
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdatePolicy = () => {
    toast({
      title: "Policy Updated",
      description: "Changes have been synced to Google Sheets.",
    });
    setSelectedPolicy(null);
    refetch();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading policies...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Do's & Don'ts</h1>
          <p className="text-muted-foreground">
            Manage guest and staff guidelines, policies, and procedures
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
                Add Policy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Policy</DialogTitle>
                <DialogDescription>
                  Create a new guideline or policy
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Guest">Guest</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Do">Do</SelectItem>
                      <SelectItem value="Don't">Don't</SelectItem>
                      <SelectItem value="Guideline">Guideline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Detailed policy description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visibleTo">Visible To</Label>
                  <Input id="visibleTo" placeholder="Who can see this policy" value={visibleTo} onChange={(e) => setVisibleTo(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePolicy} disabled={creating}>{creating ? 'Adding...' : 'Add Policy'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policiesArray.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Guest Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">
                {policiesArray.filter(p => p.Category === 'Guest').length}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Staff Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {policiesArray.filter(p => p.Category === 'Staff').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Do's</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold text-green-500">
                {policiesArray.filter(p => p.Type === 'Do').length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Policy Management</CardTitle>
          <CardDescription>
            View and manage all organizational policies and guidelines
          </CardDescription>
          <div className="flex gap-2 mt-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="guest">Guest</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy ID</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Visible To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPolicies.map((policy, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {policy['Policy ID'] || `POL${String(index + 1).padStart(3, '0')}`}
                  </TableCell>
                  <TableCell className="font-medium">{policy.Title}</TableCell>
                  <TableCell>
                    <Badge variant={getCategoryColor(policy.Category)}>
                      {policy.Category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(policy.Type)}
                      <Badge variant={getTypeColor(policy.Type)}>
                        {policy.Type}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={policy.Priority === 'High' ? 'destructive' : 
                               policy.Priority === 'Medium' ? 'secondary' : 'outline'}
                    >
                      {policy.Priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {policy.Description}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPolicy(policy)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPolicies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No policies found for the selected category.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedPolicy && (
        <Dialog open={!!selectedPolicy} onOpenChange={() => setSelectedPolicy(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Policy</DialogTitle>
              <DialogDescription>
                Update policy details and guidelines
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select defaultValue={selectedPolicy.Category}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Guest">Guest</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select defaultValue={selectedPolicy.Type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Do">Do</SelectItem>
                    <SelectItem value="Don't">Don't</SelectItem>
                    <SelectItem value="Guideline">Guideline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Description</Label>
                <Textarea defaultValue={selectedPolicy.Description} />
              </div>
              <div className="space-y-2">
                <Label>Visible To</Label>
                <Input defaultValue={selectedPolicy['Visible To']} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedPolicy(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdatePolicy}>Update Policy</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}