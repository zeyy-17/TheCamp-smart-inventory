import { DashboardCard } from "@/components/DashboardCard";
import { WeeklySalesChart } from "@/components/WeeklySalesChart";
import { TopProductsTable } from "@/components/TopProductsTable";
import { InventoryAlerts } from "@/components/InventoryAlerts";
import { Package, DollarSign, AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CreatePurchaseOrderDialog } from "@/components/CreatePurchaseOrderDialog";
import { RecordSaleDialog } from "@/components/RecordSaleDialog";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format } from "date-fns";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const navigate = useNavigate();
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = useState(false);

  // Fetch total products count
  const { data: productsCount } = useQuery({
    queryKey: ['products-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  // Fetch low stock alerts count
  const { data: lowStockCount } = useQuery({
    queryKey: ['low-stock-count'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('quantity, reorder_level');
      
      const lowStock = data?.filter(p => p.quantity !== null && p.reorder_level !== null && p.quantity <= p.reorder_level) || [];
      return lowStock.length;
    },
  });

  // Fetch weekly sales total
  const { data: weeklySales } = useQuery({
    queryKey: ['weekly-sales'],
    queryFn: async () => {
      const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('date_sold', weekAgo);
      
      const total = data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      return total;
    },
  });

  // Calculate previous week sales for trend
  const { data: previousWeeklySales } = useQuery({
    queryKey: ['previous-weekly-sales'],
    queryFn: async () => {
      const twoWeeksAgo = format(subDays(new Date(), 14), 'yyyy-MM-dd');
      const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      const { data } = await supabase
        .from('sales')
        .select('total_amount')
        .gte('date_sold', twoWeeksAgo)
        .lt('date_sold', weekAgo);
      
      const total = data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
      return total;
    },
  });

  const handleReorderOpportunity = () => {
    navigate("/inventory");
  };

  const handleStockAlert = () => {
    navigate("/inventory?filter=low-stock");
  };

  const handleOutOfStock = () => {
    navigate("/inventory?filter=out-of-stock");
  };

  const handleViewForecast = () => {
    navigate("/forecast");
  };

  // Calculate sales trend
  const salesTrend = previousWeeklySales && weeklySales 
    ? Math.round(((weeklySales - previousWeeklySales) / previousWeeklySales) * 100)
    : 0;

  return (
    <div className="flex-1 bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground mt-1">
              Real-time insights for smarter inventory decisions
            </p>
          </div>
          <Button onClick={() => setSaleDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Record Sale
          </Button>
        </div>

        {/* Inventory Alerts */}
        <InventoryAlerts />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            title="Total Products"
            value={productsCount?.toString() || "0"}
            subtitle="Active items"
            icon={Package}
            onClick={handleReorderOpportunity}
          />
          <DashboardCard
            title="Low Stock Alerts"
            value={lowStockCount?.toString() || "0"}
            subtitle="Require attention"
            icon={AlertTriangle}
            onClick={handleStockAlert}
            variant="warning"
          />
          <DashboardCard
            title="Weekly Sales"
            value={`₱${weeklySales?.toLocaleString() || "0"}`}
            subtitle="This week"
            trend={salesTrend ? { value: Math.abs(salesTrend), isPositive: salesTrend > 0 } : undefined}
            icon={DollarSign}
          />
        </div>

        {/* Charts Section */}
        <WeeklySalesChart />

        {/* Products Table */}
        <TopProductsTable />
      </div>

      <CreatePurchaseOrderDialog 
        open={reorderDialogOpen} 
        onOpenChange={setReorderDialogOpen} 
      />
      
      <RecordSaleDialog 
        open={saleDialogOpen} 
        onOpenChange={setSaleDialogOpen}
      />
    </div>
  );
};

export default Dashboard;
