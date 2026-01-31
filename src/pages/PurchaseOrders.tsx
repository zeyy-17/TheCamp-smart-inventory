import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreatePurchaseOrderDialog } from '@/components/CreatePurchaseOrderDialog';
import { BulkPurchaseOrderDialog } from '@/components/BulkPurchaseOrderDialog';
import { EditPurchaseOrderDialog } from '@/components/EditPurchaseOrderDialog';
import { Plus, Package, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const stores = ['All', 'Ampersand', 'hereX', 'Hardin'];

const PurchaseOrders = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeStore, setActiveStore] = useState('All');

  const { data: orders, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          products(name, sku),
          suppliers(name, contact_email, contact_phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const filteredOrders = orders?.filter(order => 
    activeStore === 'All' || order.store === activeStore
  );

  const handleEdit = (order: any) => {
    setSelectedOrder(order);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (order: any) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', selectedOrder.id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      toast.success("Purchase order deleted successfully!");
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      toast.error("Failed to delete purchase order");
    } finally {
      setDeleteDialogOpen(false);
      setSelectedOrder(null);
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'received': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStoreColor = (store: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (store) {
      case 'Ampersand': return 'default';
      case 'hereX': return 'secondary';
      case 'Hardin': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <main className="flex-1 overflow-y-auto bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Purchase Orders</h1>
            <p className="text-muted-foreground">Track and manage your pre-ordered stocks</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
            <Button onClick={() => setBulkDialogOpen(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Bulk Create
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle>All Purchase Orders</CardTitle>
              </div>
            </div>
            <CardDescription>View all your purchase orders with supplier details</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeStore} onValueChange={setActiveStore} className="mb-4">
              <TabsList>
                {stores.map((store) => (
                  <TabsTrigger key={store} value={store}>
                    {store}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
            ) : !filteredOrders || filteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No purchase orders found{activeStore !== 'All' ? ` for ${activeStore}` : ''}. Create your first order to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Expected Delivery</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          <Badge variant={getStoreColor(order.store)}>
                            {order.store || 'N/A'}
                          </Badge>
                        </TableCell>
                        <TableCell>{order.products?.name || 'N/A'}</TableCell>
                        <TableCell className="text-muted-foreground">{order.products?.sku || 'N/A'}</TableCell>
                        <TableCell>{order.suppliers?.name || 'N/A'}</TableCell>
                        <TableCell className="text-sm">
                          {order.suppliers?.contact_email && (
                            <div>{order.suppliers.contact_email}</div>
                          )}
                          {order.suppliers?.contact_phone && (
                            <div className="text-muted-foreground">{order.suppliers.contact_phone}</div>
                          )}
                        </TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>
                          {format(new Date(order.expected_delivery_date), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {order.notes || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(order)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(order)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <CreatePurchaseOrderDialog 
          open={dialogOpen} 
          onOpenChange={setDialogOpen}
        />
        <BulkPurchaseOrderDialog 
          open={bulkDialogOpen} 
          onOpenChange={setBulkDialogOpen}
        />
        <EditPurchaseOrderDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          order={selectedOrder}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Purchase Order</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this purchase order? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </main>
  );
};

export default PurchaseOrders;
