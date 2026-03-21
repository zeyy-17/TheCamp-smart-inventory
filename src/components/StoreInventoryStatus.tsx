import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

interface StoreStock {
  outOfStock: { id: number; name: string }[];
  lowStock: { id: number; name: string; quantity: number; reorder_level: number }[];
}

export const StoreInventoryStatus = () => {
  const navigate = useNavigate();

  const { data: storeData = {} } = useQuery<Record<string, StoreStock>>({
    queryKey: ['products-stock-by-store'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('id, name, quantity, reorder_level, store' as any);

      const result: Record<string, StoreStock> = {};
      for (const store of stores) {
        const storeItems = ((data as any[]) || []).filter(
          (p: any) => p.store?.toLowerCase() === store.name.toLowerCase()
        );
        result[store.id] = {
          outOfStock: storeItems
            .filter((p: any) => p.quantity === 0)
            .map((p: any) => ({ id: p.id, name: p.name })),
          lowStock: storeItems
            .filter((p: any) => (p.quantity ?? 0) > 0 && (p.quantity ?? 0) <= (p.reorder_level ?? 0))
            .map((p: any) => ({ id: p.id, name: p.name, quantity: p.quantity, reorder_level: p.reorder_level })),
        };
      }
      return result;
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stores.map((store) => {
        const data = storeData[store.id];
        const outOfStock = data?.outOfStock || [];
        const lowStock = data?.lowStock || [];

        return (
          <Card
            key={store.id}
            className="border-border hover:shadow-custom-lg transition-all duration-300"
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <img src={store.logo} alt={store.name} className="h-8 w-8 object-contain" />
                <CardTitle className="text-lg font-semibold">{store.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Out of Stock */}
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-destructive">Out of Stock</span>
                  <div className="bg-destructive/10 p-1.5 rounded-md">
                    <PackageX className="w-4 h-4 text-destructive" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-destructive">{outOfStock.length}</p>
                {outOfStock.length > 0 && (
                  <ul className="text-xs space-y-0.5 text-foreground/70">
                    {outOfStock.slice(0, 3).map((p) => (
                      <li key={p.id} className="truncate">• {p.name}</li>
                    ))}
                    {outOfStock.length > 3 && (
                      <li className="text-muted-foreground">+{outOfStock.length - 3} more</li>
                    )}
                  </ul>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => navigate(`/inventory?store=${store.id}&filter=out-of-stock`)}
                >
                  View All
                </Button>
              </div>

              {/* Low Stock */}
              <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-warning">Low Stock</span>
                  <div className="bg-warning/10 p-1.5 rounded-md">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-warning">{lowStock.length}</p>
                {lowStock.length > 0 && (
                  <ul className="text-xs space-y-0.5 text-foreground/70">
                    {lowStock.slice(0, 3).map((p) => (
                      <li key={p.id} className="truncate">
                        • {p.name} ({p.quantity}/{p.reorder_level})
                      </li>
                    ))}
                    {lowStock.length > 3 && (
                      <li className="text-muted-foreground">+{lowStock.length - 3} more</li>
                    )}
                  </ul>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-warning/30 text-warning hover:bg-warning/10"
                  onClick={() => navigate(`/inventory?store=${store.id}&filter=low-stock`)}
                >
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
