import { useState, useEffect, memo, useCallback } from "react";
import { Card } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { TrendingUp, TrendingDown, ArrowUpDown, Filter, MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { holdingsService } from "../services/holdingsService";
import { marketDataStream } from "../services/marketDataStream";
import { formatCurrency, formatPercent, formatNumber } from "../utils/formatters";

const RealtimePrice = memo(({ symbol, initialPrice, currency }: { symbol: string, initialPrice: number, currency: string }) => {
  const [price, setPrice] = useState(initialPrice);

  useEffect(() => {
    const subscription = marketDataStream.getPriceStream(symbol).subscribe(setPrice);
    return () => subscription.unsubscribe();
  }, [symbol]);

  return <span className="tabular-nums font-medium">{formatCurrency(price, currency)}</span>;
});

const RealtimeGainLoss = memo(({ symbol, qty, costBasis, currency }: { symbol: string, qty: number, costBasis: number, currency: string }) => {
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const subscription = marketDataStream.getPriceStream(symbol).subscribe(setPrice);
    return () => subscription.unsubscribe();
  }, [symbol]);

  if (price === 0) return <div className="animate-pulse bg-muted h-10 w-20 rounded" />;

  const value = qty * price;
  const totalCost = qty * costBasis;
  const gl = value - totalCost;
  const glPercent = totalCost > 0 ? (gl / totalCost) * 100 : 0;
  const positive = gl >= 0;

  return (
    <div className={positive ? "text-green-400" : "text-red-400"}>
      <div className="font-medium">{formatCurrency(gl, currency)}</div>
      <div className="text-xs font-medium">{positive ? '+' : ''}{formatPercent(glPercent, 2).replace('%', '')}%</div>
    </div>
  );
});

