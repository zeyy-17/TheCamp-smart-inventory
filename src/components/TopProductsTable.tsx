import { Badge } from "./ui/badge";

const products = [
  { name: "Heineken Orig/Silver", quantity: 375, status: "In Stock", trend: "+18%" },
  { name: "Smirnoff Mule", quantity: 285, status: "In Stock", trend: "+15%" },
  { name: "Hoegaarden White", quantity: 178, status: "In Stock", trend: "+12%" },
  { name: "Absolut Vodka", quantity: 95, status: "In Stock", trend: "+10%" },
  { name: "Jack Daniels", quantity: 95, status: "In Stock", trend: "+9%" },
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

export const TopProductsTable = () => {
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
