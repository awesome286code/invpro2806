import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  ArrowLeftRight,
  Bell,
  Settings,
  User,
  Moon,
  Sun,
  LogOut,
  Wallet,
  Crown,
  Zap
} from "lucide-react";
import { cn } from "./ui/utils";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { useTheme } from "../contexts/ThemeContext";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "./ui/sheet";
import { toast } from "sonner";
import { ViewType } from "../App";
import { Card } from "./ui/card";
import { useSubscription } from "./subscription/SubscriptionManager";

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  onLogout: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" as ViewType },
  { icon: Briefcase, label: "Portfolios", id: "portfolios" as ViewType },
  { icon: Wallet, label: "Holdings", id: "holdings" as ViewType },
  { icon: TrendingUp, label: "Analytics", id: "analytics" as ViewType },
  { icon: ArrowLeftRight, label: "Transactions", id: "transactions" as ViewType },
  { icon: Bell, label: "Alerts", id: "alerts" as ViewType },
  { icon: Settings, label: "Settings", id: "settings" as ViewType },
  { icon: User, label: "Profile", id: "profile" as ViewType },
];

export function Sidebar({ mobileMenuOpen, setMobileMenuOpen, activeView, setActiveView, onLogout }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { subscription } = useSubscription();

  const handleNavClick = (item: typeof navItems[0]) => {
    setActiveView(item.id);
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    toast.success("Logged out successfully");
    onLogout();
    setMobileMenuOpen(false);
  };

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-background">
      {/* Logo */}
      <div className="p-6 border-b border-[var(--color-border-primary)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="tracking-tight text-[var(--color-text-default)]">Civsesor</div>
            <div className="text-xs text-[var(--color-text-muted)]">Portfolio Manager</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto min-h-0 custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => handleNavClick(item)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative",
              activeView === item.id
                ? "bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/20"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="flex-1 text-left">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Subscription Status */}
      <div className="p-4 border-t border-[var(--color-border-primary)]">
        <Card className={cn(
          "p-4 bg-[var(--color-bg-accent)] border-[var(--color-border-primary)]",
          subscription.tier === "premium" ? "bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20" :
            subscription.tier === "pro" ? "bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/20" :
              ""
        )}>
          <div className="flex items-center gap-3 mb-2">
            {subscription.tier === "premium" ? <Crown className="w-5 h-5 text-purple-400" /> :
              subscription.tier === "pro" ? <Zap className="w-5 h-5 text-cyan-400" /> :
                <TrendingUp className="w-5 h-5 text-[var(--color-text-muted)]" />}
            <div className="flex-1">
              <div className="text-sm mb-0.5 text-[var(--color-text-default)]">{subscription.tier === "free" ? "Free Plan" : `${subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan`}</div>
              <div className="text-xs text-[var(--color-text-muted)]">
                {subscription.tier === "free" ? "Limited features" :
                  subscription.tier === "pro" ? "Pro features unlocked" :
                    "All features unlocked"}
              </div>
            </div>
          </div>
          {subscription.tier !== "premium" && (
            <Button
              onClick={() => setActiveView("subscription")}
              size="sm"
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
        </Card>
      </div>

      {/* Theme Toggle & Logout */}
      <div className="p-4 border-t border-[var(--color-border-primary)] space-y-2">
        <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-[var(--color-bg-accent)]">
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon className="w-5 h-5 text-foreground" /> : <Sun className="w-5 h-5 text-foreground" />}
            <span className="text-sm text-foreground">Dark Mode</span>
          </div>
          <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
        </div>

        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start gap-3 text-red-500 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] backdrop-blur-xl hidden lg:block">
        {renderSidebarContent()}
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-64 bg-[var(--color-bg-secondary)] backdrop-blur-xl border-[var(--color-border-primary)]">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Access portfolio sections including Dashboard, Portfolios, Analytics, and Settings
          </SheetDescription>
          {renderSidebarContent()}
        </SheetContent>
      </Sheet>
    </>
  );
}
