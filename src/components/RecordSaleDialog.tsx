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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const saleSchema = z.object({
  product_id: z.string().min(1, "Please select a product"),
  quantity: z.number().min(1, "Quantity must be at least 1").max(10000, "Quantity must be less than 10,000"),
  date_sold: z.string().min(1, "Date is required"),
});

type SaleFormValues = z.infer<typeof saleSchema>;

interface RecordSaleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RecordSaleDialog = ({ open, onOpenChange }: RecordSaleDialogProps) => {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      product_id: "",
      quantity: 1,
      date_sold: format(new Date(), 'yyyy-MM-dd'),
    },
  });

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

  // Record sale mutation
  const recordSaleMutation = useMutation({
    mutationFn: async (values: SaleFormValues) => {
      const product = products.find(p => p.id === parseInt(values.product_id));
      if (!product) throw new Error('Product not found');

      // Check if enough stock
      if (product.quantity < values.quantity) {
        throw new Error(`Insufficient stock. Only ${product.quantity} units available.`);
      }

      const totalAmount = product.retail_price * values.quantity;

      // Insert sale record
      const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert({
          product_id: parseInt(values.product_id),
          quantity: values.quantity,
          total_amount: totalAmount,
          date_sold: values.date_sold,
        })
        .select()
        .single();

      if (saleError) throw saleError;

      // Update product quantity
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          quantity: product.quantity - values.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', parseInt(values.product_id));

      if (updateError) throw updateError;

      return sale;
    },
    onSuccess: () => {
      toast.success('Sale recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products-count'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-sales'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-sales-chart'] });
      queryClient.invalidateQueries({ queryKey: ['top-products'] });
      queryClient.invalidateQueries({ queryKey: ['products-for-sale'] });
      form.reset();
      setSelectedProduct(null);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record sale');
    },
  });

  const onSubmit = (values: SaleFormValues) => {
    recordSaleMutation.mutate(values);
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === parseInt(productId));
    setSelectedProduct(product);
    form.setValue('product_id', productId);
  };

  const quantity = form.watch('quantity');
  const totalAmount = selectedProduct ? selectedProduct.retail_price * quantity : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Record Sale</DialogTitle>
          <DialogDescription>
            Log a new sale transaction and update inventory automatically.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="product_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select onValueChange={handleProductChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.name} - ₱{product.retail_price} (Stock: {product.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProduct && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Unit Price: <span className="font-semibold text-foreground">₱{selectedProduct.retail_price.toLocaleString()}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Available Stock: <span className="font-semibold text-foreground">{selectedProduct.quantity}</span>
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={selectedProduct?.quantity || 10000}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date_sold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProduct && quantity > 0 && (
              <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-lg font-semibold text-foreground">
                  Total Amount: <span className="text-primary">₱{totalAmount.toLocaleString()}</span>
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
                disabled={recordSaleMutation.isPending || !selectedProduct}
              >
                {recordSaleMutation.isPending ? 'Recording...' : 'Record Sale'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
