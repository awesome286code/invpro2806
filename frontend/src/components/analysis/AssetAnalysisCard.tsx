import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
  ChevronDown,
  ChevronUp,
  Activity,
  Shield,
  Zap,
  BarChart3,
  Lock
} from "lucide-react";
import {
  Line,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from "recharts";
import { Separator } from "../ui/separator";
import { cn } from "../ui/utils";
import { SubscriptionTier } from "../subscription/SubscriptionManager";

interface Asset {
  symbol: string;
  name: string;
  currentPrice: number;
  category: string;
  holdings: number;
  costBasis: number;
}

interface AssetAnalysisCardProps {
  asset: Asset;
  index: number;
  currentTier: SubscriptionTier;
  onUpgrade: () => void;
}

// Generate realistic forecast data
const generateForecastData = (symbol: string, currentPrice: number) => {
  const baseData: any[] = [];
  const timeframes = {
    "7D": { days: 7, volatility: 0.02 },
    "1M": { days: 30, volatility: 0.05 },
    "3M": { days: 90, volatility: 0.08 },
    "6M": { days: 180, volatility: 0.12 }
  };

  // Different trend directions for variety
  const trends = {
    "AAPL": 1.05,
    "BTC": 1.15,
    "ETH": 1.12,
    "MSFT": 1.04,
    "TSLA": 0.98,
    "VCB": 1.08
  };

  const trend = trends[symbol as keyof typeof trends] || 1.0;

  Object.entries(timeframes).forEach(([tf, config]: [string, any]) => {
    const data = [{ day: 0, actual: currentPrice, forecast: currentPrice, lower: currentPrice, upper: currentPrice }];

    for (let i = 1; i <= config.days; i++) {
      const progress = i / config.days;
      const trendPrice = currentPrice * (1 + (trend - 1) * progress);
      const volatilityRange = trendPrice * config.volatility;

      data.push({
        day: i,
        actual: (i <= 7 ? currentPrice * (1 + (Math.random() - 0.5) * 0.02) : null) as number,
        forecast: trendPrice,
        lower: trendPrice - volatilityRange,
        upper: trendPrice + volatilityRange
      });
    }

    baseData.push({ timeframe: tf, data, finalPrice: data[data.length - 1].forecast });
  });

  return baseData;
};

// Generate technical indicators
const generateTechnicalIndicators = (symbol: string) => {
  const indicators = {
    "AAPL": { rsi: 58, macd: 2.3, obv: 125000000, volumeSpike: 15, ema20: 175.20, ema50: 172.80, sma100: 170.50, sma200: 168.90 },
    "BTC": { rsi: 72, macd: 850, obv: 2500000, volumeSpike: 45, ema20: 41200, ema50: 39800, sma100: 38500, sma200: 37200 },
    "ETH": { rsi: 65, macd: 45, obv: 1800000, volumeSpike: 32, ema20: 2210, ema50: 2180, sma100: 2150, sma200: 2120 },
    "MSFT": { rsi: 55, macd: 1.8, obv: 98000000, volumeSpike: 12, ema20: 365.50, ema50: 362.20, sma100: 358.80, sma200: 355.40 },
    "TSLA": { rsi: 42, macd: -1.2, obv: 85000000, volumeSpike: 8, ema20: 245.20, ema50: 248.50, sma100: 251.30, sma200: 254.80 },
    "VCB": { rsi: 68, macd: 1200, obv: 5200000, volumeSpike: 28, ema20: 94500, ema50: 92800, sma100: 91200, sma200: 89800 }
  };

  return indicators[symbol as keyof typeof indicators] || indicators["AAPL"];
};

// Generate recommendations
const generateRecommendations = (symbol: string) => {
  const recommendations = {
    "AAPL": {
      "7D": { action: "Buy", percentage: 15, confidence: 78, strategy: "Short-term momentum trade on positive technicals" },
      "1M": { action: "Buy", percentage: 25, confidence: 82, strategy: "Accumulate on dips, strong uptrend expected" },
      "3M": { action: "Hold", percentage: 0, confidence: 75, strategy: "Maintain position, monitor resistance levels" },
      "6M": { action: "Hold", percentage: 0, confidence: 70, strategy: "Long-term growth trajectory intact" }
    },
    "BTC": {
      "7D": { action: "Hold", percentage: 0, confidence: 68, strategy: "Overbought on RSI, await pullback" },
      "1M": { action: "Sell", percentage: 20, confidence: 72, strategy: "Take partial profits near resistance" },
      "3M": { action: "Buy", percentage: 30, confidence: 85, strategy: "Strong bullish trend, accumulate on corrections" },
      "6M": { action: "Buy", percentage: 40, confidence: 88, strategy: "Major breakout expected, strategic accumulation" }
    },
    "ETH": {
      "7D": { action: "Buy", percentage: 10, confidence: 75, strategy: "Moderate momentum, good entry point" },
      "1M": { action: "Buy", percentage: 20, confidence: 80, strategy: "Positive technicals, gradual accumulation" },
      "3M": { action: "Hold", percentage: 0, confidence: 77, strategy: "Monitor support levels closely" },
      "6M": { action: "Buy", percentage: 25, confidence: 82, strategy: "Long-term bullish outlook" }
    },
    "MSFT": {
      "7D": { action: "Hold", percentage: 0, confidence: 72, strategy: "Neutral momentum, no immediate action" },
      "1M": { action: "Buy", percentage: 10, confidence: 76, strategy: "Minor accumulation on weakness" },
      "3M": { action: "Buy", percentage: 15, confidence: 79, strategy: "Steady growth expected" },
      "6M": { action: "Hold", percentage: 0, confidence: 74, strategy: "Maintain core position" }
    },
    "TSLA": {
      "7D": { action: "Hold", percentage: 0, confidence: 65, strategy: "Weak momentum, avoid new positions" },
      "1M": { action: "Sell", percentage: 15, confidence: 70, strategy: "Reduce exposure on rallies" },
      "3M": { action: "Hold", percentage: 0, confidence: 62, strategy: "Wait for clearer trend direction" },
      "6M": { action: "Rebalance", percentage: 10, confidence: 68, strategy: "Portfolio rebalancing recommended" }
    },
    "VCB": {
      "7D": { action: "Buy", percentage: 20, confidence: 80, strategy: "Strong local momentum" },
      "1M": { action: "Buy", percentage: 30, confidence: 84, strategy: "Banking sector showing strength" },
      "3M": { action: "Hold", percentage: 0, confidence: 78, strategy: "Consolidation phase expected" },
      "6M": { action: "Buy", percentage: 25, confidence: 81, strategy: "Positive fundamental outlook" }
    }
  };

  return recommendations[symbol as keyof typeof recommendations] || recommendations["AAPL"];
};

// Generate support/resistance levels
const generateSupportResistance = (_symbol: string, currentPrice: number) => {
  return {
    "7D": {
      resistance: [
        { level: currentPrice * 1.03, strength: "Strong", confidence: 85 },
        { level: currentPrice * 1.05, strength: "Moderate", confidence: 72 }
      ],
      support: [
        { level: currentPrice * 0.98, strength: "Strong", confidence: 88 },
        { level: currentPrice * 0.95, strength: "Very Strong", confidence: 92 }
      ]
    },
    "1M": {
      resistance: [
        { level: currentPrice * 1.08, strength: "Very Strong", confidence: 90 },
        { level: currentPrice * 1.12, strength: "Strong", confidence: 82 }
      ],
      support: [
        { level: currentPrice * 0.95, strength: "Strong", confidence: 85 },
        { level: currentPrice * 0.90, strength: "Very Strong", confidence: 93 }
      ]
    },
    "3M": {
      resistance: [
        { level: currentPrice * 1.15, strength: "Strong", confidence: 86 },
        { level: currentPrice * 1.22, strength: "Moderate", confidence: 75 }
      ],
      support: [
        { level: currentPrice * 0.92, strength: "Strong", confidence: 84 },
        { level: currentPrice * 0.85, strength: "Very Strong", confidence: 91 }
      ]
    },
    "6M": {
      resistance: [
        { level: currentPrice * 1.25, strength: "Moderate", confidence: 78 },
        { level: currentPrice * 1.35, strength: "Weak", confidence: 65 }
      ],
      support: [
        { level: currentPrice * 0.88, strength: "Strong", confidence: 82 },
        { level: currentPrice * 0.78, strength: "Very Strong", confidence: 89 }
      ]
    }
  };
};

export function AssetAnalysisCard({ asset, index, currentTier, onUpgrade }: AssetAnalysisCardProps) {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const [activeTimeframe, setActiveTimeframe] = useState("1M");

  // Determine what timeframes are available based on tier
  const hasAdvancedForecasts = currentTier === "pro" || currentTier === "premium";

  const forecastData = generateForecastData(asset.symbol, asset.currentPrice);
  const technicalIndicators = generateTechnicalIndicators(asset.symbol);
  const recommendations = generateRecommendations(asset.symbol);
  const supportResistance = generateSupportResistance(asset.symbol, asset.currentPrice);

  const currentForecast = forecastData.find(f => f.timeframe === activeTimeframe);
  const currentRecommendation = recommendations[activeTimeframe as keyof typeof recommendations];
  const currentLevels = supportResistance[activeTimeframe as keyof typeof supportResistance];

  const priceChange = ((currentForecast!.finalPrice - asset.currentPrice) / asset.currentPrice) * 100;
  const unrealizedGL = ((asset.currentPrice - asset.costBasis) / asset.costBasis) * 100;

  // Determine risk level
  const getRiskLevel = () => {
    if (technicalIndicators.rsi > 70 || technicalIndicators.rsi < 30) return { level: "High", color: "red" };
    if (technicalIndicators.rsi > 60 || technicalIndicators.rsi < 40) return { level: "Medium", color: "amber" };
    return { level: "Low", color: "green" };
  };

  const riskLevel = getRiskLevel();

  // Calculate stop loss and take profit
  const stopLoss = asset.currentPrice * 0.92;
  const takeProfit = asset.currentPrice * 1.15;

  return (
    <Card className="bg-card border-border overflow-hidden">
      {/* Header - Always Visible */}
      <div
        className="p-6 cursor-pointer hover:bg-accent/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            {/* Asset Icon */}
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>

            {/* Asset Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl text-foreground font-semibold">{asset.symbol}</h3>
                <Badge variant="secondary" className="bg-accent text-muted-foreground">
                  {asset.category}
                </Badge>
                <Badge
                  className={cn(
                    riskLevel.color === "red" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      riskLevel.color === "amber" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-green-500/10 text-green-400 border-green-500/20"
                  )}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {riskLevel.level} Risk
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground mb-3">{asset.name}</div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-foreground">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                  <div className="text-lg font-medium">${asset.currentPrice.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Holdings</div>
                  <div className="text-lg font-medium">{asset.holdings}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Unrealized G/L</div>
                  <div className={`text-lg font-medium ${unrealizedGL > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {unrealizedGL > 0 ? '+' : ''}{unrealizedGL.toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Forecast ({activeTimeframe})</div>
                  <div className={`text-lg font-medium flex items-center gap-1 ${priceChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {priceChange > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Expand Button */}
            <Button variant="ghost" size="icon" className="flex-shrink-0">
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border">
          <Tabs value={activeTimeframe} onValueChange={setActiveTimeframe} className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="bg-muted border border-border w-full">
                <TabsTrigger value="7D" className="flex-1">7 Days</TabsTrigger>
                <TabsTrigger
                  value="1M"
                  className="flex-1 relative"
                  disabled={!hasAdvancedForecasts}
                >
                  1 Month
                  {!hasAdvancedForecasts && <Lock className="w-3 h-3 ml-1 inline" />}
                </TabsTrigger>
                <TabsTrigger
                  value="3M"
                  className="flex-1 relative"
                  disabled={!hasAdvancedForecasts}
                >
                  3 Months
                  {!hasAdvancedForecasts && <Lock className="w-3 h-3 ml-1 inline" />}
                </TabsTrigger>
                <TabsTrigger
                  value="6M"
                  className="flex-1 relative"
                  disabled={!hasAdvancedForecasts}
                >
                  6 Months
                  {!hasAdvancedForecasts && <Lock className="w-3 h-3 ml-1 inline" />}
                </TabsTrigger>
              </TabsList>

              {!hasAdvancedForecasts && (
                <div className="mt-3 p-3 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="w-4 h-4 text-cyan-400" />
                      <span>Unlock 1M-6M forecasts with Pro</span>
                    </div>
                    <Button
                      onClick={onUpgrade}
                      size="sm"
                      className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600"
                    >
                      <Zap className="w-3 h-3" />
                      Upgrade
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {["7D", "1M", "3M", "6M"].map((tf) => (
              <TabsContent key={tf} value={tf} className="p-6 space-y-6">
                {/* Forecast Chart */}
                <Card className="bg-accent/20 border-border p-6">
                  <div className="flex items-center justify-between mb-4 text-foreground">
                    <h4 className="text-lg font-medium">Price Forecast & Prediction Bands</h4>
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20">
                      <Zap className="w-3 h-3 mr-1" />
                      {currentRecommendation.confidence}% Confidence
                    </Badge>
                  </div>

                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={currentForecast!.data}>
                        <defs>
                          <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="rangeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-primary)" />
                        <XAxis
                          dataKey="day"
                          stroke="#737373"
                          tick={{ fill: '#737373', fontSize: 12 }}
                        />
                        <YAxis
                          stroke="#737373"
                          tick={{ fill: '#737373', fontSize: 12 }}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border-primary)',
                            borderRadius: '8px',
                            color: 'var(--color-text-default)'
                          }}
                          formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
                        />
                        <Area
                          type="monotone"
                          dataKey="upper"
                          stroke="none"
                          fill="url(#rangeGradient)"
                          name="Upper Band"
                        />
                        <Area
                          type="monotone"
                          dataKey="lower"
                          stroke="none"
                          fill="url(#rangeGradient)"
                          name="Lower Band"
                        />
                        <Line
                          type="monotone"
                          dataKey="actual"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: '#10b981', r: 3 }}
                          name="Actual Price"
                        />
                        <Line
                          type="monotone"
                          dataKey="forecast"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={false}
                          name="Forecast"
                        />
                        <ReferenceLine
                          y={asset.currentPrice}
                          stroke="currentColor"
                          strokeDasharray="3 3"
                          className="text-muted-foreground/50"
                          label={{ value: 'Current', fill: 'currentColor', fontSize: 12, className: 'text-muted-foreground' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 rounded-lg bg-accent/30 border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">Predicted Price</div>
                      <div className="text-lg text-cyan-400 font-semibold">${currentForecast!.finalPrice.toLocaleString()}</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-accent/30 border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">Min Range</div>
                      <div className="text-lg text-purple-400 font-semibold">
                        ${currentForecast!.data[currentForecast!.data.length - 1].lower.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-accent/30 border border-border/50">
                      <div className="text-xs text-muted-foreground mb-1">Max Range</div>
                      <div className="text-lg text-purple-400 font-semibold">
                        ${currentForecast!.data[currentForecast!.data.length - 1].upper.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Technical Indicators */}
                  <Card className="bg-accent/20 border-border p-6">
                    <h4 className="text-lg mb-4 flex items-center gap-2 text-foreground font-medium">
                      <BarChart3 className="w-5 h-5 text-cyan-400" />
                      Technical Indicators
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">RSI (Relative Strength Index)</span>
                          <span className={cn(
                            "text-sm font-medium",
                            technicalIndicators.rsi > 70 ? "text-red-500" :
                              technicalIndicators.rsi < 30 ? "text-green-500" :
                                "text-amber-500"
                          )}>
                            {technicalIndicators.rsi}
                          </span>
                        </div>
                        <Progress value={technicalIndicators.rsi} max={100} className="h-2" />
                        <div className="text-xs text-muted-foreground/70 mt-1">
                          {technicalIndicators.rsi > 70 ? "Overbought - Consider selling" :
                            technicalIndicators.rsi < 30 ? "Oversold - Consider buying" :
                              "Neutral zone"}
                        </div>
                      </div>

                      <Separator className="bg-border" />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">MACD</div>
                          <div className={`text-lg font-semibold ${technicalIndicators.macd > 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {technicalIndicators.macd > 0 ? '+' : ''}{technicalIndicators.macd}
                          </div>
                          <div className="text-xs text-muted-foreground/70">
                            {technicalIndicators.macd > 0 ? 'Bullish momentum' : 'Bearish momentum'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Volume Spike</div>
                          <div className="text-lg text-cyan-500 font-semibold">
                            +{technicalIndicators.volumeSpike}%
                          </div>
                          <div className="text-xs text-muted-foreground/70">
                            {technicalIndicators.volumeSpike > 30 ? 'High activity' : 'Normal activity'}
                          </div>
                        </div>
                      </div>

                      <Separator className="bg-border" />

                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Moving Averages</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">EMA 20:</span>
                            <span className="text-cyan-500 font-medium">${technicalIndicators.ema20.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">EMA 50:</span>
                            <span className="text-cyan-500 font-medium">${technicalIndicators.ema50.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">SMA 100:</span>
                            <span className="text-blue-500 font-medium">${technicalIndicators.sma100.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">SMA 200:</span>
                            <span className="text-blue-500 font-medium">${technicalIndicators.sma200.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* AI Recommendation */}
                  <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-6">
                    <h4 className="text-lg mb-4 flex items-center gap-2 text-foreground font-medium">
                      <Zap className="w-5 h-5 text-purple-400" />
                      AI Recommendation
                    </h4>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Action</span>
                        <Badge
                          className={cn(
                            "text-lg px-4 py-1 border-none font-semibold",
                            currentRecommendation.action === "Buy" ? "bg-green-500/20 text-green-600 dark:text-green-400" :
                              currentRecommendation.action === "Sell" ? "bg-red-500/20 text-red-600 dark:text-red-400" :
                                currentRecommendation.action === "Hold" ? "bg-amber-500/20 text-amber-600 dark:text-amber-400" :
                                  "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                          )}
                        >
                          {currentRecommendation.action}
                          {currentRecommendation.percentage > 0 && ` ${currentRecommendation.percentage}%`}
                        </Badge>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Confidence Level</span>
                          <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">{currentRecommendation.confidence}%</span>
                        </div>
                        <Progress value={currentRecommendation.confidence} className="h-2" />
                      </div>

                      <Separator className="bg-border" />

                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Strategy</div>
                        <p className="text-sm text-foreground leading-relaxed">
                          {currentRecommendation.strategy}
                        </p>
                      </div>

                      <Separator className="bg-border" />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Stop Loss</div>
                          <div className="text-lg text-red-500 font-semibold">${stopLoss.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground/70">-8% from current</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Take Profit</div>
                          <div className="text-lg text-green-500 font-semibold">${takeProfit.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground/70">+15% from current</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Support & Resistance Levels */}
                <Card className="bg-accent/20 border-border p-6">
                  <h4 className="text-lg mb-4 flex items-center gap-2 text-foreground font-medium">
                    <Target className="w-5 h-5 text-cyan-400" />
                    Support & Resistance Zones
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Resistance Levels */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2 font-medium">
                        <TrendingUp className="w-4 h-4 text-red-500" />
                        Resistance Levels
                      </div>
                      <div className="space-y-3">
                        {currentLevels.resistance.map((level, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-lg text-red-600 dark:text-red-400 font-semibold">${level.level.toFixed(2)}</span>
                              <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 border-none text-xs">
                                {level.strength}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Confidence</span>
                              <span className="text-red-500 font-medium">{level.confidence}%</span>
                            </div>
                            <Progress value={level.confidence} className="h-1 mt-2" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Support Levels */}
                    <div>
                      <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2 font-medium">
                        <TrendingDown className="w-4 h-4 text-green-500" />
                        Support Levels
                      </div>
                      <div className="space-y-3">
                        {currentLevels.support.map((level, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-lg text-green-600 dark:text-green-400 font-semibold">${level.level.toFixed(2)}</span>
                              <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-none text-xs">
                                {level.strength}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Confidence</span>
                              <span className="text-green-500 font-medium">{level.confidence}%</span>
                            </div>
                            <Progress value={level.confidence} className="h-1 mt-2" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Risk Alerts */}
                {(technicalIndicators.rsi > 70 || technicalIndicators.rsi < 30 || technicalIndicators.volumeSpike > 30) && (
                  <Card className="bg-amber-500/10 border-amber-500/20 p-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-lg mb-2 text-amber-600 dark:text-amber-400 font-medium">Risk Alerts & Early Warnings</h4>
                        <ul className="space-y-2 text-sm text-foreground">
                          {technicalIndicators.rsi > 70 && (
                            <li className="flex items-start gap-2">
                              <span className="text-amber-500">•</span>
                              <span>RSI indicates overbought conditions ({technicalIndicators.rsi}). Consider taking profits or reducing position size.</span>
                            </li>
                          )}
                          {technicalIndicators.rsi < 30 && (
                            <li className="flex items-start gap-2">
                              <span className="text-amber-500">•</span>
                              <span>RSI indicates oversold conditions ({technicalIndicators.rsi}). Potential buying opportunity but verify trend.</span>
                            </li>
                          )}
                          {technicalIndicators.volumeSpike > 30 && (
                            <li className="flex items-start gap-2">
                              <span className="text-amber-500">•</span>
                              <span>High volume spike detected (+{technicalIndicators.volumeSpike}%). Significant price movement expected.</span>
                            </li>
                          )}
                          {Math.abs(technicalIndicators.macd) > 100 && (
                            <li className="flex items-start gap-2">
                              <span className="text-amber-500">•</span>
                              <span>Strong MACD divergence detected. Potential trend reversal approaching.</span>
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </Card>
  );
}
