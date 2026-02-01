import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TrendingUp, Package, Calendar, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { format, subDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

interface SalesChartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName?: string;
  productId?: number;
}

export const SalesChartDialog = ({ open, onOpenChange, productName, productId }: SalesChartDialogProps) => {
  // Fetch sales data for the specific product
  const { data: salesData, isLoading } = useQuery({
    queryKey: ['product-sales', productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const thirtyDaysAgo = subDays(new Date(), 30);
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('product_id', productId)
        .gte('date_sold', thirtyDaysAgo.toISOString().split('T')[0])
        .order('date_sold', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: open && !!productId,
  });

  // Fetch product info
  const { data: product } = useQuery({
    queryKey: ['product-info', productId],
    queryFn: async () => {
      if (!productId) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: open && !!productId,
  });

  // Process data for chart - group by date
  const chartData = salesData?.reduce((acc: any[], sale: any) => {
    const dateStr = sale.date_sold;
    const existing = acc.find(item => item.date === dateStr);
    
    if (existing) {
      existing.units += sale.quantity;
      existing.revenue += Number(sale.total_amount);
    } else {
      acc.push({
        date: dateStr,
        displayDate: format(parseISO(dateStr), 'MMM dd'),
        units: sale.quantity,
        revenue: Number(sale.total_amount),
      });
    }
    return acc;
  }, []) || [];

  // Sort by date
  chartData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate summary stats
  const totalUnits = salesData?.reduce((sum: number, sale: any) => sum + sale.quantity, 0) || 0;
  const totalRevenue = salesData?.reduce((sum: number, sale: any) => sum + Number(sale.total_amount), 0) || 0;
  const avgUnitsPerDay = chartData.length > 0 ? (totalUnits / chartData.length).toFixed(1) : '0';
  
  // Group by store
  const storeData = salesData?.reduce((acc: Record<string, number>, sale: any) => {
    const store = sale.store || 'Unknown';
    acc[store] = (acc[store] || 0) + sale.quantity;
    return acc;
  }, {}) || {};

  const storeChartData = Object.entries(storeData).map(([store, units]) => ({
    store,
    units,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Sales Performance
            <Badge variant="secondary" className="ml-2">
              <TrendingUp className="w-3 h-3 mr-1" />
              Top Seller
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading sales data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Product Info & Summary */}
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-lg">{productName}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Units Sold</p>
                    <p className="font-bold text-2xl text-primary">{totalUnits}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Revenue</p>
                    <p className="font-bold text-xl text-green-600">₱{totalRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg. Units/Day</p>
                    <p className="font-bold text-xl">{avgUnitsPerDay}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current Stock</p>
                    <p className="font-bold text-xl">{product?.quantity || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Sales Chart */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Daily Sales (Last 30 Days)
              </h3>
              {chartData.length > 0 ? (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="displayDate" 
                        tick={{ fontSize: 11 }}
                        className="text-muted-foreground"
                      />
                      <YAxis 
                        tick={{ fontSize: 11 }}
                        className="text-muted-foreground"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: number, name: string) => [
                          name === 'units' ? `${value} units` : `₱${value.toLocaleString()}`,
                          name === 'units' ? 'Units Sold' : 'Revenue'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="units" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No sales recorded in the last 30 days</p>
                </Card>
              )}
            </div>

            {/* Sales by Store */}
            {storeChartData.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Sales by Store
                </h3>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={storeChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="store" 
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                      />
                      <YAxis 
                        tick={{ fontSize: 11 }}
                        className="text-muted-foreground"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`${value} units`, 'Units Sold']}
                      />
                      <Bar 
                        dataKey="units" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Why it's a Top Seller */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Why This is a Top Seller
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• High volume of {totalUnits} units sold in the last 30 days</li>
                  <li>• Consistent daily sales averaging {avgUnitsPerDay} units per day</li>
                  <li>• Generated ₱{totalRevenue.toLocaleString()} in revenue</li>
                  {product?.retail_price && product?.cost_price && (
                    <li>• Profit margin of {(((product.retail_price - product.cost_price) / product.retail_price) * 100).toFixed(1)}%</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
