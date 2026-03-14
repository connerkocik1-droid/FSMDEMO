import { useLocation } from "wouter";
import { Bell, Search } from "lucide-react";

export function Header() {
  const [location] = useLocation();
  
  // Format the path into a readable title
  const title = location === "/dashboard" 
    ? "Dashboard" 
    : location.split('/')[1]?.charAt(0).toUpperCase() + location.split('/')[1]?.slice(1) || "Dashboard";

  return (
    <header className="h-20 flex items-center justify-between px-8 bg-background/80 backdrop-blur-md border-b sticky top-0 z-30">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search jobs, customers..." 
            className="pl-10 pr-4 py-2 bg-secondary/50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all focus:bg-background"
          />
        </div>
        
        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-background"></span>
        </button>
      </div>
    </header>
  );
}
