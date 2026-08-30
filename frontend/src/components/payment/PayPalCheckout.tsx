import { useEffect, useRef, useState } from "react";
import { Card, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Loader2, XCircle, Shield, CreditCard } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { SubscriptionTier } from "../subscription/SubscriptionManager";

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalCheckoutProps {
  tier: SubscriptionTier;
  amount: number;
  onSuccess: (details: any) => void;
  onCancel: () => void;
}

export interface PaymentRecord {
  id: string;
  tier: SubscriptionTier;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  date: Date;
  paypalOrderId?: string;
  paypalPayerId?: string;
  payerEmail?: string;
  payerName?: string;
}

export function PayPalCheckout({ tier, amount, onSuccess, onCancel }: PayPalCheckoutProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // PayPal Client ID - In production, use your actual PayPal Client ID
  const PAYPAL_CLIENT_ID = "test"; // Replace with your PayPal Client ID for production

  useEffect(() => {
    // Load PayPal SDK
    const loadPayPalScript = () => {
      if (window.paypal) {
        setSdkLoaded(true);
        setLoading(false);
        return;
      }

      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
      script.async = true;

      script.onload = () => {
        setSdkLoaded(true);
        setLoading(false);
      };

      script.onerror = () => {
        setError("Failed to load PayPal SDK. Please refresh and try again.");
        setLoading(false);
      };

      document.body.appendChild(script);
    };

    loadPayPalScript();
  }, []);

  useEffect(() => {
    if (!sdkLoaded || !paypalRef.current || !window.paypal) return;

    // Clear any existing buttons
    paypalRef.current.innerHTML = "";

    try {
      window.paypal.Buttons({
        style: {
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "paypal",
          height: 45
        },

        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              description: `Civsesor ${tier.toUpperCase()} Subscription - 1 Month`,
              amount: {
                currency_code: "USD",
                value: (amount || 0).toFixed(2)
              }
            }],
            application_context: {
              shipping_preference: "NO_SHIPPING"
            }
          });
        },

        onApprove: async (data: any, actions: any) => {
          try {
            const details = await actions.order.capture();

            // Create payment record
            const paymentRecord: PaymentRecord = {
              id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              tier: tier,
              amount: amount,
              currency: "USD",
              status: "completed",
              date: new Date(),
              paypalOrderId: details.id,
              paypalPayerId: details.payer.payer_id,
              payerEmail: details.payer.email_address,
              payerName: `${details.payer.name.given_name} ${details.payer.name.surname}`
            };

            // Save payment record
            savePaymentRecord(paymentRecord);

            toast.success("Payment successful! Welcome to Pro! 🎉");
            onSuccess(details);
          } catch (error) {
            console.error("Payment capture error:", error);
            toast.error("Payment processing failed. Please try again.");

            // Save failed payment record
            const failedRecord: PaymentRecord = {
              id: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              tier: tier,
              amount: amount,
              currency: "USD",
              status: "failed",
              date: new Date()
            };
            savePaymentRecord(failedRecord);
          }
        },

        onCancel: (data: any) => {
          toast.info("Payment cancelled");
          onCancel();
        },

        onError: (err: any) => {
          console.error("PayPal error:", err);
          toast.error("An error occurred during payment. Please try again.");
          setError("Payment error occurred. Please refresh and try again.");
        }
      }).render(paypalRef.current);
    } catch (error) {
      console.error("PayPal render error:", error);
      setError("Failed to initialize PayPal. Please refresh and try again.");
    }
  }, [sdkLoaded, tier, amount, onSuccess, onCancel]);

  if (loading) {
    return (
      <Card className="bg-neutral-900/50 border-neutral-800 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <p className="text-sm text-neutral-400">Loading PayPal checkout...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-500/10 border-red-500/20 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <XCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            Refresh Page
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-glass border-none p-8 shadow-2xl">
      <div className="space-y-8">
        {/* Order Summary */}
        <div className="space-y-4">
          <CardTitle className="text-2xl flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-cyan-400" />
            Complete Your Purchase
          </CardTitle>

          <div className="p-6 rounded-2xl bg-black/20 dark:bg-white/5 border border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Subscription Plan:</span>
              <span className="text-sm font-bold font-display uppercase tracking-wide">Civsesor {tier.toUpperCase()} PREMIUM</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Billing Period:</span>
              <span className="text-sm font-semibold text-slate-400">Monthly</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Amount:</span>
              <span className="text-sm font-semibold text-slate-400">${(amount || 0).toFixed(2)} USD</span>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="font-semibold text-slate-400">Total Due Today:</span>
              <span className="text-3xl font-black font-display text-premium">
                ${(amount || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* PayPal Button Container */}
        <div className="px-2">
          <div ref={paypalRef} className="min-h-[45px]" />
        </div>

        {/* Security & Test Mode Notices */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-green-500/5 border border-green-500/10">
            <Shield className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground leading-relaxed">
              <p className="font-bold text-green-500/80 mb-1">Secure payment powered by PayPal</p>
              <p>Your payment information is encrypted and secure. You'll be charged ${amount}/month until you cancel.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <p className="text-xs text-amber-500/80 text-center font-medium">
              💡 <strong>Test Mode:</strong> Use PayPal Sandbox credentials for testing. No real charges will be made.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

function savePaymentRecord(record: PaymentRecord) {
  const existing = localStorage.getItem("payment_history");
  let history: PaymentRecord[] = [];
  try {
    const parsed = existing ? JSON.parse(existing) : [];
    history = Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    history = [];
  }
  history.unshift(record);
  localStorage.setItem("payment_history", JSON.stringify(history));
}

export function getPaymentHistory(): PaymentRecord[] {
  const saved = localStorage.getItem("payment_history");
  if (!saved) return [];

  try {
    const history = JSON.parse(saved);
    if (!Array.isArray(history)) return [];

    return history.map((record: any) => ({
      ...record,
      date: new Date(record.date)
    }));
  } catch (e) {
    return [];
  }
}
