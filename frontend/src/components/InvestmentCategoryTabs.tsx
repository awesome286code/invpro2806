import { useState, useEffect, memo, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { toast } from "sonner";
import { holdingsService } from "../services/holdingsService";
import { marketDataStream } from "../services/marketDataStream";
import { formatCurrency, formatPercent, formatCompactNumber } from "../utils/formatters";

const RealtimeMarketPrice = memo(({ symbol, initialPrice, currency }: { symbol: string, initialPrice: number, currency: string }) => {
  const [price, setPrice] = useState(initialPrice);

  useEffect(() => {
    const subscription = marketDataStream.getPriceStream(symbol).subscribe(setPrice);
    return () => subscription.unsubscribe();
  }, [symbol]);

  return (
    <div className="text-lg font-mono font-semibold text-foreground mb-0.5">
      {formatCurrency(price, currency)}
    </div>
  );
});

const RealtimeMarketChange = memo(({ symbol, dailyOpen }: { symbol: string, dailyOpen: number }) => {
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const subscription = marketDataStream.getPriceStream(symbol).subscribe(setPrice);
    return () => subscription.unsubscribe();
  }, [symbol]);

  if (price === 0 || !dailyOpen) return <div className="text-sm text-muted-foreground font-bold">--</div>;

  const dayChange = price - dailyOpen;
  const dayChangePercent = (dayChange / dailyOpen) * 100;
  const dayPositive = dayChange >= 0;

  return (
    <div className={`flex items-center justify-end gap-1 text-sm font-bold ${dayPositive ? 'text-green-400' : 'text-red-400'}`}>
      {dayPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      {dayPositive ? '+' : ''}{formatPercent(dayChangePercent, 1).replace('%', '')}%
    </div>
  );
});

const MarketAssetCard = memo(({ initialItem, onClick }: { initialItem: any, onClick: () => void }) => {
  const volume = initialItem.purchasedVolume;

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-xl bg-card/40 border border-border/50 hover:border-cyan-500/30 hover:bg-accent/40 transition-all duration-200 cursor-pointer group shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-accent/50 border border-border/30 flex items-center justify-center group-hover:border-cyan-500/40 group-hover:bg-cyan-500/5 transition-all">
          <Activity className="w-6 h-6 text-cyan-400/80 group-hover:text-cyan-400 transition-colors" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-foreground font-semibold tracking-tight">{initialItem.symbol}</span>
            <span className="text-xs text-muted-foreground font-medium">· {initialItem.name}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1 font-medium">Vol: {formatCompactNumber(volume)}</div>
        </div>
      </div>

      <div className="text-right">
        <RealtimeMarketPrice
          symbol={initialItem.symbol}
          initialPrice={initialItem.rawPrice}
          currency={initialItem.currency || 'USD'}
        />
        <RealtimeMarketChange
          symbol={initialItem.symbol}
          dailyOpen={initialItem.rawDailyOpenPrice}
        />
      </div>
    </div>
  );
});

export function InvestmentCategoryTabs({ onNavigateToAsset, refreshTrigger }: { onNavigateToAsset: (symbol: string) => void, refreshTrigger?: number }) {
  const [activeTab, setActiveTab] = useState("all");
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<Record<string, any[]>>({});

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    try {
      const data = await holdingsService.getAll();

      // Aggregate by symbol
      const symbolAggregates: Record<string, any> = {};

      data.forEach(h => {
        const symbol = h.symbol;
        if (!symbolAggregates[symbol]) {
          symbolAggregates[symbol] = {
            symbol: h.symbol,
            name: h.name,
            type: h.type,
            sector: h.sector,
            currency: h.currency,
            rawPrice: Number(h.currentPrice),
            rawDailyOpenPrice: Number(h.dailyOpenPrice),
            totalPurchaseCost: 0,
            totalQuantity: 0,
          };
        }

        symbolAggregates[symbol].totalPurchaseCost += Number(h.averagePrice) * Number(h.quantity);
        symbolAggregates[symbol].totalQuantity += Number(h.quantity);
      });

      // Group by category
      const grouped: Record<string, any[]> = {
        "all": [],
        "stock": [],
        "crypto": [],
        "funds": [],
      };

      Object.values(symbolAggregates).forEach(h => {
        const type = h.type ? h.type.toLowerCase() : 'stock';
        const sector = (h.sector || '').toLowerCase();
        const avgPurchasePrice = h.totalQuantity > 0 ? h.totalPurchaseCost / h.totalQuantity : 0;

        const item = {
          symbol: h.symbol,
          name: h.name,
          currency: h.currency,
          rawPrice: h.rawPrice,
          rawDailyOpenPrice: h.rawDailyOpenPrice,
          purchasePrice: avgPurchasePrice,
          purchasedVolume: h.totalQuantity
        };

        grouped["all"].push(item);

        if (type === 'crypto') {
          grouped["crypto"].push(item);
        } else if (type === 'etf' || type === 'fund' || sector.includes('fund')) {
          grouped["funds"].push(item);
        } else {
          grouped["stock"].push(item);
        }
      });

      setCategoryData(grouped);

      const tabs = [
        { id: "all", label: "All Assets", count: grouped["all"].length },
        { id: "stock", label: "Stocks", count: grouped["stock"].length },
        { id: "crypto", label: "Crypto", count: grouped["crypto"].length },
        { id: "funds", label: "Funds", count: grouped["funds"].length },
      ];

      setCategories(tabs.filter(t => t.count > 0));
      if (activeTab === "all" && tabs.find(t => t.id === "all")?.count === 0) {
        const firstActive = tabs.find(t => t.count > 0);
        if (firstActive) setActiveTab(firstActive.id);
      }

    } catch (error) {
      console.error("Failed to load category data:", error);
      toast.error("Failed to load market cards");
    }
  };

  const handleAssetClick = useCallback((symbol: string) => {
    onNavigateToAsset(symbol);
  }, [onNavigateToAsset]);

  if (categories.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card/40 border border-border rounded-2xl">
        <Activity className="w-10 h-10 mx-auto mb-4 opacity-20 animate-pulse" />
        <p className="font-medium">Loading investment data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-card/40 border border-border/60 p-1.5 h-auto rounded-full gap-1 mb-8">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={cat.id}
              className="rounded-full px-6 py-2.5 text-sm font-semibold transition-all data-[state=active]:bg-accent data-[state=active]:text-cyan-400 data-[state=active]:shadow-lg border border-transparent data-[state=active]:border-border/50 hover:text-muted-foreground"
            >
              <div className="flex items-center gap-2.5">
                {cat.label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === cat.id ? 'bg-cyan-500/20 text-cyan-300' : 'bg-accent text-muted-foreground'}`}>
                  {cat.count}
                </span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id} className="mt-0 focus-visible:outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {categoryData[cat.id]?.map((item) => (
                <MarketAssetCard
                  key={item.symbol}
                  initialItem={item}
                  onClick={() => handleAssetClick(item.symbol)}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
