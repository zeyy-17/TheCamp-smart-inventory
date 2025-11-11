import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BrainCircuit, 
  TrendingUp, 
  Sparkles, 
  BarChart3, 
  PieChart, 
  LineChart,
  Zap,
  Database,
  Target,
  Workflow
} from "lucide-react";
import { toast } from "sonner";

const DataAnalytics = () => {
  const handleAnalyze = (feature: string) => {
    toast.success(`${feature} analysis initiated`);
  };

  return (
    <div className="flex-1 bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">Data Analytics</h1>
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Emerging Tech
              </Badge>
            </div>
            <p className="text-muted-foreground">
              AI-powered insights and predictive analytics for intelligent inventory management
            </p>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BrainCircuit className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="outline">AI/ML</Badge>
              </div>
              <CardTitle>Predictive Intelligence</CardTitle>
              <CardDescription>
                Machine learning models predict demand patterns up to 90 days in advance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Model Accuracy</span>
                  <span className="font-semibold">94.7%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: '94.7%' }} />
                </div>
              </div>
              <Button 
                onClick={() => handleAnalyze("Predictive Intelligence")}
                className="w-full gap-2"
              >
                <Zap className="w-4 h-4" />
                Run Prediction
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <Badge variant="outline">Real-time</Badge>
              </div>
              <CardTitle>Trend Analysis</CardTitle>
              <CardDescription>
                Advanced pattern recognition identifies emerging sales trends instantly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Trends Detected</span>
                  <span className="text-2xl font-bold text-blue-500">12</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  3 actionable opportunities identified
                </p>
              </div>
              <Button 
                onClick={() => handleAnalyze("Trend Analysis")}
                className="w-full gap-2"
                variant="outline"
              >
                <LineChart className="w-4 h-4" />
                View Trends
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Target className="w-5 h-5 text-green-500" />
                </div>
                <Badge variant="outline">Optimization</Badge>
              </div>
              <CardTitle>Smart Recommendations</CardTitle>
              <CardDescription>
                AI-driven suggestions to optimize inventory levels and reduce costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Potential Savings</span>
                  <span className="text-2xl font-bold text-green-500">₱23K</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on last 30 days of data
                </p>
              </div>
              <Button 
                onClick={() => handleAnalyze("Smart Recommendations")}
                className="w-full gap-2"
                variant="outline"
              >
                <Sparkles className="w-4 h-4" />
                Get Recommendations
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Advanced Analytics Suite
            </CardTitle>
            <CardDescription>
              Explore comprehensive data analytics tools powered by emerging technologies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="visualizations" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="visualizations">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Visualizations
                </TabsTrigger>
                <TabsTrigger value="segmentation">
                  <PieChart className="w-4 h-4 mr-2" />
                  Segmentation
                </TabsTrigger>
                <TabsTrigger value="forecasting">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Forecasting
                </TabsTrigger>
                <TabsTrigger value="automation">
                  <Workflow className="w-4 h-4 mr-2" />
                  Automation
                </TabsTrigger>
              </TabsList>

              <TabsContent value="visualizations" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Interactive Dashboards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Real-time data visualization with drill-down capabilities and custom filters.
                      </p>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Dynamic chart generation
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Multi-dimensional analysis
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          Export to multiple formats
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Heat Maps</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Visual representation of sales patterns and product performance hotspots.
                      </p>
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 35 }).map((_, i) => (
                          <div
                            key={i}
                            className="aspect-square rounded"
                            style={{
                              backgroundColor: `hsl(var(--primary) / ${Math.random() * 0.8 + 0.2})`
                            }}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="segmentation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Customer & Product Segmentation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      AI-powered clustering algorithms automatically segment inventory and customer data for targeted strategies.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg space-y-2">
                        <h4 className="font-semibold">High-Value Items</h4>
                        <p className="text-2xl font-bold text-primary">23%</p>
                        <p className="text-xs text-muted-foreground">Generate 67% of revenue</p>
                      </div>
                      <div className="p-4 border rounded-lg space-y-2">
                        <h4 className="font-semibold">Fast Movers</h4>
                        <p className="text-2xl font-bold text-blue-500">34%</p>
                        <p className="text-xs text-muted-foreground">High turnover rate</p>
                      </div>
                      <div className="p-4 border rounded-lg space-y-2">
                        <h4 className="font-semibold">Slow Movers</h4>
                        <p className="text-2xl font-bold text-orange-500">43%</p>
                        <p className="text-xs text-muted-foreground">Optimization needed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="forecasting" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Predictive Forecasting Engine</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Time-series analysis with seasonal decomposition and trend projection using advanced statistical models.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div>
                          <p className="font-medium">Next Week Forecast</p>
                          <p className="text-sm text-muted-foreground">Expected sales volume</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">₱52,430</p>
                          <p className="text-xs text-green-500">↑ 12% from last week</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div>
                          <p className="font-medium">30-Day Projection</p>
                          <p className="text-sm text-muted-foreground">Monthly revenue estimate</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">₱198,650</p>
                          <p className="text-xs text-blue-500">95% confidence</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="automation" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Intelligent Automation</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Automated workflows triggered by data patterns and business rules, reducing manual intervention.
                    </p>
                    <div className="space-y-3">
                      {[
                        { name: "Auto-Reorder Triggers", status: "Active", count: 8 },
                        { name: "Price Optimization", status: "Active", count: 15 },
                        { name: "Anomaly Detection", status: "Active", count: 3 },
                        { name: "Demand Alerts", status: "Active", count: 12 }
                      ].map((automation) => (
                        <div key={automation.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Workflow className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium">{automation.name}</p>
                              <p className="text-xs text-muted-foreground">{automation.count} rules configured</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            {automation.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Technology Stack */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Powered By Emerging Technologies
            </CardTitle>
            <CardDescription>
              Built on cutting-edge data science and AI infrastructure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "Machine Learning", desc: "TensorFlow & PyTorch" },
                { name: "Big Data", desc: "Real-time Processing" },
                { name: "Neural Networks", desc: "Deep Learning Models" },
                { name: "Natural Language", desc: "NLP for Insights" }
              ].map((tech) => (
                <div key={tech.name} className="p-4 border rounded-lg text-center space-y-1">
                  <p className="font-semibold text-sm">{tech.name}</p>
                  <p className="text-xs text-muted-foreground">{tech.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataAnalytics;
