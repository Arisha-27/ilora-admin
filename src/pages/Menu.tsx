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
import { Plus, Edit, Download, RefreshCw, ChefHat, DollarSign, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Edit Menu Item Form Component
function EditMenuItemForm({ item, onUpdate, onCancel }: { item: any, onUpdate: (data: any) => void, onCancel: () => void }) {
  const [type, setType] = useState(item.Type || '');
  const [itemName, setItemName] = useState(item.Item || '');
  const [price, setPrice] = useState(item.Price || '');
  const [description, setDescription] = useState(item.Description || '');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!type || !itemName || !price) {
      toast({ title: 'Missing details', description: 'Please fill type, item name, and price.' });
      return;
    }
    setUpdating(true);
    const updatedData = {
      ...item,
      Type: type,
      Item: itemName,
      Price: price.startsWith('$') ? price : `$${price}`,
      Description: description,
      'Last Updated': new Date().toISOString()
    };
    await onUpdate(updatedData);
    setUpdating(false);
  };

  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Appetizer">Appetizer</SelectItem>
              <SelectItem value="Main Course">Main Course</SelectItem>
              <SelectItem value="Dessert">Dessert</SelectItem>
              <SelectItem value="Beverage">Beverage</SelectItem>
              <SelectItem value="Special">Special</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Item Name</Label>
          <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Enter item name" />
        </div>
        <div className="space-y-2">
          <Label>Price</Label>
          <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$0.00" />
        </div>
        <div className="col-span-2 space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter item description" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={updating}>
          {updating ? 'Updating...' : 'Update Item'}
        </Button>
      </div>
    </div>
  );
}

export default function Menu() {
  const { data: menuItems, loading, refetch, addRow, updateRow, deleteRow } = useGoogleSheetsDB('Menu_Manager');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [type, setType] = useState<string | undefined>();
  const [itemName, setItemName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const { toast } = useToast();
  
  const demoMenuData = [
    { 'Item ID': 'MENU-001', Type: 'Main Course', Item: 'Margherita Pizza', Price: '$12.99', Description: 'Classic pizza with tomatoes, mozzarella, and basil' },
    { 'Item ID': 'MENU-002', Type: 'Appetizer', Item: 'Caesar Salad', Price: '$8.50', Description: 'Crisp romaine with parmesan and croutons' },
    { 'Item ID': 'MENU-003', Type: 'Main Course', Item: 'Grilled Salmon', Price: '$18.75', Description: 'Fresh salmon with lemon butter sauce' },
    { 'Item ID': 'MENU-004', Type: 'Dessert', Item: 'Chocolate Lava Cake', Price: '$7.25', Description: 'Warm chocolate cake with molten center' },
  ];

  const menuArray = Array.isArray(menuItems) && menuItems.length > 0 ? menuItems : demoMenuData;

  // Filter menu items by category
  const filteredMenuItems = filterCategory === 'all' 
    ? menuArray 
    : menuArray.filter(item => item.Type === filterCategory);

  // Get unique categories for filter
  const categories = ['all', ...new Set(menuArray.map(item => item.Type))];

  const getCategoryColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'appetizer': return 'default';
      case 'main course': return 'secondary';
      case 'dessert': return 'outline';
      case 'beverage': return 'destructive';
      case 'special': return 'default';
      default: return 'outline';
    }
  };

  const handleCreateItem = async () => {
    if (!type || !itemName || !price) {
      toast({ title: 'Missing details', description: 'Please fill type, item name, and price.' });
      return;
    }
    setCreating(true);
    const row = {
      'Item ID': `MENU-${Date.now()}`,
      Type: type,
      Item: itemName,
      Price: price.startsWith('$') ? price : `$${price}`,
      Description: description
    };
    const ok = await addRow(row);
    setCreating(false);
    if (ok) {
      toast({ title: 'Menu Item Added', description: 'New menu item has been added and synced to Google Sheets.' });
      // Reset form
      setType(undefined); setItemName(''); setPrice(''); setDescription('');
      setIsCreateDialogOpen(false);
    }
  };

  const handleUpdateItem = async (updatedData: any) => {
    const itemIndex = menuItems.findIndex((m: any) => m['Item ID'] === selectedItem?.['Item ID']);
    if (itemIndex === -1) {
      toast({ title: "Error", description: "Menu item not found." });
      return;
    }
    
    const success = await updateRow(itemIndex, updatedData);
    if (success) {
      toast({
        title: "Menu Item Updated",
        description: "Changes have been synced to Google Sheets.",
      });
      setSelectedItem(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading menu...</span>
      </div>
    );
  }

  const avgPrice = menuArray.length > 0 
    ? menuArray.reduce((sum, item) => sum + (parseFloat(item.Price?.replace('$', '')) || 0), 0) / menuArray.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Manager</h1>
          <p className="text-muted-foreground">
            Manage restaurant menu items, prices, and descriptions
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
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Menu Item</DialogTitle>
                <DialogDescription>
                  Add a new item to the menu
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Appetizer">Appetizer</SelectItem>
                      <SelectItem value="Main Course">Main Course</SelectItem>
                      <SelectItem value="Dessert">Dessert</SelectItem>
                      <SelectItem value="Beverage">Beverage</SelectItem>
                      <SelectItem value="Special">Special</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemName">Item Name</Label>
                  <Input id="itemName" placeholder="Enter item name" value={itemName} onChange={(e) => setItemName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" placeholder="$0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Enter item description" value={description} onChange={(e) => setDescription(e.target.value)} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateItem} disabled={creating}>{creating ? 'Adding...' : 'Add Item'}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menuArray.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold">${avgPrice.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ChefHat className="h-4 w-4 text-primary" />
              <div className="text-2xl font-bold">
                {new Set(menuArray.map(item => item.Type)).size}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Filtered Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {filteredMenuItems.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Menu Items</CardTitle>
              <CardDescription>
                All menu items with type, pricing and descriptions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMenuItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {item['Item ID'] || `MENU${String(index + 1).padStart(3, '0')}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCategoryColor(item.Type)}>
                      {item.Type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{item.Item}</TableCell>
                  <TableCell className="font-semibold text-green-600">
                    {item.Price}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {item.Description}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedItem(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredMenuItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No menu items found for the selected category.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
              <DialogDescription>
                Update item details and sync changes to Google Sheets
              </DialogDescription>
            </DialogHeader>
            <EditMenuItemForm 
              item={selectedItem}
              onUpdate={handleUpdateItem}
              onCancel={() => setSelectedItem(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}