import { InsightCard } from "@/components/InsightCard";
import { DashboardCard } from "@/components/DashboardCard";
import { Brain, TrendingUp, AlertCircle, Target, BrainCircuit, Sparkles, Database, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
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
        navigate('/purchase-orders');
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
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Smart Insights</h1>
            <Badge variant="secondary" className="gap-1">
              <BrainCircuit className="w-3 h-3" />
              AI Analytics
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Machine learning insights • Pattern recognition • Predictive recommendations
          </p>
        </div>

        {/* AI Analytics Overview */}
        <Card className="bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                <CardTitle>Intelligent Insights Engine</CardTitle>
              </div>
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Advanced AI
              </Badge>
            </div>
            <CardDescription>
              Real-time pattern detection, anomaly identification, and automated recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-3 bg-background/50 rounded-lg border">
                <p className="text-sm text-muted-foreground">ML Algorithm</p>
                <p className="font-semibold text-primary">Random Forest</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border">
                <p className="text-sm text-muted-foreground">Analysis Depth</p>
                <p className="font-semibold">Multi-dimensional</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border">
                <p className="text-sm text-muted-foreground">Pattern Detection</p>
                <p className="font-semibold text-green-500">Active</p>
              </div>
              <div className="p-3 bg-background/50 rounded-lg border">
                <p className="text-sm text-muted-foreground">Auto-Actions</p>
                <p className="font-semibold">15 Rules</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insight Summary Cards with ML Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Brain className="w-8 h-8 text-primary" />
                <Badge variant="outline" className="text-xs">AI</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Active Insights</p>
              <p className="text-3xl font-bold text-foreground mt-1">12</p>
              <p className="text-xs text-muted-foreground mt-2">Requires action</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <Badge variant="secondary" className="text-xs">ML</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Opportunities</p>
              <p className="text-3xl font-bold text-foreground mt-1">8</p>
              <p className="text-xs text-green-500 mt-2">₱23K potential revenue</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <AlertCircle className="w-8 h-8 text-orange-500" />
                <Badge variant="destructive" className="text-xs">Critical</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Critical Alerts</p>
              <p className="text-3xl font-bold text-foreground mt-1">3</p>
              <p className="text-xs text-orange-500 mt-2">Immediate attention needed</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-blue-500" />
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Model Accuracy</p>
              <p className="text-3xl font-bold text-primary mt-1">96.4%</p>
              <div className="h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '96.4%' }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Critical Insights */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Critical Actions</h2>
            <Badge variant="outline" className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              AI-Detected
            </Badge>
          </div>
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
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">Growth Opportunities</h2>
            <Badge variant="outline" className="text-xs gap-1">
              <Database className="w-3 h-3" />
              Pattern Analysis
            </Badge>
          </div>
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
