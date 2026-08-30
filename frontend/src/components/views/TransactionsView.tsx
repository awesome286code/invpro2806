import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { ArrowUpRight, ArrowDownLeft, Search, Download, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { transactionsService, Transaction } from "../../services/transactionsService";
import { formatCurrency, formatCompactNumber, formatNumber } from "../../utils/formatters";

import { exportToCSV, exportToPDF } from "../../utils/exportUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function TransactionsView() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionsService.getAll();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    try {
      if (transactions.length === 0) {
        toast.error("No transactions to export");
        return;
      }

      const headers = ["id", "type", "symbol", "quantity", "price", "amount", "transactionDate", "status"];
      const exportData = transactions.map(t => ({
        ...t,
        transactionDate: new Date(t.transactionDate).toLocaleDateString(),
        amount: formatCurrency(Number(t.amount)).replace('$', '')
      }));

      exportToCSV(exportData, `transactions_${new Date().toISOString().split('T')[0]}`, headers);
      toast.success("CSV exported successfully");
    } catch (error) {
      console.error('Export CSV Error:', error);
      toast.error("Failed to export CSV. Please check console for details.");
    }
  };

  const handleExportPDF = () => {
    try {
      if (transactions.length === 0) {
        toast.error("No transactions to export");
        return;
      }

      const headers = ["Type", "Symbol", "Quantity", "Price", "Amount", "Date", "Status"];
      const tableData = transactions.map(t => [
        t.type.toUpperCase(),
        t.symbol || "-",
        formatNumber(Number(t.quantity || 0)),
        formatCurrency(Number(t.price || 0)),
        formatCurrency(Number(t.amount || 0)),
        new Date(t.transactionDate).toLocaleDateString(),
        t.status.toUpperCase()
      ]);

      const summary = {
        "Total Transactions": transactions.length.toString(),
        "Total Buy Amount": formatCurrency(transactions.filter(t => t.type === "buy").reduce((sum, t) => sum + Number(t.amount), 0)),
        "Total Sell Amount": formatCurrency(transactions.filter(t => t.type === "sell").reduce((sum, t) => sum + Number(t.amount), 0)),
        "Export Date": new Date().toLocaleString()
      };

      exportToPDF(
        "Transaction History Report",
        headers,
        tableData,
        `transactions_report_${new Date().toISOString().split('T')[0]}`,
        summary
      );
      toast.success("PDF report generated successfully");
    } catch (error) {
      console.error('Export PDF Error:', error);
      toast.error("Failed to generate PDF. Please check console for details.");
    }
  };

  const transactionList = Array.isArray(transactions) ? transactions : [];
  const filteredTransactions = transactionList.filter((txn) => {
    const matchesSearch = txn.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || txn.type === filterType;
    const matchesStatus = filterStatus === "all" || txn.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalBuy = transactionList.filter(t => t.type === "buy").reduce((sum, t) => sum + Number(t.amount), 0);
  const totalSell = transactionList.filter(t => t.type === "sell").reduce((sum, t) => sum + Number(t.amount), 0);
  const totalDividend = transactionList.filter(t => t.type === "dividend").reduce((sum, t) => sum + Number(t.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl mb-1 text-foreground">Transaction History</h2>
          <p className="text-sm text-muted-foreground">Track all your investment transactions</p>
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
            <DropdownMenuItem onClick={handleExportCSV} className="cursor-pointer focus:bg-accent">
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF} className="cursor-pointer focus:bg-accent">
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border p-6">
          <div className="text-sm text-muted-foreground mb-2">Total Transactions</div>
          <div className="text-3xl mb-1 text-foreground">{transactions.length}</div>
          <div className="text-xs text-muted-foreground">All time</div>
        </Card>
        <Card className="bg-card border-border p-6">
          <div className="text-sm text-muted-foreground mb-2">Total Purchased</div>
          <div className="text-3xl mb-1 text-green-400">{formatCompactNumber(totalBuy, 'USD')}</div>
          <div className="text-xs text-muted-foreground">{transactions.filter(t => t.type === "buy").length} buys</div>
        </Card>
        <Card className="bg-card border-border p-6">
          <div className="text-sm text-muted-foreground mb-2">Total Sold</div>
          <div className="text-3xl mb-1 text-red-400">{formatCompactNumber(totalSell, 'USD')}</div>
          <div className="text-xs text-muted-foreground">{transactions.filter(t => t.type === "sell").length} sells</div>
        </Card>
        <Card className="bg-card border-border p-6">
          <div className="text-sm text-muted-foreground mb-2">Dividends Received</div>
          <div className="text-3xl mb-1 text-cyan-400">{formatCompactNumber(totalDividend, 'USD')}</div>
          <div className="text-xs text-muted-foreground">{transactions.filter(t => t.type === "dividend").length} payments</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-card border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-accent/50 border-border focus:border-cyan-500"
              />
            </div>
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-accent/50 border-border">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="buy">Buy</SelectItem>
              <SelectItem value="sell">Sell</SelectItem>
              <SelectItem value="dividend">Dividend</SelectItem>
              <SelectItem value="split">Split</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
              <SelectItem value="fee">Fee</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="bg-accent/50 border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-card border-border p-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Transaction ID</TableHead>
                <TableHead className="text-muted-foreground">Type</TableHead>
                <TableHead className="text-muted-foreground">Symbol</TableHead>
                <TableHead className="text-muted-foreground text-right">Quantity</TableHead>
                <TableHead className="text-muted-foreground text-right">Price</TableHead>
                <TableHead className="text-muted-foreground text-right">Amount</TableHead>
                <TableHead className="text-muted-foreground">Date</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((txn) => (
                <TableRow
                  key={txn.id}
                  className="border-border hover:bg-accent/30 transition-colors"
                >
                  <TableCell>
                    <span className="font-mono text-sm text-cyan-400">{txn.id.slice(0, 8)}</span>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-2 ${txn.type === 'buy' ? 'text-green-400' :
                      txn.type === 'sell' ? 'text-red-400' :
                        'text-blue-400'
                      }`}>
                      {txn.type === 'buy' ? <ArrowDownLeft className="w-4 h-4" /> :
                        txn.type === 'sell' ? <ArrowUpRight className="w-4 h-4" /> :
                          <Calendar className="w-4 h-4" />}
                      <span className="capitalize">{txn.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono">{txn.symbol || '-'}</div>
                  </TableCell>
                  <TableCell className={`text-right ${txn.type === 'buy' ? 'text-green-400' :
                    txn.type === 'sell' ? 'text-red-400' : ''}`}>
                    {txn.quantity ? formatNumber(Number(txn.quantity)) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {txn.price ? formatCurrency(Number(txn.price)) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={txn.type === 'buy' ? 'text-red-400' : 'text-green-400'}>
                      {formatCurrency(Number(txn.amount))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(txn.transactionDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        txn.status === 'completed'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : txn.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }
                    >
                      {txn.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 text-neutral-500">
            <p>No transactions found</p>
            <p className="text-sm mt-2">Start by creating your first transaction</p>
          </div>
        )}

        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
          <div className="text-sm text-neutral-500">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </div>
      </Card>
    </div>
  );
}
