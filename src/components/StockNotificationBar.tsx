import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, PackageX, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertItem {
  type: "out-of-stock" | "low-stock";
  storeName: string;
  storeId: string;
  productName: string;
  quantity?: number;
  reorderLevel?: number;
}

const storeMap: Record<string, string> = {
  ampersand: "Ampersand",
  herex: "hereX",
  hardin: "Hardin",
};

export const StockNotificationBar = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const { data: alerts = [] } = useQuery<AlertItem[]>({
    queryKey: ["stock-notifications"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, quantity, reorder_level, store" as any);

      const items: AlertItem[] = [];
      const products = (data as any[]) || [];

      for (const p of products) {
        const storeName = (p.store || "").toLowerCase();
        const storeId = Object.keys(storeMap).find(
          (k) => storeMap[k].toLowerCase() === storeName
        );
        if (!storeId) continue;

        if (p.quantity === 0) {
          items.push({
            type: "out-of-stock",
            storeName: storeMap[storeId],
            storeId,
            productName: p.name,
          });
        } else if ((p.quantity ?? 0) > 0 && (p.quantity ?? 0) <= (p.reorder_level ?? 0)) {
          items.push({
            type: "low-stock",
            storeName: storeMap[storeId],
            storeId,
            productName: p.name,
            quantity: p.quantity,
            reorderLevel: p.reorder_level,
          });
        }
      }
      return items;
    },
    refetchInterval: 30000,
  });

  // Cycle through alerts
  useEffect(() => {
    if (alerts.length <= 1) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % alerts.length);
        setVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [alerts.length]);

  // Re-show after dismiss
  useEffect(() => {
    if (dismissed && alerts.length > 0) {
      const timer = setTimeout(() => setDismissed(false), 15000);
      return () => clearTimeout(timer);
    }
  }, [dismissed, alerts.length]);

  if (alerts.length === 0 || dismissed) return null;

  const current = alerts[currentIndex % alerts.length];
  const isOutOfStock = current.type === "out-of-stock";

  const handleClick = () => {
    const filter = isOutOfStock ? "out-of-stock" : "low-stock";
    navigate(`/inventory?store=${current.storeId}&filter=${filter}`);
  };

  return (
    <div
      className={cn(
        "relative cursor-pointer rounded-lg border border-border bg-white px-3 py-2 flex items-center justify-between gap-2 transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "p-2 rounded-md shrink-0",
            isOutOfStock ? "bg-destructive/15" : "bg-warning/15"
          )}
        >
          {isOutOfStock ? (
            <PackageX className="w-4 h-4 text-destructive" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-warning" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            <span className={cn("font-semibold", isOutOfStock ? "text-destructive" : "text-warning")}>
              {isOutOfStock ? "Out of Stock" : "Low Stock"}
            </span>
            {" · "}
            <span className="font-medium">{current.productName}</span>
            {" — "}
            <span className="text-muted-foreground">{current.storeName}</span>
            {!isOutOfStock && current.quantity !== undefined && (
              <span className="text-muted-foreground">
                {" "}({current.quantity}/{current.reorderLevel})
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {currentIndex + 1}/{alerts.length}
        </span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDismissed(true);
          }}
          className="p-1 rounded-md hover:bg-foreground/10 transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};
