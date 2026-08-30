import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Crown, Zap, Sparkles, Calendar, CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import { cn } from "../ui/utils";
import { useSubscription } from "./SubscriptionManager";
import { SubscriptionManager } from "./SubscriptionManager";

interface SubscriptionStatusCardProps {
  variant?: "compact" | "full";
  showUpgradeButton?: boolean;
}

export function SubscriptionStatusCard({ variant = "full", showUpgradeButton = true }: SubscriptionStatusCardProps) {
  const { subscription, getRemainingDays } = useSubscription();
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const [upgradeKey, setUpgradeKey] = useState(0);
  const remainingDays = getRemainingDays();

  const handleUpgrade = (tier: any) => {
    // Trigger re-render by updating key
    setUpgradeKey(prev => prev + 1);
  };

  const getTierIcon = () => {
    switch (subscription.tier) {
      case "premium":
        return <Crown className="w-5 h-5 text-purple-400" />;
      case "pro":
        return <Zap className="w-5 h-5 text-cyan-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getTierColor = () => {
    switch (subscription.tier) {
      case "premium":
        return "from-purple-500/10 to-pink-500/10 border-purple-500/30";
      case "pro":
        return "from-cyan-500/10 to-blue-500/10 border-cyan-500/30";
      default:
        return "bg-muted/50 border-border";
    }
  };

  const getTierName = () => {
    switch (subscription.tier) {
      case "premium":
        return "Premium";
      case "pro":
        return "Pro";
      default:
        return "Free";
    }
  };

  const getTierPrice = () => {
    switch (subscription.tier) {
      case "premium":
        return "$49/mo";
      case "pro":
        return "$19/mo";
      default:
        return "$0";
    }
  };

  if (variant === "compact") {
    return (
      <>
        <Card
          className={cn(
            "bg-gradient-to-br p-4 border-2 cursor-pointer hover:scale-[1.02] transition-transform",
            getTierColor()
          )}
          onClick={() => setSubscriptionOpen(true)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center",
                subscription.tier === "premium" ? "bg-purple-500/20 border border-purple-500/30" :
                  subscription.tier === "pro" ? "bg-cyan-500/20 border border-cyan-500/30" :
                    "bg-muted border border-border"
              )}>
                {getTierIcon()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{getTierName()}</span>
                  <Badge className={cn(
                    "text-xs",
                    subscription.tier === "premium" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                      subscription.tier === "pro" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" :
                        "bg-muted text-muted-foreground border-border"
                  )}>
                    {getTierPrice()}
                  </Badge>
                </div>
                {remainingDays !== null && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {remainingDays} days remaining
                  </p>
                )}
              </div>
            </div>
            {subscription.tier !== "premium" && showUpgradeButton && (
              <Crown className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
        </Card>

        <SubscriptionManager
          key={upgradeKey}
          open={subscriptionOpen}
          onOpenChange={setSubscriptionOpen}
          currentTier={subscription.tier}
          onUpgrade={handleUpgrade}
        />
      </>
    );
  }

  return (
    <>
      <Card className={cn(
        "bg-gradient-to-br p-6 border-2",
        getTierColor()
      )}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center",
              subscription.tier === "premium" ? "bg-purple-500/20 border border-purple-500/30" :
                subscription.tier === "pro" ? "bg-cyan-500/20 border border-cyan-500/30" :
                  "bg-neutral-700/20 border border-neutral-600/30"
            )}>
              {getTierIcon()}
            </div>
            <div>
              <h3 className="text-xl mb-1 text-foreground">{getTierName()} Plan</h3>
              <p className="text-sm text-muted-foreground">{getTierPrice()}</p>
            </div>
          </div>
          <Badge className={cn(
            subscription.tier === "premium" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
              subscription.tier === "pro" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" :
                "bg-muted text-muted-foreground border-border"
          )}>
            Active
          </Badge>
        </div>

        {/* Subscription Period */}
        {subscription.expiryDate && remainingDays !== null && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Billing Period</span>
              <span className="text-foreground">{subscription.expiryDate.toLocaleDateString()}</span>
            </div>

            {/* Days Remaining Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Days Remaining</span>
                <span className={cn(
                  "font-semibold",
                  remainingDays < 7 ? "text-amber-400" : "text-foreground"
                )}>
                  {remainingDays} / 30 days
                </span>
              </div>
              <Progress
                value={(remainingDays / 30) * 100}
                className={cn(
                  "h-2",
                  subscription.tier === "premium" ? "[&>div]:bg-purple-500" :
                    subscription.tier === "pro" ? "[&>div]:bg-cyan-500" :
                      "[&>div]:bg-primary"
                )}
              />
            </div>

            {/* Renewal Warning */}
            {remainingDays < 7 && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300">
                  Your subscription will renew in {remainingDays} days
                </p>
              </div>
            )}
          </div>
        )}

        {/* Features Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          {subscription.tier === "free" && (
            <>
              <div className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="w-4 h-4 text-green-400" />
                <span>3 Portfolios</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Sparkles className="w-4 h-4 text-muted-foreground/50" />
                <span>Basic AI</span>
              </div>
            </>
          )}
          {subscription.tier === "pro" && (
            <>
              <div className="flex items-center gap-2 text-cyan-400">
                <TrendingUp className="w-4 h-4" />
                <span>Unlimited</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <span>AI Assistant</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <Zap className="w-4 h-4" />
                <span>Optimization</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-400">
                <Calendar className="w-4 h-4" />
                <span>3 Daily Spins</span>
              </div>
            </>
          )}
          {subscription.tier === "premium" && (
            <>
              <div className="flex items-center gap-2 text-purple-400">
                <Crown className="w-4 h-4" />
                <span>All Features</span>
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                <Sparkles className="w-4 h-4" />
                <span>Unlimited AI</span>
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                <Zap className="w-4 h-4" />
                <span>Auto-Rebalance</span>
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                <Calendar className="w-4 h-4" />
                <span>5 Daily Spins</span>
              </div>
            </>
          )}
        </div>

        {/* Upgrade Button */}
        {subscription.tier !== "premium" && showUpgradeButton && (
          <Button
            onClick={() => setSubscriptionOpen(true)}
            className={cn(
              "w-full gap-2",
              subscription.tier === "free"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                : "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            )}
          >
            <Crown className="w-4 h-4" />
            {subscription.tier === "free" ? "Upgrade to Pro" : "Upgrade to Premium"}
          </Button>
        )}

        {/* Manage Subscription */}
        {subscription.tier !== "free" && (
          <Button
            onClick={() => setSubscriptionOpen(true)}
            variant="outline"
            className="w-full gap-2 mt-2 border-border hover:border-cyan-500 hover:text-cyan-400 text-foreground"
          >
            <CreditCard className="w-4 h-4" />
            Manage Subscription
          </Button>
        )}
      </Card>

      <SubscriptionManager
        key={upgradeKey}
        open={subscriptionOpen}
        onOpenChange={setSubscriptionOpen}
        currentTier={subscription.tier}
        onUpgrade={handleUpgrade}
      />
    </>
  );
}
