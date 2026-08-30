import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Lock, Sparkles, Crown, Zap } from "lucide-react";
import { cn } from "../ui/utils";

interface UpgradePromptProps {
  feature: string;
  requiredTier: "pro" | "premium";
  onUpgrade: () => void;
  compact?: boolean;
}

const tierInfo = {
  pro: {
    name: "Pro",
    icon: Zap,
    color: "from-cyan-500 to-blue-600",
    price: "$19/mo"
  },
  premium: {
    name: "Premium",
    icon: Crown,
    color: "from-purple-500 to-pink-600",
    price: "$49/mo"
  }
};

export function UpgradePrompt({ feature, requiredTier, onUpgrade, compact = false }: UpgradePromptProps) {
  const tier = tierInfo[requiredTier];
  const Icon = tier.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 border border-neutral-700">
        <Lock className="w-5 h-5 text-neutral-500" />
        <div className="flex-1">
          <p className="text-sm text-neutral-300">
            This feature requires <span className="text-cyan-400">{tier.name}</span>
          </p>
        </div>
        <Button
          onClick={onUpgrade}
          size="sm"
          className={cn(
            "gap-2 bg-gradient-to-r hover:opacity-90",
            tier.color
          )}
        >
          <Icon className="w-4 h-4" />
          Upgrade
        </Button>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-neutral-900/90 to-neutral-900/50 border-neutral-700 p-8 text-center backdrop-blur-sm">
      <div className="max-w-md mx-auto space-y-6">
        <div className={cn(
          "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center bg-gradient-to-br",
          tier.color
        )}>
          <Icon className="w-10 h-10 text-white" />
        </div>

        <div>
          <h3 className="text-2xl mb-2 flex items-center justify-center gap-2">
            <Lock className="w-6 h-6 text-neutral-500" />
            Premium Feature
          </h3>
          <p className="text-neutral-400 leading-relaxed">
            Unlock <span className="text-cyan-400">{feature}</span> with {tier.name}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Badge className={cn(
            "text-lg px-4 py-2 bg-gradient-to-r border-none",
            tier.color
          )}>
            {tier.name} - {tier.price}
          </Badge>
        </div>

        <div className="space-y-3 text-left">
          <div className="flex items-start gap-2 text-sm text-neutral-300">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>Advanced AI-powered forecasts and recommendations</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-neutral-300">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>Real-time market sentiment analysis</span>
          </div>
          <div className="flex items-start gap-2 text-sm text-neutral-300">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
            <span>Portfolio optimization suggestions</span>
          </div>
        </div>

        <Button
          onClick={onUpgrade}
          className={cn(
            "w-full gap-2 bg-gradient-to-r text-lg py-6",
            tier.color
          )}
        >
          <Icon className="w-5 h-5" />
          Upgrade to {tier.name}
        </Button>

        <p className="text-xs text-neutral-600">
          30-day money-back guarantee • Cancel anytime
        </p>
      </div>
    </Card>
  );
}
