import { Badge } from "./ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

export const TopProductsTable = () => {
  const { data: products = [] } = useQuery({
    queryKey: ['top-products'],
    queryFn: async () => {
      // Get sales data grouped by product
      const { data: salesData } = await supabase
        .from('sales')
        .select(`
          product_id,
          quantity,
          products (
            name,
            quantity,
            reorder_level
          )
        `);

      // Group and sum by product
      const productSales = salesData?.reduce((acc: any, sale: any) => {
        if (!sale.product_id || !sale.products) return acc;
        
        const productId = sale.product_id;
        if (!acc[productId]) {
          acc[productId] = {
            name: sale.products.name,
            totalSales: 0,
            quantity: sale.products.quantity,
            reorder_level: sale.products.reorder_level,
          };
        }
        acc[productId].totalSales += sale.quantity;
        return acc;
      }, {});

      // Convert to array and sort by sales
      const topProducts = Object.values(productSales || {})
        .sort((a: any, b: any) => b.totalSales - a.totalSales)
        .slice(0, 5)
        .map((product: any) => {
          const status = product.quantity <= product.reorder_level 
            ? 'Low Stock' 
            : product.quantity > product.reorder_level * 2 
            ? 'In Stock' 
            : 'In Stock';
          
          return {
            name: product.name,
            quantity: product.quantity,
            status,
            trend: `+${Math.round(Math.random() * 20)}%`, // Placeholder trend
          };
        });

      return topProducts;
    },
  });
  return (
    <div className="bg-card rounded-xl p-6 shadow-custom-md border border-border animate-slide-in">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Top Selling Products</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Product</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Quantity</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Trend</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={index} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4 text-sm font-medium text-foreground">{product.name}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{product.quantity}</td>
                <td className="py-3 px-4">
                  <Badge className={getStatusColor(product.status)} variant="outline">
                    {product.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-sm">
                  <span className={product.trend.startsWith("+") ? "text-green-600" : "text-red-600"}>
                    {product.trend}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
