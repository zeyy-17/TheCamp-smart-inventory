import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
  { day: "Mon", sales: 4200, forecast: 4500 },
  { day: "Tue", sales: 5800, forecast: 5500 },
  { day: "Wed", sales: 3200, forecast: 4800 },
  { day: "Thu", sales: 6100, forecast: 5800 },
  { day: "Fri", sales: 7800, forecast: 7200 },
  { day: "Sat", sales: 2800, forecast: 3500 },
  { day: "Sun", sales: 9200, forecast: 8800 },
];

export const WeeklySalesChart = () => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-custom-md border border-border animate-slide-in">
      <h3 className="text-lg font-semibold mb-4 text-foreground">Weekly Sales Forecast</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
