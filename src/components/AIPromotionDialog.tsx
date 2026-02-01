import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, TrendingUp, Clock, Target, Loader2, RefreshCw, Percent, Calendar, Zap } from "lucide-react";

interface Recommendation {
  title: string;
  targetProduct: string;
  discountPercent: number;
  duration: number;
  strategy: string;
  reason: string;
  expectedImpact: string;
  priority: string;
}

interface PromotionPlan {
  recommendations: Recommendation[];
  summary: {
    totalPotentialRevenue: number;
    topOpportunity: string;
    urgentAction: string | null;
  };
  generatedAt: string;
  targetProduct: string | null;
}

interface AIPromotionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName?: string;
  productId?: number;
}

export const AIPromotionDialog = ({ open, onOpenChange, productName, productId }: AIPromotionDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [promotionPlan, setPromotionPlan] = useState<PromotionPlan | null>(null);

  const generatePromotions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-promotion', {
        body: { productName, productId }
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setPromotionPlan(data);
      toast.success("AI promotion plan generated!");
    } catch (error) {
      console.error("Error generating promotion:", error);
      toast.error("Failed to generate promotion plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (isOpen && !promotionPlan) {
      generatePromotions();
    }
    if (!isOpen) {
      setPromotionPlan(null);
    }
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy.toLowerCase()) {
      case 'clearance': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'bundle': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'flash': return 'bg-red-100 text-red-800 border-red-200';
      case 'loyalty': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'seasonal': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Promotion Planner
            <Badge variant="secondary" className="ml-2">
              <Zap className="w-3 h-3 mr-1" />
              Powered by AI
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Analyzing inventory and sales data...</p>
            <p className="text-xs text-muted-foreground">Generating smart promotion recommendations</p>
          </div>
        ) : promotionPlan ? (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    <span className="font-semibold">AI Analysis Summary</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={generatePromotions}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Top Opportunity</p>
                    <p className="font-medium">{promotionPlan.summary.topOpportunity}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Potential Revenue</p>
                    <p className="font-medium text-green-600">
                      ₱{promotionPlan.summary.totalPotentialRevenue?.toLocaleString() || 'N/A'}
                    </p>
                  </div>
                </div>
                {promotionPlan.summary.urgentAction && (
                  <div className="mt-3 p-2 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-orange-800">
                      <strong>Urgent:</strong> {promotionPlan.summary.urgentAction}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Recommended Promotions
              </h3>
              
              {promotionPlan.recommendations?.map((rec, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(rec.priority)}`} />
                        <h4 className="font-semibold">{rec.title}</h4>
                      </div>
                      <Badge variant="outline" className={getStrategyColor(rec.strategy)}>
                        {rec.strategy}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{rec.reason}</p>
                    
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                        <Percent className="w-3 h-3" />
                        <span>{rec.discountPercent}% off</span>
                      </div>
                      <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
                        <Calendar className="w-3 h-3" />
                        <span>{rec.duration} days</span>
                      </div>
                      <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded">
                        <TrendingUp className="w-3 h-3" />
                        <span>{rec.expectedImpact}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Target: <strong>{rec.targetProduct}</strong>
                      </span>
                      <Button size="sm" variant="outline">
                        Apply Promotion
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Generated: {new Date(promotionPlan.generatedAt).toLocaleString()}
              </div>
              {promotionPlan.targetProduct && (
                <span>Focus: {promotionPlan.targetProduct}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Sparkles className="w-12 h-12 text-muted-foreground" />
            <p className="text-muted-foreground">Click to generate AI promotion recommendations</p>
            <Button onClick={generatePromotions}>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Promotions
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
