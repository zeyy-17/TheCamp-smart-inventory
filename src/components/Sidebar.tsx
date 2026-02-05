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

export const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Get user initials for avatar fallback
  const getInitials = (email: string) => {
    return email?.charAt(0).toUpperCase() || "U";
  };

  // Get display name from email
  const getDisplayName = (email: string) => {
    const name = email?.split("@")[0] || "User";
    return name.split(/[._-]/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(" ");
  };

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground min-h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-4">
        <img src={logo} alt="The Camp" className="w-full h-auto rounded-lg" />
      </div>

      {/* User Profile Section - Links to Account */}
      <Link 
        to="/account" 
        className="px-6 py-8 flex flex-col items-center hover:bg-sidebar-accent/30 transition-colors cursor-pointer"
      >
        <div className="w-24 h-24 rounded-full bg-sidebar-accent border-4 border-sidebar-primary flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-sidebar-foreground">
            {getInitials(user?.email || "")}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-sidebar-foreground tracking-wide">
          {getDisplayName(user?.email || "")}
        </h3>
        <p className="text-sm text-sidebar-muted">
          {user?.email || "user@example.com"}
        </p>
      </Link>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "relative flex items-center gap-4 px-4 py-3 text-sm font-medium tracking-wider transition-all",
                isActive
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full" />
              )}
              <Icon className={cn(
                "w-5 h-5 flex-shrink-0",
                isActive ? "text-sidebar-primary" : ""
              )} />
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-muted text-center">
          Smart Inventory Management
        </p>
      </div>
    </aside>
  );
};
