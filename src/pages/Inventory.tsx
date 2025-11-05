import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { AddProductDialog } from "@/components/AddProductDialog";
import { EditProductDialog } from "@/components/EditProductDialog";
import { toast } from "sonner";

const categories = ["All", "Beers", "Tequila", "Vodka", "Rum", "Gin", "Wine", "Whisky", "Cognac", "Single Malt", "Liquer"];

const inventoryItems = [
  // Beers
  { id: 1, name: "Budweiser", category: "Beers", quantity: 145, reorderPoint: 50, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 2, name: "Corona Extra", category: "Beers", quantity: 89, reorderPoint: 100, status: "Low Stock", lastUpdated: "1 hour ago" },
  { id: 3, name: "Hoegaarden Rosee", category: "Beers", quantity: 203, reorderPoint: 75, status: "In Stock", lastUpdated: "30 min ago" },
  { id: 4, name: "Hoegaarden White", category: "Beers", quantity: 178, reorderPoint: 80, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 5, name: "Stella Artois", category: "Beers", quantity: 92, reorderPoint: 60, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 6, name: "Smirnoff Mule", category: "Beers", quantity: 285, reorderPoint: 100, status: "In Stock", lastUpdated: "3 hours ago" },
  { id: 7, name: "Heineken Orig/Silver", category: "Beers", quantity: 375, reorderPoint: 150, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 8, name: "Paraiso Bighani", category: "Beers", quantity: 90, reorderPoint: 50, status: "In Stock", lastUpdated: "45 min ago" },
  { id: 9, name: "Tiger Crystal Light", category: "Beers", quantity: 100, reorderPoint: 60, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 10, name: "Cerveza Negra", category: "Beers", quantity: 130, reorderPoint: 70, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 11, name: "San Mig Light", category: "Beers", quantity: 100, reorderPoint: 80, status: "In Stock", lastUpdated: "30 min ago" },
  { id: 12, name: "San Mig Pale Pilsen", category: "Beers", quantity: 90, reorderPoint: 70, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 13, name: "San Mig Flavored Apple/Lychee/Lemon", category: "Beers", quantity: 90, reorderPoint: 50, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 14, name: "San Mig Super Dry", category: "Beers", quantity: 130, reorderPoint: 80, status: "In Stock", lastUpdated: "3 hours ago" },
  
  // Tequila
  { id: 15, name: "Patron Tequila Anejo", category: "Tequila", quantity: 45, reorderPoint: 20, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 16, name: "Patron Tequila Reposado", category: "Tequila", quantity: 38, reorderPoint: 20, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 17, name: "Patron Tequila Silver", category: "Tequila", quantity: 52, reorderPoint: 25, status: "In Stock", lastUpdated: "30 min ago" },
  { id: 18, name: "Patron Tequila Citronge", category: "Tequila", quantity: 30, reorderPoint: 15, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 19, name: "Patron Tequila X.O.", category: "Tequila", quantity: 18, reorderPoint: 20, status: "Low Stock", lastUpdated: "45 min ago" },
  { id: 20, name: "Jose Cuervo Gold", category: "Tequila", quantity: 67, reorderPoint: 30, status: "In Stock", lastUpdated: "2 hours ago" },
  
  // Vodka
  { id: 21, name: "Absolut Vodka", category: "Vodka", quantity: 95, reorderPoint: 40, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 22, name: "Absolut Apeach", category: "Vodka", quantity: 48, reorderPoint: 25, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 23, name: "Absolut Citron", category: "Vodka", quantity: 52, reorderPoint: 25, status: "In Stock", lastUpdated: "30 min ago" },
  { id: 24, name: "Absolut Kurant", category: "Vodka", quantity: 44, reorderPoint: 25, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 25, name: "Absolut Mandarin", category: "Vodka", quantity: 39, reorderPoint: 25, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 26, name: "Absolut Mango", category: "Vodka", quantity: 46, reorderPoint: 25, status: "In Stock", lastUpdated: "45 min ago" },
  { id: 27, name: "Absolut Ruby Red", category: "Vodka", quantity: 41, reorderPoint: 25, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 28, name: "Absolut Raspberry", category: "Vodka", quantity: 37, reorderPoint: 25, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 29, name: "Absolut Pears", category: "Vodka", quantity: 43, reorderPoint: 25, status: "In Stock", lastUpdated: "30 min ago" },
  { id: 30, name: "Absolut Vanilla", category: "Vodka", quantity: 49, reorderPoint: 25, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 31, name: "Grey Goose", category: "Vodka", quantity: 72, reorderPoint: 30, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 32, name: "Smirnoff Red Vodka", category: "Vodka", quantity: 88, reorderPoint: 40, status: "In Stock", lastUpdated: "1 hour ago" },
  
  // Rum
  { id: 33, name: "Bacardi Black", category: "Rum", quantity: 64, reorderPoint: 30, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 34, name: "Bacardi Gold", category: "Rum", quantity: 58, reorderPoint: 30, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 35, name: "Bacardi Superior", category: "Rum", quantity: 71, reorderPoint: 35, status: "In Stock", lastUpdated: "30 min ago" },
  { id: 36, name: "Captain Morgan", category: "Rum", quantity: 82, reorderPoint: 40, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 37, name: "Havana 3YO Anejo", category: "Rum", quantity: 45, reorderPoint: 25, status: "In Stock", lastUpdated: "1 hour ago" },
  
  // Gin
  { id: 38, name: "Beefeater Gin", category: "Gin", quantity: 76, reorderPoint: 35, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 39, name: "Beefeater Pink", category: "Gin", quantity: 54, reorderPoint: 30, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 40, name: "Malfy Gin Rosa", category: "Gin", quantity: 48, reorderPoint: 25, status: "In Stock", lastUpdated: "30 min ago" },
  { id: 41, name: "Malfy Con Limone", category: "Gin", quantity: 51, reorderPoint: 25, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 42, name: "Bombay Sapphire", category: "Gin", quantity: 89, reorderPoint: 40, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 43, name: "Tanqueray Dry Gin", category: "Gin", quantity: 73, reorderPoint: 35, status: "In Stock", lastUpdated: "45 min ago" },
  
  // Wine
  { id: 44, name: "Luc Belaire Luxe", category: "Wine", quantity: 34, reorderPoint: 20, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 45, name: "Luc Belaire Rose", category: "Wine", quantity: 42, reorderPoint: 20, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 46, name: "Reserve Chardonnay", category: "Wine", quantity: 56, reorderPoint: 25, status: "In Stock", lastUpdated: "30 min ago" },
  { id: 47, name: "Classic Cherry Red", category: "Wine", quantity: 48, reorderPoint: 25, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 48, name: "Classic Merlot", category: "Wine", quantity: 52, reorderPoint: 25, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 49, name: "Classic Riesling", category: "Wine", quantity: 44, reorderPoint: 25, status: "In Stock", lastUpdated: "45 min ago" },
  { id: 50, name: "Martini Prosecco", category: "Wine", quantity: 67, reorderPoint: 30, status: "In Stock", lastUpdated: "1 hour ago" },
  
  // Whisky
  { id: 51, name: "Dewar's 12 YO", category: "Whisky", quantity: 38, reorderPoint: 20, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 52, name: "Dewar's Japanese Smooth", category: "Whisky", quantity: 29, reorderPoint: 15, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 53, name: "Dewar's Portugese Smooth", category: "Whisky", quantity: 31, reorderPoint: 15, status: "In Stock", lastUpdated: "30 min ago" },
  { id: 54, name: "Dewar's White Label", category: "Whisky", quantity: 45, reorderPoint: 25, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 55, name: "Chivas 12yo", category: "Whisky", quantity: 52, reorderPoint: 25, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 56, name: "Jameson Original", category: "Whisky", quantity: 78, reorderPoint: 35, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 57, name: "John Jameson Stout Edition", category: "Whisky", quantity: 24, reorderPoint: 15, status: "In Stock", lastUpdated: "45 min ago" },
  { id: 58, name: "John Jameson IPA Edition", category: "Whisky", quantity: 22, reorderPoint: 15, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 59, name: "John Jameson Black Edition", category: "Whisky", quantity: 26, reorderPoint: 15, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 60, name: "Jack Daniels", category: "Whisky", quantity: 95, reorderPoint: 40, status: "In Stock", lastUpdated: "30 min ago" },
  { id: 61, name: "Jim Beam Black", category: "Whisky", quantity: 56, reorderPoint: 30, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 62, name: "Jim Beam White", category: "Whisky", quantity: 64, reorderPoint: 30, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 63, name: "Southern Comfort", category: "Whisky", quantity: 48, reorderPoint: 25, status: "In Stock", lastUpdated: "45 min ago" },
  { id: 64, name: "J.W. Black Label", category: "Whisky", quantity: 87, reorderPoint: 40, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 65, name: "J.W. Blue Label", category: "Whisky", quantity: 15, reorderPoint: 20, status: "Low Stock", lastUpdated: "1 hour ago" },
  { id: 66, name: "J.W. Double Black", category: "Whisky", quantity: 42, reorderPoint: 25, status: "In Stock", lastUpdated: "30 min ago" },
  { id: 67, name: "J.W. Gold Reserve", category: "Whisky", quantity: 28, reorderPoint: 20, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 68, name: "J.W. Red Label", category: "Whisky", quantity: 92, reorderPoint: 45, status: "In Stock", lastUpdated: "1 hour ago" },
  
  // Cognac
  { id: 69, name: "Hennessy VS", category: "Cognac", quantity: 58, reorderPoint: 30, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 70, name: "Hennessy VSOP", category: "Cognac", quantity: 45, reorderPoint: 25, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 71, name: "Martell VSOP", category: "Cognac", quantity: 39, reorderPoint: 25, status: "In Stock", lastUpdated: "30 min ago" },
  
  // Single Malt
  { id: 72, name: "Teeling Single Grain", category: "Single Malt", quantity: 24, reorderPoint: 15, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 73, name: "The Glenlivet 12 Year", category: "Single Malt", quantity: 32, reorderPoint: 20, status: "In Stock", lastUpdated: "1 hour ago" },
  
  // Liquer
  { id: 74, name: "Aperol", category: "Liquer", quantity: 56, reorderPoint: 30, status: "In Stock", lastUpdated: "2 hours ago" },
  { id: 75, name: "Drambuie", category: "Liquer", quantity: 43, reorderPoint: 25, status: "In Stock", lastUpdated: "1 hour ago" },
  { id: 76, name: "Jagermeister", category: "Liquer", quantity: 78, reorderPoint: 35, status: "In Stock", lastUpdated: "30 min ago" },
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
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState(inventoryItems);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof inventoryItems[0] | null>(null);

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddProduct = (product: any) => {
    const newProduct = {
      id: items.length + 1,
      ...product,
      lastUpdated: "Just now",
    };
    setItems([...items, newProduct]);
    toast.success("Product added successfully");
  };

  const handleEditProduct = (id: number, updatedProduct: any) => {
    setItems(items.map(item => item.id === id ? { ...item, ...updatedProduct } : item));
    toast.success("Product updated successfully");
  };

  const handleEditClick = (product: typeof inventoryItems[0]) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

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
          <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {/* Search */}
        <div className="bg-card rounded-xl p-4 shadow-custom-md border border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="bg-card rounded-xl p-4 shadow-custom-md border border-border">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="transition-all"
              >
                {category}
              </Button>
            ))}
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
                {filteredItems.map((item) => (
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
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <AddProductDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddProduct}
      />
      
      <EditProductDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        product={selectedProduct}
        onEdit={handleEditProduct}
      />
    </div>
  );
};

export default Inventory;
