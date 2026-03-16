import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import InventorySection from "@/components/InventorySection";
import { cn } from "@/lib/utils";
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
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Handle URL filter parameter
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter) {
      setStatusFilter(filter);
    }
  }, [searchParams]);

  const toggleStore = (storeId: string) => {
    if (activeStore === storeId) {
      setActiveStore(null);
    } else {
      setActiveStore(storeId);
      setStatusFilter(null); // Reset filter when switching stores
    }
  };

  return (
    <div className="p-8 space-y-6 animate-fade-in min-h-screen w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Inventory Management</h1>
        <p className="text-muted-foreground">Select a store to manage its beverage inventory</p>
      </div>

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
