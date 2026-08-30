import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Briefcase } from "lucide-react";
import { portfoliosService, Portfolio } from "../services/portfoliosService";

interface EditPortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  portfolio: Portfolio | null;
  onSuccess?: () => void;
}

const allocationCategories = [
  { id: "stocks-vn", label: "Stocks VN", current: 33 },
  { id: "stocks-us", label: "Stocks US", current: 28 },
  { id: "crypto", label: "Crypto", current: 20 },
  { id: "real-estate", label: "Real Estate", current: 12 },
  { id: "funds", label: "Funds", current: 5 },
  { id: "others", label: "Others", current: 2 },
];

export function EditPortfolioDialog({ open, onOpenChange, portfolio, onSuccess }: EditPortfolioDialogProps) {
  const [portfolioName, setPortfolioName] = useState("");
  const [objective, setObjective] = useState<any>("growth");
  const [timeHorizon, setTimeHorizon] = useState<any>("long");
  const [riskProfile, setRiskProfile] = useState<any>("aggressive");
  const [baseCurrency, setBaseCurrency] = useState("USD");
  const [benchmark, setBenchmark] = useState("SPY");
  const [targetValue, setTargetValue] = useState("333700");
  const [allocations, setAllocations] = useState(
    allocationCategories.reduce((acc, cat) => ({ ...acc, [cat.id]: cat.current }), {} as Record<string, number>)
  );

  useEffect(() => {
    if (portfolio) {
      setPortfolioName(portfolio.name);
      setObjective(portfolio.objective || "growth");
      setTimeHorizon(portfolio.timeHorizon || "long");
      setRiskProfile(portfolio.riskProfile || "aggressive");
      setBaseCurrency(portfolio.baseCurrency || "USD");
      setBenchmark(portfolio.benchmark || "SPY");
    }
  }, [portfolio]);

  const totalAllocation = Object.values(allocations).reduce((sum, val) => sum + val, 0);

  const handleAllocationChange = (id: string, value: number[]) => {
    setAllocations({ ...allocations, [id]: value[0] });
  };

  const handleSave = async () => {
    if (Math.abs(totalAllocation - 100) > 0.1) {
      toast.error("Total allocation must equal 100%");
      return;
    }

    try {
      const portfolioData = {
        name: portfolioName,
        objective,
        timeHorizon,
        riskProfile,
        baseCurrency,
        benchmark,
      };

      if (portfolio) {
        await portfoliosService.update(portfolio.id, portfolioData);
        toast.success("Portfolio settings updated successfully!");
      } else {
        await portfoliosService.create({
          ...portfolioData,
          status: 'active',
          description: `Portfolio for ${objective} utilizing ${riskProfile} strategy`,
          color: 'blue' // Default color
        });
        toast.success("Portfolio created successfully!");
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (e) {
      console.error(e);
      toast.error(portfolio ? "Failed to update portfolio" : "Failed to create portfolio");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-400" />
            </div>
            <DialogTitle className="text-xl text-foreground">{portfolio ? "Edit Portfolio Settings" : "Create New Portfolio"}</DialogTitle>
          </div>
          <DialogDescription className="text-muted-foreground">
            {portfolio ? "Customize your portfolio preferences and target allocations" : "Set up your new investment portfolio strategy and goals"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Portfolio Name */}
          <div className="space-y-2">
            <Label htmlFor="portfolio-name">Portfolio Name</Label>
            <Input
              id="portfolio-name"
              value={portfolioName}
              onChange={(e) => setPortfolioName(e.target.value)}
              placeholder="e.g. Retirement Fund, Tech Growth"
              className="bg-background border-input text-foreground focus:border-cyan-500"
            />
          </div>

          {/* Target Value */}
          <div className="space-y-2">
            <Label htmlFor="target-value">Target Portfolio Value ($)</Label>
            <Input
              id="target-value"
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              className="bg-background border-input text-foreground focus:border-cyan-500"
            />
            {portfolio && (
              <p className="text-xs text-muted-foreground">
                Current: $285,420 • Target: ${parseInt(targetValue || "0").toLocaleString()}
              </p>
            )}
          </div>

          {/* Target Allocations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Target Asset Allocation</Label>
              <div className={`text-sm ${Math.abs(totalAllocation - 100) < 0.1 ? 'text-green-400' : 'text-red-400'}`}>
                Total: {totalAllocation.toFixed(0)}%
              </div>
            </div>

            <div className="space-y-4">
              {allocationCategories.map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{category.label}</span>
                    <span className="text-cyan-400">{allocations[category.id]}%</span>
                  </div>
                  <Slider
                    value={[allocations[category.id]]}
                    onValueChange={(value: number[]) => handleAllocationChange(category.id, value)}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Rebalancing Alert */}
          {Math.abs(totalAllocation - 100) > 0.1 && (
            <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm text-amber-400">
                ⚠️ Total allocation must equal 100%. Currently at {totalAllocation.toFixed(0)}%
              </p>
            </div>
          )}
        </div>

        {/* Metadata Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Objective</Label>
            <Select value={objective} onValueChange={setObjective}>
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-foreground">
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="capital_preservation">Capital Preservation</SelectItem>
                <SelectItem value="speculation">Speculation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Time Horizon</Label>
            <Select value={timeHorizon} onValueChange={setTimeHorizon}>
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-foreground">
                <SelectItem value="short">Short Term</SelectItem>
                <SelectItem value="mid">Mid Term</SelectItem>
                <SelectItem value="long">Long Term</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Risk Profile</Label>
            <Select value={riskProfile} onValueChange={setRiskProfile}>
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-foreground">
                <SelectItem value="conservative">Conservative</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="aggressive">Aggressive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Base Currency</Label>
            <Select value={baseCurrency} onValueChange={setBaseCurrency}>
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-foreground">
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="VND">VND</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Benchmark</Label>
            <Select value={benchmark} onValueChange={setBenchmark}>
              <SelectTrigger className="bg-background border-input text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-foreground">
                <SelectItem value="SPY">S&P 500 (SPY)</SelectItem>
                <SelectItem value="QQQ">Nasdaq 100 (QQQ)</SelectItem>
                <SelectItem value="VNINDEX">VN-Index</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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
            onClick={handleSave}
            disabled={Math.abs(totalAllocation - 100) > 0.1 || !portfolioName}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {portfolio ? "Save Changes" : "Create Portfolio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
