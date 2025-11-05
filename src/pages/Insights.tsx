import { InsightCard } from "@/components/InsightCard";
import { DashboardCard } from "@/components/DashboardCard";
import { Brain, TrendingUp, AlertCircle, Target, Edit } from "lucide-react";
import { toast } from "sonner";
import { EditInsightDialog } from "@/components/EditInsightDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Insight {
  type: "warning" | "opportunity" | "stock" | "revenue";
  title: string;
  description: string;
  action?: string;
}

const Insights = () => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [selectedInsightIndex, setSelectedInsightIndex] = useState<{ section: string; index: number } | null>(null);

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
      description: "Customers buying Olive Oil Premium often purchase Artisan Cheese. Bundle pricing could increase AOV by 18%.",
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
      description: "Imported Wine Bottles inventory 45% above optimal level. Consider promotional campaign to accelerate turnover.",
      action: "Plan Promotion"
    },
    {
      type: "stock",
      title: "Reorder Point Optimization",
      description: "Based on 90-day trend, Organic Tea Collection reorder point should increase from 100 to 125 units.",
      action: "Update Reorder Point"
    }
  ]);

  const handleAction = (message: string) => {
    toast.success(message);
  };

  const handleEditInsight = (section: string, index: number, insight: Insight) => {
    setSelectedInsight(insight);
    setSelectedInsightIndex({ section, index });
    setEditDialogOpen(true);
  };

  const handleSaveInsight = (updatedInsight: Insight) => {
    if (!selectedInsightIndex) return;

    const { section, index } = selectedInsightIndex;
    
    if (section === "critical") {
      const updated = [...criticalInsights];
      updated[index] = updatedInsight;
      setCriticalInsights(updated);
    } else if (section === "opportunity") {
      const updated = [...opportunityInsights];
      updated[index] = updatedInsight;
      setOpportunityInsights(updated);
    } else if (section === "stock") {
      const updated = [...stockInsights];
      updated[index] = updatedInsight;
      setStockInsights(updated);
    }

    toast.success("Insight updated successfully");
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
              <div key={index} className="relative group">
                <InsightCard
                  type={insight.type}
                  title={insight.title}
                  description={insight.description}
                  action={insight.action}
                  onAction={() => handleAction(`${insight.action} initiated`)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleEditInsight("critical", index, insight)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Opportunities */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Growth Opportunities</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {opportunityInsights.map((insight, index) => (
              <div key={index} className="relative group">
                <InsightCard
                  type={insight.type}
                  title={insight.title}
                  description={insight.description}
                  action={insight.action}
                  onAction={() => handleAction(`${insight.action} initiated`)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleEditInsight("opportunity", index, insight)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Stock Management */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Stock Management</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {stockInsights.map((insight, index) => (
              <div key={index} className="relative group">
                <InsightCard
                  type={insight.type}
                  title={insight.title}
                  description={insight.description}
                  action={insight.action}
                  onAction={() => handleAction(`${insight.action} initiated`)}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleEditInsight("stock", index, insight)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <EditInsightDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        insight={selectedInsight}
        onSave={handleSaveInsight}
      />
    </div>
  );
};

export default Insights;
