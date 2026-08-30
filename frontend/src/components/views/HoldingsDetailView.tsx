import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Download, TrendingUp, TrendingDown, Hash, DollarSign, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { exportToCSV, exportToPDF } from "../../utils/exportUtils";
import { formatCurrency, formatPercent, formatNumber } from "../../utils/formatters";
import { holdingsService, Holding } from "../../services/holdingsService";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface HoldingsDetailViewProps {
    onNavigateToAsset: (symbol: string) => void;
}

export function HoldingsDetailView({ onNavigateToAsset }: HoldingsDetailViewProps) {
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHoldings();
    }, []);

    const handleExportCSV = () => {
        try {
            if (holdings.length === 0) {
                toast.error("No holdings to export");
                return;
            }

            const headers = ["symbol", "name", "type", "quantity", "averagePrice", "currentPrice", "currentValue", "gainLoss", "gainLossPercent"];
            const exportData = holdings.map(h => {
                const metrics = calculateMetrics(h);
                return {
                    ...h,
                    averagePrice: formatCurrency(Number(h.averagePrice)).replace('$', ''),
                    currentPrice: formatCurrency(metrics.currentPrice).replace('$', ''),
                    currentValue: formatCurrency(metrics.currentValue).replace('$', ''),
                    gainLoss: formatCurrency(metrics.unrealizedGL).replace('$', ''),
                    gainLossPercent: formatPercent(metrics.unrealizedGLPercent)
                };
            });

            exportToCSV(exportData, `global_holdings_${new Date().toISOString().split('T')[0]}`, headers);
            toast.success("Holdings exported as CSV");
        } catch (error) {
            console.error('Export CSV Error:', error);
            toast.error("Failed to export CSV. Please check console for details.");
        }
    };

    const handleExportPDF = () => {
        try {
            if (holdings.length === 0) {
                toast.error("No holdings to export");
                return;
            }

            const headers = ["Asset", "Name", "Qty", "Avg Price", "Current", "Value", "Gain/Loss"];
            const tableData = holdings.map(h => {
                const metrics = calculateMetrics(h);
                return [
                    h.symbol,
                    h.name,
                    formatNumber(Number(h.quantity)),
                    formatCurrency(Number(h.averagePrice)),
                    formatCurrency(metrics.currentPrice),
                    formatCurrency(metrics.currentValue),
                    `${formatCurrency(metrics.unrealizedGL)} (${formatPercent(metrics.unrealizedGLPercent)})`
                ];
            });

            const totalValue = holdings.reduce((sum, h) => sum + calculateMetrics(h).currentValue, 0);
            const totalGL = holdings.reduce((sum, h) => sum + calculateMetrics(h).unrealizedGL, 0);

            const summary = {
                "Total Holdings": holdings.length.toString(),
                "Total Portfolio Value": formatCurrency(totalValue),
                "Unrealized Gain/Loss": formatCurrency(totalGL),
                "Export Date": new Date().toLocaleString()
            };

            exportToPDF(
                "Global Holdings Report",
                headers,
                tableData,
                `holdings_report_${new Date().toISOString().split('T')[0]}`,
                summary
            );
            toast.success("PDF holdings report generated");
        } catch (error) {
            console.error('Export PDF Error:', error);
            toast.error("Failed to generate PDF. Please check console for details.");
        }
    };

    const loadHoldings = async () => {
        try {
            setLoading(true);
            const data = await holdingsService.getAll();
            setHoldings(data);
        } catch (error) {
            console.error('Failed to load holdings:', error);
            toast.error("Failed to load holdings");
        } finally {
            setLoading(false);
        }
    };

    const calculateMetrics = (holding: Holding) => {
        const quantity = Number(holding.quantity);
        const averagePrice = Number(holding.averagePrice);
        const currentPrice = Number(holding.currentPrice || holding.averagePrice);

        const currentValue = quantity * currentPrice;
        const totalCost = quantity * averagePrice;
        const unrealizedGL = currentValue - totalCost;
        const unrealizedGLPercent = totalCost > 0 ? (unrealizedGL / totalCost) * 100 : 0;

        return {
            currentPrice,
            currentValue,
            totalCost,
            unrealizedGL,
            unrealizedGLPercent
        };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    const totalPortfolioValue = holdings.reduce((sum, holding) => {
        const metrics = calculateMetrics(holding);
        return sum + metrics.currentValue;
    }, 0);

    const totalUnrealizedGL = holdings.reduce((sum, holding) => {
        const metrics = calculateMetrics(holding);
        return sum + metrics.unrealizedGL;
    }, 0);

    const totalCost = holdings.reduce((sum, holding) => {
        const metrics = calculateMetrics(holding);
        return sum + metrics.totalCost;
    }, 0);

    const totalUnrealizedGLPercent = totalCost > 0 ? (totalUnrealizedGL / totalCost) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl mb-1 text-foreground">Current Holdings</h2>
                    <p className="text-sm text-muted-foreground">Detailed view of all your positions with real-time updates</p>
                </div>
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
                            Export as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer focus:bg-accent focus:text-cyan-400">
                            Export as PDF
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card border-border p-6">
                    <div className="text-sm text-muted-foreground mb-2">Total Holdings Value</div>
                    <div className="text-3xl mb-1 text-foreground">${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="text-xs text-cyan-400">Across all portfolios</div>
                </Card>

                <Card className="bg-card border-border p-6">
                    <div className="text-sm text-muted-foreground mb-2">Total Positions</div>
                    <div className="text-3xl mb-1 text-foreground">{holdings.length}</div>
                    <div className="text-xs text-muted-foreground">Active holdings</div>
                </Card>

                <Card className="bg-card border-border p-6">
                    <div className="text-sm text-muted-foreground mb-2">Total Unrealized G/L</div>
                    <div className="text-3xl mb-1 flex items-center gap-2">
                        <span className={totalUnrealizedGL >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {totalUnrealizedGL >= 0 ? '+' : ''}${Math.abs(totalUnrealizedGL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className={`text-xs ${totalUnrealizedGL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalUnrealizedGL >= 0 ? '+' : ''}{totalUnrealizedGLPercent.toFixed(2)}%
                    </div>
                </Card>
            </div>

            {/* Holdings List */}
            {holdings.length === 0 ? (
                <Card className="bg-card/50 border-border p-12">
                    <div className="text-center text-muted-foreground">
                        <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p className="mb-2 text-foreground">No holdings found</p>
                        <p className="text-sm text-muted-foreground">Create a portfolio and add investments to see them here.</p>
                    </div>
                </Card>
            ) : (
                <div className="space-y-4">
                    {holdings.map((holding) => {
                        const metrics = calculateMetrics(holding);
                        const allocationPercent = totalPortfolioValue > 0
                            ? (metrics.currentValue / totalPortfolioValue) * 100
                            : 0;

                        // Note: holding.portfolio might be populated if service asks for relations, 
                        // but type definition in service currently doesn't include it. 
                        // We'll leave it simple for now. 
                        // If backend returns portfolio object, we can use it.
                        const portfolioName = (holding as any).portfolio?.name || 'Portfolio';

                        return (
                            <Card
                                key={holding.id}
                                className="bg-card border-border p-6 hover:border-cyan-500/50 transition-all cursor-pointer group"
                                onClick={() => onNavigateToAsset(holding.symbol)}
                            >
                                {/* Holding Header */}
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center group-hover:border-cyan-500 transition-all">
                                            <Hash className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl group-hover:text-cyan-400 transition-colors text-foreground">{holding.symbol}</h3>
                                                <Badge variant="secondary" className="bg-accent text-muted-foreground">
                                                    {holding.type?.toUpperCase() || 'ASSET'}
                                                </Badge>
                                                <Badge variant="secondary" className="bg-accent text-muted-foreground">
                                                    {portfolioName}
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-muted-foreground">{holding.name}</div>
                                        </div>
                                    </div>

                                    <div className="text-right">
                                        <div className="text-sm text-muted-foreground mb-1">Current Value</div>
                                        <div className="text-2xl mb-1">${metrics.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                        <div className={`text-sm flex items-center justify-end gap-1 ${metrics.unrealizedGL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {metrics.unrealizedGL >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                            {metrics.unrealizedGL >= 0 ? '+' : ''}${Math.abs(metrics.unrealizedGL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({metrics.unrealizedGLPercent >= 0 ? '+' : ''}{metrics.unrealizedGLPercent.toFixed(2)}%)
                                        </div>
                                    </div>
                                </div>

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">Quantity</div>
                                        <div className="text-lg text-foreground">{Number(holding.quantity).toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">Average Cost</div>
                                        <div className="text-lg text-foreground">${Number(holding.averagePrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                                        <div className="text-lg text-cyan-400">${metrics.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">Total Cost</div>
                                        <div className="text-lg text-foreground">${metrics.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">Allocation</div>
                                        <div className="flex items-center gap-2">
                                            <Progress value={allocationPercent} className="h-2 flex-1" />
                                            <span className="text-sm">{allocationPercent.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
