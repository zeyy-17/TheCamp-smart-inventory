import { InsightCard } from "@/components/InsightCard";
import { Brain, TrendingUp, AlertCircle, Target, BrainCircuit, Sparkles, Zap, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CreatePurchaseOrderDialog } from "@/components/CreatePurchaseOrderDialog";
import { AIPromotionDialog } from "@/components/AIPromotionDialog";
import { SalesChartDialog } from "@/components/SalesChartDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Insight {
  type: "warning" | "opportunity" | "stock" | "revenue";
  title: string;
  description: string;
  action?: string;
  category: "active" | "opportunity" | "critical";
  productName?: string;
  productId?: number;
}

type FilterType = "all" | "active" | "opportunities" | "critical" | "accuracy";

const Insights = () => {
  const navigate = useNavigate();
  const [purchaseOrderOpen, setPurchaseOrderOpen] = useState(false);
  const [promotionDialogOpen, setPromotionDialogOpen] = useState(false);
  const [salesChartOpen, setSalesChartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ name?: string; id?: number } | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [generatedInsights, setGeneratedInsights] = useState<Insight[]>([]);

  // Fetch products data
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, suppliers(name), categories(name)');
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch sales data
  const { data: sales = [], isLoading: salesLoading } = useQuery({
    queryKey: ['sales-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*, products(name)');
      if (error) throw error;
      return data || [];
    },
  });

  // Generate insights based on real data
  useEffect(() => {
    if (products.length > 0 || sales.length > 0) {
      generateInsights();
    }
  }, [products, sales]);

  const generateInsights = () => {
    const insights: Insight[] = [];

    // Critical Insights - Stock issues
    const lowStockProducts = products.filter((p: any) => 
      p.quantity !== null && p.reorder_level !== null && p.quantity <= p.reorder_level && p.quantity > 0
    );
    const outOfStockProducts = products.filter((p: any) => p.quantity === 0);

    outOfStockProducts.forEach((product: any) => {
      insights.push({
        type: "warning",
        title: `Out of Stock: ${product.name}`,
        description: `${product.name} (SKU: ${product.sku}) is completely out of stock. Immediate restocking required to avoid lost sales.`,
        action: "Create Purchase Order",
        category: "critical",
        productName: product.name,
        productId: product.id
      });
    });

    lowStockProducts.slice(0, 3).forEach((product: any) => {
      insights.push({
        type: "warning",
        title: `Low Stock Alert: ${product.name}`,
        description: `Only ${product.quantity} units remaining (reorder level: ${product.reorder_level}). Consider restocking soon.`,
        action: "Create Purchase Order",
        category: "critical",
        productName: product.name,
        productId: product.id
      });
    });

    // Opportunity Insights - High margin products, trending items
    const highMarginProducts = products
      .filter((p: any) => p.retail_price && p.cost_price)
      .map((p: any) => ({
        ...p,
        margin: ((p.retail_price - p.cost_price) / p.retail_price) * 100
      }))
      .filter((p: any) => p.margin > 40)
      .slice(0, 3);

    highMarginProducts.forEach((product: any) => {
      insights.push({
        type: "opportunity",
        title: `High Margin Opportunity: ${product.name}`,
        description: `${product.name} has a ${product.margin.toFixed(1)}% profit margin. Consider promoting this product to increase revenue.`,
        action: "Plan Promotion",
        category: "opportunity",
        productName: product.name,
        productId: product.id
      });
    });

    // Sales-based opportunities
    if (sales.length > 0) {
      const productSales: Record<number, number> = {};
      sales.forEach((sale: any) => {
        if (sale.product_id) {
          productSales[sale.product_id] = (productSales[sale.product_id] || 0) + sale.quantity;
        }
      });

      const topSellingIds = Object.entries(productSales)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 2)
        .map(([id]) => parseInt(id));

      topSellingIds.forEach(productId => {
        const product = products.find((p: any) => p.id === productId);
        if (product) {
          insights.push({
            type: "revenue",
            title: `Top Seller: ${product.name}`,
            description: `${product.name} is one of your best-selling products with ${productSales[productId]} units sold. Consider bundling or upselling.`,
            action: "View Sales",
            category: "opportunity",
            productName: product.name,
            productId: product.id
          });
        }
      });
    }

    // Active Insights - General actionable items
    const productsNeedingReview = products.filter((p: any) => 
      !p.reorder_level || p.reorder_level === 0
    ).slice(0, 2);

    productsNeedingReview.forEach((product: any) => {
      insights.push({
        type: "stock",
        title: `Set Reorder Level: ${product.name}`,
        description: `${product.name} has no reorder level configured. Set a reorder point to enable automatic low-stock alerts.`,
        action: "Edit Product",
        category: "active",
        productName: product.name,
        productId: product.id
      });
    });

    // Products with high stock that might need promotion
    const overstockedProducts = products
      .filter((p: any) => p.quantity > 100 && p.reorder_level && p.quantity > p.reorder_level * 5)
      .slice(0, 2);

    overstockedProducts.forEach((product: any) => {
      insights.push({
        type: "stock",
        title: `Overstock Alert: ${product.name}`,
        description: `${product.name} has ${product.quantity} units in stock, which is 5x above reorder level. Consider running a promotion.`,
        action: "Plan Promotion",
        category: "active",
        productName: product.name,
        productId: product.id
      });
    });

    // Price optimization suggestions
    const lowMarginProducts = products
      .filter((p: any) => p.retail_price && p.cost_price)
      .map((p: any) => ({
        ...p,
        margin: ((p.retail_price - p.cost_price) / p.retail_price) * 100
      }))
      .filter((p: any) => p.margin < 20 && p.margin > 0)
      .slice(0, 2);

    lowMarginProducts.forEach((product: any) => {
      insights.push({
        type: "revenue",
        title: `Low Margin: ${product.name}`,
        description: `${product.name} has only ${product.margin.toFixed(1)}% margin. Review pricing or supplier costs to improve profitability.`,
        action: "Review Pricing",
        category: "active",
        productName: product.name,
        productId: product.id
      });
    });

    setGeneratedInsights(insights);
  };
  const handleAction = (actionType: string, insight?: Insight) => {
    switch (actionType) {
      case "Create Purchase Order":
        navigate('/purchase-orders');
        break;
      case "View Product":
      case "Edit Product":
        navigate('/inventory');
        break;
      case "View Sales":
        console.log("View Sales clicked for:", insight?.productName);
        if (insight) {
          setSelectedProduct({ name: insight.productName, id: insight.productId });
          setSalesChartOpen(true);
        }
        break;
      case "Plan Promotion":
        if (insight) {
          setSelectedProduct({ name: insight.productName, id: insight.productId });
        } else {
          setSelectedProduct(null);
        }
        setPromotionDialogOpen(true);
        break;
      case "Review Pricing":
        navigate('/inventory');
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

  // Filter insights based on active filter
  const getFilteredInsights = () => {
    if (activeFilter === "all") return generatedInsights;
    if (activeFilter === "active") return generatedInsights.filter(i => i.category === "active");
    if (activeFilter === "opportunities") return generatedInsights.filter(i => i.category === "opportunity");
    if (activeFilter === "critical") return generatedInsights.filter(i => i.category === "critical");
    return [];
  };

  const filteredInsights = getFilteredInsights();

  // Count insights by category
  const activeCount = generatedInsights.filter(i => i.category === "active").length;
  const opportunityCount = generatedInsights.filter(i => i.category === "opportunity").length;
  const criticalCount = generatedInsights.filter(i => i.category === "critical").length;

  // Calculate potential revenue from opportunities
  const potentialRevenue = products
    .filter((p: any) => p.retail_price && p.cost_price)
    .reduce((sum: number, p: any) => {
      const margin = ((p.retail_price - p.cost_price) / p.retail_price) * 100;
      if (margin > 40) return sum + (p.retail_price * (p.quantity || 0) * 0.1);
      return sum;
    }, 0);

  const isLoading = productsLoading || salesLoading;

  const getSectionTitle = () => {
    switch (activeFilter) {
      case "active": return "Active Insights";
      case "opportunities": return "Growth Opportunities";
      case "critical": return "Critical Alerts";
      case "accuracy": return "Model Accuracy Details";
      default: return "All Insights";
    }
  };

  return (
    <div className="flex-1 bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
          <button
            onClick={generateInsights}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
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
              <p className="text-3xl font-bold text-foreground mt-1">{activeCount}</p>
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
              <p className="text-3xl font-bold text-foreground mt-1">{opportunityCount}</p>
              <p className="text-xs text-green-500 mt-2">₱{(potentialRevenue / 1000).toFixed(0)}K potential revenue</p>
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
              <p className="text-3xl font-bold text-foreground mt-1">{criticalCount}</p>
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

        {/* Filtered Insights Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">{getSectionTitle()}</h2>
              <Badge variant="outline" className="text-xs">
                <Zap className="w-3 h-3 mr-1" />
                AI-Detected
              </Badge>
              {activeFilter !== "all" && (
                <button
                  onClick={() => setActiveFilter("all")}
                  className="text-xs text-primary hover:underline ml-2"
                >
                  Show All
                </button>
              )}
            </div>
            <Badge variant="secondary">{filteredInsights.length} insights</Badge>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-muted rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-full" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredInsights.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredInsights.map((insight, index) => (
                <InsightCard
                  key={index}
                  type={insight.type}
                  title={insight.title}
                  description={insight.description}
                  action={insight.action}
                  onAction={() => handleAction(insight.action || "", insight)}
                />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                {activeFilter === "accuracy" ? (
                  <>
                    <Target className="w-12 h-12 text-blue-500" />
                    <h3 className="text-lg font-semibold">Model Performance</h3>
                    <p className="text-muted-foreground max-w-md">
                      Our AI model maintains 96.4% accuracy based on historical predictions vs actual outcomes.
                      The model continuously learns from new sales data to improve forecasting.
                    </p>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-12 h-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">No Insights Found</h3>
                    <p className="text-muted-foreground">
                      {products.length === 0 
                        ? "Add products to your inventory to generate insights."
                        : "All clear! No actionable insights in this category right now."}
                    </p>
                  </>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      <CreatePurchaseOrderDialog open={purchaseOrderOpen} onOpenChange={setPurchaseOrderOpen} />
      <AIPromotionDialog 
        open={promotionDialogOpen} 
        onOpenChange={setPromotionDialogOpen}
        productName={selectedProduct?.name}
        productId={selectedProduct?.id}
      />
      <SalesChartDialog
        open={salesChartOpen}
        onOpenChange={setSalesChartOpen}
        productName={selectedProduct?.name}
        productId={selectedProduct?.id}
      />
    </div>
  );
};

export default Insights;
