import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { History, Printer, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface StockCountHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeName: string;
}

interface LogEntry {
  id: number;
  batch_id: string;
  product_name: string;
  sku: string;
  store: string;
  old_quantity: number;
  new_quantity: number;
  counted_by: string | null;
  created_at: string;
}

interface GroupedBatch {
  batch_id: string;
  date: string;
  counted_by: string | null;
  items: LogEntry[];
}

export const StockCountHistoryDialog = ({ open, onOpenChange, storeName }: StockCountHistoryDialogProps) => {
  const [openBatches, setOpenBatches] = useState<Set<string>>(new Set());

  const { data: logs = [], isLoading } = useQuery<LogEntry[]>({
    queryKey: ['stock-count-logs', storeName],
    queryFn: async () => {
      let query = supabase
        .from('stock_count_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (storeName !== 'all') {
        query = query.eq('store', storeName);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as LogEntry[];
    },
    enabled: open,
  });

  const groupedBatches: GroupedBatch[] = [];
  const batchMap = new Map<string, GroupedBatch>();

  logs.forEach((log) => {
    if (!batchMap.has(log.batch_id)) {
      const batch: GroupedBatch = {
        batch_id: log.batch_id,
        date: log.created_at,
        counted_by: log.counted_by,
        items: [],
      };
      batchMap.set(log.batch_id, batch);
      groupedBatches.push(batch);
    }
    batchMap.get(log.batch_id)!.items.push(log);
  });

  const toggleBatch = (batchId: string) => {
    setOpenBatches((prev) => {
      const next = new Set(prev);
      if (next.has(batchId)) next.delete(batchId);
      else next.add(batchId);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col print:shadow-none print:border-none">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <History className="h-6 w-6 text-primary" />
            <DialogTitle className="text-xl">Stock Count History — {storeName}</DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh]">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Loading history...</div>
          ) : groupedBatches.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No stock count history found</div>
          ) : (
            <div className="space-y-2 pr-4">
              {groupedBatches.map((batch, index) => (
                <Collapsible
                  key={batch.batch_id}
                  open={openBatches.has(batch.batch_id)}
                  onOpenChange={() => toggleBatch(batch.batch_id)}
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between h-auto py-3 px-4 text-left"
                    >
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-semibold text-sm">
                          Transaction #{groupedBatches.length - index}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(batch.date), "MMM dd, yyyy — h:mm a")} • {batch.counted_by || "Unknown"} • {batch.items.length} item{batch.items.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${openBatches.has(batch.batch_id) ? "rotate-180" : ""}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border border-t-0 rounded-b-lg overflow-hidden mb-1">
                      <div className="bg-muted/50 px-4 py-2 flex justify-between text-xs text-muted-foreground">
                        <span>Counted by: {batch.counted_by || "Unknown"}</span>
                        <span>{format(new Date(batch.date), "MMM dd, yyyy — h:mm a")}</span>
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-muted/30">
                          <tr>
                            <th className="text-left p-2 font-medium">Product</th>
                            <th className="text-center p-2 font-medium">Old Qty</th>
                            <th className="text-center p-2 font-medium">New Qty</th>
                            <th className="text-center p-2 font-medium">Diff</th>
                          </tr>
                        </thead>
                        <tbody>
                          {batch.items.map((item) => {
                            const diff = item.new_quantity - item.old_quantity;
                            return (
                              <tr key={item.id} className="border-t border-border">
                                <td className="p-2">
                                  <div className="font-medium">{item.product_name}</div>
                                  <div className="text-xs text-muted-foreground">{item.sku}</div>
                                </td>
                                <td className="text-center p-2 text-muted-foreground">{item.old_quantity}</td>
                                <td className="text-center p-2 font-medium">{item.new_quantity}</td>
                                <td className={`text-center p-2 font-semibold ${diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "text-muted-foreground"}`}>
                                  {diff > 0 ? `+${diff}` : diff}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="print:hidden gap-2 mt-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
