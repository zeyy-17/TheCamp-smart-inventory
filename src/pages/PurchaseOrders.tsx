import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreatePurchaseOrderDialog } from '@/components/CreatePurchaseOrderDialog';
import { EditPurchaseOrderDialog } from '@/components/EditPurchaseOrderDialog';
import { PurchaseOrderInvoice } from '@/components/PurchaseOrderInvoice';
import { Plus, Package, Pencil, Trash2, FileText, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [activeStore, setActiveStore] = useState('All');
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['purchase-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchase_orders')
        .select(`
          *,
          products(name, sku, cost_price),
          suppliers(name, contact_email, contact_phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Filter orders by store
  const filteredOrders = orders?.filter(order => 
    activeStore === 'All' || order.store === activeStore
  );

  // Group orders by invoice for better display in All tab
  const groupedByInvoice = filteredOrders?.reduce((acc, order) => {
    const invoiceNum = order.invoice_number || `#${order.id}`;
    if (!acc[invoiceNum]) {
      acc[invoiceNum] = [];
    }
    acc[invoiceNum].push(order);
    return acc;
  }, {} as Record<string, typeof filteredOrders>);

  // Sort orders by store for All tab, otherwise keep by date
  const sortedFilteredOrders = activeStore === 'All' 
    ? [...(filteredOrders || [])].sort((a, b) => {
        // First sort by store
        const storeOrder = { 'Ampersand': 0, 'hereX': 1, 'Hardin': 2 };
        const storeCompare = (storeOrder[a.store as keyof typeof storeOrder] ?? 3) - 
                            (storeOrder[b.store as keyof typeof storeOrder] ?? 3);
        if (storeCompare !== 0) return storeCompare;
        // Then by date (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      })
    : filteredOrders;

  const handleEdit = (order: any) => {
    setSelectedOrder(order);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (order: any) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  const handleViewInvoice = (invoiceNumber: string) => {
    setSelectedInvoice(invoiceNumber);
    setInvoiceDialogOpen(true);
  };

  // Get invoice items for the selected invoice, filtered by store if not "All"
  const getInvoiceItems = () => {
    if (!selectedInvoice || !orders) return [];
    let invoiceOrders = orders.filter(o => o.invoice_number === selectedInvoice);
    
    // If viewing from a specific store tab, only show items for that store
    if (activeStore !== 'All') {
      invoiceOrders = invoiceOrders.filter(o => o.store === activeStore);
    }
    
    return invoiceOrders.map(order => ({
      productName: order.products?.name || 'Unknown',
      sku: order.products?.sku || 'N/A',
      store: order.store || 'N/A',
      quantity: order.quantity,
      unitPrice: order.products?.cost_price || 0,
      totalPrice: order.quantity * (order.products?.cost_price || 0),
    }));
  };

  const getInvoiceData = () => {
    if (!selectedInvoice || !orders) return null;
    let invoiceOrders = orders.filter(o => o.invoice_number === selectedInvoice);
    
    // If viewing from a specific store tab, only show items for that store
    if (activeStore !== 'All') {
      invoiceOrders = invoiceOrders.filter(o => o.store === activeStore);
    }
    
    if (invoiceOrders.length === 0) return null;
    const firstOrder = invoiceOrders[0];
    return {
      supplierName: firstOrder.suppliers?.name || 'Unknown',
      deliveryDate: new Date(firstOrder.expected_delivery_date),
    };
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
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Order
          </Button>
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
            ) : !sortedFilteredOrders || sortedFilteredOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No purchase orders found{activeStore !== 'All' ? ` for ${activeStore}` : ''}. Create your first order to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
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
                    {sortedFilteredOrders.map((order: any) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-1 p-0 h-auto font-medium hover:text-primary"
                            onClick={() => handleViewInvoice(order.invoice_number || `#${order.id}`)}
                          >
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            {order.invoice_number || `#${order.id}`}
                          </Button>
                        </TableCell>
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
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewInvoice(order.invoice_number || `#${order.id}`)}
                              title="View Invoice"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(order)}
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(order)}
                              title="Delete"
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

        {selectedInvoice && getInvoiceData() && (
          <PurchaseOrderInvoice
            open={invoiceDialogOpen}
            onOpenChange={setInvoiceDialogOpen}
            invoiceNumber={selectedInvoice}
            supplierName={getInvoiceData()!.supplierName}
            deliveryDate={getInvoiceData()!.deliveryDate}
            items={getInvoiceItems()}
          />
        )}
      </div>
    </main>
  );
};

export default PurchaseOrders;
