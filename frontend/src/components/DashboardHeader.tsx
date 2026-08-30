import { useState } from "react";
import { Search, Download, Plus, Edit3, Menu, FileSpreadsheet, FileText, DollarSign } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu";
import { toast } from "sonner";
import { ViewType } from "../App";

interface DashboardHeaderProps {
  setMobileMenuOpen: (value: boolean) => void;
  setAddInvestmentOpen: (value: boolean) => void;
  setEditPortfolioOpen: (value: boolean) => void;
  setManualTransactionOpen: (value: boolean) => void;
  activeView: ViewType;
}



const viewTitles: Record<ViewType, { title: string; subtitle: string }> = {
  dashboard: { title: "Portfolio Dashboard", subtitle: "Track and manage your investments" },
  portfolios: { title: "My Portfolios", subtitle: "Manage multiple investment portfolios" },
  analytics: { title: "Analytics", subtitle: "Deep insights and performance metrics" },
  transactions: { title: "Transactions", subtitle: "Complete transaction history" },
  holdings: { title: "Current Holdings", subtitle: "Detailed view of all positions" },
  alerts: { title: "Alerts", subtitle: "Stay informed about your investments" },
  settings: { title: "Settings", subtitle: "Manage your preferences" },
  profile: { title: "Profile", subtitle: "Your account information" },
  "asset-detail": { title: "Asset Details", subtitle: "Detailed information and history" },
  subscription: { title: "Subscription Plans", subtitle: "Choose the perfect plan for your wealth management" },
};

export function DashboardHeader({
  setMobileMenuOpen,
  setAddInvestmentOpen,
  setEditPortfolioOpen,
  setManualTransactionOpen,
  activeView
}: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 2) {
      // Simulated search functionality
      toast.info(`Searching for: ${e.target.value}`);
    }
  };

  const handleExport = (format: "pdf" | "excel") => {
    toast.success(`Exporting portfolio report as ${format.toUpperCase()}...`);
    // Simulate export delay
    setTimeout(() => {
      toast.success(`${format.toUpperCase()} export completed!`);
    }, 2000);
  };

  return (
    <header className="border-b border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] backdrop-blur-xl sticky top-0 z-30">
      <div className="p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Mobile Menu & Title */}
          <div className="flex items-center gap-4 flex-1">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl text-[var(--color-text-default)]">{viewTitles[activeView].title}</h1>
              <p className="text-sm text-[var(--color-text-muted)] hidden sm:block">{viewTitles[activeView].subtitle}</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <Input
              placeholder="Search assets, transactions..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 bg-background border-border focus:border-cyan-500 focus:ring-cyan-500/20"
            />
          </div>



          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-border hover:border-cyan-500 hover:text-cyan-400 text-foreground">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border-border text-foreground">
                <DropdownMenuItem
                  onClick={() => handleExport("pdf")}
                  className="cursor-pointer focus:bg-accent focus:text-cyan-400"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleExport("excel")}
                  className="cursor-pointer focus:bg-accent focus:text-cyan-400"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border hover:border-blue-500 hover:text-blue-400 text-foreground"
              onClick={() => setEditPortfolioOpen(true)}
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-popover border-border text-foreground" align="end">
                <DropdownMenuItem
                  onClick={() => setManualTransactionOpen(true)}
                  className="cursor-pointer focus:bg-accent focus:text-cyan-400"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Record Transaction
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={() => setAddInvestmentOpen(true)}
                  className="cursor-pointer focus:bg-accent focus:text-cyan-400"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Quick Add Investment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
