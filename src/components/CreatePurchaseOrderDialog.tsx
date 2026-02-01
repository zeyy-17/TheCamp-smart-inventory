import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CalendarIcon, Plus, Trash2, Package } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "./ui/scroll-area";
import { PurchaseOrderInvoice } from "./PurchaseOrderInvoice";
import { Separator } from "./ui/separator";

interface CreatePurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ProductEntry {
  id: string;
  productId: string;
  quantity: string;
}

interface StoreItem {
  id: string;
  store: string;
  products: ProductEntry[];
}

interface InvoiceItem {
  productName: string;
  sku: string;
  store: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const stores = ['Ampersand', 'hereX', 'Hardin'];

const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `PO-${year}${month}${day}-${random}`;
};

const createEmptyProductEntry = (): ProductEntry => ({
  id: crypto.randomUUID(),
  productId: "",
  quantity: "",
});

const createEmptyStoreItem = (): StoreItem => ({
  id: crypto.randomUUID(),
  store: "",
  products: [createEmptyProductEntry()],
});

export const CreatePurchaseOrderDialog = ({ open, onOpenChange }: CreatePurchaseOrderDialogProps) => {
  const queryClient = useQueryClient();
  const [invoiceNumber, setInvoiceNumber] = useState(generateInvoiceNumber());
  const [supplierId, setSupplierId] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [notes, setNotes] = useState("");
  const [storeItems, setStoreItems] = useState<StoreItem[]>([createEmptyStoreItem()]);
  
  // Invoice popup state
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<{
    invoiceNumber: string;
    supplierName: string;
    deliveryDate: Date;
    items: InvoiceItem[];
  } | null>(null);

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, sku, cost_price')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const { data: suppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  const addStoreItem = () => {
    setStoreItems([...storeItems, createEmptyStoreItem()]);
  };

  const removeStoreItem = (storeItemId: string) => {
    if (storeItems.length > 1) {
      setStoreItems(storeItems.filter(item => item.id !== storeItemId));
    }
  };

  const updateStoreItemStore = (storeItemId: string, store: string) => {
    setStoreItems(storeItems.map(item =>
      item.id === storeItemId ? { ...item, store } : item
    ));
  };

  const addProductToStore = (storeItemId: string) => {
    setStoreItems(storeItems.map(item =>
      item.id === storeItemId
        ? { ...item, products: [...item.products, createEmptyProductEntry()] }
        : item
    ));
  };

  const removeProductFromStore = (storeItemId: string, productEntryId: string) => {
    setStoreItems(storeItems.map(item => {
      if (item.id === storeItemId && item.products.length > 1) {
        return { ...item, products: item.products.filter(p => p.id !== productEntryId) };
      }
      return item;
    }));
  };

  const updateProductEntry = (
    storeItemId: string,
    productEntryId: string,
    field: keyof ProductEntry,
    value: string
  ) => {
    setStoreItems(storeItems.map(item =>
      item.id === storeItemId
        ? {
            ...item,
            products: item.products.map(p =>
              p.id === productEntryId ? { ...p, [field]: value } : p
            ),
          }
        : item
    ));
  };

  const resetForm = () => {
    setInvoiceNumber(generateInvoiceNumber());
    setSupplierId("");
    setDeliveryDate(undefined);
    setNotes("");
    setStoreItems([createEmptyStoreItem()]);
  };

  const getValidOrderItems = () => {
    const items: { store: string; productId: string; quantity: number }[] = [];
    
    storeItems.forEach(storeItem => {
      if (!storeItem.store) return;
      
      storeItem.products.forEach(product => {
        if (product.productId && product.quantity && parseInt(product.quantity) > 0) {
          items.push({
            store: storeItem.store,
            productId: product.productId,
            quantity: parseInt(product.quantity),
          });
        }
      });
    });
    
    return items;
  };

  const getTotalItemCount = () => {
    return storeItems.reduce((total, storeItem) => {
      return total + storeItem.products.filter(p => p.productId && p.quantity).length;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deliveryDate) {
      toast.error("Please select a delivery date");
      return;
    }

    if (!supplierId) {
      toast.error("Please select a supplier");
      return;
    }

    const validItems = getValidOrderItems();

    if (validItems.length === 0) {
      toast.error("Please add at least one valid item with store, product, and quantity");
      return;
    }
    
    try {
      const ordersToInsert = validItems.map(item => ({
        invoice_number: invoiceNumber,
        product_id: parseInt(item.productId),
        supplier_id: parseInt(supplierId),
        quantity: item.quantity,
        expected_delivery_date: format(deliveryDate, 'yyyy-MM-dd'),
        status: 'pending', // Initial status is pending
        store: item.store,
        notes: notes || null,
      }));

      const { error } = await supabase
        .from('purchase_orders')
        .insert(ordersToInsert);

      if (error) throw error;
      
      // Prepare invoice data
      const selectedSupplier = suppliers?.find(s => s.id.toString() === supplierId);
      const invoiceItems: InvoiceItem[] = validItems.map(item => {
        const product = products?.find(p => p.id.toString() === item.productId);
        const unitPrice = product?.cost_price || 0;
        return {
          productName: product?.name || 'Unknown',
          sku: product?.sku || 'N/A',
          store: item.store,
          quantity: item.quantity,
          unitPrice,
          totalPrice: item.quantity * unitPrice,
        };
      });

      setInvoiceData({
        invoiceNumber,
        supplierName: selectedSupplier?.name || 'Unknown',
        deliveryDate,
        items: invoiceItems,
      });
      
      queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-count'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-count'] });
      queryClient.invalidateQueries({ queryKey: ['movements'] });
      
      const totalQty = validItems.reduce((sum, item) => sum + item.quantity, 0);
      toast.success(`Purchase order ${invoiceNumber} created with ${totalQty} units! Status: Pending`);
      onOpenChange(false);
      setShowInvoice(true);
      resetForm();
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast.error("Failed to create purchase order");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice">Invoice Number</Label>
                <Input
                  id="invoice"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="PO-YYYYMMDD-XXXX"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Expected Delivery Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deliveryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate ? format(deliveryDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Order Items by Store</Label>
                <Button type="button" variant="outline" size="sm" onClick={addStoreItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Store
                </Button>
              </div>
              <ScrollArea className="h-[280px] rounded-md border p-3">
                <div className="space-y-4">
                  {storeItems.map((storeItem, storeIndex) => (
                    <div key={storeItem.id} className="space-y-2">
                      {storeIndex > 0 && <Separator className="my-3" />}
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <Select
                          value={storeItem.store}
                          onValueChange={(value) => updateStoreItemStore(storeItem.id, value)}
                        >
                          <SelectTrigger className="w-[140px] h-9">
                            <SelectValue placeholder="Select store" />
                          </SelectTrigger>
                          <SelectContent>
                            {stores.map((store) => (
                              <SelectItem key={store} value={store}>
                                {store}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addProductToStore(storeItem.id)}
                          className="ml-auto"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add Product
                        </Button>
                        {storeItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => removeStoreItem(storeItem.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="ml-6 space-y-2">
                        {storeItem.products.map((product) => (
                          <div key={product.id} className="flex gap-2 items-center">
                            <Select
                              value={product.productId}
                              onValueChange={(value) =>
                                updateProductEntry(storeItem.id, product.id, 'productId', value)
                              }
                            >
                              <SelectTrigger className="flex-1 h-9">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products?.map((p) => (
                                  <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Qty"
                              value={product.quantity}
                              onChange={(e) =>
                                updateProductEntry(storeItem.id, product.id, 'quantity', e.target.value)
                              }
                              className="w-20 h-9"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9"
                              onClick={() => removeProductFromStore(storeItem.id, product.id)}
                              disabled={storeItem.products.length === 1}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <p className="text-xs text-muted-foreground">
                {getTotalItemCount()} product(s) configured across {storeItems.filter(s => s.store).length} store(s)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes..."
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Order</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {invoiceData && (
        <PurchaseOrderInvoice
          open={showInvoice}
          onOpenChange={setShowInvoice}
          invoiceNumber={invoiceData.invoiceNumber}
          supplierName={invoiceData.supplierName}
          deliveryDate={invoiceData.deliveryDate}
          items={invoiceData.items}
        />
      )}
    </>
  );
};
