import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, PackageX } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const InventoryAlerts = () => {
  const navigate = useNavigate();

  const { data: lowStockProducts = [] } = useQuery({
    queryKey: ['low-stock-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, quantity, reorder_level')
        .not('quantity', 'is', null)
        .not('reorder_level', 'is', null);
      
      return data?.filter(p => p.quantity! <= p.reorder_level!) || [];
    },
  });

  const { data: outOfStockProducts = [] } = useQuery({
    queryKey: ['out-of-stock-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, quantity');
      
      return data?.filter(p => p.quantity === 0) || [];
    },
  });

  if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {outOfStockProducts.length > 0 && (
        <Alert variant="destructive" className="border-destructive bg-destructive/10">
          <PackageX className="h-4 w-4" />
          <AlertTitle>Out of Stock Alert</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-1">
              <p className="font-semibold">{outOfStockProducts.length} product(s) are out of stock:</p>
              <ul className="list-disc list-inside text-sm">
                {outOfStockProducts.slice(0, 3).map((product) => (
                  <li key={product.id}>{product.name}</li>
                ))}
                {outOfStockProducts.length > 3 && (
                  <li>and {outOfStockProducts.length - 3} more...</li>
                )}
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => navigate('/inventory?filter=out-of-stock')}
              >
                View All
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {lowStockProducts.length > 0 && (
        <Alert variant="default" className="border-warning bg-warning/10">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <AlertTitle className="text-warning">Low Stock Alert</AlertTitle>
          <AlertDescription className="mt-2">
            <div className="space-y-1">
              <p className="font-semibold">{lowStockProducts.length} product(s) below reorder level:</p>
              <ul className="list-disc list-inside text-sm">
                {lowStockProducts.slice(0, 3).map((product) => (
                  <li key={product.id}>
                    {product.name} (Current: {product.quantity}, Reorder: {product.reorder_level})
                  </li>
                ))}
                {lowStockProducts.length > 3 && (
                  <li>and {lowStockProducts.length - 3} more...</li>
                )}
              </ul>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => navigate('/inventory?filter=low-stock')}
              >
                View All
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
