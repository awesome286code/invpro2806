import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { TrendingUp, FolderOpen, Check } from "lucide-react";
import { cn } from "./ui/utils";
import { transactionsService } from "../services/transactionsService";
import { portfoliosService, Portfolio } from "../services/portfoliosService";
import { assetsService, Asset } from "../services/assetsService";
import { formatCompactNumber } from "@/utils/formatters";

interface AddInvestmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioId?: string;
  onSuccess?: () => void;
}

// Map category values to asset types and currencies
const CATEGORY_TO_TYPE_MAP: Record<string, { type: string; currency?: string }> = {
  "stocks-vn": { type: "stock", currency: "VND" },
  "stocks-us": { type: "stock", currency: "USD" },
  "crypto": { type: "crypto" },
  "real-estate": { type: "real_estate" },
  "funds": { type: "fund" },
  "bonds": { type: "bond" },
  "others": { type: "other" },
};

export function AddInvestmentDialog({ open, onOpenChange, portfolioId, onSuccess }: AddInvestmentDialogProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assetSearchOpen, setAssetSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [formData, setFormData] = useState({
    category: "",
    shares: "",
    price: "",
  });

  // Normalize text for search (remove accents, lowercase, trim)
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove accents
  };

  // Rank and filter assets based on search query
  const rankAssets = (query: string, assetList: Asset[]): Asset[] => {
    if (!query || query.length < 2) return assetList;

    const normalizedQuery = normalizeText(query);

    const scored = assetList.map(asset => {
      const normalizedSymbol = normalizeText(asset.symbol);
      const normalizedName = normalizeText(asset.name);

      let score = 0;

      // Exact match (highest priority)
      if (normalizedSymbol === normalizedQuery || normalizedName === normalizedQuery) {
        score = 1000;
      }
      // Prefix match (high priority)
      else if (normalizedSymbol.startsWith(normalizedQuery)) {
        score = 500;
      }
      else if (normalizedName.startsWith(normalizedQuery)) {
        score = 400;
      }
      // Contains match (lower priority)
      else if (normalizedSymbol.includes(normalizedQuery)) {
        score = 200;
      }
      else if (normalizedName.includes(normalizedQuery)) {
        score = 100;
      }

      return { asset, score };
    });

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10) // Limit to 10 results
      .map(item => item.asset);
  };

  // Debounced search
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
    }, 250); // 250ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, assets]);

  useEffect(() => {
    if (open) {
      console.log('[AddInvestmentDialog] Dialog opened with portfolioId:', portfolioId);

      // Load portfolios first
      loadPortfolios();

      // Reset form
      setFormData({ category: "", shares: "", price: "" });
      setSelectedAsset(null);
      setAssets([]);
      setSearchQuery("");
    }
  }, [open]);

  // Set selectedPortfolioId after portfolios are loaded
  useEffect(() => {
    if (portfolios.length > 0 && portfolioId) {
      console.log('[AddInvestmentDialog] Portfolios loaded, setting selectedPortfolioId to:', portfolioId);
      setSelectedPortfolioId(portfolioId);
    } else if (!portfolioId) {
      setSelectedPortfolioId("");
    }
  }, [portfolios, portfolioId]);

  // Load assets when category changes
  useEffect(() => {
    if (formData.category) {
      loadAssetsByCategory(formData.category);
    } else {
      setAssets([]);
      setSelectedAsset(null);
      setFilteredAssets([]);
    }
  }, [formData.category]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-asset-search]')) {
        setAssetSearchOpen(false);
      }
    };

    if (assetSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [assetSearchOpen]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!assetSearchOpen || filteredAssets.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredAssets.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredAssets.length) % filteredAssets.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredAssets[selectedIndex]) {
          setSelectedAsset(filteredAssets[selectedIndex]);
          setAssetSearchOpen(false);
          setSearchQuery("");
        }
        break;
      case 'Escape':
        e.preventDefault();
        setAssetSearchOpen(false);
        break;
    }
  };

  const loadPortfolios = async (): Promise<void> => {
    try {
      console.log('[AddInvestmentDialog] Loading portfolios...');
      const data = await portfoliosService.getAll();
      console.log('[AddInvestmentDialog] Portfolios loaded:', data);

      if (Array.isArray(data)) {
        const activePortfolios = data.filter(p => p.status === 'active');
        console.log('[AddInvestmentDialog] Active portfolios:', activePortfolios);
        setPortfolios(activePortfolios);
      } else {
        console.error('Portfolios data is not an array:', data);
        setPortfolios([]);
      }
    } catch (error) {
      console.error('Failed to load portfolios:', error);
      setPortfolios([]);
    }
  };

  const loadAssetsByCategory = async (category: string) => {
    try {
      console.log('[AddInvestmentDialog] Loading assets for category:', category);
      const categoryConfig = CATEGORY_TO_TYPE_MAP[category];
      if (!categoryConfig) {
        console.error('Unknown category:', category);
        setAssets([]);
        setFilteredAssets([]);
        return;
      }

      console.log('[AddInvestmentDialog] Category config:', categoryConfig);
      const data = await assetsService.getByType(categoryConfig.type, categoryConfig.currency);
      console.log('[AddInvestmentDialog] Received data:', data);
      console.log('[AddInvestmentDialog] Is array?', Array.isArray(data));
      console.log('[AddInvestmentDialog] Data length:', data?.length);

      if (Array.isArray(data)) {
        setAssets(data);
        setFilteredAssets(data.slice(0, 10)); // Initial 10 items
        console.log('[AddInvestmentDialog] Assets set successfully, count:', data.length);
      } else {
        console.error('Assets data is not an array:', data);
        setAssets([]);
        setFilteredAssets([]);
      }
    } catch (error) {
      console.error('Failed to load assets:', error);
      toast.error("Failed to load assets");
      setAssets([]);
      setFilteredAssets([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPortfolioId || !formData.category || !selectedAsset || !formData.shares || !formData.price) {
      toast.error(!selectedPortfolioId ? "Please select a portfolio" : !formData.category ? "Please select a category" : !selectedAsset ? "Please select an asset" : "Please fill in all required fields");
      return;
    }

    try {
      await transactionsService.create({
        type: 'buy',
        amount: parseFloat(formData.shares) * parseFloat(formData.price),
        quantity: parseFloat(formData.shares),
        price: parseFloat(formData.price),
        symbol: selectedAsset.symbol,
        assetName: selectedAsset.name,
        investmentId: undefined,
        portfolioId: selectedPortfolioId,
        status: 'completed',
        transactionDate: new Date().toISOString(),
      });

      toast.success(`Successfully added ${formData.shares} shares of ${selectedAsset.symbol}!`);
      onOpenChange(false);
      onSuccess?.();

      // Reset form
      setFormData({ category: "", shares: "", price: "" });
      setSelectedAsset(null);
    } catch (error) {
      console.error('Failed to add investment:', error);
      toast.error("Failed to add investment. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <DialogTitle className="text-xl text-foreground">Add New Investment</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            Add a new asset to your investment portfolio
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio *</Label>
            <Select
              value={selectedPortfolioId}
              onValueChange={setSelectedPortfolioId}
              disabled={!!portfolioId}
            >
              <SelectTrigger className="bg-background border-input focus:border-cyan-500">
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-cyan-400/70" />
                  <SelectValue placeholder="Select a portfolio" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-foreground">
                {Array.isArray(portfolios) && portfolios.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Investment Category *</Label>
            <Select value={formData.category} onValueChange={(value: string) => setFormData({ ...formData, category: value })}>
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
                  <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-[300px] overflow-auto">
                    {filteredAssets.map((asset, index) => {
                      const isSelected = index === selectedIndex;
                      const isChosen = selectedAsset?.id === asset.id;

                      // Highlight matching text
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
                          <span className="font-mono text-cyan-400 font-medium">
                            {highlightText(asset.symbol)}
                          </span>
                          <span className="text-muted-foreground">-</span>
                          <span className="text-foreground text-sm">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shares">Quantity/Shares *</Label>
              <Input
                id="shares"
                type="number"
                step="0.0001"
                placeholder="0.00"
                value={formData.shares}
                onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                className="bg-background border-input focus:border-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Purchase Price *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="bg-background border-input focus:border-cyan-500"
              />
            </div>
          </div>

          {formData.shares && formData.price && (
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <div className="text-sm text-muted-foreground mb-1">Total Investment</div>
              <div className="text-2xl text-cyan-400">
                ${formatCompactNumber(parseFloat(formData.shares) * parseFloat(formData.price))}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
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
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              Add Investment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
