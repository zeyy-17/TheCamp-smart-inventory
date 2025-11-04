import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, FileText, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const reportTypes = [
  {
    title: "Weekly Inventory Report",
    description: "Comprehensive overview of stock levels, movements, and alerts for the past week",
    icon: Calendar,
    lastGenerated: "2 hours ago",
  },
  {
    title: "Monthly Sales Analysis",
    description: "Detailed sales performance, trends, and forecast accuracy for the month",
    icon: TrendingUp,
    lastGenerated: "1 day ago",
  },
  {
    title: "Prescriptive Insights Summary",
    description: "AI-generated recommendations and action items based on inventory data",
    icon: FileText,
    lastGenerated: "5 hours ago",
  },
  {
    title: "Stock Movement Report",
    description: "Track product movements, turnover rates, and inventory velocity",
    icon: FileText,
    lastGenerated: "3 days ago",
  },
];

const Reports = () => {
  const handleDownload = (reportName: string) => {
    toast.success(`Downloading ${reportName}...`);
  };

  const handleGenerate = (reportName: string) => {
    toast.success(`Generating ${reportName}...`);
  };

  return (
    <div className="flex-1 bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground mt-1">
              Generate and download comprehensive inventory reports
            </p>
          </div>
          <Button className="gap-2">
            <FileText className="w-4 h-4" />
            Custom Report
          </Button>
        </div>

        {/* Report Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportTypes.map((report, index) => {
            const Icon = report.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-custom-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {report.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {report.description}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Last generated: {report.lastGenerated}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => handleDownload(report.title)}
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleGenerate(report.title)}
                      >
                        Regenerate
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Scheduled Reports */}
        <div className="bg-card rounded-xl p-6 shadow-custom-md border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">Scheduled Reports</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Weekly Inventory Summary</p>
                <p className="text-sm text-muted-foreground">Every Monday at 9:00 AM</p>
              </div>
              <Button variant="outline" size="sm">Edit Schedule</Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Monthly Performance Report</p>
                <p className="text-sm text-muted-foreground">First day of each month at 8:00 AM</p>
              </div>
              <Button variant="outline" size="sm">Edit Schedule</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
