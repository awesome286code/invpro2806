import { useState, useEffect } from "react";
import { PortfolioOverview } from "../PortfolioOverview";
import { InvestmentCategoryTabs } from "../InvestmentCategoryTabs";
import { PerformanceAnalytics } from "../PerformanceAnalytics";
import { HoldingsTable } from "../HoldingsTable";
import { NewsInsights } from "../NewsInsights";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Crown, X, Zap, TrendingUp } from "lucide-react";
import { useSubscription } from "../subscription/SubscriptionManager";
import { useSocket } from "../../contexts/SocketContext";

interface DashboardViewProps {
  timeRange: string;
  onNavigateToAsset: (symbol: string) => void;
  onNavigateToSubscription: () => void;
  refreshTrigger?: number;
}

export function DashboardView({ timeRange, onNavigateToAsset, onNavigateToSubscription, refreshTrigger: externalRefreshTrigger }: DashboardViewProps) {
  const { subscription } = useSubscription();
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(true);
  const [internalRefreshTrigger, setInternalRefreshTrigger] = useState(0);
  const socket = useSocket();

  const handleRefresh = () => {
    setInternalRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    socket.on('dashboard:refresh', handleRefresh);
    socket.on('portfolio:updated', handleRefresh);
    socket.on('transaction:created', handleRefresh);

    return () => {
      socket.off('dashboard:refresh', handleRefresh);
      socket.off('portfolio:updated', handleRefresh);
      socket.off('transaction:created', handleRefresh);
    };
  }, [socket]);

  // Combine both triggers
  const activeRefreshTrigger = (externalRefreshTrigger || 0) + internalRefreshTrigger;


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl mb-1 text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Your investment portfolio at a glance</p>
      </div>

      {/* Upgrade Banner for Free Users */}
      {subscription.tier === "free" && showUpgradeBanner && (
        <Card className="relative bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-cyan-500/30 p-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 animate-pulse" />
          <button
            onClick={() => setShowUpgradeBanner(false)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl mb-1 text-foreground">Unlock Pro Features</h3>
                <p className="text-sm text-muted-foreground">
                  Get unlimited portfolios and advanced analytics for just $19/month
                </p>
              </div>
            </div>
            <div className="flex-1" />
            <div className="flex flex-col gap-2 min-w-[200px]">
              <Button
                onClick={onNavigateToSubscription}
                className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                <Zap className="w-4 h-4" />
                Upgrade to Pro
              </Button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-cyan-400/50" />
                <span>7-day free trial • Cancel anytime</span>
              </div>
            </div>
          </div>
        </Card>
      )}


      {/* Portfolio Overview */}
      <PortfolioOverview timeRange={timeRange} refreshTrigger={activeRefreshTrigger} />

      {/* Investment Categories */}
      <InvestmentCategoryTabs onNavigateToAsset={onNavigateToAsset} refreshTrigger={activeRefreshTrigger} />

      {/* Performance Analytics */}
      <PerformanceAnalytics timeRange={timeRange} refreshTrigger={activeRefreshTrigger} />

      {/* Holdings Table */}
      <HoldingsTable onNavigateToAsset={onNavigateToAsset} refreshTrigger={activeRefreshTrigger} />

      {/* News & Insights */}
      <NewsInsights />
    </div>
  );
}
