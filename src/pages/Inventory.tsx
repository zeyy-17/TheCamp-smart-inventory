import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter } from "lucide-react";

const inventoryItems = [
  { id: 1, name: "Premium Coffee Beans", category: "Beverages", quantity: 145, reorderPoint: 50, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 2, name: "Organic Tea Collection", category: "Beverages", quantity: 89, reorderPoint: 100, status: "Low Stock", lastUpdated: "1 hour ago" },
  { id: 3, name: "Artisan Chocolate Box", category: "Confectionery", quantity: 203, reorderPoint: 75, status: "In Stock", lastUpdated: "30 min ago" },
  { id: 4, name: "Gourmet Pasta Set", category: "Food", quantity: 12, reorderPoint: 40, status: "Critical", lastUpdated: "15 min ago" },
  { id: 5, name: "Olive Oil Premium", category: "Food", quantity: 67, reorderPoint: 30, status: "In Stock", lastUpdated: "3 hours ago" },
  { id: 6, name: "Specialty Cheese Wheel", category: "Dairy", quantity: 34, reorderPoint: 45, status: "Low Stock", lastUpdated: "45 min ago" },
  { id: 7, name: "Craft Beer Selection", category: "Beverages", quantity: 178, reorderPoint: 80, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 8, name: "Imported Wine Bottles", category: "Beverages", quantity: 92, reorderPoint: 60, status: "In Stock", lastUpdated: "2 hours ago" },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "In Stock":
      return "bg-green-100 text-green-800 border-green-200";
    case "Low Stock":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Critical":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const Inventory = () => {
  return (
    <div className="flex-1 bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground mt-1">
              Real-time monitoring and stock control
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="bg-card rounded-xl p-4 shadow-custom-md border border-border">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-card rounded-xl shadow-custom-md border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Product Name</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Category</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Quantity</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Reorder Point</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Last Updated</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventoryItems.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-foreground">{item.name}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{item.category}</td>
                    <td className="py-4 px-6 text-sm">
                      <span className={item.quantity <= item.reorderPoint ? "text-red-600 font-semibold" : "text-foreground"}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{item.reorderPoint}</td>
                    <td className="py-4 px-6">
                      <Badge className={getStatusColor(item.status)} variant="outline">
                        {item.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{item.lastUpdated}</td>
                    <td className="py-4 px-6">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
