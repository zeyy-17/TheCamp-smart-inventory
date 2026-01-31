import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Line, ComposedChart } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format, startOfDay, addDays } from "date-fns";

export const WeeklySalesChart = () => {
  // Fetch sales data for the past 7 days
  const { data: salesData = [] } = useQuery({
    queryKey: ['weekly-sales-chart'],
    queryFn: async () => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = new Date();
      const chartData = [];

      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
        
        const { data } = await supabase
          .from('sales')
          .select('total_amount')
          .eq('date_sold', dateStr);

        const total = data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
        
        chartData.push({
          day: days[date.getDay()],
          date: dateStr,
          sales: total,
          forecast: 0, // Will be updated with purchase order data
          orders: 0,
        });
      }

      return chartData;
    },
  });

  // Fetch purchase orders for the past 7 days and next 7 days
  const { data: purchaseOrderData } = useQuery({
    queryKey: ['weekly-purchase-orders-chart'],
    queryFn: async () => {
      const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd');
      
      const { data } = await supabase
        .from('purchase_orders')
        .select('quantity, expected_delivery_date, status, created_at, products(retail_price)')
        .gte('created_at', weekAgo)
        .lte('expected_delivery_date', nextWeek);
      
      return data || [];
    },
  });

  // Combine sales data with purchase order data
  const chartDataWithOrders = salesData.map(day => {
    // Count orders created on this day
    const ordersOnDay = purchaseOrderData?.filter(po => {
      const createdDate = format(new Date(po.created_at!), 'yyyy-MM-dd');
      return createdDate === day.date;
    }) || [];
    
    const orderQuantity = ordersOnDay.reduce((sum, po) => sum + po.quantity, 0);
    
    // Calculate expected stock value from orders expected to arrive
    const expectedDeliveries = purchaseOrderData?.filter(po => {
      const deliveryDate = format(new Date(po.expected_delivery_date), 'yyyy-MM-dd');
      return deliveryDate === day.date && po.status === 'pending';
    }) || [];
    
    const expectedValue = expectedDeliveries.reduce((sum, po) => {
      const price = po.products?.retail_price || 0;
      return sum + (po.quantity * Number(price));
    }, 0);

    // Forecast: sales trend + expected incoming stock value
    const avgSales = salesData.reduce((sum, d) => sum + d.sales, 0) / salesData.length;
    const forecast = day.sales > 0 ? day.sales * 1.1 : avgSales * 0.9;

    return {
      ...day,
      orders: orderQuantity,
      expectedStock: expectedValue,
      forecast: Math.round(forecast + expectedValue * 0.3), // Factor in expected deliveries
    };
  });

  return (
    <div className="bg-card rounded-xl p-6 shadow-custom-md border border-border animate-slide-in">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Weekly Sales & Orders Forecast</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartDataWithOrders}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
          <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" />
          <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            formatter={(value: number, name: string) => {
              if (name === "Actual Sales" || name === "Forecast") {
                return [`₱${value.toLocaleString()}`, name];
              }
              return [value, name];
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="sales" fill="hsl(var(--chart-1))" name="Actual Sales" radius={[8, 8, 0, 0]} />
          <Bar yAxisId="right" dataKey="orders" fill="hsl(var(--chart-3))" name="Orders Created" radius={[8, 8, 0, 0]} />
          <Line yAxisId="left" type="monotone" dataKey="forecast" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Forecast" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-1))" }} />
          <span>Sales (₱)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(var(--chart-3))" }} />
          <span>Purchase Orders (qty)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5" style={{ backgroundColor: "hsl(var(--chart-2))" }} />
          <span>Forecast</span>
        </div>
      </div>
    </div>
  );
};
