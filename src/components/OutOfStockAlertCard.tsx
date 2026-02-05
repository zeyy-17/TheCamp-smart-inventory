import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PackageX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const OutOfStockAlertCard = () => {
  const navigate = useNavigate();

  const { data: outOfStockProducts = [] } = useQuery({
    queryKey: ['out-of-stock-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, quantity');
      
      return data?.filter(p => p.quantity === 0) || [];
    },
  });

  return (
    <Card className="border-destructive/50 bg-destructive/5 hover:shadow-custom-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-destructive">
            Out of Stock
          </CardTitle>
          <div className="bg-destructive/10 p-2 rounded-lg">
            <PackageX className="w-5 h-5 text-destructive" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-4xl font-bold text-destructive">
          {outOfStockProducts.length}
        </p>
        <p className="text-sm text-muted-foreground">Products need restocking</p>
        
        {outOfStockProducts.length > 0 && (
          <ul className="text-sm space-y-1 text-foreground/80">
            {outOfStockProducts.slice(0, 5).map((product) => (
              <li key={product.id} className="truncate">• {product.name}</li>
            ))}
            {outOfStockProducts.length > 5 && (
              <li className="text-muted-foreground">
                +{outOfStockProducts.length - 5} more...
              </li>
            )}
          </ul>
        )}
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2 border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={() => navigate('/inventory?filter=out-of-stock')}
        >
          View All
        </Button>
      </CardContent>
    </Card>
  );
};
