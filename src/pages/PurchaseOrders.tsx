import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreatePurchaseOrderDialog } from '@/components/CreatePurchaseOrderDialog';
import { EditPurchaseOrderDialog } from '@/components/EditPurchaseOrderDialog';
import { PurchaseOrderInvoice } from '@/components/PurchaseOrderInvoice';
import { ChangeStatusDialog } from '@/components/ChangeStatusDialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Package, Pencil, Trash2, FileText, Eye, ArrowUpDown, Filter, Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc'>('date-desc');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'received' | 'cancelled'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

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

  const searchLower = searchQuery.toLowerCase();
  const filteredOrders = orders?.filter(order => 
    (activeStore === 'All' || order.store === activeStore) &&
    (statusFilter === 'all' || order.status === statusFilter) &&
    (searchQuery === '' || 
      (order.invoice_number || '').toLowerCase().includes(searchLower) ||
      (order.products?.name || '').toLowerCase().includes(searchLower))
  );

  // Sort helper
  const sortOrders = (items: any[]) => {
    return [...items].sort((a, b) => {
      const dateA = new Date(a.expected_delivery_date || a.expectedDeliveryDate).getTime();
      const dateB = new Date(b.expected_delivery_date || b.expectedDeliveryDate).getTime();
      return sortBy === 'date-asc' ? dateA - dateB : dateB - dateA;
    });
  };

  // For "All" tab, group orders by invoice number to show consolidated view
  const groupedByInvoice = activeStore === 'All' && orders 
    ? orders.filter(o => 
        (statusFilter === 'all' || o.status === statusFilter) &&
        (searchQuery === '' || 
          (o.invoice_number || '').toLowerCase().includes(searchLower) ||
          (o.products?.name || '').toLowerCase().includes(searchLower))
      ).reduce((acc, order) => {
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

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
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

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by PO # or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <CardTitle>All Purchase Orders</CardTitle>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Status: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>All</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('pending')}>Pending</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('received')}>Received</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>Cancelled</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Sort: {sortBy === 'date-desc' ? 'Newest First' : 'Oldest First'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy('date-desc')}>Date: Newest First</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('date-asc')}>Date: Oldest First</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
              <div className="space-y-2">
                {activeStore === 'All' ? (
                  groupedInvoices.map((group: any) => {
                    const key = `group-${group.invoiceNumber}`;
                    return (
                      <Collapsible key={key} open={openItems.has(key)} onOpenChange={() => toggleItem(key)}>
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" className="w-full justify-between h-auto py-3 px-4 text-left">
                            <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <FileText className="h-4 w-4 text-primary shrink-0" />
                                <span className="font-semibold text-sm">{group.invoiceNumber}</span>
                                <Badge variant={getStatusColor(group.status)} className="text-xs">{group.status}</Badge>
                                {Array.from(group.stores).map((store: string) => (
                                  <Badge key={store} variant={getStoreColor(store)} className="text-xs">{store}</Badge>
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {group.supplier?.name || 'N/A'} • {format(new Date(group.expectedDeliveryDate), 'MMM dd, yyyy')} • {group.products.length} item{group.products.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${openItems.has(key) ? "rotate-180" : ""}`} />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="border border-t-0 rounded-b-lg overflow-hidden mb-1">
                            <div className="bg-muted/50 px-4 py-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                              <span>Supplier: {group.supplier?.name || 'N/A'}</span>
                              {group.supplier?.contact_email && <span>Email: {group.supplier.contact_email}</span>}
                              {group.supplier?.contact_phone && <span>Phone: {group.supplier.contact_phone}</span>}
                              <span>Delivery: {format(new Date(group.expectedDeliveryDate), 'MMM dd, yyyy')}</span>
                            </div>
                            <table className="w-full text-sm">
                              <thead className="bg-muted/30">
                                <tr>
                                  <th className="text-left p-2 font-medium">Product</th>
                                  <th className="text-center p-2 font-medium">Store</th>
                                  <th className="text-center p-2 font-medium">Qty</th>
                                </tr>
                              </thead>
                              <tbody>
                                {group.products.map((product: any, idx: number) => (
                                  <tr key={idx} className="border-t border-border">
                                    <td className="p-2">
                                      <div className="font-medium">{product.name}</div>
                                      <div className="text-xs text-muted-foreground">{product.sku}</div>
                                    </td>
                                    <td className="text-center p-2">
                                      <Badge variant="outline" className="text-xs">{product.store}</Badge>
                                    </td>
                                    <td className="text-center p-2 font-medium">{product.quantity}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {group.notes && (
                              <div className="px-4 py-2 bg-muted/20 text-xs text-muted-foreground border-t">
                                <span className="font-medium">Notes:</span> {group.notes}
                              </div>
                            )}
                            <div className="px-4 py-2 flex justify-end gap-1 border-t">
                              <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(group.invoiceNumber)} title="View Invoice">
                                <Eye className="h-4 w-4 mr-1" /> View Invoice
                              </Button>
                              {group.status === 'pending' && (
                                <Button variant="ghost" size="sm" onClick={() => {
                                  setSelectedStatusGroup({
                                    invoiceNumber: group.invoiceNumber,
                                    status: group.status,
                                    orders: group.orders,
                                  });
                                  setStatusDialogOpen(true);
                                }}>
                                  Change Status
                                </Button>
                              )}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })
                ) : (
                  sortedFilteredOrders.map((order: any) => {
                    const key = `order-${order.id}`;
                    const invoiceNum = order.invoice_number || `#${order.id}`;
                    return (
                      <Collapsible key={key} open={openItems.has(key)} onOpenChange={() => toggleItem(key)}>
                        <CollapsibleTrigger asChild>
                          <Button variant="outline" className="w-full justify-between h-auto py-3 px-4 text-left">
                            <div className="flex flex-col items-start gap-0.5 min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <FileText className="h-4 w-4 text-primary shrink-0" />
                                <span className="font-semibold text-sm">{invoiceNum}</span>
                                <Badge variant={getStatusColor(order.status)} className="text-xs">{order.status}</Badge>
                                <Badge variant={getStoreColor(order.store)} className="text-xs">{order.store || 'N/A'}</Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {order.products?.name || 'N/A'} × {order.quantity} • {order.suppliers?.name || 'N/A'} • {format(new Date(order.expected_delivery_date), 'MMM dd, yyyy')}
                              </span>
                            </div>
                            <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${openItems.has(key) ? "rotate-180" : ""}`} />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="border border-t-0 rounded-b-lg overflow-hidden mb-1">
                            <div className="bg-muted/50 px-4 py-2 space-y-1 text-xs text-muted-foreground">
                              <div className="flex justify-between"><span>Supplier:</span><span className="font-medium text-foreground">{order.suppliers?.name || 'N/A'}</span></div>
                              {order.suppliers?.contact_email && <div className="flex justify-between"><span>Email:</span><span>{order.suppliers.contact_email}</span></div>}
                              {order.suppliers?.contact_phone && <div className="flex justify-between"><span>Phone:</span><span>{order.suppliers.contact_phone}</span></div>}
                              <div className="flex justify-between"><span>Expected Delivery:</span><span className="font-medium text-foreground">{format(new Date(order.expected_delivery_date), 'MMM dd, yyyy')}</span></div>
                            </div>
                            <table className="w-full text-sm">
                              <thead className="bg-muted/30">
                                <tr>
                                  <th className="text-left p-2 font-medium">Product</th>
                                  <th className="text-center p-2 font-medium">Qty</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr className="border-t border-border">
                                  <td className="p-2">
                                    <div className="font-medium">{order.products?.name || 'N/A'}</div>
                                    <div className="text-xs text-muted-foreground">{order.products?.sku || 'N/A'}</div>
                                  </td>
                                  <td className="text-center p-2 font-medium">{order.quantity}</td>
                                </tr>
                              </tbody>
                            </table>
                            {order.notes && (
                              <div className="px-4 py-2 bg-muted/20 text-xs text-muted-foreground border-t">
                                <span className="font-medium">Notes:</span> {order.notes}
                              </div>
                            )}
                            <div className="px-4 py-2 flex justify-end gap-1 border-t">
                              <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoiceNum)}>
                                <Eye className="h-4 w-4 mr-1" /> View Invoice
                              </Button>
                              {order.status === 'pending' && (
                                <>
                                  <Button variant="ghost" size="sm" onClick={() => handleEdit(order)}>
                                    <Pencil className="h-4 w-4 mr-1" /> Edit
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(order)}>
                                    <Trash2 className="h-4 w-4 mr-1 text-destructive" /> Delete
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })
                )}
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
