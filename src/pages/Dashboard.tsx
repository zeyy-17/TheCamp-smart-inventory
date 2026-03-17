import { WeeklySalesChart } from "@/components/WeeklySalesChart";
import { StoreInventoryStatus } from "@/components/StoreInventoryStatus";
import { CreatePurchaseOrderDialog } from "@/components/CreatePurchaseOrderDialog";
import { useState } from "react";

const Dashboard = () => {
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);


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
