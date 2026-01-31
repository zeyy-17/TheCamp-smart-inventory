import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Download, RefreshCw, Calendar, TrendingUp, Package, DollarSign, FileText, Truck } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const queryClient = useQueryClient();
  const today = new Date();
  
  // Calculate date range based on report type
  const dateRange = reportType === "weekly" 
    ? { start: startOfWeek(today), end: endOfWeek(today) }
    : { start: startOfMonth(today), end: endOfMonth(today) };

  const startDate = format(dateRange.start, 'yyyy-MM-dd');
  const endDate = format(dateRange.end, 'yyyy-MM-dd');

  // Fetch sales data for the period
  const { data: salesData, isLoading: salesLoading, refetch: refetchSales } = useQuery({
    queryKey: ['report-sales', reportType, open],
    queryFn: async () => {
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
  const { data: movementsData, isLoading: movementsLoading, refetch: refetchMovements } = useQuery({
    queryKey: ['report-movements', reportType, open],
    queryFn: async () => {
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
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['report-products', open],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*');
      
      return data || [];
    },
    enabled: open,
  });

  // Fetch purchase orders for the period
  const { data: purchaseOrdersData, isLoading: poLoading, refetch: refetchPO } = useQuery({
    queryKey: ['report-purchase-orders', reportType, open],
    queryFn: async () => {
      const { data } = await supabase
        .from('purchase_orders')
        .select('*, products(name), suppliers(name)')
        .gte('created_at', startDate)
        .lte('created_at', endDate);
      
      return data || [];
    },
    enabled: open,
  });

  const isLoading = salesLoading || movementsLoading || productsLoading || poLoading;

  // Calculate summary stats
  const totalSales = salesData?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
  const totalTransactions = salesData?.length || 0;
  const totalItemsSold = salesData?.reduce((sum, sale) => sum + sale.quantity, 0) || 0;
  const totalMovements = movementsData?.length || 0;
  const lowStockItems = productsData?.filter(p => (p.quantity || 0) <= (p.reorder_level || 0)).length || 0;
  const totalProducts = productsData?.length || 0;

  // Purchase order stats
  const totalPurchaseOrders = purchaseOrdersData?.length || 0;
  const pendingOrders = purchaseOrdersData?.filter(po => po.status === 'pending').length || 0;
  const receivedOrders = purchaseOrdersData?.filter(po => po.status === 'received').length || 0;
  const totalOrderedQty = purchaseOrdersData?.reduce((sum, po) => sum + po.quantity, 0) || 0;

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

  const generatePDF = () => {
    const doc = new jsPDF();
    const title = reportType === "weekly" ? "Weekly Inventory Report" : "Monthly Sales Analysis";
    const periodText = reportType === "weekly" 
      ? `${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`
      : format(dateRange.start, 'MMMM yyyy');

    // Header
    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("The Camp Inventory", 14, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(title, 14, 32);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report Period: ${periodText}`, 14, 40);
    doc.text(`Generated: ${format(new Date(), 'MMM d, yyyy h:mm a')}`, 14, 47);

    let yPos = 60;

    // Summary Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Summary", 14, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [['Metric', 'Value']],
      body: [
        ['Total Sales', `₱${totalSales.toLocaleString()}`],
        ['Transactions', totalTransactions.toString()],
        ['Items Sold', totalItemsSold.toString()],
        ['Stock Movements', totalMovements.toString()],
        ['Low Stock Items', `${lowStockItems} of ${totalProducts}`],
        ['Purchase Orders', totalPurchaseOrders.toString()],
        ['Pending Orders', pendingOrders.toString()],
        ['Received Orders', receivedOrders.toString()],
        ['Total Ordered Qty', totalOrderedQty.toString()],
      ],
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Top Selling Products
    if (topProducts.length > 0) {
      doc.setFontSize(14);
      doc.text("Top Selling Products", 14, yPos);
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        head: [['Rank', 'Product', 'Quantity Sold', 'Revenue']],
        body: topProducts.map((product, idx) => [
          (idx + 1).toString(),
          product.name,
          product.qty.toString(),
          `₱${product.amount.toLocaleString()}`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Purchase Orders Table
    if (purchaseOrdersData && purchaseOrdersData.length > 0) {
      // Check if we need a new page
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text("Purchase Orders", 14, yPos);
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        head: [['Invoice #', 'Product', 'Supplier', 'Qty', 'Status', 'Expected Delivery']],
        body: purchaseOrdersData.map(po => [
          po.invoice_number || `PO-${po.id}`,
          po.products?.name || 'N/A',
          po.suppliers?.name || 'N/A',
          po.quantity.toString(),
          po.status || 'pending',
          format(new Date(po.expected_delivery_date), 'MMM d, yyyy'),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
        columnStyles: {
          0: { cellWidth: 30 },
          4: { cellWidth: 22 },
        },
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    }

    // Low Stock Items
    const lowStockProducts = productsData?.filter(p => (p.quantity || 0) <= (p.reorder_level || 0)) || [];
    if (lowStockProducts.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text("Low Stock Alerts", 14, yPos);
      yPos += 8;

      autoTable(doc, {
        startY: yPos,
        head: [['Product', 'SKU', 'Current Stock', 'Reorder Level']],
        body: lowStockProducts.map(p => [
          p.name,
          p.sku,
          (p.quantity || 0).toString(),
          (p.reorder_level || 0).toString(),
        ]),
        theme: 'striped',
        headStyles: { fillColor: [231, 76, 60] },
      });
    }

    // Save the PDF
    const fileName = `${reportType}-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
    toast.success(`${title} downloaded successfully!`);
  };

  const handleConfirm = () => {
    if (action === "download") {
      generatePDF();
    } else {
      // Regenerate - refetch all data
      Promise.all([refetchSales(), refetchMovements(), refetchProducts(), refetchPO()])
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['report-sales'] });
          queryClient.invalidateQueries({ queryKey: ['report-movements'] });
          queryClient.invalidateQueries({ queryKey: ['report-products'] });
          queryClient.invalidateQueries({ queryKey: ['report-purchase-orders'] });
          toast.success("Report regenerated with latest data!");
        });
    }
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

              {/* Purchase Orders Stats */}
              <div className="border rounded-lg p-4 bg-blue-500/5">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <h4 className="font-semibold text-foreground">Purchase Orders</h4>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-xl font-bold text-foreground">{totalPurchaseOrders}</div>
                    <div className="text-xs text-muted-foreground">Total Orders</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-warning">{pendingOrders}</div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-green-600">{receivedOrders}</div>
                    <div className="text-xs text-muted-foreground">Received</div>
                  </div>
                </div>
                <div className="mt-2 text-center text-sm text-muted-foreground">
                  {totalOrderedQty} total units ordered
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
                      <li>• Purchase orders summary</li>
                    </>
                  ) : (
                    <>
                      <li>• Weekly sales comparison</li>
                      <li>• Top performing products</li>
                      <li>• Sales trend analysis</li>
                      <li>• Purchase orders overview</li>
                      <li>• Stock replenishment history</li>
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
                Download PDF
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
