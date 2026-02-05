import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const LowStockAlertCard = () => {
  const navigate = useNavigate();

  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ['low-stock-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, quantity, reorder_level')
        .not('quantity', 'is', null)
        .not('reorder_level', 'is', null);
      
      // Low stock = quantity <= reorder_level AND quantity > 0
      return data?.filter(p => p.quantity! <= p.reorder_level! && p.quantity! > 0) || [];
    },
  });

  return (
    <Card className="border-warning/50 bg-warning/5 hover:shadow-custom-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-warning">
            Low Stock
          </CardTitle>
          <div className="bg-warning/10 p-2 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-warning" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-4xl font-bold text-warning">
          {lowStockProducts.length}
        </p>
        <p className="text-sm text-muted-foreground">Below reorder level</p>
        
        {lowStockProducts.length > 0 && (
          <ul className="text-sm space-y-1 text-foreground/80">
            {lowStockProducts.slice(0, 5).map((product) => (
              <li key={product.id} className="truncate">
                • {product.name} ({product.quantity}/{product.reorder_level})
              </li>
            ))}
            {lowStockProducts.length > 5 && (
              <li className="text-muted-foreground">
                +{lowStockProducts.length - 5} more...
              </li>
            )}
          </ul>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2 border-warning/30 text-warning hover:bg-warning/10"
          onClick={() => navigate('/inventory?filter=low-stock')}
        >
          View All
        </Button>
      </CardContent>
    </Card>
  );
};
