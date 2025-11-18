import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { AddProductDialog } from "@/components/AddProductDialog";
import { EditProductDialog } from "@/components/EditProductDialog";
import { toast } from "sonner";
import { productsApi, categoriesApi } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

const Inventory = () => {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Handle URL filter parameter
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter) {
      setStatusFilter(filter);
    }
  }, [searchParams]);

  // Fetch categories
  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  // Fetch products
  const { data: products = [], isLoading, error } = useQuery<any[]>({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll(),
  });

  // Get unique category names
  const categoryNames = ["All", ...Array.from(new Set(categories.map((c: any) => c.name)))];

  const filteredItems = products.filter((item: any) => {
    const matchesCategory = selectedCategory === "All" || item.category?.name === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Apply status filter if present
    let matchesStatus = true;
    if (statusFilter === 'out-of-stock') {
      matchesStatus = item.quantity === 0;
    } else if (statusFilter === 'low-stock') {
      matchesStatus = item.quantity > 0 && item.quantity <= item.reorder_level;
    }
    
    return matchesCategory && matchesSearch && matchesStatus;
  });

  const getStatusColor = (quantity: number, reorderPoint: number) => {
    if (quantity === 0) return "bg-red-100 text-red-700 border-red-300";
    if (quantity <= reorderPoint) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-green-100 text-green-700 border-green-300";
  };

  const getStatusText = (quantity: number, reorderPoint: number) => {
    if (quantity === 0) return "Out of Stock";
    if (quantity <= reorderPoint) return "Low Stock";
    return "In Stock";
  };

  const handleEditClick = (product: any) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleRemoveProduct = async (id: number) => {
    try {
      await productsApi.delete(id);
      toast.success("Product removed successfully");
      queryClient.invalidateQueries({ queryKey: ['products'] });
    } catch (error) {
      toast.error("Failed to remove product");
      console.error(error);
    }
  };

  const handleAddSuccess = () => {
    setAddDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ['products'] });
  };

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          Error loading inventory data. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage your beverage inventory</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="shadow-custom-sm hover:shadow-custom-md transition-all">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Active Filter Badge */}
      {statusFilter && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            Filter: {statusFilter === 'out-of-stock' ? 'Out of Stock' : 'Low Stock'}
          </Badge>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setStatusFilter(null)}
          >
            Clear Filter
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-xl shadow-custom-md border border-border">
          <div className="text-sm text-muted-foreground mb-2">Total Products</div>
          <div className="text-3xl font-bold text-foreground">{products.length}</div>
        </div>
        <Button 
          variant="outline"
          className="bg-card p-6 rounded-xl shadow-custom-md border border-border hover:bg-warning/10 h-auto flex flex-col items-start transition-all w-full"
          onClick={() => setStatusFilter('low-stock')}
        >
          <div className="text-sm text-muted-foreground mb-2">Low Stock Items</div>
          <div className="text-3xl font-bold text-warning">
            {products.filter((item: any) => item.quantity > 0 && item.quantity <= item.reorder_level).length}
          </div>
        </Button>
        <Button 
          variant="outline"
          className="bg-card p-6 rounded-xl shadow-custom-md border border-border hover:bg-destructive/10 h-auto flex flex-col items-start transition-all w-full"
          onClick={() => setStatusFilter('out-of-stock')}
        >
          <div className="text-sm text-muted-foreground mb-2">Out of Stock</div>
          <div className="text-3xl font-bold text-destructive">
            {products.filter((item: any) => item.quantity === 0).length}
          </div>
        </Button>
        <div className="bg-card p-6 rounded-xl shadow-custom-md border border-border">
          <div className="text-sm text-muted-foreground mb-2">Total Value</div>
          <div className="text-3xl font-bold text-foreground">
            ₱{products.reduce((sum: number, item: any) => sum + (item.retail_price * item.quantity), 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-6 rounded-xl shadow-custom-md border border-border">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search by product name or SKU..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-foreground mb-3">Filter by Category</div>
          <div className="flex flex-wrap gap-2">
            {categoryNames.map((category) => (
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
      </div>

      {/* Inventory Table */}
      <div className="bg-card rounded-xl shadow-custom-md border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Product Name</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">SKU</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Category</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Quantity</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Reorder Point</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Price</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Loading products...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item: any) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-foreground">{item.name}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{item.sku}</td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{item.category?.name || 'N/A'}</td>
                    <td className="py-4 px-6 text-sm">
                      <span className={item.quantity <= item.reorder_level ? "text-red-600 font-semibold" : "text-foreground"}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{item.reorder_level}</td>
                    <td className="py-4 px-6 text-sm text-foreground">₱{item.retail_price?.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <Badge className={getStatusColor(item.quantity, item.reorder_level)} variant="outline">
                        {getStatusText(item.quantity, item.reorder_level)}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleRemoveProduct(item.id)}>
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialogs */}
      <AddProductDialog 
        open={addDialogOpen} 
        onOpenChange={setAddDialogOpen}
        onSuccess={handleAddSuccess}
      />
      {selectedProduct && (
        <EditProductDialog 
          open={editDialogOpen} 
          onOpenChange={setEditDialogOpen}
          product={selectedProduct}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default Inventory;
