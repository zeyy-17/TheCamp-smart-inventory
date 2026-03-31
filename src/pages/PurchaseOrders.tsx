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
import { ChangeStatusDialog } from '@/components/ChangeStatusDialog';
import { Plus, Package, Pencil, Trash2, FileText, Eye, ArrowUpDown, Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatusGroup, setSelectedStatusGroup] = useState<any>(null);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'item-asc' | 'item-desc'>('date-desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'received' | 'cancelled'>('all');

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

      // Auto-update pending orders whose expected delivery date has passed
      const today = new Date().toISOString().split('T')[0];
      const pendingDue = data?.filter(
        (o) => o.status === 'pending' && o.expected_delivery_date <= today
      );

      if (pendingDue && pendingDue.length > 0) {
        const ids = pendingDue.map((o) => o.id);
        await supabase
          .from('purchase_orders')
          .update({ status: 'received' })
          .in('id', ids);

        // Update inventory for each auto-received order
        for (const order of pendingDue) {
          if (order.product_id) {
            const { data: product } = await supabase
              .from('products')
              .select('quantity')
              .eq('id', order.product_id)
              .single();

            if (product) {
              await supabase
                .from('products')
                .update({
                  quantity: (product.quantity || 0) + order.quantity,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', order.product_id);

              await supabase.from('movements').insert({
                product_id: order.product_id,
                qty_change: order.quantity,
                reason: `Purchase Order ${order.invoice_number || '#' + order.id} auto-received on delivery date`,
              });
            }
          }
        }

        // Re-fetch with updated statuses
        const { data: refreshed, error: refreshError } = await supabase
          .from('purchase_orders')
          .select(`
            *,
            products(name, sku, cost_price),
            suppliers(name, contact_email, contact_phone)
          `)
          .order('created_at', { ascending: false });

        if (refreshError) throw refreshError;
        return refreshed;
      }

      return data;
    }
  });

  const filteredOrders = orders?.filter(order => 
    (activeStore === 'All' || order.store === activeStore) &&
    (statusFilter === 'all' || order.status === statusFilter)
  );

  // Sort helper
  const sortOrders = (items: any[]) => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case 'date-asc':
          return new Date(a.expected_delivery_date || a.expectedDeliveryDate).getTime() - new Date(b.expected_delivery_date || b.expectedDeliveryDate).getTime();
        case 'date-desc':
          return new Date(b.expected_delivery_date || b.expectedDeliveryDate).getTime() - new Date(a.expected_delivery_date || a.expectedDeliveryDate).getTime();
        case 'item-asc': {
          const nameA = (a.products?.name || a.products?.[0]?.name || a.invoiceNumber || '').toLowerCase();
          const nameB = (b.products?.name || b.products?.[0]?.name || b.invoiceNumber || '').toLowerCase();
          return nameA.localeCompare(nameB);
        }
        case 'item-desc': {
          const nameA = (a.products?.name || a.products?.[0]?.name || a.invoiceNumber || '').toLowerCase();
          const nameB = (b.products?.name || b.products?.[0]?.name || b.invoiceNumber || '').toLowerCase();
          return nameB.localeCompare(nameA);
        }
        default:
          return 0;
      }
    });
  };

  // For "All" tab, group orders by invoice number to show consolidated view
  const groupedByInvoice = activeStore === 'All' && orders 
    ? orders.filter(o => statusFilter === 'all' || o.status === statusFilter).reduce((acc, order) => {
        const invoiceNum = order.invoice_number || `#${order.id}`;
        if (!acc[invoiceNum]) {
          acc[invoiceNum] = {
            invoiceNumber: invoiceNum,
            orders: [],
            stores: new Set<string>(),
            products: [] as Array<{ name: string; sku: string; quantity: number; store: string }>,
            supplier: order.suppliers,
            expectedDeliveryDate: order.expected_delivery_date,
            status: order.status,
            notes: order.notes,
            firstOrder: order,
          };
        }
        acc[invoiceNum].orders.push(order);
        if (order.store) acc[invoiceNum].stores.add(order.store);
        acc[invoiceNum].products.push({
          name: order.products?.name || 'Unknown',
          sku: order.products?.sku || 'N/A',
          quantity: order.quantity,
          store: order.store || 'N/A',
        });
        return acc;
      }, {} as Record<string, any>)
    : {};

  const groupedInvoices = sortOrders(Object.values(groupedByInvoice));
  const sortedFilteredOrders = filteredOrders ? sortOrders(filteredOrders) : [];

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

  // Get invoice items for the selected invoice
  const getInvoiceItems = () => {
    if (!selectedInvoice || !orders) return [];
    const invoiceOrders = orders.filter(o => o.invoice_number === selectedInvoice);
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
    const invoiceOrders = orders.filter(o => o.invoice_number === selectedInvoice);
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
    <main className="flex-1 overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-metallic-black mb-2">Purchase Orders</h1>
            <p className="text-page-foreground/70">Track and manage your pre-ordered stocks</p>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    Sort: {sortBy === 'date-desc' ? 'Newest First' : sortBy === 'date-asc' ? 'Oldest First' : sortBy === 'item-asc' ? 'Item A-Z' : 'Item Z-A'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('date-desc')}>Date: Newest First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('date-asc')}>Date: Oldest First</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('item-asc')}>Item: A → Z</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('item-desc')}>Item: Z → A</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription>View all your purchase orders with supplier details</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeStore} onValueChange={setActiveStore} className="mb-4">
              <TabsList className="bg-accent/50 h-12 p-1 gap-1">
                {stores.map((store) => (
                  <TabsTrigger key={store} value={store} className="px-6 py-2.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-foreground">
                    {store}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
            ) : (activeStore === 'All' ? groupedInvoices.length === 0 : sortedFilteredOrders.length === 0) ? (
              <div className="text-center py-8 text-muted-foreground">
                No purchase orders found{activeStore !== 'All' ? ` for ${activeStore}` : ''}. Create your first order to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO #</TableHead>
                      <TableHead>Store(s)</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Expected Delivery</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeStore === 'All' ? (
                      // Grouped view for "All" tab - shows invoice with all stores
                      groupedInvoices.map((group: any) => (
                        <TableRow key={group.invoiceNumber}>
                          <TableCell className="font-medium">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-1 p-0 h-auto font-medium hover:text-primary"
                              onClick={() => handleViewInvoice(group.invoiceNumber)}
                            >
                              <FileText className="h-3 w-3 text-muted-foreground" />
                              {group.invoiceNumber}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {Array.from(group.stores).map((store: string) => (
                                <Badge key={store} variant={getStoreColor(store)}>
                                  {store}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1 max-w-xs">
                              {group.products.map((product: any, idx: number) => (
                                <div key={idx} className="text-sm">
                                  <span className="font-medium">{product.name}</span>
                                  <span className="text-muted-foreground"> ({product.sku})</span>
                                  <span className="text-muted-foreground"> × {product.quantity}</span>
                                  <Badge variant="outline" className="ml-1 text-xs">{product.store}</Badge>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>{group.supplier?.name || 'N/A'}</TableCell>
                          <TableCell className="text-sm">
                            {group.supplier?.contact_email && (
                              <div>{group.supplier.contact_email}</div>
                            )}
                            {group.supplier?.contact_phone && (
                              <div className="text-muted-foreground">{group.supplier.contact_phone}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            {format(new Date(group.expectedDeliveryDate), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusColor(group.status)}
                              className={group.status === 'pending' ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
                              onClick={() => {
                                if (group.status === 'received' || group.status === 'cancelled') return;
                                setSelectedStatusGroup({
                                  invoiceNumber: group.invoiceNumber,
                                  status: group.status,
                                  orders: group.orders,
                                });
                                setStatusDialogOpen(true);
                              }}
                            >
                              {group.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {group.notes || '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewInvoice(group.invoiceNumber)}
                                title="View Invoice"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      // Individual view for store-specific tabs
                      sortedFilteredOrders.map((order: any) => (
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
                          <TableCell>
                            <div className="text-sm">
                              <span className="font-medium">{order.products?.name || 'N/A'}</span>
                              <span className="text-muted-foreground"> ({order.products?.sku || 'N/A'})</span>
                              <span className="text-muted-foreground"> × {order.quantity}</span>
                            </div>
                          </TableCell>
                          <TableCell>{order.suppliers?.name || 'N/A'}</TableCell>
                          <TableCell className="text-sm">
                            {order.suppliers?.contact_email && (
                              <div>{order.suppliers.contact_email}</div>
                            )}
                            {order.suppliers?.contact_phone && (
                              <div className="text-muted-foreground">{order.suppliers.contact_phone}</div>
                            )}
                          </TableCell>
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
                              {order.status === 'pending' && (
                                <>
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
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
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

        {selectedStatusGroup && (
          <ChangeStatusDialog
            open={statusDialogOpen}
            onOpenChange={setStatusDialogOpen}
            invoiceNumber={selectedStatusGroup.invoiceNumber}
            currentStatus={selectedStatusGroup.status}
            orders={selectedStatusGroup.orders}
          />
        )}

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
