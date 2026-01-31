import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Trash2, Store } from "lucide-react";

const STORES = ['Ampersand', 'hereX', 'Hardin'] as const;

interface ProductEntry {
  productId: string;
  quantity: number;
}

interface StoreEntry {
  store: typeof STORES[number];
  products: ProductEntry[];
}

interface RecordSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RecordSaleDialog = ({ open, onOpenChange }: RecordSaleDialogProps) => {
  const queryClient = useQueryClient();
  const [dateSold, setDateSold] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [storeEntries, setStoreEntries] = useState<StoreEntry[]>([
    { store: 'Ampersand', products: [{ productId: '', quantity: 1 }] }
  ]);

  // Fetch all products
  const { data: products = [] } = useQuery({
    queryKey: ['products-for-sale'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const addStore = () => {
    const usedStores = storeEntries.map(e => e.store);
    const availableStore = STORES.find(s => !usedStores.includes(s));
    if (availableStore) {
      setStoreEntries([...storeEntries, { 
        store: availableStore, 
        products: [{ productId: '', quantity: 1 }] 
      }]);
    }
  };

  const removeStore = (storeIndex: number) => {
    if (storeEntries.length > 1) {
      setStoreEntries(storeEntries.filter((_, i) => i !== storeIndex));
    }
  };

  const updateStore = (storeIndex: number, store: typeof STORES[number]) => {
    const updated = [...storeEntries];
    updated[storeIndex].store = store;
    setStoreEntries(updated);
  };

  const addProduct = (storeIndex: number) => {
    const updated = [...storeEntries];
    updated[storeIndex].products.push({ productId: '', quantity: 1 });
    setStoreEntries(updated);
  };

  const removeProduct = (storeIndex: number, productIndex: number) => {
    const updated = [...storeEntries];
    if (updated[storeIndex].products.length > 1) {
      updated[storeIndex].products = updated[storeIndex].products.filter((_, i) => i !== productIndex);
      setStoreEntries(updated);
    }
  };

  const updateProduct = (storeIndex: number, productIndex: number, field: keyof ProductEntry, value: string | number) => {
    const updated = [...storeEntries];
    updated[storeIndex].products[productIndex] = {
      ...updated[storeIndex].products[productIndex],
      [field]: value
    };
    setStoreEntries(updated);
  };

  // Record sale mutation
  const recordSaleMutation = useMutation({
    mutationFn: async () => {
      const saleRecords: Array<{
        product_id: number;
        quantity: number;
        total_amount: number;
        date_sold: string;
        store: string;
      }> = [];

      // Validate and prepare all sale records
      for (const storeEntry of storeEntries) {
        for (const productEntry of storeEntry.products) {
          if (!productEntry.productId) continue;
          
          const product = products.find(p => p.id === parseInt(productEntry.productId));
          if (!product) throw new Error('Product not found');

          if (product.quantity < productEntry.quantity) {
            throw new Error(`Insufficient stock for ${product.name}. Only ${product.quantity} units available.`);
          }

          saleRecords.push({
            product_id: parseInt(productEntry.productId),
            quantity: productEntry.quantity,
            total_amount: product.retail_price * productEntry.quantity,
            date_sold: dateSold,
            store: storeEntry.store,
          });
        }
      }

      if (saleRecords.length === 0) {
        throw new Error('Please select at least one product');
      }

      // Insert all sale records
      const { error: saleError } = await supabase
        .from('sales')
        .insert(saleRecords);

      if (saleError) throw saleError;

      // Update product quantities
      for (const record of saleRecords) {
        const product = products.find(p => p.id === record.product_id);
        if (product) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ 
              quantity: product.quantity - record.quantity,
              updated_at: new Date().toISOString(),
            })
            .eq('id', record.product_id);

          if (updateError) throw updateError;
        }
      }

      return saleRecords;
    },
    onSuccess: () => {
      toast.success('Sale recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-count'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-sales'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-sales-chart'] });
      queryClient.invalidateQueries({ queryKey: ['top-products'] });
      queryClient.invalidateQueries({ queryKey: ['products-for-sale'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      resetForm();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record sale');
    },
  });

  const resetForm = () => {
    setDateSold(format(new Date(), 'yyyy-MM-dd'));
    setStoreEntries([{ store: 'Ampersand', products: [{ productId: '', quantity: 1 }] }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordSaleMutation.mutate();
  };

  const getProductById = (productId: string) => {
    return products.find(p => p.id === parseInt(productId));
  };

  const calculateTotalAmount = () => {
    let total = 0;
    for (const storeEntry of storeEntries) {
      for (const productEntry of storeEntry.products) {
        if (productEntry.productId) {
          const product = getProductById(productEntry.productId);
          if (product) {
            total += product.retail_price * productEntry.quantity;
          }
        }
      }
    }
    return total;
  };

  const usedStores = storeEntries.map(e => e.store);
  const canAddStore = storeEntries.length < STORES.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Record Sale</DialogTitle>
          <DialogDescription>
            Log sales transactions across stores. Select multiple products per store.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input 
              type="date" 
              value={dateSold}
              onChange={(e) => setDateSold(e.target.value)}
            />
          </div>

          <div className="max-h-[350px] overflow-y-auto border rounded-lg p-2 scrollbar-thin scrollbar-thumb-muted-foreground/30 scrollbar-track-transparent">
            <div className="space-y-4 pr-2">
              {storeEntries.map((storeEntry, storeIndex) => (
                <div key={storeIndex} className="border rounded-lg p-4 space-y-4 bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-muted-foreground" />
                      <Select 
                        value={storeEntry.store} 
                        onValueChange={(value) => updateStore(storeIndex, value as typeof STORES[number])}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STORES.filter(s => s === storeEntry.store || !usedStores.includes(s)).map((store) => (
                            <SelectItem key={store} value={store}>{store}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {storeEntries.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStore(storeIndex)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {storeEntry.products.map((productEntry, productIndex) => {
                      const selectedProduct = productEntry.productId ? getProductById(productEntry.productId) : null;
                      return (
                        <div key={productIndex} className="space-y-2 p-3 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <Select 
                                value={productEntry.productId} 
                                onValueChange={(value) => updateProduct(storeIndex, productIndex, 'productId', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select product" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id.toString()}>
                                      {product.name} - ₱{product.retail_price} (Stock: {product.quantity})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="w-24">
                              <Input
                                type="number"
                                min="1"
                                max={selectedProduct?.quantity || 10000}
                                value={productEntry.quantity}
                                onChange={(e) => updateProduct(storeIndex, productIndex, 'quantity', parseInt(e.target.value) || 1)}
                                placeholder="Qty"
                              />
                            </div>
                            {storeEntry.products.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeProduct(storeIndex, productIndex)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                          {selectedProduct && (
                            <div className="text-xs text-muted-foreground">
                              Unit: ₱{selectedProduct.retail_price.toLocaleString()} | 
                              Subtotal: <span className="text-foreground font-medium">₱{(selectedProduct.retail_price * productEntry.quantity).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addProduct(storeIndex)}
                    className="w-full gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </Button>
                </div>
              ))}

              {canAddStore && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addStore}
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Store
                </Button>
              )}
            </div>
          </div>

          {calculateTotalAmount() > 0 && (
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-lg font-semibold text-foreground">
                Total Amount: <span className="text-primary">₱{calculateTotalAmount().toLocaleString()}</span>
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={recordSaleMutation.isPending}
            >
              {recordSaleMutation.isPending ? 'Recording...' : 'Record Sale'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
