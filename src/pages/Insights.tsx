import { InsightCard } from "@/components/InsightCard";
import { DashboardCard } from "@/components/DashboardCard";
import { Brain, TrendingUp, AlertCircle, Target } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { CreatePurchaseOrderDialog } from "@/components/CreatePurchaseOrderDialog";
import { AdjustForecastDialog } from "@/components/AdjustForecastDialog";
import { SeasonalAnalysisDialog } from "@/components/SeasonalAnalysisDialog";
import { CreateBundleDialog } from "@/components/CreateBundleDialog";
import { ReviewPricingDialog } from "@/components/ReviewPricingDialog";
import { PlanPromotionDialog } from "@/components/PlanPromotionDialog";
import { UpdateReorderPointDialog } from "@/components/UpdateReorderPointDialog";

interface Insight {
  type: "warning" | "opportunity" | "stock" | "revenue";
  title: string;
  description: string;
  action?: string;
}

const Insights = () => {
  const [purchaseOrderOpen, setPurchaseOrderOpen] = useState(false);
  const [adjustForecastOpen, setAdjustForecastOpen] = useState(false);
  const [seasonalAnalysisOpen, setSeasonalAnalysisOpen] = useState(false);
  const [createBundleOpen, setCreateBundleOpen] = useState(false);
  const [reviewPricingOpen, setReviewPricingOpen] = useState(false);
  const [planPromotionOpen, setPlanPromotionOpen] = useState(false);
  const [updateReorderOpen, setUpdateReorderOpen] = useState(false);

  const [criticalInsights, setCriticalInsights] = useState<Insight[]>([
    {
      type: "warning",
      title: "Stock Shortage Risk",
      description: "Gourmet Pasta Set inventory critically low. Historical data shows 3-day lead time. Immediate reorder recommended.",
      action: "Create Purchase Order"
    },
    {
      type: "warning",
      title: "Demand Spike Detected",
      description: "Artisan Chocolate Box showing 35% increase in weekly demand. Current stock sufficient for 8 days only.",
      action: "Adjust Forecast"
    }
  ]);

  const [opportunityInsights, setOpportunityInsights] = useState<Insight[]>([
    {
      type: "opportunity",
      title: "Seasonal Trend Identified",
      description: "Premium Coffee Beans sales increase 40% in autumn months. Consider bulk purchase for Q4.",
      action: "View Seasonal Analysis"
    },
    {
      type: "revenue",
      title: "Cross-Sell Opportunity",
      description: "Customers buying Heineken often purchase Corona. Bundle pricing could increase AOV by 18%.",
      action: "Create Bundle"
    },
    {
      type: "opportunity",
      title: "Pricing Optimization",
      description: "Specialty Cheese Wheel price elasticity analysis suggests 8% price increase won't impact demand.",
      action: "Review Pricing"
    },
    {
      type: "revenue",
      title: "Inventory Efficiency",
      description: "Reducing Craft Beer Selection reorder frequency from weekly to bi-weekly could save ₱450/month.",
      action: "Optimize Schedule"
    }
  ]);

  const [stockInsights, setStockInsights] = useState<Insight[]>([
    {
      type: "stock",
      title: "Overstock Alert",
      description: "Smirnoff Mule inventory 45% above optimal level. Consider promotional campaign to accelerate turnover.",
      action: "Plan Promotion"
    },
    {
      type: "stock",
      title: "Reorder Point Optimization",
      description: "Based on 90-day trend, Organic Tea Collection reorder point should increase from 100 to 125 units.",
      action: "Update Reorder Point"
    }
  ]);

  const handleAction = (actionType: string) => {
    switch (actionType) {
      case "Create Purchase Order":
        setPurchaseOrderOpen(true);
        break;
      case "Adjust Forecast":
        setAdjustForecastOpen(true);
        break;
      case "View Seasonal Analysis":
        setSeasonalAnalysisOpen(true);
        break;
      case "Create Bundle":
        setCreateBundleOpen(true);
        break;
      case "Review Pricing":
        setReviewPricingOpen(true);
        break;
      case "Optimize Schedule":
        toast.success("Reorder schedule optimized successfully!");
        break;
      case "Plan Promotion":
        setPlanPromotionOpen(true);
        break;
      case "Update Reorder Point":
        setUpdateReorderOpen(true);
        break;
      default:
        toast.success(`${actionType} initiated`);
    }
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
            {criticalInsights.map((insight, index) => (
              <InsightCard
                key={index}
                type={insight.type}
                title={insight.title}
                description={insight.description}
                action={insight.action}
                onAction={() => handleAction(insight.action || "")}
              />
            ))}
          </div>
        </div>

        {/* Opportunities */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Growth Opportunities</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {opportunityInsights.map((insight, index) => (
              <InsightCard
                key={index}
                type={insight.type}
                title={insight.title}
                description={insight.description}
                action={insight.action}
                onAction={() => handleAction(insight.action || "")}
              />
            ))}
          </div>
        </div>

        {/* Stock Management */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Stock Management</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {stockInsights.map((insight, index) => (
              <InsightCard
                key={index}
                type={insight.type}
                title={insight.title}
                description={insight.description}
                action={insight.action}
                onAction={() => handleAction(insight.action || "")}
              />
            ))}
          </div>
        </div>
      </div>

      <CreatePurchaseOrderDialog open={purchaseOrderOpen} onOpenChange={setPurchaseOrderOpen} />
      <AdjustForecastDialog open={adjustForecastOpen} onOpenChange={setAdjustForecastOpen} />
      <SeasonalAnalysisDialog open={seasonalAnalysisOpen} onOpenChange={setSeasonalAnalysisOpen} />
      <CreateBundleDialog open={createBundleOpen} onOpenChange={setCreateBundleOpen} />
      <ReviewPricingDialog open={reviewPricingOpen} onOpenChange={setReviewPricingOpen} />
      <PlanPromotionDialog open={planPromotionOpen} onOpenChange={setPlanPromotionOpen} />
      <UpdateReorderPointDialog open={updateReorderOpen} onOpenChange={setUpdateReorderOpen} />
    </div>
  );
};

export default Insights;
