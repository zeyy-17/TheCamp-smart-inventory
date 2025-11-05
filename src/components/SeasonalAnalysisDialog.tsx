import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SeasonalAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const seasonalData = [
  { month: "Jan", sales: 3200 },
  { month: "Feb", sales: 2800 },
  { month: "Mar", sales: 3500 },
  { month: "Apr", sales: 4200 },
  { month: "May", sales: 3800 },
  { month: "Jun", sales: 4500 },
  { month: "Jul", sales: 5200 },
  { month: "Aug", sales: 5800 },
  { month: "Sep", sales: 6200 },
  { month: "Oct", sales: 7100 },
  { month: "Nov", sales: 6800 },
  { month: "Dec", sales: 5500 },
];

export const SeasonalAnalysisDialog = ({ open, onOpenChange }: SeasonalAnalysisDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Seasonal Sales Analysis</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={seasonalData}>
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
              <Line
                type="monotone"
                dataKey="sales"
                stroke="hsl(var(--chart-1))"
                strokeWidth={3}
                name="Sales (₱)"
                dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Key Insights</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Peak season: October (+40% vs baseline)</li>
              <li>• Low season: February (-20% vs baseline)</li>
              <li>• Recommendation: Increase stock by 30% in Q4</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
