import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Check, Sparkles, Crown, Zap, Lock, ArrowLeft, CreditCard, Receipt } from "lucide-react";
import { cn } from "../ui/utils";
import { toast } from "sonner";
import { PayPalCheckout } from "../payment/PayPalCheckout";
import { PaymentHistory } from "../payment/PaymentHistory";

export type SubscriptionTier = "free" | "pro" | "premium";

export interface SubscriptionState {
  tier: SubscriptionTier;
  expiryDate?: Date;
}

interface SubscriptionManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTier: SubscriptionTier;
  onUpgrade: (tier: SubscriptionTier) => void;
}

const tiers = [
  {
    id: "free" as SubscriptionTier,
    name: "Free",
    price: 0,
    displayPrice: "$0",
    period: "forever",
    icon: Sparkles,
    color: "from-muted to-muted/80",
    features: [
      { text: "Up to 3 portfolios", included: true },
      { text: "Basic transaction tracking", included: true },
      { text: "7-day price forecasts", included: true },
      { text: "Basic technical indicators (RSI, MACD)", included: true },
      { text: "Manual transaction recording", included: true },
      { text: "Portfolio overview dashboard", included: true },
      { text: "1 daily spin on reward wheel", included: true },
      { text: "Advanced AI forecasts (1M-6M)", included: false },
      { text: "AI chat assistant", included: false },
      { text: "Portfolio optimization", included: false },
      { text: "Automated rebalancing", included: false },
    ]
  },
  {
    id: "pro" as SubscriptionTier,
    name: "Pro",
    price: 19,
    displayPrice: "$19",
    period: "per month",
    icon: Zap,
    color: "from-cyan-500 to-blue-600",
    popular: true,
    features: [
      { text: "Unlimited portfolios", included: true },
      { text: "Advanced transaction tracking", included: true },
      { text: "Multi-timeframe forecasts (7D-6M)", included: true },
      { text: "All technical indicators + Volume analysis", included: true },
      { text: "Support/Resistance zone analysis", included: true },
      { text: "AI-powered recommendations", included: true },
      { text: "Real-time market alerts", included: true },
      { text: "Sentiment analysis", included: true },
      { text: "Portfolio optimization", included: true },
      { text: "AI chat assistant (100 queries/month)", included: true },
      { text: "3 daily spins on reward wheel", included: true },
      { text: "Advanced backtesting", included: false },
      { text: "Automated rebalancing", included: false },
    ]
  },
  {
    id: "premium" as SubscriptionTier,
    name: "Premium",
    price: 49,
    displayPrice: "$49",
    period: "lifetime",
    icon: Crown,
    color: "from-purple-500 to-pink-600",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "AI chat assistant (Unlimited)", included: true },
      { text: "Advanced backtesting engine", included: true },
      { text: "Automated portfolio rebalancing", included: true },
      { text: "Correlation analysis", included: true },
      { text: "Sector rotation recommendations", included: true },
      { text: "Custom AI models training", included: true },
      { text: "Priority support (24/7)", included: true },
      { text: "API access", included: true },
      { text: "White-label reports", included: true },
      { text: "5 daily spins on reward wheel", included: true },
    ]
  }
];

