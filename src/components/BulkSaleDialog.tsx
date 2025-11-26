import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BulkSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SaleItem {
  product_id: string;
  quantity: string;
  date_sold: Date | undefined;
}

export function BulkSaleDialog({ open, onOpenChange }: BulkSaleDialogProps) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState<SaleItem[]>([
    { product_id: "", quantity: "", date_sold: new Date() }
  ]);

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const recordSalesMutation = useMutation({
    mutationFn: async (sales: SaleItem[]) => {
      for (const item of sales) {
        const product = products?.find(p => p.id.toString() === item.product_id);
        if (!product) throw new Error("Product not found");
        
        const quantity = parseInt(item.quantity);
        if (product.quantity < quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        const totalAmount = product.retail_price * quantity;

        const { error: saleError } = await supabase.from("sales").insert({
          product_id: parseInt(item.product_id),
          quantity,
          total_amount: totalAmount,
          date_sold: format(item.date_sold!, "yyyy-MM-dd"),
        });

        if (saleError) throw saleError;

        const { error: updateError } = await supabase
          .from("products")
          .update({ quantity: product.quantity - quantity })
          .eq("id", product.id);

        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(`Successfully recorded ${items.length} sales`);
      onOpenChange(false);
      setItems([{ product_id: "", quantity: "", date_sold: new Date() }]);
    },
    onError: (error) => {
      toast.error("Failed to record sales: " + error.message);
    },
  });

  const addItem = () => {
    setItems([...items, { product_id: "", quantity: "", date_sold: new Date() }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof SaleItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = () => {
    const isValid = items.every(
      item => item.product_id && item.quantity && item.date_sold
    );

    if (!isValid) {
      toast.error("Please fill in all fields for each item");
      return;
    }

    recordSalesMutation.mutate(items);
  };

  const getTotalAmount = () => {
    return items.reduce((total, item) => {
      const product = products?.find(p => p.id.toString() === item.product_id);
      if (!product || !item.quantity) return total;
      return total + (product.retail_price * parseInt(item.quantity));
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Bulk Sales</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {items.map((item, index) => {
            const product = products?.find(p => p.id.toString() === item.product_id);
            const itemTotal = product && item.quantity ? product.retail_price * parseInt(item.quantity) : 0;

            return (
              <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select
                      value={item.product_id}
                      onValueChange={(value) => updateItem(index, "product_id", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name} (Stock: {product.quantity})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                      placeholder="Enter quantity"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Date Sold</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !item.date_sold && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {item.date_sold ? (
                            format(item.date_sold, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={item.date_sold}
                          onSelect={(date) => updateItem(index, "date_sold", date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {itemTotal > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Item Total: ₱{itemTotal.toFixed(2)}
                  </div>
                )}
              </div>
            );
          })}

          <Button onClick={addItem} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>

          {items.length > 0 && getTotalAmount() > 0 && (
            <div className="border-t pt-4">
              <div className="text-lg font-semibold">
                Total Transaction Amount: ₱{getTotalAmount().toFixed(2)}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={recordSalesMutation.isPending}>
            {recordSalesMutation.isPending ? "Recording..." : `Record ${items.length} Sale${items.length > 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
