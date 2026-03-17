import { WeeklySalesChart } from "@/components/WeeklySalesChart";
import { StoreInventoryStatus } from "@/components/StoreInventoryStatus";
import { useNavigate } from "react-router-dom";
import { CreatePurchaseOrderDialog } from "@/components/CreatePurchaseOrderDialog";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);

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

  // Calculate sales trend
  const salesTrend = previousWeeklySales && weeklySales 
    ? Math.round(((weeklySales - previousWeeklySales) / previousWeeklySales) * 100)
    : 0;

  return (
    <div className="flex-1 bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1">
            Real-time insights for smarter inventory decisions
          </p>
        </div>


        {/* Store Inventory Status */}
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4">Store Inventory Status</h2>
          <StoreInventoryStatus />
        </div>

        {/* Charts Section */}
        <WeeklySalesChart />
      </div>

      <CreatePurchaseOrderDialog 
        open={reorderDialogOpen} 
        onOpenChange={setReorderDialogOpen} 
      />
    </div>
  );
};

export default Dashboard;
