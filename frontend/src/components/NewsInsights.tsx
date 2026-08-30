import { Card } from "./ui/card";
import { Newspaper, ChevronRight, ExternalLink } from "lucide-react";
import { Badge } from "./ui/badge";
import { toast } from "sonner";

const news = [
  {
    title: "Fed Holds Interest Rates Steady",
    source: "Bloomberg",
    time: "2h ago",
    category: "Economy",
  },
  {
    title: "Tech Stocks Rally on Strong Earnings",
    source: "Reuters",
    time: "4h ago",
    category: "Markets",
  },
  {
    title: "Vietnam GDP Growth Beats Expectations",
    source: "VnExpress",
    time: "6h ago",
    category: "Economy",
  },
  {
    title: "Bitcoin Breaks $43K Resistance",
    source: "CoinDesk",
    time: "8h ago",
    category: "Crypto",
  },
];

export function NewsInsights() {
  const handleNewsClick = (newsItem: typeof news[0]) => {
    toast.info(`Opening article: ${newsItem.title}`);
  };

  const handleViewAllNews = () => {
    toast.info("Loading all market news...");
  };

  return (
    <div className="space-y-6">
      {/* Market News */}
      <Card className="bg-card border-border p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 flex items-center justify-center">
              <Newspaper className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-lg">Market News</h3>
          </div>
          <button
            onClick={handleViewAllNews}
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {news.map((item, index) => (
            <div
              key={index}
              onClick={() => handleNewsClick(item)}
              className="pb-4 border-b border-border last:border-0 last:pb-0 hover:bg-accent/40 -mx-2 px-2 rounded transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-sm leading-snug group-hover:text-cyan-400 transition-colors">{item.title}</h4>
                <ExternalLink className="w-4 h-4 text-neutral-600 group-hover:text-cyan-400 flex-shrink-0 transition-colors" />
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{item.source}</span>
                <span>•</span>
                <span>{item.time}</span>
                <Badge variant="secondary" className="bg-accent text-muted-foreground text-xs">
                  {item.category}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
