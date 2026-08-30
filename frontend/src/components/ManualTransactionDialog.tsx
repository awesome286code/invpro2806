import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { toast } from "sonner";
import { CalendarIcon, TrendingUp, DollarSign, FileText, Check } from "lucide-react";
import { format } from "date-fns";
import { cn } from "./ui/utils";
import { transactionsService } from "../services/transactionsService";
import { assetsService, Asset } from "../services/assetsService";
import { portfoliosService, Portfolio } from "../services/portfoliosService";
import { formatCurrency } from "../utils/formatters";

interface ManualTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionAdded: (transaction: any) => void;
  portfolioId?: string;
}

export interface Transaction {
  id: string;
  symbol: string;
  assetName: string;
  category: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  totalValue: number;
  date: Date;
  notes: string;
  portfolio: string;
  fees?: number;
}

// Category to type mapping
const CATEGORY_TO_TYPE_MAP: Record<string, { type: string; currency?: string }> = {
  "stocks-vn": { type: "stock", currency: "VND" },
  "stocks-us": { type: "stock", currency: "USD" },
  "crypto": { type: "crypto" },
  "real-estate": { type: "real_estate" },
  "funds": { type: "fund" },
  "bonds": { type: "bond" },
  "others": { type: "other" },
};

export function ManualTransactionDialog({ open, onOpenChange, onTransactionAdded, portfolioId }: ManualTransactionDialogProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");
  const [assetSearchOpen, setAssetSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [formData, setFormData] = useState({
    category: "",
    type: "buy" as "buy" | "sell" | "dividend" | "split" | "transfer" | "fee" | "deposit" | "withdraw",
    quantity: "",
    price: "",
    amount: "", // Direct amount for non-trade types
    fees: "",
    notes: "",
  });

  const isTradeType = ["buy", "sell", "split"].includes(formData.type);

  const calculateTotal = () => {
    if (isTradeType) {
      if (formData.quantity && formData.price) {
        return parseFloat(formData.quantity) * parseFloat(formData.price);
      }
      return 0;
    }
    return formData.amount ? parseFloat(formData.amount) : 0;
  };

  const totalValue = calculateTotal();

  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  const rankAssets = (query: string, assetList: Asset[]): Asset[] => {
    const normalizedQuery = normalizeText(query);
    if (!normalizedQuery) return assetList.slice(0, 10);

    return assetList
      .map(asset => {
        let score = 0;
        const normalizedSymbol = normalizeText(asset.symbol);
        const normalizedName = normalizeText(asset.name);

        if (normalizedSymbol === normalizedQuery || normalizedName === normalizedQuery) score += 1000;
        else if (normalizedSymbol.startsWith(normalizedQuery)) score += 500;
        else if (normalizedName.startsWith(normalizedQuery)) score += 400;
        else if (normalizedSymbol.includes(normalizedQuery)) score += 200;
        else if (normalizedName.includes(normalizedQuery)) score += 100;

        return { asset, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.asset)
      .slice(0, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredAssets.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredAssets.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredAssets.length) % filteredAssets.length);
    } else if (e.key === 'Enter' && assetSearchOpen) {
      e.preventDefault();
      if (filteredAssets[selectedIndex]) {
        setSelectedAsset(filteredAssets[selectedIndex]);
        setAssetSearchOpen(false);
        setSearchQuery("");
      }
    } else if (e.key === 'Escape') {
      setAssetSearchOpen(false);
    }
  };

  const loadAssetsByCategory = async (category: string) => {
    setIsLoading(true);
    try {
      const config = CATEGORY_TO_TYPE_MAP[category];
      if (config) {
        const data = await assetsService.getByType(config.type, config.currency);
        setAssets(data);
        setFilteredAssets(data.slice(0, 10));
      } else {
        setAssets([]);
        setFilteredAssets([]);
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
      toast.error('Failed to load assets for this category');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPortfolios = async () => {
    try {
      const data = await portfoliosService.getAll();
      const active = data.filter(p => p.status === 'active');
      setPortfolios(active);
    } catch (error) {
      console.error('Failed to load portfolios:', error);
    }
  };

  useEffect(() => {
    if (open) {
      setFormData({
        category: "",
        type: "buy",
        quantity: "",
        price: "",
        amount: "",
        fees: "",
        notes: "",
      });
      setSelectedAsset(null);
      // Pre-fill portfolioId if provided, otherwise empty
      setSelectedPortfolioId(portfolioId || "");
      setAssets([]);
      setSearchQuery("");
      setDate(new Date());
      loadPortfolios();
    }
  }, [open, portfolioId]);

  useEffect(() => {
    if (formData.category) {
      loadAssetsByCategory(formData.category);
    } else {
      setAssets([]);
      setSelectedAsset(null);
      setFilteredAssets([]);
    }
  }, [formData.category]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setFilteredAssets(assets.slice(0, 10));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      const ranked = rankAssets(searchQuery, assets);
      setFilteredAssets(ranked);
      setIsLoading(false);
      setSelectedIndex(0);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, assets]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-asset-search]')) {
        setAssetSearchOpen(false);
      }
    };

    if (assetSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [assetSearchOpen]);

  const totalWithFees = formData.fees
    ? (isTradeType ? totalValue + parseFloat(formData.fees) : totalValue - parseFloat(formData.fees))
    // Logic: For buy, fees add to cost. For sell/income, fees reduce proceeds? 
    // Actually, usually Amount is the main value. Fees are separate. 
    // Let's keep it simple: "Amount" is the transaction value. Fees are extra info or subtracted depending on context.
    // For standardizing: Backend expects 'amount' and 'fees'.
    : totalValue;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const isTrade = ["buy", "sell"].includes(formData.type);
    if (!selectedPortfolioId || !formData.category || (!formData.amount && (!formData.quantity || !formData.price))) {
      if (!selectedPortfolioId) {
        toast.error("Please select a portfolio");
        return;
      }
      if (!formData.category) {
        toast.error("Please select a category");
        return;
      }

      if (isTrade && (!selectedAsset || !formData.quantity || !formData.price)) {
        toast.error("Please fill in Asset, Quantity, and Price");
        return;
      }
      if (!isTrade && !formData.amount) {
        if (!selectedAsset && ["dividend", "split"].includes(formData.type)) {
          toast.error("Please select an Asset");
          return;
        }
        if (!formData.amount && !["split"].includes(formData.type)) {
          toast.error("Please fill in Amount");
          return;
        }
      }
    }

    const transactionDto: any = {
      symbol: selectedAsset?.symbol.toUpperCase(),
      assetName: selectedAsset?.name,
      portfolioId: selectedPortfolioId,
      type: formData.type,
      quantity: formData.quantity ? parseFloat(formData.quantity) : undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
      amount: totalValue || (formData.amount ? parseFloat(formData.amount) : 0),
      fees: formData.fees ? parseFloat(formData.fees) : 0,
      transactionDate: date.toISOString(),
      notes: formData.notes,
      status: 'completed',
    };

    try {
      await transactionsService.create(transactionDto);
      toast.success("Transaction recorded successfully!");
      onTransactionAdded({ ...transactionDto, id: 'temp' });
      onOpenChange(false);
      setFormData({
        category: "",
        type: "buy",
        quantity: "",
        price: "",
        amount: "",
        fees: "",
        notes: "",
      });
      setSelectedAsset(null);
      setSelectedPortfolioId("");
      setSearchQuery("");
      setDate(new Date());
    } catch (error) {
      console.error("Transaction failed", error);
      toast.error("Failed to record transaction");
    }
  };

  // const updateHoldings = ... (Removed as backend handles it)


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <DialogTitle className="text-xl text-foreground">Record Transaction</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Manually add a buy or sell transaction to your portfolio
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Transaction Type *</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="bg-background border-input focus:border-cyan-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-foreground">
                <SelectItem value="buy">Buy / Purchase</SelectItem>
                <SelectItem value="sell">Sell / Dispose</SelectItem>
                <SelectItem value="dividend">Dividend / Income</SelectItem>
                <SelectItem value="fee">Fee / Expense</SelectItem>
                <SelectItem value="split">Stock Split</SelectItem>
                <SelectItem value="transfer">Transfer</SelectItem>
                <SelectItem value="deposit">Deposit (Cash)</SelectItem>
                <SelectItem value="withdraw">Withdraw (Cash)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value: string) => {
                setFormData({ ...formData, category: value });
                setSelectedAsset(null);
                setSearchQuery("");
              }}
            >
              <SelectTrigger className="bg-background border-input focus:border-cyan-500">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-foreground">
                <SelectItem value="stocks-vn">Stocks VN</SelectItem>
                <SelectItem value="stocks-us">Stocks US</SelectItem>
                <SelectItem value="crypto">Cryptocurrency</SelectItem>
                <SelectItem value="real-estate">Real Estate</SelectItem>
                <SelectItem value="funds">Funds</SelectItem>
                <SelectItem value="bonds">Bonds</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Asset Search */}
          {formData.category && (
            <div className="space-y-2" data-asset-search>
              <Label htmlFor="asset-search">
                Asset *
                {searchQuery.length > 0 && searchQuery.length < 2 && (
                  <span className="text-xs text-muted-foreground ml-2">(type at least 2 characters)</span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="asset-search"
                  type="text"
                  placeholder="Search asset (e.g. AAPL, BTC)..."
                  className="bg-accent/50 border-input focus:border-cyan-500 pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setAssetSearchOpen(true)}
                  onKeyDown={handleKeyDown}
                  autoComplete="off"
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
                  </div>
                )}

                {assetSearchOpen && filteredAssets.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-[200px] overflow-auto">
                    {filteredAssets.map((asset, index) => {
                      const isSelected = index === selectedIndex;
                      const isChosen = selectedAsset?.id === asset.id;

                      const highlightText = (text: string) => {
                        if (!searchQuery || searchQuery.length < 2) return text;
                        const regex = new RegExp(`(${searchQuery})`, 'gi');
                        const parts = text.split(regex);
                        return parts.map((part, i) =>
                          regex.test(part) ?
                            <mark key={i} className="bg-cyan-500/30 text-cyan-300">{part}</mark> :
                            part
                        );
                      };

                      return (
                        <div
                          key={asset.id}
                          onClick={() => {
                            setSelectedAsset(asset);
                            setAssetSearchOpen(false);
                            setSearchQuery("");
                          }}
                          className={cn(
                            "cursor-pointer px-3 py-2 flex items-center gap-2 transition-colors",
                            isSelected && "bg-accent",
                            isChosen && "bg-cyan-500/10",
                            !isSelected && !isChosen && "hover:bg-accent/50"
                          )}
                        >
                          <Check
                            className={cn(
                              "h-4 w-4 flex-shrink-0",
                              isChosen ? "opacity-100 text-cyan-400" : "opacity-0"
                            )}
                          />
                          <span className="font-mono text-cyan-400 font-medium whitespace-nowrap">
                            {highlightText(asset.symbol)}
                          </span>
                          <span className="text-muted-foreground flex-shrink-0">-</span>
                          <span className="text-foreground text-sm truncate">
                            {highlightText(asset.name)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {assetSearchOpen && filteredAssets.length === 0 && searchQuery.length >= 2 && !isLoading && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-lg p-4 text-center text-sm text-muted-foreground">
                    No results found for "{searchQuery}"
                  </div>
                )}
              </div>

              {selectedAsset && (
                <div className="flex items-center gap-2 p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                  <Check className="h-4 w-4 text-cyan-400 flex-shrink-0" />
                  <span className="font-mono text-cyan-400 font-medium">{selectedAsset.symbol}</span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-foreground text-sm truncate">{selectedAsset.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAsset(null);
                      setSearchQuery("");
                    }}
                    className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Portfolio */}
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio *</Label>
            <Select value={selectedPortfolioId} onValueChange={(value: string) => setSelectedPortfolioId(value)}>
              <SelectTrigger className="bg-background border-input focus:border-cyan-500">
                <SelectValue placeholder="Select portfolio" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-foreground">
                {portfolios.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quantity and Price OR Amount */}
          {isTradeType ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity / Shares *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.0001"
                  placeholder="0.00"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="bg-background border-input focus:border-cyan-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price per Unit *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="pl-10 bg-background border-input focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="pl-10 bg-accent/50 border-input focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* Fees and Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fees">Transaction Fees</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="fees"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.fees}
                  onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
                  className="pl-10 bg-background border-input focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Transaction Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-accent/50 border-input hover:bg-accent",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate: Date | undefined) => newDate && setDate(newDate)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this transaction..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="pl-10 bg-background border-input focus:border-cyan-500 min-h-[80px]"
              />
            </div>
          </div>

          {/* Summary */}
          {(formData.amount || (formData.quantity && formData.price)) && (
            <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction Value:</span>
                  <span className="text-foreground">{formatCurrency(totalValue)}</span>
                </div>
                {formData.fees && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fees:</span>
                    <span className="text-foreground">{formatCurrency(parseFloat(formData.fees))}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-border flex justify-between">
                  <span className="text-foreground">Total Impact:</span>
                  <span className={`text-xl ${["buy", "withdraw", "fee"].includes(formData.type) ? "text-red-400" : "text-green-400"}`}>
                    {formatCurrency(totalWithFees)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border hover:bg-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={cn(
                "gap-2",
                ["buy", "deposit", "dividend"].includes(formData.type)
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  : "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
              )}
            >
              <TrendingUp className="w-4 h-4" />
              Record {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
