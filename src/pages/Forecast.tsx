import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState } from "react";

const dailyData = [
  { period: "Mon", actual: 850, forecast: 820 },
  { period: "Tue", actual: 920, forecast: 900 },
  { period: "Wed", actual: 780, forecast: 850 },
  { period: "Thu", actual: 1100, forecast: 1050 },
  { period: "Fri", actual: 1350, forecast: 1300 },
  { period: "Sat", actual: 1450, forecast: 1400 },
  { period: "Sun", actual: 1200, forecast: 1180 },
];

const weeklyData = [
  { period: "Week 1", actual: 4200, forecast: 4000 },
  { period: "Week 2", actual: 5800, forecast: 5500 },
  { period: "Week 3", actual: 3200, forecast: 3800 },
  { period: "Week 4", actual: 6100, forecast: 6000 },
];

const monthlyData = [
  { period: "Jan", actual: 18500, forecast: 17800 },
  { period: "Feb", actual: 22300, forecast: 21500 },
  { period: "Mar", actual: 19800, forecast: 20200 },
  { period: "Apr", actual: 25600, forecast: 24800 },
  { period: "May", actual: 28900, forecast: 28200 },
  { period: "Jun", actual: 31200, forecast: 30500 },
];

const trendingProducts = [
  { period: "Mon", heineken: 45, corona: 32, stella: 28, budweiser: 25 },
  { period: "Tue", heineken: 52, corona: 35, stella: 30, budweiser: 28 },
  { period: "Wed", heineken: 48, corona: 38, stella: 32, budweiser: 26 },
  { period: "Thu", heineken: 65, corona: 42, stella: 35, budweiser: 30 },
  { period: "Fri", heineken: 78, corona: 55, stella: 48, budweiser: 42 },
  { period: "Sat", heineken: 85, corona: 62, stella: 52, budweiser: 48 },
  { period: "Sun", heineken: 72, corona: 48, stella: 45, budweiser: 38 },
];

const monthlyProductTrends = [
  { month: "Jan", heineken: 320, corona: 280, stella: 240, budweiser: 200 },
  { month: "Feb", heineken: 350, corona: 295, stella: 255, budweiser: 220 },
  { month: "Mar", heineken: 380, corona: 310, stella: 270, budweiser: 235 },
  { month: "Apr", heineken: 420, corona: 340, stella: 295, budweiser: 260 },
  { month: "May", heineken: 465, corona: 380, stella: 325, budweiser: 285 },
  { month: "Jun", heineken: 510, corona: 420, stella: 360, budweiser: 310 },
];

const Forecast = () => {
  const handleExport = () => {
    toast.success("Report exported successfully!");
  };

  const handleGenerateForecast = () => {
    toast.success("Forecast generated successfully!");
  };

  return (
    <div className="flex-1 bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sales Forecast</h1>
            <p className="text-muted-foreground mt-1">
              Predictive analytics for smarter planning
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>Export Report</Button>
            <Button onClick={handleGenerateForecast}>Generate Forecast</Button>
          </div>
        </div>

        {/* Forecast Tabs */}
        <Tabs defaultValue="monthly" className="space-y-6">
          <TabsList className="bg-muted">
            <TabsTrigger value="daily">Daily Forecast</TabsTrigger>
            <TabsTrigger value="weekly">Weekly Forecast</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-custom-md border border-border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Daily Sales Projection</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={3}
                    name="Actual Sales (₱)"
                    dot={{ fill: "hsl(var(--chart-1))", r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Forecasted Sales (₱)"
                    dot={{ fill: "hsl(var(--chart-2))", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Daily Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">Average Daily Sales</p>
                <p className="text-2xl font-bold text-foreground mt-1">₱1,093</p>
                <p className="text-xs text-green-600 mt-1">↑ 12% from last week</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">Forecast Accuracy</p>
                <p className="text-2xl font-bold text-foreground mt-1">91%</p>
                <p className="text-xs text-green-600 mt-1">↑ 2% improvement</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">Tomorrow's Projection</p>
                <p className="text-2xl font-bold text-foreground mt-1">₱1,250</p>
                <p className="text-xs text-muted-foreground mt-1">Confidence: High</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-custom-md border border-border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Weekly Sales Projection</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={3}
                    name="Actual Sales (₱)"
                    dot={{ fill: "hsl(var(--chart-1))", r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Forecasted Sales (₱)"
                    dot={{ fill: "hsl(var(--chart-2))", r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">Average Weekly Sales</p>
                <p className="text-2xl font-bold text-foreground mt-1">₱4,825</p>
                <p className="text-xs text-green-600 mt-1">↑ 15% from last month</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">Forecast Accuracy</p>
                <p className="text-2xl font-bold text-foreground mt-1">92%</p>
                <p className="text-xs text-green-600 mt-1">↑ 3% improvement</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">Next Week Projection</p>
                <p className="text-2xl font-bold text-foreground mt-1">₱7,200</p>
                <p className="text-xs text-muted-foreground mt-1">Confidence: High</p>
              </div>
            </div>

            {/* Trending Products Chart */}
            <div className="bg-card rounded-xl p-6 shadow-custom-md border border-border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Trending Products This Week</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendingProducts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="heineken" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Heineken" />
                  <Line type="monotone" dataKey="corona" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Corona" />
                  <Line type="monotone" dataKey="stella" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Stella Artois" />
                  <Line type="monotone" dataKey="budweiser" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Budweiser" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-custom-md border border-border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Monthly Sales Projection</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={3}
                    name="Actual Sales (₱)"
                    dot={{ fill: "hsl(var(--chart-1))", r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    name="Forecasted Sales (₱)"
                    dot={{ fill: "hsl(var(--chart-2))", r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Insights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">Average Monthly Sales</p>
                <p className="text-2xl font-bold text-foreground mt-1">₱24,383</p>
                <p className="text-xs text-green-600 mt-1">↑ 22% YoY growth</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">Forecast Accuracy</p>
                <p className="text-2xl font-bold text-foreground mt-1">94%</p>
                <p className="text-xs text-green-600 mt-1">↑ 5% improvement</p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground">Next Month Projection</p>
                <p className="text-2xl font-bold text-foreground mt-1">₱33,500</p>
                <p className="text-xs text-muted-foreground mt-1">Confidence: Very High</p>
              </div>
            </div>

            {/* Monthly Product Trends */}
            <div className="bg-card rounded-xl p-6 shadow-custom-md border border-border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Product Trends - Monthly View</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyProductTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="heineken" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Heineken" />
                  <Line type="monotone" dataKey="corona" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Corona" />
                  <Line type="monotone" dataKey="stella" stroke="hsl(var(--chart-3))" strokeWidth={2} name="Stella Artois" />
                  <Line type="monotone" dataKey="budweiser" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Budweiser" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Forecast;
