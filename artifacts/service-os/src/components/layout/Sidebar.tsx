import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  MapPin, 
  MessageSquare, 
  Star, 
  Share2, 
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
  ChevronDown,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";
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
  operatorName?: string;
  operatorAlwaysShow?: boolean;
  children?: NavItem[];
}

interface NavGroupDef {
  label?: string;
  operatorLabel?: string;
  items: NavItem[];
  pinBottom?: boolean;
}

const mainNavGroups: NavGroupDef[] = [
  {
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    items: [
      {
        name: "Jobs", operatorName: "My Jobs", href: "/jobs", icon: Briefcase,
        children: [
          { name: "Dispatch Board", href: "/dispatch", icon: MapPin, minRole: "admin" },
          { name: "Live GPS", href: "/gps", icon: MapPin, feature: "gps_tracking", minRole: "admin" },
        ]
      },
    ]
  },
  {
    items: [
      {
        name: "Customers", href: "/customers", icon: Users, minRole: "admin",
        children: [
          { name: "Leads", href: "/leads", icon: BookOpen, minRole: "admin" },
        ]
      },
    ]
  },
  {
    items: [
      { name: "Inbox", operatorName: "Chat", href: "/sms", icon: MessageSquare, feature: "manual_sms", operatorAlwaysShow: true },
    ]
  },
  {
    items: [
      {
        name: "Finance", operatorName: "My Earnings", href: "/financials", icon: WalletCards, feature: "basic_financials", operatorAlwaysShow: true,
        children: [
          { name: "Invoices", href: "/invoices", icon: Receipt, feature: "basic_financials", minRole: "admin" },
        ]
      },
    ]
  },
  {
    items: [
      {
        name: "Reports", href: "/analytics", icon: BarChart3, feature: "full_analytics", minRole: "admin",
        children: [
          { name: "Insights", href: "/insights", icon: Sparkles, feature: "full_analytics", minRole: "admin" },
          { name: "Reviews", href: "/reviews", icon: Star, feature: "referral_network", minRole: "admin" },
          { name: "Referrals", href: "/referrals", icon: Share2, feature: "referral_network", minRole: "admin" },
        ]
      },
    ]
  },
];

const settingsNavGroup: NavGroupDef = {
  pinBottom: true,
  items: [
    { name: "My Profile", href: "/settings/profile", icon: UserCircle },
    { name: "Company", href: "/settings/company", icon: Building2, minRole: "admin" },
    { name: "Team", href: "/settings/users", icon: Users, minRole: "admin" },
    { name: "Billing", href: "/settings/billing", icon: CreditCard, minRole: "owner" },
    { name: "Add-ons", href: "/settings/add-ons", icon: Puzzle, minRole: "owner" },
    { name: "Audit Log", href: "/settings/audit", icon: ClipboardList, minRole: "admin" },
    { name: "Landing Pages", href: "/settings/landing-pages", icon: Globe, feature: "landing_pages", minRole: "owner" },
    { name: "Locations", href: "/settings/locations", icon: Building, feature: "multi_location", minRole: "owner" },
    { name: "API Keys", href: "/settings/api-keys", icon: Key, feature: "custom_api", minRole: "owner" },
  ],
};

