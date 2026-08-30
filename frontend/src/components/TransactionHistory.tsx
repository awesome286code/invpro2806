import { Card } from "./ui/card";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

const transactions = [
  {
    id: 1,
    type: "buy",
    asset: "Bitcoin",
    symbol: "BTC",
    amount: "+0.025",
    value: "$1,065.00",
    date: "Oct 28",
    time: "2:30 PM",
    color: "bg-orange-500",
  },
  {
    id: 2,
    type: "sell",
    asset: "Ethereum",
    symbol: "ETH",
    amount: "-1.5",
    value: "$2,700.00",
    date: "Oct 27",
    time: "10:15 AM",
    color: "bg-blue-500",
  },
  {
    id: 3,
    type: "buy",
    asset: "Cardano",
    symbol: "ADA",
    amount: "+2,500",
    value: "$1,050.00",
    date: "Oct 26",
    time: "4:45 PM",
    color: "bg-cyan-500",
  },
  {
    id: 4,
    type: "buy",
    asset: "Solana",
    symbol: "SOL",
    amount: "+15",
    value: "$750.00",
    date: "Oct 25",
    time: "11:20 AM",
    color: "bg-purple-500",
  },
];

export function TransactionHistory() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-foreground">Transactions</h2>
        <button className="text-sm text-muted-foreground hover:text-foreground">
          See All
        </button>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between hover:bg-accent/50 p-2 -mx-2 rounded-lg transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 ${transaction.color} rounded-full flex items-center justify-center text-white font-medium`}>
                  {transaction.symbol.charAt(0)}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-card ${transaction.type === "buy"
                      ? "bg-green-500"
                      : "bg-red-500"
                    }`}
                >
                  {transaction.type === "buy" ? (
                    <ArrowDownLeft className="w-3 h-3 text-white" />
                  ) : (
                    <ArrowUpRight className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>

              <div>
                <div className="text-sm text-foreground">
                  {transaction.type === "buy" ? "Bought" : "Sold"} {transaction.asset}
                </div>
                <div className="text-xs text-muted-foreground">
                  {transaction.date} • {transaction.time}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div
                className={`text-sm font-medium ${transaction.type === "buy"
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                  }`}
              >
                {transaction.amount} {transaction.symbol}
              </div>
              <div className="text-xs text-muted-foreground">{transaction.value}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
