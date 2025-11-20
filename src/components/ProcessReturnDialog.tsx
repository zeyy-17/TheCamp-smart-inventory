import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const returnSchema = z.object({
  sale_id: z.string().min(1, "Please select a sale"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  reason: z.string().optional(),
});

type ReturnFormValues = z.infer<typeof returnSchema>;

interface ProcessReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProcessReturnDialog = ({ open, onOpenChange }: ProcessReturnDialogProps) => {
  const queryClient = useQueryClient();
  const [selectedSale, setSelectedSale] = useState<any>(null);

  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      sale_id: "",
      quantity: 1,
      reason: "",
    },
  });

  // Fetch recent sales (last 5 transactions)
  const { data: recentSales = [] } = useQuery({
    queryKey: ['recent-sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          product:products(*)
        `)
        .order('date_sold', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
  });

  // Process return mutation
  const processReturnMutation = useMutation({
    mutationFn: async (values: ReturnFormValues) => {
      const sale = recentSales.find(s => s.id === parseInt(values.sale_id));
      if (!sale) throw new Error('Sale not found');

      if (values.quantity > sale.quantity) {
        throw new Error(`Return quantity cannot exceed sale quantity (${sale.quantity})`);
      }

      const refundAmount = (sale.total_amount / sale.quantity) * values.quantity;

      // Create return record
      const { data: returnRecord, error: returnError } = await supabase
        .from('returns')
        .insert({
          sale_id: parseInt(values.sale_id),
          product_id: sale.product_id,
          quantity: values.quantity,
          refund_amount: refundAmount,
          reason: values.reason || null,
        })
        .select()
        .single();

      if (returnError) throw returnError;

      // Get current product quantity
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', sale.product_id)
        .single();

      if (productError) throw productError;

      // Add returned quantity back to inventory
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          quantity: product.quantity + values.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', sale.product_id);

      if (updateError) throw updateError;

      return returnRecord;
    },
    onSuccess: () => {
      toast.success('Return processed successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['recent-sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales-history'] });
      queryClient.invalidateQueries({ queryKey: ['weekly-sales'] });
      form.reset();
      setSelectedSale(null);
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process return');
    },
  });

  const onSubmit = (values: ReturnFormValues) => {
    processReturnMutation.mutate(values);
  };

  const handleSelectSale = (sale: any) => {
    setSelectedSale(sale);
    form.setValue('sale_id', sale.id.toString());
    form.setValue('quantity', 1);
  };

  const quantity = form.watch('quantity');
  const refundAmount = selectedSale 
    ? (selectedSale.total_amount / selectedSale.quantity) * quantity 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Process Return/Refund</DialogTitle>
          <DialogDescription>
            Select from the last 5 transactions to process a return
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="sale_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recent Transactions (Last 5)</FormLabel>
                  <div className="space-y-2">
                    {recentSales.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No recent sales found</p>
                    ) : (
                      recentSales.map((sale) => (
                        <div
                          key={sale.id}
                          className={cn(
                            "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
                            selectedSale?.id === sale.id 
                              ? "bg-primary/10 border-primary" 
                              : "hover:bg-accent"
                          )}
                          onClick={() => handleSelectSale(sale)}
                        >
                          <div className="flex-1">
                            <div className="font-medium">{sale.product?.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(sale.date_sold), 'MMM dd, yyyy')} • Qty: {sale.quantity} • ₱{sale.total_amount.toLocaleString()}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSale(sale);
                            }}
                          >
                            Select
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedSale && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <p className="text-sm text-muted-foreground">
                  Product: <span className="font-semibold text-foreground">{selectedSale.product?.name}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Original Quantity: <span className="font-semibold text-foreground">{selectedSale.quantity}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Unit Price: <span className="font-semibold text-foreground">₱{(selectedSale.total_amount / selectedSale.quantity).toLocaleString()}</span>
                </p>
              </div>
            )}

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Return Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max={selectedSale?.quantity || 10000}
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
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Defective product, Customer changed mind..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedSale && quantity > 0 && (
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-lg font-semibold text-foreground">
                  Refund Amount: <span className="text-destructive">₱{refundAmount.toLocaleString()}</span>
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {quantity} unit(s) will be added back to inventory
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
                variant="destructive"
                disabled={processReturnMutation.isPending || !selectedSale}
              >
                {processReturnMutation.isPending ? 'Processing...' : 'Process Return'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};