import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Store, ChevronDown, ChevronUp } from "lucide-react";
import InventorySection from "@/components/InventorySection";
import { cn } from "@/lib/utils";

const stores = [
  { id: "ampersand", name: "Ampersand", color: "bg-blue-500" },
  { id: "herex", name: "hereX", color: "bg-emerald-500" },
  { id: "hardin", name: "Hardin", color: "bg-amber-500" },
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
    <div className="p-8 space-y-6 animate-fade-in">
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
                "w-full h-16 text-lg font-semibold justify-between transition-all shadow-custom-md hover:shadow-custom-lg",
                activeStore === store.id 
                  ? `${store.color} text-white hover:opacity-90` 
                  : "bg-card text-foreground border border-border hover:bg-muted"
              )}
              variant={activeStore === store.id ? "default" : "outline"}
            >
              <div className="flex items-center gap-3">
                <Store className="w-6 h-6" />
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
