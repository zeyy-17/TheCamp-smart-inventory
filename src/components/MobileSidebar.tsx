import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Package, TrendingUp, Lightbulb, BarChart3, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/the-camp-logo.jpg";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "DASHBOARD", href: "/", icon: LayoutDashboard },
  { name: "INVENTORY", href: "/inventory", icon: Package },
  { name: "SALES FORECAST", href: "/forecast", icon: TrendingUp },
  { name: "SMART INSIGHTS", href: "/insights", icon: Lightbulb },
  { name: "PURCHASE ORDERS", href: "/purchase-orders", icon: ShoppingCart },
  { name: "REPORTS", href: "/reports", icon: BarChart3 },
];

export const MobileSidebar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const getInitials = (email: string) => email?.charAt(0).toUpperCase() || "U";
  const getDisplayName = (email: string) => {
    const name = email?.split("@")[0] || "User";
    return name.split(/[._-]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  };

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-sidebar px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} className="text-sidebar-foreground">
          <Menu className="w-6 h-6" />
        </Button>
        <img src={logo} alt="The Camp" className="h-8 rounded" />
        <div className="w-10" />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-sidebar-border">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <div className="p-4">
            <img src={logo} alt="The Camp" className="w-full h-auto rounded-lg" />
          </div>

          <Link
            to="/account"
            onClick={() => setOpen(false)}
            className="px-4 py-3 flex items-center gap-3 hover:bg-sidebar-accent/30 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-sidebar-accent border-2 border-sidebar-primary flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-sidebar-foreground">
                {getInitials(user?.user_metadata?.username || user?.email || "")}
              </span>
            </div>
            <p className="text-sm font-semibold text-sidebar-foreground tracking-wide truncate">
              {user?.user_metadata?.username || getDisplayName(user?.email || "")}
            </p>
          </Link>

          <nav className="flex-1 px-4 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "relative flex items-center gap-4 px-4 py-3 text-sm font-medium tracking-wider transition-all",
                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full" />
                  )}
                  <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-sidebar-primary" : "")} />
                  <span className="text-xs">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-sidebar-border">
            <p className="text-xs text-sidebar-muted text-center">Smart Inventory Management</p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
