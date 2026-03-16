import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { PackageX, AlertTriangle } from "lucide-react";
import ampersandLogo from "@/assets/ampersand-logo.png";
import hardinLogo from "@/assets/hardin-logo.png";
import herexLogo from "@/assets/herex-logo.png";

const stores = [
  { id: "ampersand", name: "Ampersand", logo: ampersandLogo },
  { id: "herex", name: "hereX", logo: herexLogo },
  { id: "hardin", name: "Hardin", logo: hardinLogo },
];

export const StoreInventoryStatus = () => {
  const navigate = useNavigate();

  const { data: products = [] } = useQuery({
    queryKey: ['products-stock-status'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, quantity, reorder_level');
      return data || [];
    },
  });

  const outOfStock = products.filter(p => p.quantity === 0);
  const lowStock = products.filter(p => (p.quantity ?? 0) > 0 && (p.quantity ?? 0) <= (p.reorder_level ?? 0));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stores.map((store) => (
        <Card
          key={store.id}
          className="cursor-pointer hover:shadow-custom-lg transition-all duration-300 border-border"
          onClick={() => navigate('/inventory')}
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <img src={store.logo} alt={store.name} className="h-8 w-8 object-contain" />
              <span className="text-lg font-semibold text-foreground">{store.name}</span>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-destructive/10 p-1.5 rounded-md">
                  <PackageX className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Out of Stock</p>
                  <p className="text-xl font-bold text-destructive">{outOfStock.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-warning/10 p-1.5 rounded-md">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Low Stock</p>
                  <p className="text-xl font-bold text-warning">{lowStock.length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
