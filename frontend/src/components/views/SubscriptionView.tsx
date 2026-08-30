import { useState } from "react";
import { Button } from "../ui/button";
import {
    ArrowLeft,
    Minus,
    Eye,
    PieChart,
    TrendingUp,
    ShieldCheck,
    CheckCircle2,
    BellRing,
    Beaker,
    FileJson,
    BarChart3,
    LockKeyholeOpen,
    Infinity,
    Files,
    PartyPopper,
    Zap,
    MessageSquare,
    Sparkles,
    Crown
} from "lucide-react";
import { cn } from "../ui/utils";
import { useSubscription, SubscriptionTier } from "../subscription/SubscriptionManager";
import { PayPalCheckout } from "../payment/PayPalCheckout";
import { toast } from "sonner";

interface Feature {
    icon: any;
    text: string;
    color: string;
    bold?: boolean;
}

interface Plan {
    id: SubscriptionTier;
    label: string;
    name: string;
    subtitle: string;
    price: number;
    displayPrice: string;
    period: string;
    features: Feature[];
    buttonText: string;
    variant: "basic" | "comprehensive" | "lifetime";
    popular?: boolean;
    headerIcon: any;
}

export function SubscriptionView() {
    const { subscription, upgradeSubscription } = useSubscription();
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    const plans: Plan[] = [
        {
            id: "free",
            label: "PLAN A: ESSENTIALS",
            name: "Clear Asset Visibility",
            subtitle: "Clear Asset Visibility",
            price: 199000,
            displayPrice: "199,000",
            period: "VND/mo",
            features: [
                { icon: Eye, text: "Live Net Worth Tracking", color: "text-[#22c55e]", bold: true },
                { icon: PieChart, text: "Basic Asset Allocation", color: "text-[#22c55e]" },
                { icon: TrendingUp, text: "Real-time P/L Reports", color: "text-[#22c55e]" },
                { icon: ShieldCheck, text: "Financial Health Score", color: "text-[#22c55e]" },
            ],
            buttonText: "Start Journey",
            variant: "basic",
            headerIcon: Sparkles,
        },
        {
            id: "premium",
            label: "PLAN B: PROFESSIONAL",
            name: "Strategic Wealth Control",
            subtitle: "Strategic Wealth Control",
            price: 399000,
            displayPrice: "399,000",
            period: "VND/mo",
            features: [
                { icon: CheckCircle2, text: "Includes all Essential features", color: "text-[#3b82f6]", bold: true },
                { icon: BellRing, text: "Smart Strategy Drift Alerts", color: "text-[#3b82f6]", bold: true },
                { icon: Beaker, text: "Future Wealth Simulations", color: "text-[#22c55e]" },
                { icon: FileJson, text: "Automated Monthly Insights", color: "text-[#22c55e]" },
                { icon: BarChart3, text: "Performance Benchmarking", color: "text-[#22c55e]" },
            ],
            buttonText: "Go Professional",
            variant: "comprehensive",
            popular: true,
            headerIcon: Zap,
        },
        {
            id: "pro",
            label: "PLAN C: LIFETIME",
            name: "Long-term Peace of Mind",
            subtitle: "Long-term Peace of Mind",
            price: 4900000,
            displayPrice: "4,900,000",
            period: "VND/mo",
            features: [
                { icon: LockKeyholeOpen, text: "Zero Renewal Fees", color: "text-[#D4AF37]", bold: true },
                { icon: Infinity, text: "Eternal Feature Access", color: "text-[#D4AF37]" },
                { icon: Files, text: "Unlimited Custom Reports", color: "text-[#22c55e]" },
                { icon: PartyPopper, text: "1-on-1 Portfolio Setup", color: "text-[#D4AF37]", bold: true },
                { icon: Zap, text: "Early Beta Feature Access", color: "text-[#22c55e]" },
            ],
            buttonText: "Unlock Lifetime Power",
            variant: "lifetime",
            headerIcon: Crown,
        },
    ];

    const handleSelectPlan = (plan: Plan) => {
        if (plan.id === subscription.tier) {
            toast.info("This is your current plan");
            return;
        }
        setSelectedPlan(plan);
    };

    const handlePaymentSuccess = () => {
        if (!selectedPlan) return;
        upgradeSubscription(selectedPlan.id);
        toast.success(`Plan updated successfully to ${selectedPlan.label}!`);
        setSelectedPlan(null);
    };

    if (selectedPlan) {
        return (
            <div className="min-h-screen bg-[#0a0f18] py-20 px-4">
                <div className="max-w-3xl mx-auto space-y-12">
                    <Button
                        variant="ghost"
                        onClick={() => setSelectedPlan(null)}
                        className="gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Plans
                    </Button>

                    <div className="text-center space-y-4">
                        <h2 className="text-4xl font-black text-white tracking-tight font-display">
                            Complete Your Purchase
                        </h2>
                        <p className="text-slate-400 font-medium font-display">
                            You are upgrading to <span className="text-premium">{selectedPlan.label}</span>
                        </p>
                    </div>

                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-[28px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                        <PayPalCheckout
                            tier={selectedPlan.id}
                            amount={selectedPlan.id === "pro" ? 199 : selectedPlan.id === "premium" ? 19 : 0}
                            onSuccess={handlePaymentSuccess}
                            onCancel={() => setSelectedPlan(null)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f18] text-slate-900 dark:text-slate-200 py-16 px-6 md:px-20 font-sans transition-colors selection:bg-[#3b82f6]/20">
            <div className="max-w-6xl mx-auto space-y-20">

                {/* Header Section - Calm & Professional */}
                <div className="text-center space-y-6 mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight font-display">
                        Investment Clarity for Your Journey
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
                        Professional-grade tools designed to help long-term investors track, analyze, and master their personal wealth with absolute confidence.
                    </p>
                </div>

                {/* Pricing Cards Grid - Centered & Balanced */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch mb-24">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={cn(
                                "flex flex-col p-8 rounded-2xl transition-all h-full relative border",
                                "bg-white dark:bg-[#131825]", // Light/Dark Card
                                plan.variant === "basic" && "border-slate-200 dark:border-slate-800/60 shadow-sm dark:shadow-none hover:border-slate-300 dark:hover:border-slate-700",
                                plan.variant === "comprehensive" && "border-blue-200 dark:border-[#3b82f6]/40 shadow-2xl shadow-blue-900/5 dark:shadow-blue-900/10 md:scale-105 z-10",
                                plan.variant === "lifetime" && "border-amber-200 dark:border-amber-500/20 shadow-sm dark:shadow-none hover:border-amber-300 dark:hover:border-amber-500/40"
                            )}
                        >
                            {/* Current Plan Badge - Top Center (Replaces Most Popular if active) */}
                            {subscription.tier === plan.id ? (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-md z-20 border-[3px] border-white dark:border-[#131825]">
                                    Current Plan
                                </div>
                            ) : plan.popular && (
                                <div
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold uppercase tracking-[0.15em] px-4 py-1.5 rounded-full shadow-lg z-20 whitespace-nowrap border-[3px] border-white dark:border-[#131825]"
                                    style={{ backgroundColor: '#3b82f6' }}
                                >
                                    Most Popular
                                </div>
                            )}

                            {/* Centered Header Section */}
                            <div className="flex flex-col items-center text-center mb-8">
                                {/* Gradient Icon */}
                                <div
                                    className={cn(
                                        "w-16 h-16 rounded-2xl mb-6 flex items-center justify-center shadow-lg",
                                        plan.variant === "basic" && "bg-slate-100 dark:bg-slate-800",
                                        plan.variant === "comprehensive" && "text-white",
                                        plan.variant === "lifetime" && "text-white"
                                    )}
                                    style={{
                                        background: plan.variant === "comprehensive" ? 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)' :
                                            plan.variant === "lifetime" ? 'linear-gradient(135deg, #f59e0b 0%, #ec4899 100%)' : undefined
                                    }}
                                >
                                    <plan.headerIcon className={cn("w-8 h-8", plan.variant === "basic" && "text-slate-600 dark:text-slate-300")} />
                                </div>

                                <h2 className={cn("text-lg font-bold uppercase tracking-widest mb-2 font-display",
                                    plan.variant === "lifetime" ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"
                                )}>{plan.label}</h2>

                                <div className="flex flex-col items-center">
                                    <div className="flex items-baseline gap-1">
                                        <span className={cn("text-4xl md:text-5xl font-black text-slate-900 dark:text-white font-display", plan.variant === "lifetime" && "text-amber-600 dark:text-amber-50")}>
                                            {plan.displayPrice}
                                        </span>
                                    </div>
                                    {plan.variant !== "lifetime" ? (
                                        <span className="text-sm font-medium text-slate-500 mt-1">{plan.period}</span>
                                    ) : (
                                        <span className="text-xs font-medium text-amber-600 dark:text-amber-500/80 uppercase tracking-wide mt-2">
                                            Single payment, forever access
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Divider if needed, or just space */}
                            <div className="w-full h-px bg-slate-100 dark:bg-slate-800 mb-8"></div>

                            {/* Features List */}
                            <ul className="flex flex-col gap-4 text-sm mb-8 flex-grow">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className={cn(
                                        "flex items-start gap-3",
                                        "text-slate-600 dark:text-slate-300"
                                    )}>
                                        <div className="mt-0.5" style={{ color: '#10b981' }}>
                                            <CheckCircle2 className="size-5 shrink-0" strokeWidth={2.5} />
                                        </div>
                                        <span className="leading-relaxed font-normal">{feature.text}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Button at the Bottom */}
                            <button
                                onClick={() => handleSelectPlan(plan)}
                                disabled={subscription.tier === plan.id}
                                className={cn(
                                    "w-full py-3.5 px-6 rounded-xl transition-all text-base font-bold tracking-wide font-display mt-auto shadow-lg",
                                    plan.variant === "basic" && "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white",
                                    plan.variant === "comprehensive" && "text-white shadow-blue-500/25",
                                    plan.variant === "lifetime" && "text-white shadow-pink-500/25"
                                )}
                                style={{
                                    background: plan.variant === "comprehensive" ? 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)' :
                                        plan.variant === "lifetime" ? 'linear-gradient(90deg, #ec4899 0%, #9333ea 100%)' : undefined
                                }}
                            >
                                {subscription.tier === plan.id ? "Current Plan" : plan.buttonText}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Comparison Table Section - Calm Data View */}
                <div className="space-y-8 py-10">
                    <div className="text-center space-y-2 mt-8 mb-8">
                        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">Compare Plans</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">Detailed feature breakdown for informed decision making.</p>
                    </div>

                    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131825]">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1a2030]">
                                    <th className="p-8 text-xs uppercase tracking-widest font-bold text-slate-500 dark:text-slate-400 w-[40%] font-display">Features</th>
                                    <th className="p-8 text-xs uppercase tracking-widest font-bold text-slate-500 dark:text-slate-300 text-center w-[20%] font-display">Essentials</th>
                                    <th className="p-8 text-xs uppercase tracking-widest font-bold text-blue-500 dark:text-blue-400 text-center w-[20%] font-display">Professional</th>
                                    <th className="p-8 text-xs uppercase tracking-widest font-bold text-amber-500 text-center w-[20%] font-display">Lifetime</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
                                {[
                                    { name: "Multi-channel Asset Tracking", basic: true, comp: true, life: true },
                                    { name: "Automated Portfolio Analysis", basic: true, comp: true, life: true },
                                    { name: "In-depth Performance Reports", basic: null, comp: "Monthly Insights", life: "On-Demand Unlimited" },
                                    { name: "Compound Interest & Inflation Simulations", basic: null, comp: true, life: true },
                                    { name: "Personalized Strategy Support", basic: null, comp: null, life: "VIP Onboarding" },
                                    { name: "Product Update Cycle", basic: "Standard", comp: "Standard", life: "Priority First-Access" },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="p-8 text-[15px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{row.name}</td>
                                        <td className="p-8 text-center align-middle">
                                            <div className="flex justify-center">
                                                {row.basic === true ? <CheckCircle2 className="size-5" style={{ color: '#10b981' }} strokeWidth={2.5} /> : row.basic === null ? <Minus className="size-4 text-slate-700" /> : <span className="text-xs font-medium text-slate-500">{row.basic}</span>}
                                            </div>
                                        </td>
                                        <td className="p-8 text-center align-middle">
                                            <div className="flex justify-center">
                                                {row.comp === true ? <CheckCircle2 className="size-5" style={{ color: '#10b981' }} strokeWidth={2.5} /> : row.comp === null ? <Minus className="size-4 text-slate-400 dark:text-slate-700" /> : <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{row.comp}</span>}
                                            </div>
                                        </td>
                                        <td className="p-8 text-center align-middle">
                                            <div className="flex justify-center">
                                                {row.life === true ? <CheckCircle2 className="size-5" style={{ color: '#10b981' }} strokeWidth={2.5} /> : row.life === null ? <Minus className="size-4 text-slate-700" /> : <span className={cn("text-sm font-medium", i === 4 ? "text-amber-400" : "text-amber-500")}>{row.life}</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Trust Bar - Minimal & Clean */}
                <div className="mt-24 mb-12 py-12 border-t border-slate-200 dark:border-slate-800/40 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-24 text-slate-600 dark:text-slate-500">
                    {[
                        { icon: ShieldCheck, text: "No Trading Account Linked" },
                        { icon: CheckCircle2, text: "No Hidden Fees" },
                        { icon: TrendingUp, text: "Cancel Anytime" },
                        { icon: MessageSquare, text: "Priority Support" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <item.icon className="size-5 text-slate-600" strokeWidth={2} />
                            <span className="text-sm font-medium tracking-wide">
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
