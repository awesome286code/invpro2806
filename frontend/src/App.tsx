import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardView } from "./components/views/DashboardView";
import { PortfoliosView } from "./components/views/PortfoliosView";
import { AnalyticsView } from "./components/views/AnalyticsView";
import { TransactionsView } from "./components/views/TransactionsView";
import { AlertsView } from "./components/views/AlertsView";
import { SettingsView } from "./components/views/SettingsView";
import { ProfileView } from "./components/views/ProfileView";
import { HoldingsDetailView } from "./components/views/HoldingsDetailView";
import { StockDetailView } from "./components/views/StockDetailView";
import { LoginView } from "./components/auth/LoginView";
import { SubscriptionView } from "./components/views/SubscriptionView";
import { AddInvestmentDialog } from "./components/AddInvestmentDialog";
import { EditPortfolioDialog } from "./components/EditPortfolioDialog";
import { PortfolioDetailsDialog } from "./components/PortfolioDetailsDialog";
import { ManualTransactionDialog, Transaction } from "./components/ManualTransactionDialog";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { useTheme } from "./contexts/ThemeContext";
import { SEO } from "./components/SEO";
import { webApplicationSchema, organizationSchema, getBreadcrumbSchema } from "./utils/seo/schemas";

export type ViewType = "dashboard" | "portfolios" | "analytics" | "transactions" | "alerts" | "settings" | "profile" | "holdings" | "asset-detail" | "subscription";

