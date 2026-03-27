import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const DeletionLogBar = () => {
  const [expanded, setExpanded] = useState(false);

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

  if (logs.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl shadow-custom-md overflow-hidden">
      <Button
        variant="ghost"
        onClick={() => setExpanded(!expanded)}
        className="w-full h-12 justify-between px-4 rounded-none hover:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-destructive" />
          <span className="font-semibold text-sm text-card-foreground">Deletion Log</span>
          <Badge variant="secondary" className="text-xs">{logs.length}</Badge>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </Button>

      {expanded && (
        <ScrollArea className="max-h-[300px]">
          <div className="border-t border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 sticky top-0">
                <tr>
                  <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">SKU</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Store</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Qty</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Cost</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Retail</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Deleted By</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log: any) => (
                  <tr key={log.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-3 font-medium text-card-foreground">{log.product_name}</td>
                    <td className="p-3 text-muted-foreground">{log.sku}</td>
                    <td className="p-3 text-muted-foreground">{log.store || '—'}</td>
                    <td className="p-3 text-center text-card-foreground">{log.quantity ?? '—'}</td>
                    <td className="p-3 text-right text-card-foreground">
                      {log.cost_price != null ? `₱${Number(log.cost_price).toFixed(2)}` : '—'}
                    </td>
                    <td className="p-3 text-right text-card-foreground">
                      {log.retail_price != null ? `₱${Number(log.retail_price).toFixed(2)}` : '—'}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">{log.deleted_by || '—'}</td>
                    <td className="p-3 text-muted-foreground text-xs">
                      {format(new Date(log.deleted_at), "MMM dd, yyyy h:mm a")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default DeletionLogBar;
