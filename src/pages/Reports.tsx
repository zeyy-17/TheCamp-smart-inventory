import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, Calendar, TrendingUp, DollarSign, Package, Truck } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { Badge } from "@/components/ui/badge";

const reportTypes = [
  {
    title: "Weekly Inventory Report",
    description: "Comprehensive overview of stock levels, movements, and alerts for the past week",
    icon: Calendar,
    lastGenerated: "2 hours ago",
  },
  {
    title: "Monthly Sales Analysis",
    description: "Detailed sales performance, trends, and forecast accuracy for the month",
    icon: TrendingUp,
    lastGenerated: "1 day ago",
  },
];

const Reports = () => {
  // Fetch today's sales
  const { data: todaySales = [] } = useQuery({
    queryKey: ['today-sales'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('sales')
        .select('*, products(name)')
        .eq('date_sold', today)
        .order('created_at', { ascending: false });
      
      return data || [];
    },
  });

  // Fetch recent purchase orders (last 7 days)
  const { data: recentPurchaseOrders = [] } = useQuery({
    queryKey: ['recent-purchase-orders'],
    queryFn: async () => {
      const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('purchase_orders')
        .select('*, products(name), suppliers(name)')
        .gte('created_at', weekAgo)
        .order('created_at', { ascending: false });
      
      return data || [];
    },
  });

  // Fetch pending purchase orders
  const { data: pendingOrders = [] } = useQuery({
    queryKey: ['pending-purchase-orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('purchase_orders')
        .select('*, products(name), suppliers(name)')
        .eq('status', 'pending')
        .order('expected_delivery_date', { ascending: true });
      
      return data || [];
    },
  });

  // Calculate today's totals
  const todayTotalSales = todaySales.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
  const todayTotalItems = todaySales.reduce((sum, sale) => sum + sale.quantity, 0);

  // Calculate purchase order stats
  const receivedOrders = recentPurchaseOrders.filter(po => po.status === 'received');
  const totalReceivedQty = receivedOrders.reduce((sum, po) => sum + po.quantity, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Pending</Badge>;
      case 'received':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Received</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDownload = (reportName: string) => {
    toast.success(`Downloading ${reportName}...`);
  };

  const handleGenerate = (reportName: string) => {
    toast.success(`Generating ${reportName}...`);
  };

  return (
    <div className="flex-1 bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">
              Generate and download comprehensive inventory reports
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Today's Sales Summary */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Today's Sales</h3>
            </div>
            <div className="text-3xl font-bold text-primary">₱{todayTotalSales.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {todaySales.length} transactions • {todayTotalItems} items
            </div>
          </Card>

          {/* Pending Orders */}
          <Card className="p-6 bg-gradient-to-br from-warning/10 to-orange-500/10 border-warning/20">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="w-5 h-5 text-warning" />
              <h3 className="font-semibold text-foreground">Pending Orders</h3>
            </div>
            <div className="text-3xl font-bold text-warning">{pendingOrders.length}</div>
            <div className="text-sm text-muted-foreground mt-1">
              Awaiting delivery
            </div>
          </Card>

          {/* Received This Week */}
          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-foreground">Received This Week</h3>
            </div>
            <div className="text-3xl font-bold text-green-600">{totalReceivedQty}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {receivedOrders.length} orders received
            </div>
          </Card>
        </div>

        {/* Today's Sales Details */}
        {todaySales.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Today's Transactions</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {todaySales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{sale.products?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Qty: {sale.quantity} • {sale.store || 'N/A'} • {format(new Date(sale.created_at!), 'h:mm a')}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-primary">
                    ₱{Number(sale.total_amount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Pending Purchase Orders */}
        {pendingOrders.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Pending Purchase Orders</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {pendingOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{order.products?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Qty: {order.quantity} • {order.store} • Due: {format(new Date(order.expected_delivery_date), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{order.suppliers?.name}</span>
                    {getStatusBadge(order.status || 'pending')}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Purchase Orders */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Recent Purchase Orders (Last 7 Days)</h2>
          {recentPurchaseOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No purchase orders in the last 7 days</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentPurchaseOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{order.products?.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Qty: {order.quantity} • {order.store} • {order.invoice_number || `PO-${order.id}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at!), 'MMM d')}
                    </span>
                    {getStatusBadge(order.status || 'pending')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report, index) => {
            const Icon = report.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-custom-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {report.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {report.description}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Last generated: {report.lastGenerated}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDownload(report.title)}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleGenerate(report.title)}
                      >
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Scheduled Reports */}
        <div className="bg-card rounded-xl p-6 shadow-custom-md border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Scheduled Reports</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Weekly Inventory Summary</p>
                <p className="text-sm text-muted-foreground">Every Monday at 9:00 AM</p>
              </div>
              <Button variant="outline" size="sm">Edit Schedule</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Monthly Performance Report</p>
                <p className="text-sm text-muted-foreground">First day of each month at 8:00 AM</p>
              </div>
              <Button variant="outline" size="sm">Edit Schedule</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
