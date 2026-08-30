import { Bell, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";

export function PortfolioHeader() {
  return (
    <header className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-foreground rounded-full" />
              <span className="tracking-tight text-foreground font-semibold">Portfolio+</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                Markets
              </a>
            </nav>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-4">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              Send
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              Lnk
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              Currency ▼
            </button>

            <button className="p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 cursor-pointer text-foreground group">
              <Avatar className="w-8 h-8 border border-border">
                <AvatarFallback className="bg-accent text-accent-foreground">JD</AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline text-sm font-medium">Olivia Wilson</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
