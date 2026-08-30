import { Card } from "./ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

const assets = [
  {
    id: 1,
    name: "Bitcoin",
    symbol: "BTC",
    amount: "0.5",
    value: "$21,312.50",
    change: "+2.5%",
    positive: true,
    color: "bg-orange-500",
  },
  {
    id: 2,
    name: "Ethereum",
    symbol: "ETH",
    amount: "5.2",
    value: "$9,360.00",
    change: "+1.8%",
    positive: true,
    color: "bg-blue-500",
  },
  {
    id: 3,
    name: "Cardano",
    symbol: "ADA",
    amount: "10,000",
    value: "$4,200.00",
    change: "-0.5%",
    positive: false,
    color: "bg-cyan-500",
  },
];

export function AssetHoldings() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-foreground">Asset Holdings</h2>
        <button className="text-sm text-muted-foreground hover:text-foreground">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {assets.map((asset) => (
          <div
            key={asset.id}
            className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer border border-transparent hover:border-border"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 ${asset.color} rounded-full flex items-center justify-center text-white font-medium`}>
                {asset.symbol.charAt(0)}
              </div>
              <div>
                <div className="text-foreground font-medium">{asset.name}</div>
                <div className="text-sm text-muted-foreground">
                  {asset.amount} {asset.symbol}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-foreground font-medium">{asset.value}</div>
              <div
                className={`text-sm flex items-center justify-end gap-1 ${asset.positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}
              >
                {asset.positive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {asset.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
