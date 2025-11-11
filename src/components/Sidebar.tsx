import { LayoutDashboard, Package, TrendingUp, Lightbulb, BarChart3, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import logo from "@/assets/the-camp-logo.jpg";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Sales Forecast", href: "/forecast", icon: TrendingUp },
  { name: "Smart Insights", href: "/insights", icon: Lightbulb },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Account", href: "/account", icon: User },
];

export const Sidebar = () => {
  const location = useLocation();
  const { logout, username } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    });
  };

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

      <div className="mt-auto p-4 border-t border-sidebar-border space-y-4 absolute bottom-0 left-0 right-0">
        <div className="text-sm text-muted-foreground px-3">
          Logged in as: <span className="font-medium text-foreground">{username}</span>
        </div>
        <Button 
          onClick={handleLogout} 
          variant="outline" 
          className="w-full justify-start"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
};
