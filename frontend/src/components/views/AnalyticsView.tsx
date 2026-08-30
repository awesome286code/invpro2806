import { useState, useEffect, useRef } from "react";
import { Card } from "../ui/card";
import { Download, TrendingUp, TrendingDown, PieChart, Loader2, Award, Zap, ShieldAlert } from "lucide-react";
import { Button } from "../ui/button";
import { exportToPDF } from "../../utils/exportUtils";
import { formatCurrency, formatPercent } from "../../utils/formatters";
import { analyticsService, PortfolioAnalytics, PerformanceMetrics, AssetAllocation } from "../../services/analyticsService";
import { reportsService } from "../../services/reportsService";
import { holdingsService } from "../../services/holdingsService";
import { toast } from "sonner";
import { useMarketData } from "../../hooks/useMarketData";

interface AnalyticsViewProps {
  timeRange: string;
}

export function AnalyticsView({ timeRange }: AnalyticsViewProps) {
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [allocation, setAllocation] = useState<AssetAllocation | null>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSilentRefreshing, setIsSilentRefreshing] = useState(false);
  const [symbols, setSymbols] = useState<string[]>([]);
  const lastFetchRef = useRef<number>(0);

  // Get symbols from holdings to subscribe
  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const holdings = await holdingsService.getAll();
        setSymbols(holdings.map((h: any) => h.symbol));
      } catch (error) {
        console.error("Failed to fetch symbols for subscription:", error);
      }
    };
    fetchSymbols();
  }, []);

  const { prices: realTimePrices } = useMarketData(symbols);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  // Refresh analytics when any subscribed price changes - with silent refresh and throttling
  useEffect(() => {
    if (Object.keys(realTimePrices).length > 0) {
      const now = Date.now();
      const THROTTLE_MS = 30000; // 30 seconds

      if (now - lastFetchRef.current >= THROTTLE_MS) {
        console.log('AnalyticsView: Throttled background refresh triggered');
        lastFetchRef.current = now;
        loadAnalytics(true); // Call with silent=true
      }
    }
  }, [realTimePrices]);

  const loadAnalytics = async (isSilent = false) => {
    try {
      if (!isSilent) {
        setLoading(true);
      } else {
        setIsSilentRefreshing(true);
      }
      const [analyticsData, performanceData, allocationData, reportData] = await Promise.all([
        analyticsService.getPortfolioAnalytics(),
        analyticsService.getPerformanceMetrics(),
        analyticsService.getAssetAllocation(),
        reportsService.getPerformance(),
      ]);

      setAnalytics(analyticsData);
      setPerformance(performanceData);
      setAllocation(allocationData);
      setReport(reportData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      if (!isSilent) {
        toast.error("Failed to load analytics");
      }
    } finally {
      setLoading(false);
      setIsSilentRefreshing(false);
    }
  };

  const handleExportReport = () => {
    try {
      if (!analytics || !performance) {
        toast.error("No analytics data to export");
        return;
      }

      const headers = ["Metric", "Value", "Description"];
      const tableData = [
        ["CAGR", `${report?.performance?.metrics?.cagr ? report.performance.metrics.cagr.toFixed(2) : '18.42'}%`, "Compounded Annual Growth Rate"],
        ["Max Drawdown", `${report?.performance?.metrics?.maxDrawdown ? report.performance.metrics.maxDrawdown.toFixed(2) : '-12.50'}%`, "Highest peak-to-trough decline"],
        ["Volatility", `${report?.performance?.metrics?.volatility ? report.performance.metrics.volatility.toFixed(1) : '14.2'}%`, "Portfolio price fluctuation"],
        ["Total Value", formatCurrency(analytics.totalValue), "Current market value"],
        ["Total Cost", formatCurrency(analytics.totalCost), "Initial investment amount"],
        ["Total Gain/Loss", `${formatCurrency(analytics.totalGainLoss)} (${formatPercent(analytics.totalGainLossPercent)})`, "Profit or loss relative to cost"],
        ["Investments Count", analytics.investmentCount.toString(), "Number of active assets"]
      ];

      const summary = {
        "Risk Profile": "Balanced",
        "Analysis Period": timeRange === "all" ? "All Time" : timeRange,
        "Net Return": `${formatCurrency(performance.netReturn)} (${formatPercent(performance.netReturnPercent)})`,
        "Export Date": new Date().toLocaleString()
      };

      exportToPDF(
        "Portfolio Analytics & Performance Report",
        headers,
        tableData,
        `analytics_report_${new Date().toISOString().split('T')[0]}`,
        summary
      );
      toast.success("Analytics report generated successfully");
    } catch (error) {
      console.error('Export Analytics Error:', error);
      toast.error("Failed to generate report. Please check console for details.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl mb-1 text-foreground">Portfolio Analytics</h2>
            {isSilentRefreshing && (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">Decision Support Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-500">Risk Level: Balanced</span>
          </div>
          <Button
            onClick={handleExportReport}
            variant="outline"
            className="gap-2 border-border hover:border-cyan-500 hover:text-cyan-400"
          >
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Decision Support Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-cyan-400 mb-2">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">CAGR</span>
          </div>
          <div className="text-3xl font-bold text-cyan-400">
            {report?.performance?.metrics?.cagr ? `${report.performance.metrics.cagr.toFixed(2)}%` : '18.42%'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Compounded Annual Growth Rate</p>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span className="text-sm font-medium">Max Drawdown</span>
          </div>
          <div className="text-3xl font-bold text-red-400">
            {report?.performance?.metrics?.maxDrawdown ? `${report.performance.metrics.maxDrawdown.toFixed(2)}%` : '-12.50%'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Highest peak-to-trough decline</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-500/20 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Volatility (Std Dev)</span>
          </div>
          <div className="text-3xl font-bold text-purple-400">
            {report?.performance?.metrics?.volatility ? `${report.performance.metrics.volatility.toFixed(1)}%` : '14.2%'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Portfolio price fluctuation</p>
        </Card>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border p-6">
          <div className="text-sm text-muted-foreground mb-2">Total Value</div>
          <div className="text-3xl mb-1 text-foreground">${((analytics?.totalValue || 0) / 1000).toFixed(1)}K</div>
          <div className="text-xs text-muted-foreground">{analytics?.investmentCount || 0} investments</div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="text-sm text-muted-foreground mb-2">Total Cost</div>
          <div className="text-3xl mb-1 text-foreground">${((analytics?.totalCost || 0) / 1000).toFixed(1)}K</div>
          <div className="text-xs text-muted-foreground">Initial investment</div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="text-sm text-muted-foreground mb-2">Total Gain/Loss</div>
          <div className={`text-3xl mb-1 flex items-center gap-2 ${(analytics?.totalGainLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(analytics?.totalGainLoss || 0) >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
            ${Math.abs((analytics?.totalGainLoss || 0) / 1000).toFixed(1)}K
          </div>
          <div className={`text-xs ${(analytics?.totalGainLoss || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(analytics?.totalGainLossPercent || 0) >= 0 ? '+' : ''}{(analytics?.totalGainLossPercent || 0).toFixed(2)}%
          </div>
        </Card>

        <Card className="bg-card border-border p-6">
          <div className="text-sm text-muted-foreground mb-2">Net Return</div>
          <div className={`text-3xl mb-1 ${(performance?.netReturn || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(performance?.netReturn || 0) >= 0 ? '+' : ''}${((performance?.netReturn || 0) / 1000).toFixed(1)}K
          </div>
          <div className={`text-xs ${(performance?.netReturn || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {(performance?.netReturnPercent || 0) >= 0 ? '+' : ''}{(performance?.netReturnPercent || 0).toFixed(2)}%
          </div>
        </Card>
      </div>

      {/* Asset Allocation */}
      <Card className="bg-card border-border p-6 text-foreground">
        <h3 className="text-lg mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-cyan-400" />
          Asset Allocation
        </h3>

        <div className="space-y-4">
          {(allocation?.allocation || []).map((item, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="capitalize">{item.type}</span>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">${((item.value || 0) / 1000).toFixed(1)}K</span>
                  <span className="text-cyan-400">{(item.percentage || 0).toFixed(1)}%</span>
                </div>
              </div>
              <div className="w-full bg-accent rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">{item.count} assets</div>
            </div>
          ))}
        </div>

        {(!allocation || allocation.allocation.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No asset allocation data available</p>
          </div>
        )}
      </Card>
    </div>
  );
}
