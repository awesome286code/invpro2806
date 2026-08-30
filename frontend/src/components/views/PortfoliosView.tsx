import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Plus, TrendingUp, TrendingDown, Loader2, MoreVertical, Eye, Edit, Trash2, Copy, Download } from "lucide-react";
import { exportToCSV, exportToPDF } from "../../utils/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { toast } from "sonner";
import { portfoliosService, Portfolio } from "../../services/portfoliosService";
import { useSocket } from "../../contexts/SocketContext";
import { cn } from "../ui/utils";
import { AllocationBar } from "../AllocationBar";
import { formatCurrency, formatPercent } from "../../utils/formatters";

interface PortfoliosViewProps {
  setAddInvestmentOpen: (open: boolean) => void;
  onViewPortfolio: (id: string, name: string) => void;
  onEditPortfolio: (portfolio: Portfolio) => void;
  onAddAsset: (portfolio: Portfolio) => void;
  onCreatePortfolio: () => void;
  refreshTrigger?: number;
}

// Mock allocation generator removed, using backend data

export function PortfoliosView({ onViewPortfolio, onEditPortfolio, onAddAsset, onCreatePortfolio, refreshTrigger }: PortfoliosViewProps) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    loadPortfolios();
  }, [refreshTrigger]);

  useEffect(() => {
    const handlePortfolioUpdate = () => {
      loadPortfolios();
    };

    socket.on('portfolio:updated', handlePortfolioUpdate);
    socket.on('dashboard:refresh', handlePortfolioUpdate);

    return () => {
      socket.off('portfolio:updated', handlePortfolioUpdate);
      socket.off('dashboard:refresh', handlePortfolioUpdate);
    };
  }, [socket]);

  const loadPortfolios = async () => {
    try {
      setLoading(true);
      const data = await portfoliosService.getAll();
      setPortfolios(data);
    } catch (error) {
      console.error('Failed to load portfolios:', error);
      toast.error("Failed to load portfolios");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePortfolio = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await portfoliosService.delete(id);
      setPortfolios(portfolios.filter((p: Portfolio) => p.id !== id));
      toast.success(`${name} deleted successfully`);
    } catch (error) {
      toast.error("Failed to delete portfolio");
    }
  };

  const handleDuplicatePortfolio = (_portfolio: Portfolio) => {
    toast.info("Duplicate functionality coming soon");
    // TODO: Implement duplicate
  };

  const handleExportCSV = () => {
    try {
      if (portfolios.length === 0) {
        toast.error("No portfolios to export");
        return;
      }

      const headers = ["name", "status", "riskProfile", "totalValue", "totalGainLoss", "totalGainLossPercent", "assetsCount"];
      const exportData = portfolios.map(p => ({
        name: p.name,
        status: p.status,
        riskProfile: p.riskProfile || 'N/A',
        totalValue: formatCurrency(p.totalValue || 0).replace('$', ''),
        totalGainLoss: formatCurrency(p.totalGainLoss || 0).replace('$', ''),
        totalGainLossPercent: formatPercent(p.totalGainLossPercent || 0),
        assetsCount: p.investments?.length || 0
      }));

      exportToCSV(exportData, `portfolios_summary_${new Date().toISOString().split('T')[0]}`, headers);
      toast.success("Portfolios summary exported as CSV");
    } catch (error) {
      console.error('Export CSV Error:', error);
      toast.error("Failed to export CSV. Please check console for details.");
    }
  };

  const handleExportPDF = () => {
    try {
      if (portfolios.length === 0) {
        toast.error("No portfolios to export");
        return;
      }

      const headers = ["Portfolio", "Status", "Risk", "Value", "Gain/Loss", "Assets"];
      const tableData = portfolios.map(p => [
        p.name,
        p.status.toUpperCase(),
        (p.riskProfile || 'N/A').toUpperCase(),
        formatCurrency(p.totalValue || 0),
        `${formatCurrency(p.totalGainLoss || 0)} (${formatPercent(p.totalGainLossPercent || 0)})`,
        (p.investments?.length || 0).toString()
      ]);

      const totalPortfolioValue = portfolios.reduce((sum, p) => sum + (p.totalValue || 0), 0);
      const summary = {
        "Total Portfolios": portfolios.length.toString(),
        "Combined Market Value": formatCurrency(totalPortfolioValue),
        "Active Strategies": portfolios.filter(p => p.status === 'active').length.toString(),
        "Export Date": new Date().toLocaleString()
      };

      exportToPDF(
        "Investment Portfolio Summary Report",
        headers,
        tableData,
        `portfolios_report_${new Date().toISOString().split('T')[0]}`,
        summary
      );
      toast.success("PDF summary report generated");
    } catch (error) {
      console.error('Export PDF Error:', error);
      toast.error("Failed to generate PDF. Please check console for details.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const portfolioList = Array.isArray(portfolios) ? portfolios : [];

  const activePortfolios = portfolioList.filter(p => p.status === 'active');
  const totalInvestments = portfolioList.reduce((sum, p) => sum + (p.investments?.length || 0), 0);
  const combinedValue = portfolioList.reduce((sum, p) => sum + (p.totalValue || 0), 0);
  const bestPerformer = portfolioList.reduce((best, p) => {
    if (!best) return p;
    return (p.totalGainLossPercent || 0) > (best.totalGainLossPercent || 0) ? p : best;
  }, portfolioList[0] || null);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1 text-foreground">My Portfolios</h2>
          <p className="text-sm text-muted-foreground">Manage and track your investment strategies</p>
        </div>
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="gap-2 border-border hover:border-cyan-500 hover:text-cyan-400"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer focus:bg-accent focus:text-cyan-400">
                Export Summary as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer focus:bg-accent focus:text-cyan-400">
                Export Summary as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={onCreatePortfolio}
            className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0"
          >
            <Plus className="w-4 h-4" />
            Create Portfolio
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border p-6">
          <div className="text-sm text-muted-foreground mb-2">Total Portfolios</div>
          <div className="text-3xl mb-1 text-foreground">{portfolioList.length}</div>
          <div className="text-xs text-green-400">{activePortfolios.length} active</div>
        </Card>
        <Card className="bg-card border-border p-6">
          <div className="text-sm text-muted-foreground mb-2">Combined Value</div>
          <div className="text-3xl mb-1 text-foreground">{formatCurrency(combinedValue, 'USD')}</div>
          <div className="text-xs text-muted-foreground">Across all portfolios</div>
        </Card>
        <Card className="bg-card border-border p-6">
          <div className="text-sm text-muted-foreground mb-2">Total Assets</div>
          <div className="text-3xl mb-1 text-foreground">{totalInvestments}</div>
          <div className="text-xs text-muted-foreground">Across all portfolios</div>
        </Card>
        <Card className="bg-card border-border p-6">
          <div className="text-sm text-muted-foreground mb-2">Best Performer</div>
          <div className="text-3xl mb-1 text-cyan-400">
            {bestPerformer ? (
              <>
                {(bestPerformer.totalGainLossPercent || 0) >= 0 ? '+' : ''}
                {formatPercent(bestPerformer.totalGainLossPercent || 0, 1).replace('%', '')}%
              </>
            ) : '0%'}
          </div>
          <div className="text-xs text-muted-foreground">{bestPerformer?.name || 'None'}</div>
        </Card>
      </div>

      {/* Grid */}
      {portfolioList.length === 0 ? (
        <Card className="bg-card border-border p-12">
          <div className="text-center text-muted-foreground">
            <Plus className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No portfolios created yet</p>
            <Button variant="link" onClick={onCreatePortfolio} className="text-cyan-400 mt-2">
              Create your first portfolio
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {portfolioList.map((portfolio) => {
            const gain = portfolio.totalGainLoss || 0;
            const gainPercent = portfolio.totalGainLossPercent || 0;
            const allocations = portfolio.allocations || [];

            return (
              <Card
                key={portfolio.id}
                className="group bg-card border-border p-6 hover:border-accent transition-all duration-300 relative overflow-hidden"
              >
                {/* Header Section */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-medium text-foreground group-hover:text-cyan-400 transition-colors">
                        {portfolio.name}
                      </h3>
                      {portfolio.riskProfile && (
                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-amber-500/20 capitalize font-normal text-xs">
                          {portfolio.riskProfile} Risk
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Updated {getTimeAgo(portfolio.updatedAt)}</p>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover border-border text-foreground">
                      <DropdownMenuItem onClick={() => onViewPortfolio(portfolio.id, portfolio.name)} className="cursor-pointer focus:bg-accent focus:text-cyan-400">
                        <Eye className="w-4 h-4 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditPortfolio(portfolio)} className="cursor-pointer focus:bg-accent focus:text-amber-400">
                        <Edit className="w-4 h-4 mr-2" /> Edit Portfolio
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicatePortfolio(portfolio)} className="cursor-pointer focus:bg-accent">
                        <Copy className="w-4 h-4 mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeletePortfolio(portfolio.id, portfolio.name)} className="cursor-pointer focus:bg-accent focus:text-red-400 text-red-400/80">
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Main Value Stats */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-3 mb-1">
                    <span className="text-3xl font-semibold text-foreground tracking-tight">
                      {formatCurrency(portfolio.totalValue || 0, 'USD')}
                    </span>
                    <span className={cn("text-sm font-medium flex items-center", gain >= 0 ? "text-green-400" : "text-red-400")}>
                      {gain >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {formatPercent(Math.abs(gainPercent), 1)}
                    </span>
                  </div>
                  <div className={cn("text-sm", gain >= 0 ? "text-green-500/60" : "text-red-500/60")}>
                    {gain >= 0 ? "+" : "-"}{formatCurrency(Math.abs(gain), 'USD')} total gain
                  </div>
                </div>

                {/* Asset Allocation */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-muted-foreground">Asset Allocation</span>
                    <span className="text-xs text-muted-foreground/60">{portfolio.investments?.length || 0} assets</span>
                  </div>
                  <AllocationBar segments={allocations} />
                </div>

                {/* Footer Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
                  <Button
                    variant="outline"
                    className="border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:border-accent"
                    onClick={() => onAddAsset(portfolio)}
                    disabled={portfolio.status !== 'active'}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Asset
                  </Button>
                  <Button
                    variant="outline"
                    className="border-border text-muted-foreground hover:text-cyan-400 hover:bg-accent hover:border-cyan-500/30"
                    onClick={() => onViewPortfolio(portfolio.id, portfolio.name)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
