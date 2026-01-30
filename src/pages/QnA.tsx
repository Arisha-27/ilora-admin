import { useState } from 'react';
import { useGoogleSheetsDB } from '@/hooks/useGoogleSheetsDB';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Download, RefreshCw, HelpCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Edit QnA Form Component
function EditQnAForm({ qna, onUpdate, onCancel }: { qna: any, onUpdate: (data: any) => void, onCancel: () => void }) {
  const [question, setQuestion] = useState(qna.Question || '');
  const [answer, setAnswer] = useState(qna.Answer || '');
  const [usageCount, setUsageCount] = useState(qna['Usage Count'] || '0');
  const [status, setStatus] = useState(qna.Status || 'Active');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!question || !answer) {
      toast({ title: 'Missing details', description: 'Please fill question and answer.' });
      return;
    }
    setUpdating(true);
    const updatedData = {
      ...qna,
      Question: question,
      Answer: answer,
      'Usage Count': usageCount,
      Status: status,
      'Last Updated': new Date().toISOString()
    };
    await onUpdate(updatedData);
    setUpdating(false);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Question</Label>
        <Input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Enter the question" />
      </div>
      <div className="space-y-2">
        <Label>Answer</Label>
        <Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Enter the detailed answer" className="min-h-24" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Usage Count</Label>
          <Input value={usageCount} onChange={(e) => setUsageCount(e.target.value)} type="number" placeholder="0" />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={updating}>
          {updating ? 'Updating...' : 'Update Q&A'}
        </Button>
      </div>
    </div>
  );
}

export default function QnA() {
  const { data: qnaData, loading, refetch, addRow, updateRow, deleteRow } = useGoogleSheetsDB('QnA_Manager');
  const [selectedQnA, setSelectedQnA] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [usageCount, setUsageCount] = useState('0');
  const [status, setStatus] = useState('Active');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  const qnaArray = Array.isArray(qnaData) ? qnaData : [];

  const handleCreateQnA = async () => {
    if (!question || !answer) {
      toast({ title: 'Missing details', description: 'Please fill question and answer.' });
      return;
    }
    setCreating(true);
    const row = {
      'QnA ID': `QNA-${Date.now()}`,
      'Question': question,
      'Answer': answer,
      'Usage Count': usageCount,
      'Last Updated': new Date().toISOString(),
      'Status': status
    };
    const ok = await addRow(row);
    setCreating(false);
    if (ok) {
      toast({ title: 'Q&A Added', description: 'New question and answer has been added and synced to Google Sheets.' });
      // Reset form
      setQuestion(''); setAnswer(''); setUsageCount('0'); setStatus('Active');
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdateQnA = async (updatedData: any) => {
    const qnaIndex = qnaData.findIndex((q: any) => q['QnA ID'] === selectedQnA?.['QnA ID']);
    if (qnaIndex === -1) {
      toast({ title: "Error", description: "Q&A not found." });
      return;
    }
    
    const success = await updateRow(qnaIndex, updatedData);
    if (success) {
      toast({
        title: "Q&A Updated",
        description: "Changes have been synced to Google Sheets.",
      });
      setSelectedQnA(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading Q&A...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Q&A Manager</h1>
          <p className="text-muted-foreground">
            Manage FAQ questions and answers for chatbot integration
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
                Add Q&A
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Q&A</DialogTitle>
                <DialogDescription>
                  Create a new question and answer for the chatbot
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Input id="question" placeholder="Enter the question" value={question} onChange={(e) => setQuestion(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="answer">Answer</Label>
                  <Textarea id="answer" placeholder="Enter the detailed answer" className="min-h-24" value={answer} onChange={(e) => setAnswer(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="usageCount">Usage Count</Label>
                    <Input id="usageCount" type="number" placeholder="0" value={usageCount} onChange={(e) => setUsageCount(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Input id="status" placeholder="Active" value={status} onChange={(e) => setStatus(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateQnA} disabled={creating}>{creating ? 'Adding...' : 'Add Q&A'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Q&As</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">{qnaArray.length}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {qnaArray.reduce((total, q) => total + (parseInt(q['Usage Count']) || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {qnaArray.filter(q => q.Status !== 'Inactive').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Question & Answer Database</CardTitle>
          <CardDescription>
            All FAQ content connected to your chatbot system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>QnA ID</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Answer</TableHead>
                <TableHead>Usage Count</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qnaArray.map((qna, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {qna['QnA ID'] || `QNA${String(index + 1).padStart(3, '0')}`}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="font-medium truncate" title={qna.Question}>
                      {qna.Question}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={qna.Answer}>
                    {qna.Answer}
                  </TableCell>
                  <TableCell>{qna['Usage Count'] || 0}</TableCell>
                  <TableCell>
                    {qna['Last Updated'] ? new Date(qna['Last Updated']).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>{qna.Status || 'Active'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedQnA(qna)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {qnaArray.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No Q&A entries found. Add your first question to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedQnA && (
        <Dialog open={!!selectedQnA} onOpenChange={() => setSelectedQnA(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Q&A #{selectedQnA['QnA ID']}</DialogTitle>
              <DialogDescription>
                Update question and answer information
              </DialogDescription>
            </DialogHeader>
            <EditQnAForm 
              qna={selectedQnA}
              onUpdate={handleUpdateQnA}
              onCancel={() => setSelectedQnA(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}