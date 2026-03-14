import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  MapPin, 
  MessageSquare, 
  Star, 
  Share2, 
  LineChart, 
  Settings,
  Menu,
  X,
  Lock,
  WalletCards,
  BookOpen
} from "lucide-react";
import { useState } from "react";
import { useMockAuth, MockUserButton } from "@/lib/mock-auth";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navGroups = [
  {
    label: "Operations",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Jobs & Dispatch", href: "/jobs", icon: Briefcase },
      { name: "Live GPS", href: "/gps", icon: MapPin, tier: "pro" },
    ]
  },
  {
    label: "CRM",
    items: [
      { name: "Leads", href: "/leads", icon: BookOpen },
      { name: "Customers", href: "/customers", icon: Users },
    ]
  },
  {
    label: "Communication",
    items: [
      { name: "SMS Hub", href: "/sms", icon: MessageSquare },
      { name: "Reviews", href: "/reviews", icon: Star },
      { name: "Referrals", href: "/referrals", icon: Share2 },
    ]
  },
  {
    label: "Reports",
    items: [
      { name: "Financials", href: "/financials", icon: WalletCards },
      { name: "Analytics", href: "/analytics", icon: LineChart, tier: "pro" },
    ]
  }
];

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useMockAuth();
  
  const userTier = user?.publicMetadata?.tier || "free";
  const isPro = userTier === "pro" || userTier === "franchise" || userTier === "enterprise";

  const NavContent = () => (
    <>
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="ServiceOS Logo" className="w-8 h-8 rounded-lg" />
          <span className="font-display font-bold text-xl tracking-tight text-sidebar-foreground">ServiceOS</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              {group.label}
            </h3>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const isActive = location === item.href || location.startsWith(`${item.href}/`);
                const isLocked = item.tier === "pro" && !isPro;
                
                return (
                  <Link
                    key={item.name}
                    href={isLocked ? "#" : item.href}
                    className={cn(
                      "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-primary/20" 
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-sidebar-foreground/60")} />
                      {item.name}
                    </div>
                    {isLocked && <Lock className="w-4 h-4 text-sidebar-foreground/40" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-4 mt-auto border-t border-sidebar-border space-y-2">
        <Link 
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
            location.startsWith("/settings")
              ? "bg-sidebar-accent text-sidebar-foreground"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <Settings className="w-5 h-5 text-sidebar-foreground/60" />
          Settings
        </Link>
        <div className="px-2 py-2">
          <MockUserButton />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-md border"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <button 
          className="lg:hidden absolute top-4 right-4 p-2 text-sidebar-foreground/60 hover:text-sidebar-foreground"
          onClick={() => setIsOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
        <NavContent />
      </aside>
    </>
  );
}
