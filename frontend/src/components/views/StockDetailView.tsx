import { useState, useEffect, useCallback } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { TrendingUp, TrendingDown, ArrowLeft, Clock, Activity, Briefcase, Newspaper, ExternalLink, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { holdingsService, AssetDetail } from "../../services/holdingsService";
import { toast } from "sonner";
import { useMarketData } from "../../hooks/useMarketData";
import { formatCurrency, formatNumber } from "../../utils/formatters";

interface StockDetailViewProps {
    symbol: string;
    onBack: () => void;
}

export function StockDetailView({ symbol, onBack }: StockDetailViewProps) {
    const [data, setData] = useState<AssetDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const { prices, dailyOpenPrices, currencies } = useMarketData([symbol]);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const detail = await holdingsService.getBySymbol(symbol);
            setData(detail);
        } catch (error) {
            console.error("Failed to load asset detail:", error);
            toast.error("Failed to load asset details");
        } finally {
            setLoading(false);
        }
    }, [symbol]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    if (loading || !data) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-muted-foreground animate-pulse">Loading {symbol} details...</div>
            </div>
        );
    }

    const currentPrice = prices[symbol] || data.asset.currentPrice;
    const dailyOpen = dailyOpenPrices[symbol] || data.asset.dailyOpenPrice;
    const currency = currencies[symbol] || data.asset.currency || 'USD';

    const dayChange = currentPrice - (dailyOpen || currentPrice);
    const dayChangePercent = dailyOpen ? (dayChange / dailyOpen) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Back Button & Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-accent rounded-lg transition-colors border border-transparent hover:border-border"
                >
                    <ArrowLeft className="w-5 h-5 text-foreground" />
                </button>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-2xl font-bold text-foreground">{data.asset.symbol}</h2>
                        <Badge variant="secondary" className="bg-accent text-muted-foreground">
                            {data.asset.type?.toUpperCase()}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">{data.asset.name}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Metrics Summary */}
                <Card className="lg:col-span-2 bg-card border-border p-6 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="text-sm text-muted-foreground mb-1">Current Price</div>
                            <div className="text-5xl font-bold mb-1 text-foreground">{formatCurrency(currentPrice, currency)}</div>
                            <div className={`flex items-center gap-1 text-base ${dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {dayChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                {formatCurrency(Math.abs(dayChange), currency)} ({dayChangePercent.toFixed(2)}%)
                                <span className="text-muted-foreground/60 ml-1 text-sm">Today</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:text-right">
                            <div>
                                <div className="text-xs text-muted-foreground uppercase">Sector</div>
                                <div className="text-sm font-medium text-foreground">{data.asset.sector || 'N/A'}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground uppercase">Risk Level</div>
                                <Badge variant="outline" className={`
                                    ${data.asset.riskLevel === 'high' ? 'text-red-400 border-red-400/20' :
                                        data.asset.riskLevel === 'low' ? 'text-green-400 border-green-400/20' :
                                            'text-amber-400 border-amber-400/20'}
                                `}>
                                    {data.asset.riskLevel?.toUpperCase()}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <div className="text-xs text-muted-foreground mb-1 text-muted-foreground/50">MARKET CAP</div>
                            <div className="text-sm font-medium text-foreground">N/A</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1 text-muted-foreground/50">VOLUME</div>
                            <div className="text-sm font-medium text-foreground">{formatNumber(data.asset.volume || 0)}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1 text-muted-foreground/50">VALUATION (P/E)</div>
                            <div className="text-sm font-medium text-foreground">N/A</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground mb-1 text-muted-foreground/50">DIVIDEND YIELD</div>
                            <div className="text-sm font-medium text-foreground">N/A</div>
                        </div>
                    </div>
                </Card>

                {/* Position Summary */}
                <Card className="bg-card border-border p-6 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-foreground">
                        <Briefcase className="w-5 h-5 text-cyan-400" />
                        Your Position
                    </h3>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="text-xs text-muted-foreground mb-1">SHARES</div>
                                <div className="text-lg font-medium text-foreground">{formatNumber(data.metrics.totalQuantity)}</div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground mb-1">AVG. COST</div>
                                <div className="text-lg font-medium text-foreground">{formatCurrency(data.metrics.averagePrice, currency)}</div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <div className="text-xs text-muted-foreground mb-1">TOTAL VALUE</div>
                            <div className="text-2xl font-bold text-foreground">{formatCurrency(data.metrics.currentValue, currency)}</div>
                        </div>

                        <div className="pt-4 border-t border-border">
                            <div className="text-xs text-muted-foreground mb-1">TOTAL RETURN</div>
                            <div className={`text-xl font-bold ${data.metrics.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {data.metrics.gainLoss >= 0 ? '+' : ''}{formatCurrency(data.metrics.gainLoss, currency)}
                                <span className="text-sm ml-2 font-normal">({data.metrics.gainLossPercent.toFixed(2)}%)</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Reports & Insights Section */}
                <Card className="lg:col-span-2 bg-card border-border p-6 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
                            <Newspaper className="w-5 h-5 text-blue-400" />
                            Latest Reports & Insights
                        </h3>
                    </div>

                    <div className="space-y-6">
                        {data.reports?.map((report) => (
                            <div key={report.id} className="group cursor-pointer">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <h4 className="text-base font-medium group-hover:text-cyan-400 transition-colors leading-snug text-foreground">
                                        {report.title}
                                    </h4>
                                    <ExternalLink className="w-4 h-4 text-muted-foreground/40 group-hover:text-cyan-400 flex-shrink-0" />
                                </div>
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                    {report.summary}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <Badge variant="secondary" className="bg-accent text-muted-foreground text-[10px] h-5">
                                        {report.type.toUpperCase()}
                                    </Badge>
                                    <span>{report.author}</span>
                                    <span>•</span>
                                    <span>{new Date(report.publishedDate).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className="text-cyan-500/80">{report.category}</span>
                                </div>
                            </div>
                        ))}
                        {(!data.reports || data.reports.length === 0) && (
                            <div className="py-12 text-center text-muted-foreground">
                                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
                                    <Newspaper className="w-6 h-6 text-muted-foreground/40" />
                                </div>
                                <p className="text-muted-foreground/60">No reports found for this asset.</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Simplified Distribution or Recent Transactions (Alternative Layout) */}
                <Card className="bg-card border-border p-6 backdrop-blur-sm">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-foreground">
                        <Activity className="w-5 h-5 text-amber-400" />
                        Asset Distribution
                    </h3>
                    <div className="space-y-4">
                        {data.holdings.map(h => (
                            <div key={h.id} className="flex flex-col gap-1 pb-3 border-b border-border/30 last:border-0 last:pb-0">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground font-medium">{h.portfolio?.name || 'Unknown'}</span>
                                    <span className="text-foreground">{formatNumber(h.quantity)} shares</span>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground/60">
                                    <span>Avg. {formatCurrency(h.averagePrice, currency)}</span>
                                    <span>Value {formatCurrency(h.currentValue, currency)}</span>
                                </div>
                            </div>
                        ))}
                        {data.holdings.length === 0 && (
                            <p className="text-neutral-500 text-center text-sm py-4">No holdings in any portfolio.</p>
                        )}
                    </div>
                </Card>
            </div>

            <Card className="bg-card/50 border-border p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 text-foreground">
                    <Clock className="w-5 h-5 text-blue-400" />
                    Transaction History
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-muted-foreground text-xs uppercase border-b border-border">
                                <th className="pb-4 font-medium">Transaction ID</th>
                                <th className="pb-4 font-medium">Type</th>
                                <th className="pb-4 font-medium">Asset</th>
                                <th className="pb-4 font-medium text-center">Quantity</th>
                                <th className="pb-4 font-medium text-right">Price</th>
                                <th className="pb-4 font-medium text-right">Total</th>
                                <th className="pb-4 font-medium text-center">Portfolio</th>
                                <th className="pb-4 font-medium">Date & Time</th>
                                <th className="pb-4 font-medium text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-foreground">
                            {data.transactions.map((t) => (
                                <tr key={t.id} className="border-b border-border/30 hover:bg-accent/30">
                                    <td className="py-4">
                                        <span className="text-cyan-500 font-medium">TXN-{t.id.slice(0, 6).toUpperCase()}</span>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            {t.type === 'buy' ? (
                                                <>
                                                    <ArrowDownLeft className="w-4 h-4 text-green-400" />
                                                    <span className="text-green-400 font-medium">Buy</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowUpRight className="w-4 h-4 text-red-500" />
                                                    <span className="text-red-500 font-medium">Sell</span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-foreground">{data.asset.symbol}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">{data.asset.name}</span>
                                        </div>
                                    </td>
                                    <td className={`py-4 text-center font-medium ${t.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatNumber(t.quantity)}
                                    </td>
                                    <td className="py-4 text-right font-bold">{formatCurrency(t.price, currency)}</td>
                                    <td className={`py-4 text-right font-bold ${t.type === 'buy' ? 'text-red-400' : 'text-green-400'}`}>
                                        {formatCurrency(t.amount, currency)}
                                    </td>
                                    <td className="py-4 text-center">
                                        <Badge variant="secondary" className="bg-accent text-muted-foreground font-normal hover:bg-accent/80">
                                            {t.portfolioName || 'Primary'}
                                        </Badge>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-muted-foreground">
                                                {new Date(t.transactionDate).toLocaleDateString()}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground/60">
                                                {new Date(t.transactionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 text-right">
                                        <Badge className={`bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/10`}>
                                            {t.status || 'completed'}
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                            {data.transactions.length === 0 && (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-neutral-500">No transactions recorded for this asset.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
