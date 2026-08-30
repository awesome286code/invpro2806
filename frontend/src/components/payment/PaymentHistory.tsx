import { useState, useEffect } from "react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  Receipt,
  Calendar,
  DollarSign,
  Crown,
  Zap
} from "lucide-react";
import { getPaymentHistory, PaymentRecord } from "./PayPalCheckout";
import { toast } from "sonner@2.0.3";
import { cn } from "../ui/utils";

export function PaymentHistory() {
  const [history, setHistory] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const records = getPaymentHistory();
    setHistory(records);
  };

  const downloadReceipt = (record: PaymentRecord) => {
    const receiptText = `
Civsesor Payment Receipt
========================

Transaction ID: ${record.id}
Date: ${record.date.toLocaleString()}
Plan: ${record.tier.toUpperCase()}
Amount: $${(record.amount || 0).toFixed(2)} ${record.currency}
Status: ${record.status.toUpperCase()}

${record.paypalOrderId ? `PayPal Order ID: ${record.paypalOrderId}` : ''}
${record.payerEmail ? `Email: ${record.payerEmail}` : ''}
${record.payerName ? `Name: ${record.payerName}` : ''}

Thank you for your subscription!
Civsesor - Professional Portfolio Management
    `.trim();

    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Civsesor-Receipt-${record.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Receipt downloaded");
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "premium":
        return <Crown className="w-4 h-4 text-purple-400" />;
      case "pro":
        return <Zap className="w-4 h-4 text-cyan-400" />;
      default:
        return <CreditCard className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1">
            <Clock className="w-3 h-3" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1">
            <XCircle className="w-3 h-3" />
            Failed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (history.length === 0) {
    return (
      <Card className="bg-neutral-900/50 border-neutral-800 p-12">
        <div className="text-center text-neutral-500">
          <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="mb-2">No payment history</p>
          <p className="text-sm">Your subscription payments will appear here</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-neutral-900/50 border-neutral-800">
      <div className="p-6 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg mb-1 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-cyan-400" />
              Payment History
            </h3>
            <p className="text-sm text-neutral-500">
              {history.length} {history.length === 1 ? "transaction" : "transactions"}
            </p>
          </div>
          <Button
            onClick={loadHistory}
            variant="outline"
            size="sm"
            className="border-neutral-700 hover:border-cyan-500 hover:text-cyan-400"
          >
            Refresh
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="p-6 space-y-4">
          {history.map((record) => (
            <Card
              key={record.id}
              className={cn(
                "p-4 border-2 transition-colors",
                record.status === "completed"
                  ? "bg-neutral-800/50 border-neutral-700 hover:border-neutral-600"
                  : record.status === "failed"
                    ? "bg-red-500/5 border-red-500/20"
                    : "bg-amber-500/5 border-amber-500/20"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    record.tier === "premium"
                      ? "bg-purple-500/10 border border-purple-500/20"
                      : "bg-cyan-500/10 border border-cyan-500/20"
                  )}>
                    {getTierIcon(record.tier)}
                  </div>
                  <div>
                    <h4 className="mb-1 flex items-center gap-2">
                      Civsesor {record.tier.toUpperCase()}
                      {getStatusBadge(record.status)}
                    </h4>
                    <p className="text-xs text-neutral-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {record.date.toLocaleDateString()} at {record.date.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl mb-1 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {(record.amount || 0).toFixed(2)}
                  </div>
                  <div className="text-xs text-neutral-500">{record.currency}</div>
                </div>
              </div>

              <div className="space-y-1 text-xs text-neutral-400 mb-3">
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono">{record.id}</span>
                </div>
                {record.paypalOrderId && (
                  <div className="flex justify-between">
                    <span>PayPal Order:</span>
                    <span className="font-mono">{record.paypalOrderId}</span>
                  </div>
                )}
                {record.payerEmail && (
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{record.payerEmail}</span>
                  </div>
                )}
                {record.payerName && (
                  <div className="flex justify-between">
                    <span>Name:</span>
                    <span>{record.payerName}</span>
                  </div>
                )}
              </div>

              {record.status === "completed" && (
                <Button
                  onClick={() => downloadReceipt(record)}
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-neutral-700 hover:border-cyan-500 hover:text-cyan-400"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt
                </Button>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
