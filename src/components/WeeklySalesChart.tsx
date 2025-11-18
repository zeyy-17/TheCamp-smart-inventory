import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format, startOfDay } from "date-fns";

export const WeeklySalesChart = () => {
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
          sales: total,
          forecast: total * 1.1, // Simple forecast: 10% above actual
        });
      }

      return chartData;
    },
  });
  return (
    <div className="bg-card rounded-xl p-6 shadow-custom-md border border-border animate-slide-in">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Weekly Sales Forecast</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={salesData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
          <YAxis stroke="hsl(var(--muted-foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="sales" fill="hsl(var(--chart-1))" name="Actual Sales" radius={[8, 8, 0, 0]} />
          <Bar dataKey="forecast" fill="hsl(var(--chart-2))" name="Forecast" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
