import { LayoutDashboard, Package, TrendingUp, Lightbulb, BarChart3, Receipt, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/the-camp-logo.jpg";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Sales Forecast", href: "/forecast", icon: TrendingUp },
  { name: "Smart Insights", href: "/insights", icon: Lightbulb },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Sales History", href: "/sales-history", icon: Receipt },
  { name: "Account", href: "/account", icon: User },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground min-h-screen border-r border-sidebar-border">
      <div className="p-6">
        <img src={logo} alt="The Camp" className="w-full h-auto mb-2" />
        <p className="text-xs text-sidebar-foreground/70 mt-1">Smart Inventory Management</p>
      </div>
      
      <nav className="px-3 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
