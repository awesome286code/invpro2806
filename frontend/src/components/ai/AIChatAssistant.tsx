import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Bot, Send, User } from "lucide-react";
import { cn } from "../ui/utils";
import { SubscriptionTier } from "../subscription/SubscriptionManager";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AIChatAssistantProps {
  currentTier: SubscriptionTier;
  onUpgrade: () => void;
}

const suggestedQuestions = [
  "What's the best time to buy Bitcoin?",
  "Should I rebalance my portfolio?",
  "Analyze my portfolio risk",
  "What are the top tech stocks to watch?",
];

const aiResponses: Record<string, string> = {
  "default": "I'm analyzing your portfolio and market conditions. Based on current trends, I'd recommend reviewing your asset allocation. Would you like specific suggestions for any particular investment?",
  "bitcoin": "Based on technical analysis, Bitcoin is showing bullish momentum with RSI at 65. The current support level is at $41,200 with resistance at $44,500. Consider accumulating on dips near support levels. However, monitor volume trends closely.",
  "rebalance": "Your portfolio shows a 42% concentration in tech stocks. I recommend rebalancing by reducing tech exposure by 10% and increasing diversification into healthcare and consumer staples. This would improve your Sharpe ratio by an estimated 0.3 points.",
  "risk": "Current portfolio risk analysis: Medium-High. Your portfolio beta is 1.25, indicating higher volatility than the market. Main risk factors: 1) Tech sector concentration (42%), 2) Limited bond allocation (5%), 3) High correlation between holdings (0.78). Consider adding defensive positions.",
  "tech stocks": "Top tech stocks with strong momentum: NVDA (AI/GPU leader, RSI 68), MSFT (Cloud growth, stable), AAPL (approaching support at $175). However, sector is overbought. Consider waiting for pullback or scaling in gradually.",
};

export function AIChatAssistant({ currentTier, onUpgrade }: AIChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI investment assistant. I can help you analyze your portfolio, provide market insights, and suggest optimization strategies. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [queryCount, setQueryCount] = useState(0);

  const queryLimit = currentTier === "free" ? 0 : currentTier === "pro" ? 100 : Infinity;
  const canSendMessage = currentTier !== "free" && (queryCount < queryLimit || currentTier === "premium");

  const handleSend = () => {
    if (!input.trim() || !canSendMessage) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInput("");
    setQueryCount(queryCount + 1);

    // Simulate AI response
    setTimeout(() => {
      let responseContent = aiResponses.default;
      const lowerInput = input.toLowerCase();

      if (lowerInput.includes("bitcoin") || lowerInput.includes("btc")) {
        responseContent = aiResponses.bitcoin;
      } else if (lowerInput.includes("rebalance")) {
        responseContent = aiResponses.rebalance;
      } else if (lowerInput.includes("risk")) {
        responseContent = aiResponses.risk;
      } else if (lowerInput.includes("tech") || lowerInput.includes("stock")) {
        responseContent = aiResponses["tech stocks"];
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleSuggestionClick = (question: string) => {
    if (!canSendMessage) return;
    setInput(question);
  };

  return (
    <Card className="bg-card border-border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg text-foreground">AI Investment Assistant</h3>
              <p className="text-xs text-muted-foreground">
                {currentTier === "free"
                  ? "Upgrade to chat"
                  : currentTier === "premium"
                    ? "Unlimited queries"
                    : `${queryCount}/${queryLimit} queries used`}
              </p>
            </div>
          </div>
          <Badge className={cn(
            currentTier === "premium" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
              currentTier === "pro" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" :
                "bg-accent text-muted-foreground"
          )}>
            {currentTier.toUpperCase()}
          </Badge>
        </div>
      </div>

      {currentTier === "free" ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md space-y-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center">
              <Bot className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-xl text-foreground">AI Chat Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Get instant AI-powered investment advice, portfolio analysis, and market insights.
            </p>
            <Button
              onClick={onUpgrade}
              className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-purple-400" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      message.role === "user"
                        ? "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20"
                        : "bg-accent/50 border border-border"
                    )}
                  >
                    <p className="text-sm text-foreground leading-relaxed">{message.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-cyan-400" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-muted-foreground mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(question)}
                    className="text-xs px-3 py-1.5 rounded-full bg-accent/50 border border-border hover:border-cyan-500/50 hover:text-cyan-400 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder={canSendMessage ? "Ask me anything about your investments..." : "Upgrade to unlock chat"}
                disabled={!canSendMessage}
                className="bg-accent/50 border-input focus:border-cyan-500 text-foreground"
              />
              <Button
                onClick={handleSend}
                disabled={!canSendMessage || !input.trim()}
                className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {currentTier === "pro" && queryCount >= queryLimit * 0.8 && (
              <p className="text-xs text-amber-400 mt-2">
                You've used {queryCount} of {queryLimit} queries. Upgrade to Premium for unlimited access.
              </p>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
