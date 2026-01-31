import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { productsApi, categoriesApi, suppliersApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

const stores = [
  { id: "ampersand", name: "Ampersand" },
  { id: "herex", name: "hereX" },
  { id: "hardin", name: "Hardin" },
];

interface ProductFormData {
  id: string;
  name: string;
  sku: string;
  category_id: string;
  supplier_id: string;
  cost_price: string;
  retail_price: string;
  quantity: string;
  reorder_level: string;
  store: string;
}

const createEmptyProduct = (): ProductFormData => ({
  id: crypto.randomUUID(),
  name: "",
  sku: "",
  category_id: "",
  supplier_id: "",
  cost_price: "",
  retail_price: "",
  quantity: "0",
  reorder_level: "20",
  store: "",
});

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddProductDialog = ({ open, onOpenChange, onSuccess }: AddProductDialogProps) => {
  const [products, setProducts] = useState<ProductFormData[]>([createEmptyProduct()]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const { data: suppliers = [] } = useQuery<any[]>({
    queryKey: ['suppliers'],
    queryFn: () => suppliersApi.getAll(),
  });

  const updateProduct = (id: string, field: keyof ProductFormData, value: string) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const addProduct = () => {
    setProducts(prev => [...prev, createEmptyProduct()]);
  };

  const removeProduct = (id: string) => {
    if (products.length === 1) return;
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const resetForm = () => {
    setProducts([createEmptyProduct()]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let successCount = 0;
    let failCount = 0;

    for (const product of products) {
      try {
        await productsApi.create({
          name: product.name,
          sku: product.sku,
          category_id: product.category_id ? parseInt(product.category_id) : undefined,
          supplier_id: product.supplier_id ? parseInt(product.supplier_id) : undefined,
          cost_price: parseFloat(product.cost_price),
          retail_price: parseFloat(product.retail_price),
          quantity: parseInt(product.quantity),
          reorder_level: parseInt(product.reorder_level),
        });
        successCount++;
      } catch (error: any) {
        failCount++;
        console.error(`Failed to add ${product.name}:`, error);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} product${successCount > 1 ? 's' : ''} added successfully`);
      resetForm();
      if (onSuccess) onSuccess();
      onOpenChange(false);
    }
    if (failCount > 0) {
      toast.error(`Failed to add ${failCount} product${failCount > 1 ? 's' : ''}`);
    }

    setIsSubmitting(false);
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[750px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Products</DialogTitle>
          <DialogDescription>
            Add one or more products to your inventory. Click "Add Another" to add multiple products at once.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <ScrollArea className="flex-1 max-h-[50vh] pr-4">
            <div className="space-y-4 pb-2">
              {products.map((product, index) => (
                <div key={product.id} className="space-y-3 p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-foreground">Product {index + 1}</span>
                    {products.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProduct(product.id)}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`name-${product.id}`} className="text-xs">Name*</Label>
                      <Input
                        id={`name-${product.id}`}
                        value={product.name}
                        onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                        required
                        className="h-9"
                        placeholder="Product name"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor={`sku-${product.id}`} className="text-xs">SKU*</Label>
                      <Input
                        id={`sku-${product.id}`}
                        value={product.sku}
                        onChange={(e) => updateProduct(product.id, 'sku', e.target.value)}
                        required
                        className="h-9"
                        placeholder="SKU"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`cost_price-${product.id}`} className="text-xs">Cost (₱)*</Label>
                      <Input
                        id={`cost_price-${product.id}`}
                        type="number"
                        step="0.01"
                        value={product.cost_price}
                        onChange={(e) => updateProduct(product.id, 'cost_price', e.target.value)}
                        required
                        className="h-9"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`retail_price-${product.id}`} className="text-xs">Retail (₱)*</Label>
                      <Input
                        id={`retail_price-${product.id}`}
                        type="number"
                        step="0.01"
                        value={product.retail_price}
                        onChange={(e) => updateProduct(product.id, 'retail_price', e.target.value)}
                        required
                        className="h-9"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`store-${product.id}`} className="text-xs">Store*</Label>
                      <Select
                        value={product.store}
                        onValueChange={(value) => updateProduct(product.id, 'store', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {stores.map((store) => (
                            <SelectItem key={store.id} value={store.id}>
                              {store.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`category-${product.id}`} className="text-xs">Category</Label>
                      <Select
                        value={product.category_id}
                        onValueChange={(value) => updateProduct(product.id, 'category_id', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`supplier-${product.id}`} className="text-xs">Supplier</Label>
                      <Select
                        value={product.supplier_id}
                        onValueChange={(value) => updateProduct(product.id, 'supplier_id', value)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((sup: any) => (
                            <SelectItem key={sup.id} value={sup.id.toString()}>
                              {sup.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`quantity-${product.id}`} className="text-xs">Quantity</Label>
                      <Input
                        id={`quantity-${product.id}`}
                        type="number"
                        value={product.quantity}
                        onChange={(e) => updateProduct(product.id, 'quantity', e.target.value)}
                        className="h-9"
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`reorder_level-${product.id}`} className="text-xs">Reorder Lvl</Label>
                      <Input
                        id={`reorder_level-${product.id}`}
                        type="number"
                        value={product.reorder_level}
                        onChange={(e) => updateProduct(product.id, 'reorder_level', e.target.value)}
                        className="h-9"
                        placeholder="20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-4 pt-4 border-t border-border flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={addProduct}
              className="w-full mb-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Product
            </Button>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : `Add ${products.length} Product${products.length > 1 ? 's' : ''}`}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
