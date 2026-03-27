import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

const DeletionLogBar = () => {
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

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="hidden sm:inline">Deletion Log</span>
          {logs.length > 0 && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0">{logs.length}</Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Deletion Log
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No deleted items yet.</p>
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
                  <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t border-border mt-1">
                    <span>{log.deleted_by || '—'}</span>
                    <span>{format(new Date(log.deleted_at), "MMM dd, yyyy h:mm a")}</span>
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
