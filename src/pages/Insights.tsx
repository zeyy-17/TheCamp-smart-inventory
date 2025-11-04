import { InsightCard } from "@/components/InsightCard";
import { DashboardCard } from "@/components/DashboardCard";
import { Brain, TrendingUp, AlertCircle, Target } from "lucide-react";
import { toast } from "sonner";

const Insights = () => {
  const handleAction = (message: string) => {
    toast.success(message);
  };

  return (
    <div className="flex-1 bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Smart Insights</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered recommendations for optimal inventory management
          </p>
        </div>

        {/* Insight Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Active Insights"
            value="12"
            subtitle="Requires action"
            icon={Brain}
          />
          <DashboardCard
            title="Opportunities"
            value="8"
            subtitle="Revenue potential"
            icon={TrendingUp}
          />
          <DashboardCard
            title="Critical Alerts"
            value="3"
            subtitle="Immediate attention"
            icon={AlertCircle}
          />
          <DashboardCard
            title="Accuracy Score"
            value="96%"
            subtitle="Prediction quality"
            icon={Target}
          />
        </div>

        {/* Critical Insights */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Critical Actions</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InsightCard
              type="warning"
              title="Stock Shortage Risk"
              description="Gourmet Pasta Set inventory critically low. Historical data shows 3-day lead time. Immediate reorder recommended."
              action="Create Purchase Order"
              onAction={() => handleAction("Purchase order initiated")}
            />
            <InsightCard
              type="warning"
              title="Demand Spike Detected"
              description="Artisan Chocolate Box showing 35% increase in weekly demand. Current stock sufficient for 8 days only."
              action="Adjust Forecast"
              onAction={() => handleAction("Forecast adjusted")}
            />
          </div>
        </div>

        {/* Opportunities */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Growth Opportunities</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InsightCard
              type="opportunity"
              title="Seasonal Trend Identified"
              description="Premium Coffee Beans sales increase 40% in autumn months. Consider bulk purchase for Q4."
              action="View Seasonal Analysis"
              onAction={() => handleAction("Opening seasonal report...")}
            />
            <InsightCard
              type="revenue"
              title="Cross-Sell Opportunity"
              description="Customers buying Olive Oil Premium often purchase Artisan Cheese. Bundle pricing could increase AOV by 18%."
              action="Create Bundle"
              onAction={() => handleAction("Bundle creation started")}
            />
            <InsightCard
              type="opportunity"
              title="Pricing Optimization"
              description="Specialty Cheese Wheel price elasticity analysis suggests 8% price increase won't impact demand."
              action="Review Pricing"
              onAction={() => handleAction("Price review opened")}
            />
            <InsightCard
              type="revenue"
              title="Inventory Efficiency"
              description="Reducing Craft Beer Selection reorder frequency from weekly to bi-weekly could save $450/month."
              action="Optimize Schedule"
              onAction={() => handleAction("Schedule optimization in progress")}
            />
          </div>
        </div>

        {/* Stock Management */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Stock Management</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InsightCard
              type="stock"
              title="Overstock Alert"
              description="Imported Wine Bottles inventory 45% above optimal level. Consider promotional campaign to accelerate turnover."
              action="Plan Promotion"
              onAction={() => handleAction("Promotion planning started")}
            />
            <InsightCard
              type="stock"
              title="Reorder Point Optimization"
              description="Based on 90-day trend, Organic Tea Collection reorder point should increase from 100 to 125 units."
              action="Update Reorder Point"
              onAction={() => handleAction("Reorder point updated")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
