import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck } from "lucide-react";

interface StockCountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: any[];
  storeName: string;
}

export const StockCountDialog = ({ open, onOpenChange, products, storeName }: StockCountDialogProps) => {
  const [quantities, setQuantities] = useState<Record<number, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const queryClient = useQueryClient();

  const categoryNames = Array.from(new Set(products.map((p: any) => p.category?.name).filter(Boolean)));

  useEffect(() => {
    if (open) {
      const initial: Record<number, string> = {};
      products.forEach((p) => {
        initial[p.id] = String(p.quantity ?? 0);
      });
      setQuantities(initial);
      setSearchQuery("");
      setSelectedCategory("");
    }
  }, [open, products]);

  const filteredProducts = products.filter(
    (p) =>
      (selectedCategory === "All" || p.category?.name === selectedCategory) &&
      (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getChangedProducts = () => {
    return products.filter((p) => {
      const newQty = parseInt(quantities[p.id] || "0", 10);
      return !isNaN(newQty) && newQty !== (p.quantity ?? 0);
    });
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      const changed = getChangedProducts();
      if (changed.length === 0) throw new Error("No changes to save");

      for (const product of changed) {
        const newQty = parseInt(quantities[product.id] || "0", 10);
        const { error } = await supabase
          .from("products")
          .update({ quantity: newQty })
          .eq("id", product.id);
        if (error) throw error;
      }
      return changed.length;
    },
    onSuccess: (count) => {
      toast.success(`Stock count updated for ${count} product${count > 1 ? "s" : ""}`);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-stock-by-store"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update stock count");
    },
  });

  const changedCount = getChangedProducts().length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            Stock Count — {storeName}
          </DialogTitle>
        </DialogHeader>

        <div className="mb-3">
          <Input
            placeholder="Search product or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          {categoryNames.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="text-xs"
            >
              {cat}
            </Button>
          ))}
        </div>

        <ScrollArea className="flex-1 max-h-[50vh] border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="text-left py-2 px-3 font-semibold text-foreground">Product</th>
                <th className="text-left py-2 px-3 font-semibold text-foreground">SKU</th>
                <th className="text-center py-2 px-3 font-semibold text-foreground w-24">Current</th>
                <th className="text-center py-2 px-3 font-semibold text-foreground w-28">Actual Qty</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const currentQty = product.quantity ?? 0;
                const inputVal = quantities[product.id] ?? String(currentQty);
                const newQty = parseInt(inputVal, 10);
                const hasChanged = !isNaN(newQty) && newQty !== currentQty;

                return (
                  <tr
                    key={product.id}
                    className={`border-b border-border last:border-0 ${hasChanged ? "bg-primary/5" : ""}`}
                  >
                    <td className="py-2 px-3 font-medium text-foreground">{product.name}</td>
                    <td className="py-2 px-3 text-muted-foreground">{product.sku}</td>
                    <td className="py-2 px-3 text-center text-muted-foreground">{currentQty}</td>
                    <td className="py-2 px-3">
                      <Input
                        type="number"
                        min="0"
                        className="text-center h-8"
                        value={inputVal}
                        onChange={(e) =>
                          setQuantities((prev) => ({ ...prev, [product.id]: e.target.value }))
                        }
                      />
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-muted-foreground">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </ScrollArea>

        <DialogFooter className="mt-4 flex items-center justify-between sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {changedCount} product{changedCount !== 1 ? "s" : ""} modified
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={changedCount === 0 || updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Update Stock"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