export default function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const { theme } = useTheme();
  const [timeRange] = useState("1M");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addInvestmentOpen, setAddInvestmentOpen] = useState(false);
  const [editPortfolioOpen, setEditPortfolioOpen] = useState(false);
  const [manualTransactionOpen, setManualTransactionOpen] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>("dashboard");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [editingPortfolio, setEditingPortfolio] = useState<any | null>(null);
  const [viewPortfolioOpen, setViewPortfolioOpen] = useState(false);
  const [viewingPortfolio, setViewingPortfolio] = useState<any | null>(null);
  const [selectedPortfolioForAdd, setSelectedPortfolioForAdd] = useState<{ id: string; name: string } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Load transactions from localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem("portfolio_transactions");
    if (savedTransactions) {
      try {
        const parsed = JSON.parse(savedTransactions);
        setTransactions(Array.isArray(parsed) ? parsed : []);
      } catch (e) {
        setTransactions([]);
      }
    }
  }, []);

  const handleLogout = () => {
    logout();
    setActiveView("dashboard");
  };

  const handleTransactionAdded = (transaction: Transaction) => {
    const updatedTransactions = [...transactions, transaction];
    setTransactions(updatedTransactions);
    handleRefresh();
  };

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <DashboardView
            timeRange={timeRange}
            refreshTrigger={refreshTrigger}
            onNavigateToAsset={(symbol) => {
              setSelectedSymbol(symbol);
              setActiveView("asset-detail");
            }}
            onNavigateToSubscription={() => setActiveView("subscription")}
          />
        );
      case "portfolios":
        return (
          <>
            <SEO
              title="Portfolios"
              description="Manage and track all your investment portfolios in one place."
              canonical="/portfolios"
              schema={getBreadcrumbSchema([{ name: 'Home', item: '/' }, { name: 'Portfolios', item: '/portfolios' }])}
            />
            <PortfoliosView
              refreshTrigger={refreshTrigger}
              setAddInvestmentOpen={setAddInvestmentOpen}
              onViewPortfolio={(id: string, name: string) => {
                setViewingPortfolio({ id, name });
                setViewPortfolioOpen(true);
              }}
              onEditPortfolio={(portfolio: any) => {
                setEditingPortfolio(portfolio);
                setEditPortfolioOpen(true);
              }}
              onCreatePortfolio={() => {
                setEditingPortfolio(null);
                setEditPortfolioOpen(true);
              }}
              onAddAsset={(portfolio: any) => {
                setSelectedPortfolioForAdd({ id: portfolio.id, name: portfolio.name });
                setAddInvestmentOpen(true);
              }}
            />
          </>
        );
      case "analytics":
        return (
          <>
            <SEO
              title="Analytics & Performance"
              description="Detailed analysis of your portfolio performance and market trends."
              canonical="/analytics"
              schema={getBreadcrumbSchema([{ name: 'Home', item: '/' }, { name: 'Analytics', item: '/analytics' }])}
            />
            <AnalyticsView timeRange={timeRange} />
          </>
        );
      case "transactions":
        return (
          <>
            <SEO title="Transactions History" description="View and manage your investment transaction history." />
            <TransactionsView />
          </>
        );
      case "alerts":
        return (
          <>
            <SEO title="Price Alerts" description="Set and monitor price alerts for your favorite assets." />
            <AlertsView />
          </>
        );
      case "settings":
        return (
          <>
            <SEO title="Settings" description="Configure your profile and application preferences." />
            <SettingsView />
          </>
        );
      case "profile":
        return (
          <>
            <SEO title="User Profile" description="Your personal information and account security." />
            <ProfileView />
          </>
        );
      case "holdings":
        return (
          <>
            <SEO
              title="Total Holdings"
              description="Detailed view of all your assets across all portfolios."
              canonical="/holdings"
              schema={getBreadcrumbSchema([{ name: 'Home', item: '/' }, { name: 'Holdings', item: '/holdings' }])}
            />
            <HoldingsDetailView
              onNavigateToAsset={(symbol) => {
                setSelectedSymbol(symbol);
                setActiveView("asset-detail");
              }}
            />
          </>
        );
      case "asset-detail":
        return selectedSymbol ? (
          <>
            <SEO title={`${selectedSymbol} Detail`} description={`In-depth analysis and history for ${selectedSymbol}.`} />
            <StockDetailView
              symbol={selectedSymbol}
              onBack={() => setActiveView("dashboard")}
            />
          </>
        ) : (
          <DashboardView
            timeRange={timeRange}
            onNavigateToAsset={(symbol: string) => {
              setSelectedSymbol(symbol);
              setActiveView("asset-detail");
            }}
            onNavigateToSubscription={() => setActiveView("subscription")}
          />
        );
      case "subscription":
        return (
          <>
            <SEO title="Premium Subscription" description="Upgrade to premium for advanced analytics and features." />
            <SubscriptionView />
          </>
        );
      default:
        return (
          <DashboardView
            timeRange={timeRange}
            onNavigateToAsset={(symbol: string) => {
              setSelectedSymbol(symbol);
              setActiveView("asset-detail");
            }}
            onNavigateToSubscription={() => setActiveView("subscription")}
          />
        );
    }
  };

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <SEO
          title="Login"
          description="Login to your investment portfolio dashboard."
          canonical="/login"
          schema={[organizationSchema, webApplicationSchema]}
        />
        <LoginView onLogin={() => { }} />
        <Toaster theme={theme} />
      </>
    );
  }

  return (
    <SocketProvider userId={user?.id}>
      <SEO
        title="Dashboard"
        description="Overview of your total wealth and portfolio performance."
        canonical="/"
        schema={getBreadcrumbSchema([{ name: 'Home', item: '/' }])}
      />
      <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-default)] transition-colors duration-200">
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          activeView={activeView}
          setActiveView={setActiveView}
          onLogout={handleLogout}
        />

        <div className="lg:pl-64">
          <DashboardHeader
            setMobileMenuOpen={setMobileMenuOpen}
            setAddInvestmentOpen={setAddInvestmentOpen}
            setEditPortfolioOpen={setEditPortfolioOpen}
            setManualTransactionOpen={setManualTransactionOpen}
            activeView={activeView}
          />

          <main className="p-4 lg:p-8">
            {renderView()}
          </main>
        </div>

        {/* Dialogs */}
        <AddInvestmentDialog
          open={addInvestmentOpen}
          onOpenChange={setAddInvestmentOpen}
          portfolioId={selectedPortfolioForAdd?.id}
          onSuccess={handleRefresh}
        />
        <EditPortfolioDialog
          open={editPortfolioOpen}
          onOpenChange={setEditPortfolioOpen}
          portfolio={editingPortfolio}
          onSuccess={handleRefresh}
        />
        <PortfolioDetailsDialog
          open={viewPortfolioOpen}
          onOpenChange={setViewPortfolioOpen}
          portfolio={viewingPortfolio}
          refreshTrigger={refreshTrigger}
        />
        <ManualTransactionDialog
          open={manualTransactionOpen}
          onOpenChange={setManualTransactionOpen}
          onTransactionAdded={handleTransactionAdded}
          portfolioId={selectedPortfolioForAdd?.id}
        />

        <Toaster theme={theme} />
      </div>
    </SocketProvider>
  );
}
