import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, Package } from "lucide-react";
import InventorySection from "@/components/InventorySection";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ampersandLogo from "@/assets/ampersand-logo.png";
import hardinLogo from "@/assets/hardin-logo.png";
import herexLogo from "@/assets/herex-logo.png";

const stores = [
  { id: "ampersand", name: "Ampersand", logo: ampersandLogo },
  { id: "herex", name: "hereX", logo: herexLogo },
  { id: "hardin", name: "Hardin", logo: hardinLogo },
];

const Inventory = () => {
  const [searchParams] = useSearchParams();
  const [activeStore, setActiveStore] = useState<string | null>(null);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const { data: totalProducts = 0 } = useQuery({
    queryKey: ['totalProducts'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });

  // Handle URL parameters for store and filter
  useEffect(() => {
    const store = searchParams.get('store');
    const filter = searchParams.get('filter');
    if (store) {
      setActiveStore(store);
    }
    if (filter) {
      setStatusFilter(filter);
    }
  }, [searchParams]);

  const toggleStore = (storeId: string) => {
    setShowAllProducts(false);
    if (activeStore === storeId) {
      setActiveStore(null);
    } else {
      setActiveStore(storeId);
      setStatusFilter(null);
    }
  };

  const toggleAllProducts = () => {
    setShowAllProducts(!showAllProducts);
    setActiveStore(null);
    setStatusFilter(null);
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in min-h-screen w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Inventory Management</h1>
        <p className="text-muted-foreground">Select a store to manage its beverage inventory</p>
      </div>

      {/* Total Products Button */}
      <div
        onClick={toggleAllProducts}
        className={cn(
          "bg-card rounded-xl p-6 shadow-custom-md border cursor-pointer transition-all duration-300 hover:shadow-custom-lg hover:scale-[1.02]",
          showAllProducts ? "border-primary border-2" : "border-border"
        )}
      >
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Products</p>
            <h3 className="text-3xl font-bold text-foreground">{totalProducts}</h3>
          </div>
        </div>
      </div>

      {showAllProducts && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-custom-md animate-fade-in">
          <InventorySection
            storeName="all"
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
      )}

      {/* Store Buttons */}
      <div className="space-y-4">
        {stores.map((store) => (
          <div key={store.id} className="space-y-0">
            <Button
              onClick={() => toggleStore(store.id)}
              className={cn(
                "w-full h-14 text-lg font-semibold justify-between transition-all shadow-sm hover:shadow-md px-4",
                activeStore === store.id 
                  ? "bg-card text-foreground border-2 border-primary" 
                  : "bg-card text-foreground border border-border hover:bg-muted"
              )}
              variant="outline"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={store.logo} 
                  alt={store.name} 
                  className="h-8 w-8 object-contain"
                />
                <span>{store.name}</span>
              </div>
              {activeStore === store.id ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </Button>
            
            {/* Expanded Content */}
            {activeStore === store.id && (
              <div className="bg-card border border-t-0 border-border rounded-b-xl p-6 shadow-custom-md animate-fade-in">
                <InventorySection 
                  storeName={store.name}
                  statusFilter={statusFilter}
                  onStatusFilterChange={setStatusFilter}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Inventory;
