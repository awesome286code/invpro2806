import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import {
  Brain,
  BarChart3,
  Target,
  Zap,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Lock
} from "lucide-react";
import { cn } from "../ui/utils";
import { SubscriptionTier } from "../subscription/SubscriptionManager";

interface EnhancedAIFeaturesProps {
  currentTier: SubscriptionTier;
  onUpgrade: () => void;
}

export function EnhancedAIFeatures({ currentTier, onUpgrade }: EnhancedAIFeaturesProps) {
  const hasProAccess = currentTier === "pro" || currentTier === "premium";
  const hasPremiumAccess = currentTier === "premium";

  return (
    <div className="space-y-6">
      {/* Sentiment Analysis */}
      <Card className={cn(
        "p-6",
        hasProAccess
          ? "bg-neutral-900/50 border-neutral-800"
          : "bg-neutral-900/30 border-neutral-800 relative overflow-hidden"
      )}>
        {!hasProAccess && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Unlock with Pro</p>
              <Button
                onClick={onUpgrade}
                size="sm"
                className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600"
              >
                <Zap className="w-4 h-4" />
                Upgrade
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg text-foreground">Market Sentiment Analysis</h3>
              <p className="text-xs text-muted-foreground">AI-powered social & news sentiment</p>
            </div>
          </div>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Pro</Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-xs text-muted-foreground mb-1">BTC Sentiment</div>
            <div className="text-2xl text-green-400 mb-1">+68%</div>
            <Progress value={68} className="h-1" />
            <div className="text-xs text-green-400 mt-1">Very Bullish</div>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="text-xs text-muted-foreground mb-1">AAPL Sentiment</div>
            <div className="text-2xl text-green-400 mb-1">+54%</div>
            <Progress value={54} className="h-1" />
            <div className="text-xs text-green-400 mt-1">Bullish</div>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="text-xs text-muted-foreground mb-1">TSLA Sentiment</div>
            <div className="text-2xl text-amber-400 mb-1">+12%</div>
            <Progress value={12} className="h-1" />
            <div className="text-xs text-amber-400 mt-1">Neutral</div>
          </div>
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="text-xs text-muted-foreground mb-1">Market Fear</div>
            <div className="text-2xl text-red-400 mb-1">-28%</div>
            <Progress value={28} className="h-1" />
            <div className="text-xs text-red-400 mt-1">Cautious</div>
          </div>
        </div>
      </Card>

      {/* Portfolio Optimization */}
      <Card className={cn(
        "p-6",
        hasProAccess
          ? "bg-neutral-900/50 border-neutral-800"
          : "bg-neutral-900/30 border-neutral-800 relative overflow-hidden"
      )}>
        {!hasProAccess && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Unlock with Pro</p>
              <Button
                onClick={onUpgrade}
                size="sm"
                className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600"
              >
                <Zap className="w-4 h-4" />
                Upgrade
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg text-foreground">AI Portfolio Optimization</h3>
              <p className="text-xs text-muted-foreground">Maximize returns, minimize risk</p>
            </div>
          </div>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Pro</Badge>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Potential Return Improvement</span>
              <span className="text-lg text-green-400">+4.2%</span>
            </div>
            <Progress value={85} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-2">Current Sharpe Ratio</div>
              <div className="text-2xl mb-1 text-foreground">1.18</div>
              <div className="text-xs text-muted-foreground">Risk-adjusted return</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2">Optimized Sharpe Ratio</div>
              <div className="text-2xl text-green-400 mb-1">1.52</div>
              <div className="text-xs text-muted-foreground">+28.8% improvement</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm text-muted-foreground mb-2">Recommended Adjustments:</div>
            <div className="flex items-center justify-between p-2 rounded bg-accent/50">
              <span className="text-sm text-foreground">Reduce TSLA</span>
              <span className="text-sm text-red-400">-8%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-accent/50">
              <span className="text-sm text-foreground">Increase VCB</span>
              <span className="text-sm text-green-400">+5%</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-accent/50">
              <span className="text-sm text-foreground">Add bonds allocation</span>
              <span className="text-sm text-green-400">+3%</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Automated Rebalancing */}
      <Card className={cn(
        "p-6",
        hasPremiumAccess
          ? "bg-neutral-900/50 border-neutral-800"
          : "bg-neutral-900/30 border-neutral-800 relative overflow-hidden"
      )}>
        {!hasPremiumAccess && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Premium Feature</p>
              <Button
                onClick={onUpgrade}
                size="sm"
                className="gap-2 bg-gradient-to-r from-purple-500 to-pink-600"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade to Premium
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg text-foreground">Automated Rebalancing</h3>
              <p className="text-xs text-muted-foreground">Set it and forget it</p>
            </div>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Premium</Badge>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border">
            <div>
              <div className="text-sm mb-1 text-foreground">Rebalancing Strategy</div>
              <div className="text-xs text-muted-foreground">Monthly threshold-based</div>
            </div>
            <Badge className="bg-green-500/20 text-green-400">Active</Badge>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-accent/50 text-center">
              <div className="text-xs text-muted-foreground mb-1">Next Rebalance</div>
              <div className="text-lg text-foreground">Dec 15</div>
            </div>
            <div className="p-3 rounded-lg bg-accent/50 text-center">
              <div className="text-xs text-muted-foreground mb-1">Threshold</div>
              <div className="text-lg text-foreground">±5%</div>
            </div>
            <div className="p-3 rounded-lg bg-accent/50 text-center">
              <div className="text-xs text-muted-foreground mb-1">Last Run</div>
              <div className="text-lg text-green-400">Nov 15</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Correlation Analysis */}
      <Card className={cn(
        "p-6",
        hasPremiumAccess
          ? "bg-neutral-900/50 border-neutral-800"
          : "bg-neutral-900/30 border-neutral-800 relative overflow-hidden"
      )}>
        {!hasPremiumAccess && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Premium Feature</p>
              <Button
                onClick={onUpgrade}
                size="sm"
                className="gap-2 bg-gradient-to-r from-purple-500 to-pink-600"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade to Premium
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg text-foreground">Correlation Matrix</h3>
              <p className="text-xs text-muted-foreground">Identify diversification opportunities</p>
            </div>
          </div>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Premium</Badge>
        </div>

        <div className="space-y-3 text-foreground">
          <div className="flex items-center gap-2">
            <span className="text-sm w-20">AAPL-MSFT</span>
            <Progress value={85} className="h-2 flex-1" />
            <span className="text-sm text-red-400">0.85</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm w-20">BTC-ETH</span>
            <Progress value={92} className="h-2 flex-1" />
            <span className="text-sm text-red-400">0.92</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm w-20">BTC-AAPL</span>
            <Progress value={28} className="h-2 flex-1" />
            <span className="text-sm text-green-400">0.28</span>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-300">
              High correlation detected between tech stocks (0.85). Consider diversifying into uncorrelated assets.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
