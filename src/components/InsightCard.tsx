import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingUp, Package, DollarSign } from "lucide-react";
import { Button } from "./ui/button";

interface InsightCardProps {
  type: "warning" | "opportunity" | "stock" | "revenue";
  title: string;
  description: string;
  action?: string;
  onAction?: () => void;
}

const typeConfig = {
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    borderColor: "border-red-200",
  },
  opportunity: {
    icon: TrendingUp,
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
  },
  stock: {
    icon: Package,
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200",
  },
  revenue: {
    icon: DollarSign,
    bgColor: "bg-amber-50",
    iconColor: "text-amber-600",
    borderColor: "border-amber-200",
  },
};

export const InsightCard = ({
  type,
  title,
  description,
  action,
  onAction,
}: InsightCardProps) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "bg-card rounded-lg p-4 border shadow-custom-sm animate-fade-in",
        config.borderColor
      )}
    >
      <div className="flex gap-4">
        <div className={cn("p-2 rounded-lg h-fit", config.bgColor)}>
          <Icon className={cn("w-5 h-5", config.iconColor)} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          {action && onAction && (
            <Button
              onClick={onAction}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {action}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
