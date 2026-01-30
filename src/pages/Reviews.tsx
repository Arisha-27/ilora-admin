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
import { Plus, MessageSquare, Download, RefreshCw, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Edit Review Form Component
function EditReviewForm({ review, onUpdate, onCancel }: { review: any, onUpdate: (data: any) => void, onCancel: () => void }) {
  const [status, setStatus] = useState(review.Status || 'Open');
  const [assignedTicket, setAssignedTicket] = useState(review['Assigned Ticket'] || '');
  const [replyMessage, setReplyMessage] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async () => {
    setUpdating(true);
    const updatedData = {
      ...review,
      Status: status,
      'Assigned Ticket': assignedTicket,
      'Reply Message': replyMessage,
      'Updated At': new Date().toISOString()
    };
    await onUpdate(updatedData);
    setUpdating(false);
  };

  return (
    <div className="space-y-4 py-4">
      <div>
        <Label>Review Text</Label>
        <div className="p-3 bg-muted rounded-lg mt-2">
          {review['Review Text']}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Replied">Replied</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Assigned Ticket</Label>
          <Input value={assignedTicket} onChange={(e) => setAssignedTicket(e.target.value)} placeholder="Link to ticket ID" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Reply Message</Label>
        <Textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} placeholder="Write your reply to the guest..." />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={updating}>
          {updating ? 'Updating...' : 'Send Reply & Update'}
        </Button>
      </div>
    </div>
  );
}

export default function Reviews() {
  const { data: reviews, loading, refetch, addRow, updateRow, deleteRow } = useGoogleSheetsDB('review_managment');
  const [selectedReview, setSelectedReview] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [platform, setPlatform] = useState<string | undefined>();
  const [rating, setRating] = useState<string | undefined>();
  const [sentiment, setSentiment] = useState<string | undefined>();
  const [reviewText, setReviewText] = useState('');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  
  const reviewsArray = Array.isArray(reviews) ? reviews : [];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'default';
      case 'neutral': return 'secondary';
      case 'negative': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'destructive';
      case 'replied': return 'default';
      case 'resolved': return 'secondary';
      default: return 'outline';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handleCreateReview = async () => {
    if (!guestName || !platform || !rating || !reviewText) {
      toast({ title: 'Missing details', description: 'Please fill guest name, platform, rating and review text.' });
      return;
    }
    setCreating(true);
    const row = {
      'Review ID': `REV-${Date.now()}`,
      'Guest Name': guestName,
      'Platform': platform,
      'Rating': rating,
      'Sentiment': sentiment || 'Neutral',
      'Review Text': reviewText,
      'Status': 'Open',
      'Date': new Date().toISOString(),
      'Assigned Ticket': ''
    };
    const ok = await addRow(row);
    setCreating(false);
    if (ok) {
      toast({ title: 'Review Added', description: 'New review has been added and synced to Google Sheets.' });
      // Reset form
      setGuestName(''); setPlatform(undefined); setRating(undefined); setSentiment(undefined); setReviewText('');
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdateReview = async (updatedData: any) => {
    const reviewIndex = reviews.findIndex((r: any) => r['Review ID'] === selectedReview?.['Review ID']);
    if (reviewIndex === -1) {
      toast({ title: "Error", description: "Review not found." });
      return;
    }
    
    const success = await updateRow(reviewIndex, updatedData);
    if (success) {
      toast({
        title: "Review Updated",
        description: "Changes have been synced to Google Sheets.",
      });
      setSelectedReview(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading reviews...</span>
      </div>
    );
  }

  const avgRating = reviewsArray.length > 0 
    ? reviewsArray.reduce((sum, review) => sum + (parseInt(review.Rating) || 0), 0) / reviewsArray.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Review Management</h1>
          <p className="text-muted-foreground">
            Monitor and respond to guest reviews across all platforms
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
                Add Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Review</DialogTitle>
                <DialogDescription>
                  Manually add a review from any platform
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="guestName">Guest Name</Label>
                  <Input id="guestName" placeholder="Enter guest name" value={guestName} onChange={(e) => setGuestName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Google">Google</SelectItem>
                      <SelectItem value="TripAdvisor">TripAdvisor</SelectItem>
                      <SelectItem value="Booking.com">Booking.com</SelectItem>
                      <SelectItem value="Airbnb">Airbnb</SelectItem>
                      <SelectItem value="Direct">Direct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Select value={rating} onValueChange={setRating}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
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
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="reviewText">Review Text</Label>
                  <Textarea id="reviewText" placeholder="Enter the review content" value={reviewText} onChange={(e) => setReviewText(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateReview} disabled={creating}>{creating ? 'Adding...' : 'Add Review'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewsArray.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
              <div className="flex">
                {renderStars(Math.round(avgRating))}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Replies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {reviewsArray.filter(r => r.Status === 'Open').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Positive Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {reviewsArray.filter(r => r.Sentiment === 'Positive').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>
            All guest reviews from various platforms with sentiment analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Review ID</TableHead>
                <TableHead>Guest Name</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Sentiment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewsArray.map((review, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {review['Review ID'] || `REV${String(index + 1).padStart(3, '0')}`}
                  </TableCell>
                  <TableCell>{review['Guest Name']}</TableCell>
                  <TableCell>{review.Platform}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderStars(parseInt(review.Rating) || 0)}
                      <span className="ml-1 text-sm">{review.Rating}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getSentimentColor(review.Sentiment)}>
                      {review.Sentiment}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(review.Status)}>
                      {review.Status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {review.Date ? new Date(review.Date).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedReview(review)}>
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {reviewsArray.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No reviews found. Add your first review to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reply/Edit Dialog */}
      {selectedReview && (
        <Dialog open={!!selectedReview} onOpenChange={() => setSelectedReview(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review #{selectedReview['Review ID']}</DialogTitle>
              <DialogDescription>
                Reply to review and update status
              </DialogDescription>
            </DialogHeader>
            <EditReviewForm 
              review={selectedReview}
              onUpdate={handleUpdateReview}
              onCancel={() => setSelectedReview(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}