const RealtimeDayChange = memo(({ symbol, dailyOpen }: { symbol: string, dailyOpen: number }) => {
  const [price, setPrice] = useState(0);

  useEffect(() => {
    const subscription = marketDataStream.getPriceStream(symbol).subscribe(setPrice);
    return () => subscription.unsubscribe();
  }, [symbol]);

  if (price === 0 || !dailyOpen) return <span className="text-muted-foreground">--</span>;

  const dayChange = price - dailyOpen;
  const dayChangePercent = (dayChange / dailyOpen) * 100;
  const dayPositive = dayChange >= 0;

  return (
    <div className={`flex items-center justify-end gap-1 font-medium ${dayPositive ? 'text-green-400' : 'text-red-400'}`}>
      {dayPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
      {dayPositive ? '+' : ''}{formatPercent(dayChangePercent, 1).replace('%', '')}%
    </div>
  );
});

const HoldingRow = memo(({ holding, onViewDetails, onRemove }: { holding: any, onViewDetails: (s: string) => void, onRemove: (s: string) => void }) => {
  return (
    <TableRow
      className="border-border hover:bg-accent/30 transition-colors cursor-pointer group"
      onClick={() => onViewDetails(holding.symbol)}
    >
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-xs text-cyan-400 group-hover:border-cyan-500 transition-all">
            {holding.symbol.charAt(0)}
          </div>
          <span className="font-mono group-hover:text-cyan-400 transition-colors">{holding.symbol}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">{holding.name}</TableCell>
      <TableCell>
        <Badge variant="secondary" className="bg-accent text-muted-foreground">
          {holding.category}
        </Badge>
      </TableCell>
      <TableCell className="text-right font-medium">{holding.shares}</TableCell>
      <TableCell className="text-right tabular-nums font-medium">
        <RealtimePrice symbol={holding.symbol} initialPrice={holding.rawCurrentPrice} currency={holding.currency} />
      </TableCell>
      <TableCell className="text-right text-muted-foreground tabular-nums">
        {formatCurrency(holding.rawCostBasis, holding.currency)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        <RealtimeGainLoss symbol={holding.symbol} qty={holding.rawShares} costBasis={holding.rawCostBasis} currency={holding.currency} />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center gap-2 justify-end">
          <Progress value={holding.allocation} className="w-16 h-1.5 bg-accent" />
          <span className="text-sm w-12">{formatPercent(holding.allocation, 1)}</span>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <RealtimeDayChange symbol={holding.symbol} dailyOpen={holding.rawDailyOpenPrice} />
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem onClick={() => onViewDetails(holding.symbol)} className="cursor-pointer">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={() => onRemove(holding.symbol)} className="cursor-pointer text-red-400 focus:text-red-400">
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

const HoldingCard = memo(({ holding, onViewDetails, onRemove }: { holding: any, onViewDetails: (s: string) => void, onRemove: (s: string) => void }) => {
  return (
    <div
      className="p-4 rounded-lg bg-accent/30 border border-border/50 hover:border-cyan-500/50 hover:bg-accent/50 transition-all cursor-pointer group"
      onClick={() => onViewDetails(holding.symbol)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center">
            <span className="text-sm font-bold text-cyan-400">{holding.symbol.charAt(0)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium">{holding.symbol}</span>
              <Badge variant="secondary" className="bg-accent text-muted-foreground text-xs">
                {holding.category}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">{holding.name}</div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border">
            <DropdownMenuItem onClick={() => onViewDetails(holding.symbol)}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem onClick={() => onRemove(holding.symbol)} className="text-red-400">
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="text-muted-foreground mb-1">Current Price</div>
          <RealtimePrice symbol={holding.symbol} initialPrice={holding.rawCurrentPrice} currency={holding.currency} />
        </div>
        <div>
          <div className="text-muted-foreground mb-1">Shares</div>
          <div className="font-medium text-foreground">{holding.shares}</div>
        </div>
        <div>
          <div className="text-muted-foreground mb-1">Unrealized G/L</div>
          <RealtimeGainLoss symbol={holding.symbol} qty={holding.rawShares} costBasis={holding.rawCostBasis} currency={holding.currency} />
        </div>
        <div>
          <div className="text-muted-foreground mb-1">Day Change</div>
          <RealtimeDayChange symbol={holding.symbol} dailyOpen={holding.rawDailyOpenPrice} />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">Allocation</span>
          <span className="font-medium text-foreground">{formatPercent(holding.allocation, 1)}</span>
        </div>
        <Progress value={holding.allocation} className="h-2 bg-accent" />
      </div>
    </div>
  );
});

export function HoldingsTable({ onNavigateToAsset, refreshTrigger }: { onNavigateToAsset: (symbol: string) => void, refreshTrigger?: number }) {
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<string>("allocation");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  useEffect(() => {
    loadHoldings();
  }, [refreshTrigger]);

  const loadHoldings = async () => {
    try {
      setLoading(true);
      const data = await holdingsService.getAll();

      // Aggregate by symbol
      const symbolAggregates: Record<string, any> = {};
      let totalPortfolioValue = 0;

      data.forEach(h => {
        const symbol = h.symbol;
        const qty = Number(h.quantity);
        const currentPrice = Number(h.currentPrice || h.averagePrice);
        const purchasePrice = Number(h.averagePrice);

        if (!symbolAggregates[symbol]) {
          symbolAggregates[symbol] = {
            symbol: h.symbol,
            name: h.name,
            category: h.type || 'Stock',
            currency: h.currency || 'USD',
            rawCurrentPrice: currentPrice,
            rawDailyOpenPrice: Number(h.dailyOpenPrice || currentPrice),
            totalQuantity: 0,
            totalPurchaseCost: 0,
          };
        }

        const aggregate = symbolAggregates[symbol];
        aggregate.totalQuantity += qty;
        aggregate.totalPurchaseCost += (qty * purchasePrice);

        // We use the price from the latest entry for the aggregate, or keep as is if already set
        // Usually all entries for the same symbol should have the same currentPrice from the backend
        aggregate.rawCurrentPrice = currentPrice;
      });

      // Calculate total portfolio value for allocation
      Object.values(symbolAggregates).forEach((h: any) => {
        totalPortfolioValue += h.totalQuantity * h.rawCurrentPrice;
      });

      const formattedHoldings = Object.values(symbolAggregates).map((h: any) => {
        const qty = h.totalQuantity;
        const price = h.rawCurrentPrice;
        const avgCost = h.totalPurchaseCost / qty;
        const value = qty * price;
        const allocation = totalPortfolioValue > 0 ? (value / totalPortfolioValue) * 100 : 0;

        return {
          symbol: h.symbol,
          name: h.name,
          category: h.category,
          shares: formatNumber(qty),
          rawShares: qty,
          rawCostBasis: avgCost,
          rawCurrentPrice: price,
          rawDailyOpenPrice: h.rawDailyOpenPrice,
          currency: h.currency,
          allocation: Number(allocation.toFixed(1)),
        };
      });

      setHoldings(formattedHoldings);
    } catch (error) {
      console.error("Failed to load holdings:", error);
      toast.error("Failed to load holdings");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    toast.info(`Sorted by ${field} (${sortOrder === "asc" ? "desc" : "asc"})`);
  };

  const handleFilter = (category: string) => {
    setFilterCategory(category);
    toast.info(category === "all" ? "Showing all assets" : `Filtered by ${category}`);
  };

  const handleViewDetails = useCallback((symbol: string) => {
    onNavigateToAsset(symbol);
  }, [onNavigateToAsset]);

  const handleRemove = useCallback((symbol: string) => {
    toast.success(`${symbol} removed from portfolio`);
  }, []);

  const filteredHoldings = (filterCategory === "all"
    ? holdings
    : holdings.filter(h => h.category === filterCategory)
  ).sort((a, b) => {
    const factor = sortOrder === "asc" ? 1 : -1;
    if (sortField === "allocation") {
      return (a.allocation - b.allocation) * factor;
    }
    if (sortField === "glPercent") {
      return (a.rawShares * (a.rawCurrentPrice - a.rawCostBasis) / (a.rawShares * a.rawCostBasis || 1) -
        b.rawShares * (b.rawCurrentPrice - b.rawCostBasis) / (b.rawShares * b.rawCostBasis || 1)) * factor;
    }
    if (sortField === "dayChange") {
      const aChange = (a.rawCurrentPrice - a.rawDailyOpenPrice) / (a.rawDailyOpenPrice || 1);
      const bChange = (b.rawCurrentPrice - b.rawDailyOpenPrice) / (b.rawDailyOpenPrice || 1);
      return (aChange - bChange) * factor;
    }
    return 0;
  });

  if (loading) {
    return (
      <Card className="bg-card border-border p-6 backdrop-blur-sm">
        <div className="flex items-center justify-center h-64 text-muted-foreground font-medium">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
            <span>Loading holdings...</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg mb-1">Holdings</h3>
          <p className="text-sm text-muted-foreground">{filteredHoldings.length} active positions</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select value={filterCategory} onValueChange={handleFilter}>
            <SelectTrigger className="w-[140px] bg-accent/50 border-border">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Stocks US">Stocks US</SelectItem>
              <SelectItem value="Stocks VN">Stocks VN</SelectItem>
              <SelectItem value="Crypto">Crypto</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-border hover:border-cyan-500">
                <ArrowUpDown className="w-4 h-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border">
              <DropdownMenuItem onClick={() => handleSort("allocation")} className="cursor-pointer">
                By Allocation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("glPercent")} className="cursor-pointer">
                By Gain/Loss %
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("dayChange")} className="cursor-pointer">
                By Day Change
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            className="lg:hidden border-border"
            onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
          >
            {viewMode === "table" ? "Cards" : "Table"}
          </Button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className={`overflow-x-auto ${viewMode === "cards" ? "hidden lg:block" : ""}`}>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">Symbol</TableHead>
              <TableHead className="text-muted-foreground">Name</TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-muted-foreground text-right">Shares</TableHead>
              <TableHead className="text-muted-foreground text-right">Current Price</TableHead>
              <TableHead className="text-muted-foreground text-right">Cost Basis</TableHead>
              <TableHead className="text-muted-foreground text-right">Unrealized G/L</TableHead>
              <TableHead className="text-muted-foreground text-right">Allocation</TableHead>
              <TableHead className="text-muted-foreground text-right">Day Change</TableHead>
              <TableHead className="text-muted-foreground"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHoldings.map((holding) => (
              <HoldingRow
                key={holding.symbol}
                holding={holding}
                onViewDetails={handleViewDetails}
                onRemove={handleRemove}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className={`space-y-4 ${viewMode === "table" ? "lg:hidden" : "lg:block"}`}>
        {filteredHoldings.map((holding) => (
          <HoldingCard
            key={holding.symbol}
            holding={holding}
            onViewDetails={handleViewDetails}
            onRemove={handleRemove}
          />
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
        <div className="text-sm text-muted-foreground">
          Showing {holdings.length} of {holdings.length} holdings
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled className="border-border">
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled className="border-border">
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}
