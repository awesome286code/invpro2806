import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { portfoliosService, PortfolioHoldings } from "../services/portfoliosService";
import { Loader2, TrendingUp, TrendingDown, PieChart as PieChartIcon, Download } from "lucide-react";
import { Card } from "./ui/card";
import { toast } from "sonner";
import { formatCurrency, formatPercent, formatNumber } from "../utils/formatters";
import { exportToCSV, exportToPDF } from "../utils/exportUtils";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface PortfolioDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    portfolio: { id: string; name: string } | null;
    refreshTrigger?: number;
}

export function PortfolioDetailsDialog({ open, onOpenChange, portfolio, refreshTrigger }: PortfolioDetailsDialogProps) {
    const [data, setData] = useState<PortfolioHoldings | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && portfolio) {
            loadHoldings();
        }
    }, [open, portfolio, refreshTrigger]);

    const loadHoldings = async () => {
        if (!portfolio) return;
        try {
            setLoading(true);
            const holdingsData = await portfoliosService.getHoldings(portfolio.id);
            setData(holdingsData);
        } catch (error) {
            console.error('Failed to load portfolio holdings:', error);
            toast.error("Failed to load portfolio details");
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        try {
            if (!data || data.holdings.length === 0) {
                toast.error("No holdings to export");
                return;
            }

            const headers = ["symbol", "name", "quantity", "averagePrice", "currentPrice", "totalValue", "gainLoss", "gainLossPercent"];
            const exportData = data.holdings.map(h => ({
                ...h,
                averagePrice: formatCurrency(h.averagePrice).replace('$', ''),
                currentPrice: formatCurrency(h.currentPrice).replace('$', ''),
                totalValue: formatCurrency(h.totalValue).replace('$', ''),
                gainLoss: formatCurrency(h.gainLoss).replace('$', '')
            }));

            exportToCSV(exportData, `holdings_${portfolio?.name || 'portfolio'}_${new Date().toISOString().split('T')[0]}`, headers);
            toast.success("Holdings exported as CSV");
        } catch (error) {
            console.error('Export CSV Error:', error);
            toast.error("Failed to export CSV. Please check console for details.");
        }
    };

    const handleExportPDF = () => {
        try {
            if (!data || data.holdings.length === 0) {
                toast.error("No holdings to export");
                return;
            }

            const headers = ["Asset", "Name", "Qty", "Avg Price", "Current", "Value", "Gain/Loss"];
            const tableData = data.holdings.map(h => [
                h.symbol,
                h.name,
                formatNumber(h.quantity),
                formatCurrency(h.averagePrice),
                formatCurrency(h.currentPrice),
                formatCurrency(h.totalValue),
                `${formatCurrency(h.gainLoss)} (${formatPercent(h.gainLossPercent)})`
            ]);

            const summary = {
                "Portfolio": portfolio?.name || "Unknown",
                "Total Value": formatCurrency(data.summary.totalValue),
                "Total Cost": formatCurrency(data.summary.totalCost),
                "Total Gain/Loss": `${formatCurrency(data.summary.totalGainLoss)} (${formatPercent(data.summary.totalGainLossPercent)})`,
                "Export Date": new Date().toLocaleString()
            };

            exportToPDF(
                `${portfolio?.name || "Portfolio"} Holdings Report`,
                headers,
                tableData,
                `holdings_${portfolio?.name || 'portfolio'}_report_${new Date().toISOString().split('T')[0]}`,
                summary
            );
            toast.success("PDF holdings report generated");
        } catch (error) {
            console.error('Export PDF Error:', error);
            toast.error("Failed to generate PDF. Please check console for details.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-popover border-border !min-w-fit max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center">
                                <PieChartIcon className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl text-foreground">{portfolio?.name || "Portfolio Details"}</DialogTitle>
                                <DialogDescription className="text-muted-foreground text-lg">
                                    Performance summary and current holdings
                                </DialogDescription>
                            </div>
                        </div>

                        {!loading && data && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-2 border-border">
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
                        )}
                    </div>
                </DialogHeader>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-foreground">
                        <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mb-4" />
                        <p className="text-muted-foreground">Loading details...</p>
                    </div>
                ) : data ? (
                    <div className="space-y-8 py-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card className="bg-card border-border p-6">
                                <div className="text-sm text-muted-foreground mb-2">Total Value</div>
                                <div className="text-2xl font-semibold text-foreground">{formatCurrency(data.summary.totalValue)}</div>
                            </Card>
                            <Card className="bg-card border-border p-6">
                                <div className="text-sm text-muted-foreground mb-2">Total Cost</div>
                                <div className="text-2xl font-semibold text-foreground">{formatCurrency(data.summary.totalCost)}</div>
                            </Card>
                            <Card className="bg-card border-border p-6">
                                <div className="text-sm text-muted-foreground mb-2">Total Gain/Loss</div>
                                <div className={`text-2xl font-semibold ${data.summary.totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {formatCurrency(data.summary.totalGainLoss)}
                                </div>
                            </Card>
                            <Card className="bg-card border-border p-6">
                                <div className="text-sm text-muted-foreground mb-2">Return</div>
                                <div className={`text-2xl font-semibold flex items-center gap-2 ${data.summary.totalGainLossPercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {data.summary.totalGainLossPercent >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                    {formatPercent(data.summary.totalGainLossPercent)}
                                </div>
                            </Card>
                        </div>

                        {/* Holdings Table */}
                        <div>
                            <h3 className="text-xl font-medium text-foreground mb-4">Holdings</h3>
                            <div className="border border-border rounded-xl overflow-hidden bg-card">
                                <table className="w-full text-left text-base">
                                    <thead className="bg-accent/50 text-foreground uppercase text-xs tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Asset</th>
                                            <th className="px-6 py-4 font-semibold text-right">Quantity</th>
                                            <th className="px-6 py-4 font-semibold text-right">Avg Price</th>
                                            <th className="px-6 py-4 font-semibold text-right">Current</th>
                                            <th className="px-6 py-4 font-semibold text-right">Value</th>
                                            <th className="px-6 py-4 font-semibold text-right">Gain/Loss</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {data.holdings.map((holding) => (
                                            <tr key={holding.id} className="hover:bg-accent/50 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="font-semibold text-foreground text-lg">{holding.symbol}</div>
                                                    <div className="text-sm text-muted-foreground uppercase">{holding.name}</div>
                                                </td>
                                                <td className="px-6 py-5 text-right tabular-nums text-foreground font-medium">
                                                    {formatNumber(holding.quantity)}
                                                </td>
                                                <td className="px-6 py-5 text-right tabular-nums text-muted-foreground">
                                                    {formatCurrency(holding.averagePrice)}
                                                </td>
                                                <td className="px-6 py-5 text-right tabular-nums text-foreground">
                                                    {formatCurrency(holding.currentPrice)}
                                                </td>
                                                <td className="px-6 py-5 text-right tabular-nums font-semibold text-foreground">
                                                    {formatCurrency(holding.totalValue)}
                                                </td>
                                                <td className={`px-6 py-5 text-right tabular-nums font-semibold ${holding.gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    <div className="flex items-center justify-end gap-1 text-lg">
                                                        {holding.gainLoss >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                        {formatPercent(holding.gainLossPercent, 1)}
                                                    </div>
                                                    <div className="text-xs opacity-90 mt-1">
                                                        {holding.gainLoss >= 0 ? '+' : ''}{formatCurrency(holding.gainLoss)}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {data.holdings.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground italic text-lg">
                                                    No assets found in this portfolio
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-12 text-center text-muted-foreground text-lg">
                        Failed to load data.
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