function NavItemLink({ item, location, isOperator, canAccessFeature, isAtLeastRole, indent }: {
  item: NavItem;
  location: string;
  isOperator: boolean;
  canAccessFeature: (f: Feature) => boolean;
  isAtLeastRole: (r: string) => boolean;
  indent?: boolean;
}) {
  const isActive = location === item.href || location.startsWith(`${item.href}/`);
  const isLocked = item.feature && !canAccessFeature(item.feature) && !(isOperator && item.operatorAlwaysShow);
  const displayName = isOperator && item.operatorName ? item.operatorName : item.name;

  return (
    <Link
      href={isLocked ? "#" : item.href}
      className={cn(
        "flex items-center justify-between py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
        indent ? "pl-10 pr-3" : "px-3",
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
}

function NavParentItem({ item, location, isOperator, canAccessFeature, isAtLeastRole }: {
  item: NavItem;
  location: string;
  isOperator: boolean;
  canAccessFeature: (f: Feature) => boolean;
  isAtLeastRole: (r: string) => boolean;
}) {
  const visibleChildren = (item.children || []).filter(child => {
    if (child.minRole && !isAtLeastRole(child.minRole)) return false;
    if (child.feature && !canAccessFeature(child.feature)) return false;
    return true;
  });

  const isChildActive = visibleChildren.some(child => location === child.href || location.startsWith(`${child.href}/`));
  const isSelfActive = location === item.href || location.startsWith(`${item.href}/`);
  const [expanded, setExpanded] = useState(isSelfActive || isChildActive);

  useEffect(() => {
    if (isSelfActive || isChildActive) setExpanded(true);
  }, [location, isSelfActive, isChildActive]);

  if (visibleChildren.length === 0) {
    return <NavItemLink item={item} location={location} isOperator={isOperator} canAccessFeature={canAccessFeature} isAtLeastRole={isAtLeastRole} />;
  }

  const isLocked = item.feature && !canAccessFeature(item.feature) && !(isOperator && item.operatorAlwaysShow);
  const displayName = isOperator && item.operatorName ? item.operatorName : item.name;

  return (
    <div>
      <div className="flex items-center">
        <Link
          href={isLocked ? "#" : item.href}
          className={cn(
            "flex-1 flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-medium transition-all duration-200",
            isSelfActive
              ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-primary/20"
              : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            isLocked && "opacity-50 cursor-not-allowed hover:bg-transparent"
          )}
          title={isLocked ? "Upgrade to unlock this feature" : undefined}
        >
          <div className="flex items-center gap-3">
            <item.icon className={cn("w-5 h-5", isSelfActive ? "text-white" : "text-sidebar-foreground/60")} />
            {displayName}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(!expanded); }}
            className="p-0.5 rounded hover:bg-sidebar-accent/50"
          >
            {expanded
              ? <ChevronDown className={cn("w-4 h-4", isSelfActive ? "text-white" : "text-sidebar-foreground/40")} />
              : <ChevronRight className={cn("w-4 h-4", isSelfActive ? "text-white" : "text-sidebar-foreground/40")} />}
          </button>
        </Link>
      </div>
      {expanded && (
        <div className="mt-0.5 space-y-0.5">
          {visibleChildren.map(child => (
            <NavItemLink key={child.name} item={child} location={location} isOperator={isOperator} canAccessFeature={canAccessFeature} isAtLeastRole={isAtLeastRole} indent />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { canAccessFeature, isAtLeastRole, role } = useMockAuth();
  const isOperator = !isAtLeastRole("admin");

  const isItemVisible = (item: NavItem) => {
    if (item.minRole && !isAtLeastRole(item.minRole)) return false;
    if (item.feature && !canAccessFeature(item.feature)) {
      if (isOperator && item.operatorAlwaysShow) return true;
      return false;
    }
    return true;
  };

  const isItemOrChildrenVisible = (item: NavItem): boolean => {
    if (isItemVisible(item)) return true;
    if (item.children && item.children.some(child => isItemVisible(child))) return true;
    return false;
  };

  const settingsItems = settingsNavGroup.items.filter(isItemVisible);
  const isSettingsActive = settingsItems.some(item => location === item.href || location.startsWith(`${item.href}/`));

  useEffect(() => {
    if (isSettingsActive) setSettingsOpen(true);
  }, [location, isSettingsActive]);

  const NavContent = () => (
    <>
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 transition-transform hover:scale-105 active:scale-95">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="ServiceOS Logo" className="w-8 h-8 rounded-lg" />
          <span className="font-display font-bold text-xl tracking-tight text-sidebar-foreground">ServiceOS</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {mainNavGroups.map((group, gi) => {
          const visibleItems = group.items.filter(isItemOrChildrenVisible);
          if (visibleItems.length === 0) return null;

          return (
            <div key={gi}>
              {group.label && (
                <h3 className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 mt-4">
                  {group.label}
                </h3>
              )}
              <nav className="space-y-0.5">
                {visibleItems.map(item => (
                  item.children
                    ? <NavParentItem key={item.name} item={item} location={location} isOperator={isOperator} canAccessFeature={canAccessFeature} isAtLeastRole={isAtLeastRole} />
                    : <NavItemLink key={item.name} item={item} location={location} isOperator={isOperator} canAccessFeature={canAccessFeature} isAtLeastRole={isAtLeastRole} />
                ))}
              </nav>
            </div>
          );
        })}
      </div>

      <div className="mt-auto border-t border-sidebar-border">
        <div className="px-4 py-2">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className={cn(
              "w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              isSettingsActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-primary/20"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <Settings className={cn("w-5 h-5", isSettingsActive ? "text-white" : "text-sidebar-foreground/60")} />
              Settings
            </div>
            {settingsOpen
              ? <ChevronDown className={cn("w-4 h-4", isSettingsActive ? "text-white" : "text-sidebar-foreground/40")} />
              : <ChevronRight className={cn("w-4 h-4", isSettingsActive ? "text-white" : "text-sidebar-foreground/40")} />}
          </button>
          {settingsOpen && (
            <div className="mt-0.5 space-y-0.5">
              {settingsItems.map(item => (
                <NavItemLink key={item.name} item={item} location={location} isOperator={isOperator} canAccessFeature={canAccessFeature} isAtLeastRole={isAtLeastRole} indent />
              ))}
            </div>
          )}
        </div>
        <div className="px-4 pb-4 pt-2 border-t border-sidebar-border">
          <div className="px-2 py-2">
            <MockUserButton />
          </div>
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
