import { DashboardCard } from "@/components/DashboardCard";
import { WeeklySalesChart } from "@/components/WeeklySalesChart";
import { TopProductsTable } from "@/components/TopProductsTable";
import { InsightCard } from "@/components/InsightCard";
import { Package, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CreatePurchaseOrderDialog } from "@/components/CreatePurchaseOrderDialog";
import { useState } from "react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [reorderDialogOpen, setReorderDialogOpen] = useState(false);

  const handleReorderOpportunity = () => {
    navigate("/inventory");
  };

  const handleStockAlert = () => {
    setReorderDialogOpen(true);
  };

  const handleViewForecast = () => {
    navigate("/forecast");
  };

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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Products"
            value="79"
            subtitle="Active items"
            trend={{ value: 12, isPositive: true }}
            icon={Package}
          />
          <DashboardCard
            title="Low Stock Alerts"
            value="23"
            subtitle="Require attention"
            trend={{ value: 5, isPositive: false }}
            icon={AlertTriangle}
          />
          <DashboardCard
            title="Weekly Sales"
            value="₱45,231"
            subtitle="This week"
            trend={{ value: 18, isPositive: true }}
            icon={DollarSign}
          />
          <DashboardCard
            title="Forecast Accuracy"
            value="94%"
            subtitle="Last 30 days"
            trend={{ value: 3, isPositive: true }}
            icon={TrendingUp}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklySalesChart />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Prescriptive Insights</h3>
            <InsightCard
              type="opportunity"
              title="Reorder Opportunity"
              description="Top-selling products detected with 25% higher velocity. AI recommends increasing order quantities by 30% based on predictive analytics."
              action="View Details"
              onAction={handleReorderOpportunity}
            />
            <InsightCard
              type="warning"
              title="Stock Alert"
              description="Multiple products below safety stock levels. Immediate reorder recommended to prevent stockouts within 48 hours."
              action="Reorder Now"
              onAction={handleStockAlert}
            />
            <InsightCard
              type="revenue"
              title="Revenue Forecast"
              description="AI predicts ₱15,000+ weekend sales spike. Advanced forecasting models suggest optimizing inventory for high-demand items."
              action="View Forecast"
              onAction={handleViewForecast}
            />
          </div>
        </div>

        {/* Products Table */}
        <TopProductsTable />
      </div>

      <CreatePurchaseOrderDialog 
        open={reorderDialogOpen} 
        onOpenChange={setReorderDialogOpen} 
      />
    </div>
  );
};

export default Dashboard;
