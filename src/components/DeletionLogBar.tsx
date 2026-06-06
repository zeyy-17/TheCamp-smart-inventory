import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Archive, RotateCcw } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const DeletionLogBar = () => {
  const queryClient = useQueryClient();

  const { data: logs = [] } = useQuery({
    queryKey: ['deletion-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deletion_logs')
        .select('*')
        .order('deleted_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (log: any) => {
      const { error: insertError } = await supabase.from('products').insert({
        name: log.product_name,
        sku: log.sku,
        store: log.store,
        quantity: log.quantity ?? 0,
        cost_price: log.cost_price ?? 0,
        retail_price: log.retail_price ?? 0,
        reorder_level: log.reorder_level ?? 0,
        category_id: log.category_id ?? null,
        supplier_id: log.supplier_id ?? null,
      } as any);
      if (insertError) throw insertError;

      const { error: deleteError } = await supabase
        .from('deletion_logs')
        .delete()
        .eq('id', log.id);
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      toast.success("Product restored to inventory");
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['deletion-logs'] });
      queryClient.invalidateQueries({ queryKey: ['products-stock-by-store'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to restore product");
    },
  });

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Archive className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">Archived</span>
          {logs.length > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">{logs.length}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Archive className="h-5 w-5 text-primary" />
            Archived Products
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No archived items yet.</p>
          ) : (
            <div className="space-y-3 pr-4">
              {logs.map((log: any) => (
                <div key={log.id} className="border border-border rounded-lg p-3 space-y-1 bg-muted/30">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm text-card-foreground">{log.product_name}</span>
                    <Badge variant="outline" className="text-xs">{log.store || '—'}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">SKU: {log.sku}</div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Qty: {log.quantity ?? '—'}</span>
                    <span>Cost: {log.cost_price != null ? `₱${Number(log.cost_price).toFixed(2)}` : '—'}</span>
                    <span>Retail: {log.retail_price != null ? `₱${Number(log.retail_price).toFixed(2)}` : '—'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground pt-1 border-t border-border mt-1">
                    <div className="flex flex-col">
                      <span>{log.deleted_by || '—'}</span>
                      <span>{format(new Date(log.deleted_at), "MMM dd, yyyy h:mm a")}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 h-7"
                      onClick={() => restoreMutation.mutate(log)}
                      disabled={restoreMutation.isPending}
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default DeletionLogBar;
