import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Download, RefreshCw, Calendar, TrendingUp, Package, DollarSign, FileText } from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";

interface ReportSummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportType: "weekly" | "monthly";
  action: "download" | "regenerate";
  onConfirm: () => void;
}

export const ReportSummaryDialog = ({
  open,
  onOpenChange,
  reportType,
  action,
  onConfirm,
}: ReportSummaryDialogProps) => {
  const today = new Date();
  
  // Calculate date range based on report type
  const dateRange = reportType === "weekly" 
    ? { start: startOfWeek(today), end: endOfWeek(today) }
    : { start: startOfMonth(today), end: endOfMonth(today) };

  // Fetch sales data for the period
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['report-sales', reportType, open],
    queryFn: async () => {
      const startDate = format(dateRange.start, 'yyyy-MM-dd');
      const endDate = format(dateRange.end, 'yyyy-MM-dd');
      
      const { data } = await supabase
        .from('sales')
        .select('*, products(name, category_id)')
        .gte('date_sold', startDate)
        .lte('date_sold', endDate);
      
      return data || [];
    },
    enabled: open,
  });

  // Fetch inventory movements for the period
  const { data: movementsData, isLoading: movementsLoading } = useQuery({
    queryKey: ['report-movements', reportType, open],
    queryFn: async () => {
      const startDate = format(dateRange.start, 'yyyy-MM-dd');
      const endDate = format(dateRange.end, 'yyyy-MM-dd');
      
      const { data } = await supabase
        .from('movements')
        .select('*, products(name)')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      return data || [];
    },
    enabled: open,
  });

  // Fetch products for stock levels
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['report-products', open],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*');
      
      return data || [];
    },
    enabled: open,
  });

  const isLoading = salesLoading || movementsLoading || productsLoading;

  // Calculate summary stats
  const totalSales = salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
  const totalTransactions = salesData?.length || 0;
  const totalItemsSold = salesData?.reduce((sum, sale) => sum + sale.quantity, 0) || 0;
  const totalMovements = movementsData?.length || 0;
  const lowStockItems = productsData?.filter(p => (p.quantity || 0) <= (p.reorder_level || 0)).length || 0;
  const totalProducts = productsData?.length || 0;

  // Top selling products
  const productSales: Record<string, { name: string; qty: number; amount: number }> = {};
  salesData?.forEach(sale => {
    const name = sale.products?.name || 'Unknown';
    if (!productSales[name]) {
      productSales[name] = { name, qty: 0, amount: 0 };
    }
    productSales[name].qty += sale.quantity;
    productSales[name].amount += Number(sale.total_amount);
  });
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const Icon = reportType === "weekly" ? Calendar : TrendingUp;
  const title = reportType === "weekly" ? "Weekly Inventory Report" : "Monthly Sales Analysis";
  const periodText = reportType === "weekly" 
    ? `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`
    : format(dateRange.start, 'MMMM yyyy');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            {title} Summary
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Period */}
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <span className="text-sm text-muted-foreground">Report Period: </span>
            <span className="font-semibold text-foreground">{periodText}</span>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Total Sales</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    ₱{totalSales.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {totalTransactions} transactions
                  </div>
                </div>

                <div className="bg-accent/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-accent-foreground" />
                    <span className="text-sm text-muted-foreground">Items Sold</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {totalItemsSold.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    across {totalTransactions} sales
                  </div>
                </div>

                <div className="bg-warning/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-warning" />
                    <span className="text-sm text-muted-foreground">Stock Movements</span>
                  </div>
                  <div className="text-2xl font-bold text-warning">
                    {totalMovements}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    adjustments recorded
                  </div>
                </div>

                <div className="bg-destructive/10 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-muted-foreground">Low Stock Items</span>
                  </div>
                  <div className="text-2xl font-bold text-destructive">
                    {lowStockItems}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    of {totalProducts} products
                  </div>
                </div>
              </div>

              {/* Top Products */}
              {topProducts.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-3">Top Selling Products</h4>
                  <div className="space-y-2">
                    {topProducts.map((product, idx) => (
                      <div key={product.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                            {idx + 1}
                          </span>
                          <span className="text-foreground">{product.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-medium text-foreground">₱{product.amount.toLocaleString()}</span>
                          <span className="text-muted-foreground ml-2">({product.qty} sold)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Report Contents */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold text-foreground mb-2">Report Contents</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {reportType === "weekly" ? (
                    <>
                      <li>• Daily sales breakdown</li>
                      <li>• Stock level changes</li>
                      <li>• Low stock alerts</li>
                      <li>• Inventory movements log</li>
                    </>
                  ) : (
                    <>
                      <li>• Weekly sales comparison</li>
                      <li>• Top performing products</li>
                      <li>• Sales trend analysis</li>
                      <li>• Forecast accuracy review</li>
                    </>
                  )}
                </ul>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading} className="gap-2">
            {action === "download" ? (
              <>
                <Download className="w-4 h-4" />
                Download Report
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Regenerate Report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
