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
  BookOpen,
  Globe,
  Building,
  Key,
  UserCircle,
  CreditCard,
  ClipboardList,
  Building2,
  Sparkles,
  Receipt,
  Puzzle,
} from "lucide-react";
import { useState } from "react";
import { useMockAuth, MockUserButton } from "@/lib/mock-auth";
import type { Feature } from "@/lib/permissions";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  feature?: Feature;
  minRole?: "owner" | "admin" | "manager" | "operator";
}

interface NavItemWithAliases extends NavItem {
  operatorName?: string;
  operatorAlwaysShow?: boolean;
}

interface NavGroupDef {
  label: string;
  operatorLabel?: string;
  items: NavItemWithAliases[];
}

const navGroups: NavGroupDef[] = [
  {
    label: "Operations",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "Jobs & Dispatch", operatorName: "My Jobs", href: "/jobs", icon: Briefcase },
      { name: "Dispatch Board", href: "/dispatch", icon: MapPin, minRole: "admin" },
      { name: "Live GPS", href: "/gps", icon: MapPin, feature: "gps_tracking", minRole: "admin" },
    ]
  },
  {
    label: "CRM",
    items: [
      { name: "Leads", href: "/leads", icon: BookOpen, minRole: "admin" },
      { name: "Customers", href: "/customers", icon: Users, minRole: "admin" },
    ]
  },
  {
    label: "Communication",
    items: [
      { name: "SMS Hub", operatorName: "Chat", href: "/sms", icon: MessageSquare, feature: "manual_sms", operatorAlwaysShow: true },
      { name: "Reviews", href: "/reviews", icon: Star, feature: "referral_network", minRole: "admin" },
      { name: "Referrals", href: "/referrals", icon: Share2, feature: "referral_network", minRole: "admin" },
    ]
  },
  {
    label: "Reports",
    items: [
      { name: "Financials", operatorName: "My Earnings", href: "/financials", icon: WalletCards, feature: "basic_financials", operatorAlwaysShow: true },
      { name: "Invoices", href: "/invoices", icon: Receipt, feature: "basic_financials", minRole: "admin" },
      { name: "Analytics", href: "/analytics", icon: LineChart, feature: "full_analytics", minRole: "admin" },
      { name: "Insights", href: "/insights", icon: Sparkles, feature: "full_analytics", minRole: "admin" },
    ]
  },
  {
    label: "Account",
    items: [
      { name: "My Profile", href: "/settings/profile", icon: UserCircle },
      { name: "Company", href: "/settings/company", icon: Building2, minRole: "admin" },
      { name: "Team", href: "/settings/users", icon: Users, minRole: "admin" },
      { name: "Billing", href: "/settings/billing", icon: CreditCard, minRole: "owner" },
      { name: "Add-ons", href: "/settings/add-ons", icon: Puzzle, minRole: "owner" },
      { name: "Audit Log", href: "/settings/audit", icon: ClipboardList, minRole: "admin" },
    ]
  },
  {
    label: "Settings",
    items: [
      { name: "Landing Pages", href: "/settings/landing-pages", icon: Globe, feature: "landing_pages", minRole: "owner" },
      { name: "Locations", href: "/settings/locations", icon: Building, feature: "multi_location", minRole: "owner" },
      { name: "API Keys", href: "/settings/api-keys", icon: Key, feature: "custom_api", minRole: "owner" },
    ]
  }
];

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { canAccessFeature, isAtLeastRole, role } = useMockAuth();
  const isOperator = !isAtLeastRole("admin");

  const NavContent = () => (
    <>
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="ServiceOS Logo" className="w-8 h-8 rounded-lg" />
          <span className="font-display font-bold text-xl tracking-tight text-sidebar-foreground">ServiceOS</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(item => {
            if (item.minRole && !isAtLeastRole(item.minRole)) return false;
            if (item.feature && !canAccessFeature(item.feature)) {
              if (isOperator && (item as NavItemWithAliases).operatorAlwaysShow) return true;
              return false;
            }
            return true;
          });
          if (visibleItems.length === 0) return null;
          
          return (
            <div key={group.label}>
              <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
                {group.label}
              </h3>
              <nav className="space-y-1">
                {visibleItems.map((item) => {
                  const isActive = location === item.href || location.startsWith(`${item.href}/`);
                  const isLocked = item.feature && !canAccessFeature(item.feature) && !(isOperator && (item as NavItemWithAliases).operatorAlwaysShow);
                  const displayName = isOperator && (item as NavItemWithAliases).operatorName ? (item as NavItemWithAliases).operatorName : item.name;
                  
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
                      title={isLocked ? "Upgrade to unlock this feature" : undefined}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-sidebar-foreground/60")} />
                        {displayName}
                      </div>
                      {isLocked && <Lock className="w-4 h-4 text-sidebar-foreground/40" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          );
        })}
      </div>

      <div className="p-4 mt-auto border-t border-sidebar-border">
        <div className="px-2 py-2">
          <MockUserButton />
        </div>
      </div>
    </>
  );

  return (
    <>
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card rounded-lg shadow-md border"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

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
