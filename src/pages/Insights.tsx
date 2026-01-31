import { InsightCard } from "@/components/InsightCard";
import { Brain, TrendingUp, AlertCircle, Target, BrainCircuit, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CreatePurchaseOrderDialog } from "@/components/CreatePurchaseOrderDialog";

interface Insight {
  type: "warning" | "opportunity" | "stock" | "revenue";
  title: string;
  description: string;
  action?: string;
}

type FilterType = "all" | "active" | "opportunities" | "critical" | "accuracy";

const Insights = () => {
  const navigate = useNavigate();
  const [purchaseOrderOpen, setPurchaseOrderOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const [criticalInsights] = useState<Insight[]>([
    {
      type: "warning",
      title: "Stock Shortage Risk",
      description: "Gourmet Pasta Set inventory critically low. Historical data shows 3-day lead time. Immediate reorder recommended.",
      action: "Create Purchase Order"
    }
  ]);

  const handleAction = (actionType: string) => {
    switch (actionType) {
      case "Create Purchase Order":
        navigate('/purchase-orders');
        break;
      default:
        toast.success(`${actionType} initiated`);
    }
  };

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
    const filterMessages: Record<FilterType, string> = {
      all: "Showing all insights",
      active: "Showing active insights requiring action",
      opportunities: "Showing growth opportunities",
      critical: "Showing critical alerts",
      accuracy: "Showing model accuracy details"
    };
    toast.info(filterMessages[filter]);
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

        {/* Insight Summary Cards - Interactive */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${activeFilter === "active" ? "ring-2 ring-primary" : ""}`}
            onClick={() => handleFilterClick("active")}
          >
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
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${activeFilter === "opportunities" ? "ring-2 ring-primary" : ""}`}
            onClick={() => handleFilterClick("opportunities")}
          >
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
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${activeFilter === "critical" ? "ring-2 ring-primary" : ""}`}
            onClick={() => handleFilterClick("critical")}
          >
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
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${activeFilter === "accuracy" ? "ring-2 ring-primary" : ""}`}
            onClick={() => handleFilterClick("accuracy")}
          >
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
      </div>

      <CreatePurchaseOrderDialog open={purchaseOrderOpen} onOpenChange={setPurchaseOrderOpen} />
    </div>
  );
};

export default Insights;
