import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Activity, Shield, Target, BarChart3 } from "lucide-react";
import { Progress } from "./ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { dashboardService } from "../services/dashboardService";
import { analyticsService } from "../services/analyticsService";
import { toast } from "sonner";

interface PerformanceAnalyticsProps {
  timeRange: string;
  refreshTrigger?: number;
}

export function PerformanceAnalytics({ timeRange, refreshTrigger }: PerformanceAnalyticsProps) {
  const [monthlyPerformance, setMonthlyPerformance] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [riskDistribution, setRiskDistribution] = useState<{ low: number; medium: number; high: number }>({ low: 35, medium: 45, high: 20 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Always fetch 1Y for monthly analysis context, or use timeRange if less
        const range = '1Y';
        const [perfResponse, riskResponse] = await Promise.all([
          dashboardService.getPerformance(range),
          analyticsService.getRiskDistribution()
        ]);

        const data = perfResponse.data;
        if (riskResponse) {
          setRiskDistribution({
            low: Number(riskResponse.low.toFixed(1)),
            medium: Number(riskResponse.medium.toFixed(1)),
            high: Number(riskResponse.high.toFixed(1))
          });
        }

        if (!data || data.length === 0) return;

        // Process Monthly Returns
        const monthlyData: Record<string, { start: number, end: number }> = {};
        data.forEach((point: any) => {
          const date = new Date(point.date);
          const monthKey = date.toLocaleDateString('en-US', { month: 'short' });

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { start: point.value, end: point.value };
          }
          monthlyData[monthKey].end = point.value;
        });

        const chartData = Object.entries(monthlyData).map(([month, values]) => ({
          month,
          portfolio: Number((((values.end - values.start) / values.start) * 100).toFixed(2)),
          benchmark: 0.5 // Mock flat benchmark gain per month
        })).slice(-6); // Last 6 months

        setMonthlyPerformance(chartData);

        // Calculate Risk Metrics (Simplified)
        // Volatility = StdDev of daily returns
        const dailyReturns = [];
        for (let i = 1; i < data.length; i++) {
          const prev = data[i - 1].value;
          const curr = data[i].value;
          if (prev > 0) dailyReturns.push((curr - prev) / prev);
        }

        const meanReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
        const variance = dailyReturns.reduce((a, b) => a + Math.pow(b - meanReturn, 2), 0) / dailyReturns.length;
        const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100; // Annualized

        // Sharpe (assuming 2% risk free)
        const annualizedReturn = meanReturn * 252;
        const sharpe = (annualizedReturn - 0.02) / (Math.sqrt(variance) * Math.sqrt(252));

        setMetrics([
          {
            label: "Sharpe Ratio",
            value: sharpe.toFixed(2),
            description: "Risk-adjusted return",
            icon: BarChart3,
            color: "cyan",
            rating: sharpe > 1 ? "Excellent" : "Good",
          },
          {
            label: "Volatility",
            value: `${volatility.toFixed(1)}%`,
            description: "Annual volatility",
            icon: Activity,
            color: "amber",
            rating: volatility < 20 ? "Low" : "Moderate",
          },
          {
            label: "Risk Level",
            value: volatility < 15 ? "Low" : (volatility < 25 ? "Medium" : "High"),
            description: "Overall risk assessment",
            icon: Shield,
            color: "green",
            rating: "Balanced",
          },
          {
            label: "Beta",
            value: "0.95", // Hard to calc without benchmark data series
            description: "Market correlation",
            icon: Target,
            color: "blue",
            rating: " correlated",
          },
        ]);

      } catch (error) {
        console.error("Failed to load analytics:", error);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange, refreshTrigger]);

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Calculating metrics...</div>;
  }

  return (
    <Card className="bg-card border-border p-6 backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="text-lg mb-1">Performance Analytics</h3>
        <p className="text-sm text-muted-foreground">Risk metrics and historical performance</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-accent/30 border border-border/50 hover:border-border transition-all"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${metric.color}-500/10 to-${metric.color}-600/10 border border-${metric.color}-500/20 flex items-center justify-center mb-3`}>
              <metric.icon className={`w-5 h-5 text-${metric.color}-400`} />
            </div>
            <div className="text-2xl mb-1">{metric.value}</div>
            <div className="text-xs text-muted-foreground mb-1">{metric.label}</div>
            <div className="text-xs text-muted-foreground/60">{metric.rating}</div>
          </div>
        ))}
      </div>

      {/* Historical Performance Chart */}
      <div className="mb-6">
        <h4 className="text-sm mb-4">Monthly Returns Comparison</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="month"
                stroke="var(--muted-foreground)"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-bg-accent)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: '8px',
                  color: 'var(--color-text-default)'
                }}
                formatter={(value: number) => [`${value}%`, '']}
              />
              <Legend />
              <Bar dataKey="portfolio" fill="#06b6d4" name="Portfolio" radius={[4, 4, 0, 0]} />
              <Bar dataKey="benchmark" fill="#3b82f6" name="Benchmark" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="space-y-4">
        <h4 className="text-sm">Risk Distribution</h4>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Low Risk Assets</span>
              <span className="text-green-400">{riskDistribution.low}%</span>
            </div>
            <Progress value={riskDistribution.low} className="h-2 bg-accent" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Medium Risk Assets</span>
              <span className="text-amber-400">{riskDistribution.medium}%</span>
            </div>
            <Progress value={riskDistribution.medium} className="h-2 bg-accent" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">High Risk Assets</span>
              <span className="text-red-400">{riskDistribution.high}%</span>
            </div>
            <Progress value={riskDistribution.high} className="h-2 bg-accent" />
          </div>
        </div>
      </div>
    </Card>
  );
}
