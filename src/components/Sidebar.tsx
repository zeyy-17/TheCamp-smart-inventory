import { LayoutDashboard, Package, TrendingUp, Lightbulb, BarChart3, User, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/the-camp-logo.jpg";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Sales Forecast", href: "/forecast", icon: TrendingUp },
  { name: "Smart Insights", href: "/insights", icon: Lightbulb },
  { name: "Purchase Orders", href: "/purchase-orders", icon: ShoppingCart },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Account", href: "/account", icon: User },
];

export const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Get user initials for avatar fallback
  const getInitials = (email: string) => {
    return email?.charAt(0).toUpperCase() || "U";
  };

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground min-h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-4 border-b border-sidebar-border">
        <img src={logo} alt="The Camp" className="w-full h-auto rounded-lg" />
      </div>

      {/* User Profile Section */}
      <div className="p-6 flex flex-col items-center border-b border-sidebar-border">
        <div className="w-20 h-20 rounded-full bg-sidebar-accent border-4 border-sidebar-primary flex items-center justify-center mb-3">
          <span className="text-2xl font-bold text-sidebar-foreground">
            {getInitials(user?.email || "")}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-sidebar-foreground">
          {user?.email?.split("@")[0]?.toUpperCase() || "USER"}
        </h3>
        <p className="text-sm text-sidebar-foreground/60">
          {user?.email || "user@example.com"}
        </p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className={cn(
                "w-5 h-5",
                isActive ? "text-sidebar-primary" : ""
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/50 text-center">
          Smart Inventory Management
        </p>
      </div>
    </aside>
  );
};
