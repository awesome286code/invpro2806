import { useState, useEffect, useCallback, memo } from "react";
import { Card } from "./ui/card";
import { TrendingUp, TrendingDown, DollarSign, Percent, Target } from "lucide-react";
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { dashboardService } from "../services/dashboardService";
import { analyticsService } from "../services/analyticsService";
import { holdingsService } from "../services/holdingsService";
import { toast } from "sonner";
import { marketDataStream } from "../services/marketDataStream";
import { formatCurrency, formatPercent, formatCompactNumber } from "../utils/formatters";

interface PortfolioOverviewProps {
  timeRange: string;
  refreshTrigger?: number;
}

const RealtimeTotalValue = memo(({ holdings, initialValue }: { holdings: any[], initialValue: number }) => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const subscription = marketDataStream.getSummaryStream(holdings).subscribe(v => setValue(v.totalValue));
    return () => subscription.unsubscribe();
  }, [holdings]);

  return <span>{formatCurrency(value)}</span>;
});

const RealtimeUnrealizedGL = memo(({ holdings, initialGL, initialGLPercent }: { holdings: any[], initialGL: number, initialGLPercent: number }) => {
  const [data, setData] = useState({ totalGL: initialGL, totalGLPercent: initialGLPercent });

  useEffect(() => {
    const subscription = marketDataStream.getSummaryStream(holdings).subscribe(v => setData({
      totalGL: v.totalGL,
      totalGLPercent: v.totalGLPercent
    }));
    return () => subscription.unsubscribe();
  }, [holdings]);

  const positive = data.totalGL >= 0;

  return (
    <div>
      <div className="text-3xl mb-1">{formatCurrency(data.totalGL)}</div>
      <div className={`flex items-center gap-1 text-sm ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {data.totalGLPercent >= 0 ? '+' : ''}{formatPercent(data.totalGLPercent)}
      </div>
    </div>
  );
});

export function PortfolioOverview({ timeRange, refreshTrigger }: PortfolioOverviewProps) {
  const [stats, setStats] = useState<any[]>([]);
  const [holdingsMetadata, setHoldingsMetadata] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [allocationData, setAllocationData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [summary, performance, allocation, holdingsData] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getPerformance(timeRange),
        analyticsService.getAssetAllocation(),
        holdingsService.getAll()
      ]);

      // Process metadata for RxJS streams
      setHoldingsMetadata(holdingsData.map((h: any) => ({
        symbol: h.symbol,
        quantity: Number(h.quantity),
        costBasis: Number(h.averagePrice)
      })));

      setStats([
        {
          label: "Total Portfolio Value",
          value: summary.totalValue,
          change: summary.totalGainLossPercent >= 0 ? `+${formatPercent(summary.totalGainLossPercent)}` : formatPercent(summary.totalGainLossPercent),
          changeValue: formatCurrency(summary.totalGainLoss),
          positive: summary.totalGainLoss >= 0,
          icon: DollarSign,
          accent: "cyan",
          isRealtimeValue: true
        },
        {
          label: "Total Cost",
          value: formatCurrency(summary.totalCost),
          change: "Invested",
          changeValue: "Initial Capital",
          positive: true,
          icon: Percent,
          accent: "green",
        },
        {
          label: "Unrealized Gain/Loss",
          value: summary.totalGainLoss,
          change: summary.totalGainLossPercent,
          changeValue: "All time",
          positive: summary.totalGainLoss >= 0,
          icon: TrendingUp,
          accent: "blue",
          isRealtimeGL: true
        },
        {
          label: "Active Assets",
          value: summary.assetCount.toString(),
          change: summary.portfolioCount.toString(),
          changeValue: "Portfolios",
          positive: true,
          icon: Target,
          accent: "amber",
        },
      ]);

      // Process Performance Data
      const formattedPerformance = performance.data.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: item.value,
        benchmark: item.value * 1.05 // Mock benchmark for visual comparison
      }));
      setPerformanceData(formattedPerformance);

      // Process Allocation Data
      const colors = ["#06b6d4", "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b"];
      const formattedAllocation = allocation.allocation.map((item: any, index: number) => ({
        name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
        value: item.value,
        color: colors[index % colors.length]
      }));
      setAllocationData(formattedAllocation);

    } catch (error) {
      console.error("Failed to load portfolio overview:", error);
      toast.error("Failed to load portfolio data");
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
  }, [timeRange, fetchData, refreshTrigger]);

  if (loading) {
    return <div className="text-center p-10 text-muted-foreground">Loading portfolio data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="relative overflow-hidden bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)] p-6 backdrop-blur-sm hover:border-[var(--color-border-accent)] transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${stat.accent}-500/10 to-${stat.accent}-600/10 border border-${stat.accent}-500/20 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.accent}-400`} />
              </div>
              {!stat.isRealtimeGL && (
                <div className={`flex items-center gap-1 text-sm ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              )}
            </div>
            {stat.isRealtimeValue ? (
              <div className="text-3xl mb-1">
                <RealtimeTotalValue holdings={holdingsMetadata} initialValue={stat.value} />
              </div>
            ) : stat.isRealtimeGL ? (
              <RealtimeUnrealizedGL holdings={holdingsMetadata} initialGL={stat.value} initialGLPercent={stat.change} />
            ) : (
              <div className="text-3xl mb-1">{stat.value}</div>
            )}
            <div className="text-sm text-[var(--color-text-muted)]">{stat.label}</div>
            <div className="text-xs text-[var(--color-text-muted-2)] mt-2">{stat.changeValue}</div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="xl:col-span-2 bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)] p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg mb-1">Portfolio Performance</h3>
              <p className="text-sm text-muted-foreground">Portfolio vs Benchmark ({timeRange})</p>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--muted-foreground)"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  tickFormatter={(value) => formatCompactNumber(value, 'USD')}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-accent)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: '8px',
                    color: 'var(--color-text-default)'
                  }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fill="url(#colorPortfolio)"
                  name="Portfolio Value"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Asset Allocation Pie Chart */}
        <Card className="bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)] p-6 backdrop-blur-sm">
          <div className="mb-6">
            <h3 className="text-lg mb-1">Asset Allocation</h3>
            <p className="text-sm text-muted-foreground">Distribution by category</p>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-accent)',
                    border: '1px solid var(--color-border-primary)',
                    borderRadius: '8px',
                    color: 'var(--color-text-default)'
                  }}
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4">
            {allocationData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span>{formatCompactNumber(item.value, 'USD')}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