export function SubscriptionManager({ open, onOpenChange, currentTier, onUpgrade }: SubscriptionManagerProps) {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier | null>(null);
  const [activeTab, setActiveTab] = useState<string>("plans");

  // Reset when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedTier(null);
      setActiveTab("plans");
    }
  }, [open]);

  const handleSelectPlan = (tier: SubscriptionTier) => {
    if (tier === "free") {
      toast.info("You're already on the free plan");
      return;
    }

    if (tier === currentTier) {
      toast.info("This is your current plan");
      return;
    }

    // Go to checkout
    setSelectedTier(tier);
  };

  const handlePaymentSuccess = (_details: any) => {
    if (!selectedTier) return;

    // Create subscription expiry date (30 days for pro, 100 years for premium lifetime)
    const expiryDate = selectedTier === "premium"
      ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Save subscription state with expiry
    const newState: SubscriptionState = {
      tier: selectedTier,
      expiryDate: expiryDate,
    };
    localStorage.setItem("subscription_state", JSON.stringify(newState));

    // Upgrade the user
    onUpgrade(selectedTier);

    // Show success message with details
    toast.success(
      `🎉 Welcome to ${selectedTier.toUpperCase()}! Your subscription is now active${selectedTier === "premium" ? " for lifetime!" : ` until ${expiryDate.toLocaleDateString()}.`}`,
      { duration: 5000 }
    );

    // Reset and close
    setSelectedTier(null);
    onOpenChange(false);
  };

  const handlePaymentCancel = () => {
    toast.info("Payment cancelled. You can upgrade anytime!");
    setSelectedTier(null);
  };

  const handleBack = () => {
    setSelectedTier(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border w-[95vw] lg:w-[90vw] sm:max-w-none max-w-screen-2xl max-h-[90vh] overflow-y-auto text-foreground scrollbar-hide">
        <DialogHeader>
          <div className="text-center mb-4">
            <DialogTitle className="text-3xl mb-2 text-foreground">
              {selectedTier ? "Complete Your Purchase" : "Choose Your Plan"}
            </DialogTitle>
            <DialogDescription className="text-lg text-muted-foreground">
              {selectedTier
                ? `Upgrade to ${selectedTier.toUpperCase()} and unlock advanced features`
                : "Unlock advanced AI features and take your investment strategy to the next level"}
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Show checkout if tier selected */}
        {selectedTier ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <Button
              onClick={handleBack}
              variant="outline"
              className="border-border hover:border-cyan-500 hover:text-cyan-400 gap-2 text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Plans
            </Button>

            <PayPalCheckout
              tier={selectedTier}
              amount={tiers.find(t => t.id === selectedTier)?.price || 0}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          </div>
        ) : (
          // Show plans or history tabs
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="plans" className="gap-2">
                <CreditCard className="w-4 h-4" />
                Subscription Plans
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Receipt className="w-4 h-4" />
                Payment History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plans" className="mt-0">
              <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-x-visible pt-8 pb-6 md:pb-0 snap-x scrollbar-hide -mt-4">
                {tiers.map((tier) => (
                  <Card
                    key={tier.id}
                    className={cn(
                      "relative p-6 transition-all duration-300 flex-shrink-0 w-[280px] sm:w-[320px] md:w-auto snap-center ml-2 first:ml-0 md:ml-0",
                      tier.popular
                        ? "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30 scale-100 md:scale-105"
                        : "bg-card border-border hover:border-primary/50"
                    )}
                  >
                    {/* Badges Container */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-10">
                      {tier.popular && (
                        <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-none whitespace-nowrap shadow-sm">
                          Most Popular
                        </Badge>
                      )}

                      {currentTier === tier.id && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none whitespace-nowrap shadow-sm">
                          Current Plan
                        </Badge>
                      )}
                    </div>

                    <div className="text-center mb-6">
                      <div className={cn(
                        "w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-gradient-to-br",
                        tier.color
                      )}>
                        <tier.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl mb-2 text-foreground">{tier.name}</h3>
                      <div className="mb-1">
                        <span className="text-4xl text-foreground">{tier.displayPrice}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{tier.period}</p>
                    </div>

                    <ul className="space-y-3 mb-6">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className={cn(
                          "flex items-start gap-2 text-sm",
                          feature.included ? "text-foreground/80" : "text-muted-foreground/50"
                        )}>
                          {feature.included ? (
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Lock className="w-4 h-4 text-muted-foreground/30 flex-shrink-0 mt-0.5" />
                          )}
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleSelectPlan(tier.id)}
                      disabled={currentTier === tier.id}
                      className={cn(
                        "w-full",
                        tier.popular
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                          : tier.id === "premium"
                            ? "bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                      )}
                    >
                      {currentTier === tier.id ? "Current Plan" : tier.id === "free" ? "Downgrade" : "Upgrade Now"}
                    </Button>
                  </Card>
                ))}
              </div>


            </TabsContent>

            <TabsContent value="history" className="mt-0">
              <PaymentHistory />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage subscription state
export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionState>({
    tier: "free",
  });

  useEffect(() => {
    const saved = localStorage.getItem("subscription_state");
    if (saved) {
      const parsed = JSON.parse(saved);
      const state: SubscriptionState = {
        tier: parsed.tier,
        expiryDate: parsed.expiryDate ? new Date(parsed.expiryDate) : undefined,
      };

      // Check if subscription expired
      if (state.expiryDate && state.expiryDate < new Date()) {
        // Expired - downgrade to free
        const freeState: SubscriptionState = { tier: "free" };
        setSubscription(freeState);
        localStorage.setItem("subscription_state", JSON.stringify(freeState));
        toast.error("Your subscription has expired. Please renew to continue using premium features.");
      } else {
        setSubscription(state);
      }
    }
  }, []);

  const upgradeSubscription = (tier: SubscriptionTier) => {
    const newState: SubscriptionState = {
      tier,
      expiryDate: tier === "pro"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : tier === "premium"
          ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000)
          : undefined,
    };
    setSubscription(newState);
    localStorage.setItem("subscription_state", JSON.stringify(newState));
  };

  const hasFeature = (feature: string): boolean => {
    const featureMap: Record<string, SubscriptionTier[]> = {
      "advanced_forecasts": ["pro", "premium"],
      "ai_chat": ["pro", "premium"],
      "portfolio_optimization": ["pro", "premium"],
      "sentiment_analysis": ["pro", "premium"],
      "backtesting": ["premium"],
      "automated_rebalancing": ["premium"],
      "correlation_analysis": ["premium"],
      "sector_rotation": ["premium"],
      "unlimited_portfolios": ["pro", "premium"],
      "advanced_alerts": ["pro", "premium"],
    };

    return featureMap[feature]?.includes(subscription.tier) ?? false;
  };

  const getRemainingDays = (): number | null => {
    if (!subscription.expiryDate) return null;
    const diff = subscription.expiryDate.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return {
    subscription,
    upgradeSubscription,
    hasFeature,
    getRemainingDays,
  };
}
