import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Calendar } from "lucide-react";
import { Button } from "./ui/button";

const chartData = [
  { date: "Jan", value: 20000 },
  { date: "Feb", value: 22000 },
  { date: "Mar", value: 21000 },
  { date: "Apr", value: 24000 },
  { date: "May", value: 23000 },
  { date: "Jun", value: 26000 },
  { date: "Jul", value: 28625 },
];

const stats = [
  { label: "24H/24", value: "$40,619", change: "+$11.16" },
  { label: "11.24%", value: "$0.00", sublabel: "Without Holdings" },
  { label: "Currency", value: "USD" },
];

export function PortfolioStats() {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-muted-foreground">Dashboard</h2>
            <Button variant="outline" size="sm" className="gap-2 border-border text-foreground">
              <Calendar className="w-4 h-4" />
              Last 30 days
            </Button>
          </div>
          <h1 className="text-foreground text-3xl font-semibold">Statistic</h1>
        </div>

        {/* Portfolio Value */}
        <div>
          <div className="flex items-baseline gap-3 mb-1">
            <span className="text-4xl text-foreground font-bold">$28,625.00</span>
            <Badge variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-none">
              <TrendingUp className="w-3 h-3 mr-1" />
              +6% ($686)
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Without Holdings</p>
        </div>

        {/* Chart */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="text-muted-foreground"
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Portfolio Value']}
                contentStyle={{
                  backgroundColor: 'var(--color-bg-card)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: '12px',
                  color: 'var(--color-text-default)'
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--color-accent-blue)"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-xs text-muted-foreground mb-1">{stat.label}</div>
              <div className="text-foreground font-medium">{stat.value}</div>
              {stat.change && (
                <div className="text-xs text-muted-foreground">{stat.change}</div>
              )}
              {stat.sublabel && (
                <div className="text-xs text-muted-foreground">{stat.sublabel}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
