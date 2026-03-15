import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Role, Tier } from "./permissions";
import { canAccess, hasPermission, isAtLeastRole } from "./permissions";
import type { Feature, Permission } from "./permissions";

export interface DemoProfile {
  id: string;
  name: string;
  email: string;
  company: string;
  avatar: string;
  role: Role;
  tier: Tier;
  tagline: string;
  unlocked: string[];
  locked: string[];
}

export const DEMO_PROFILES: DemoProfile[] = [
  {
    id: "free_owner",
    name: "Sam Rivera",
    email: "sam@samplelawn.com",
    company: "Sample Lawn Co.",
    avatar: "https://i.pravatar.cc/150?u=sam-rivera",
    role: "owner",
    tier: "free",
    tagline: "Just getting started",
    unlocked: ["Up to 3 users", "Core scheduling", "Basic invoicing", "Dashboard"],
    locked: ["GPS tracking", "SMS hub", "Financials", "Analytics"],
  },
  {
    id: "independent_owner",
    name: "Taylor Brooks",
    email: "taylor@brooksroofing.com",
    company: "Brooks Roofing",
    avatar: "https://i.pravatar.cc/150?u=taylor-brooks",
    role: "owner",
    tier: "independent",
    tagline: "Solo operator growing fast",
    unlocked: ["Up to 6 users", "Live GPS tracking", "Manual SMS", "Referral network", "Financials"],
    locked: ["AI SMS workflows", "Full analytics", "Landing pages"],
  },
  {
    id: "pro_owner",
    name: "Jordan Lee",
    email: "jordan@leehvac.com",
    company: "Lee HVAC Services",
    avatar: "https://i.pravatar.cc/150?u=jordan-lee",
    role: "owner",
    tier: "pro",
    tagline: "Growing team, full visibility",
    unlocked: ["Up to 25 users", "AI SMS workflows", "Full analytics", "Review automation", "Priority support"],
    locked: ["Landing pages", "Multi-location routing", "Custom API"],
  },
  {
    id: "franchise_owner",
    name: "Casey Morgan",
    email: "casey@morganlawn.net",
    company: "Morgan Lawn Network",
    avatar: "https://i.pravatar.cc/150?u=casey-morgan",
    role: "owner",
    tier: "franchise",
    tagline: "Multi-location franchise",
    unlocked: ["Up to 75 users", "Landing page builder", "Multi-location routing", "Custom API access", "Dedicated success manager"],
    locked: [],
  },
  {
    id: "enterprise_owner",
    name: "Alex Chen",
    email: "alex@chenservices.com",
    company: "Chen Field Services Group",
    avatar: "https://i.pravatar.cc/150?u=alex-chen",
    role: "owner",
    tier: "enterprise",
    tagline: "Enterprise-scale operations",
    unlocked: ["Unlimited users", "Everything in Franchise", "Custom integrations", "Dedicated SLA", "White-glove onboarding"],
    locked: [],
  },
  {
    id: "field_tech",
    name: "Marcus Williams",
    email: "marcus@leehvac.com",
    company: "Lee HVAC Services",
    avatar: "https://i.pravatar.cc/150?u=marcus-williams",
    role: "operator",
    tier: "pro",
    tagline: "Field technician view",
    unlocked: ["My job queue", "SMS check-in", "Job completion reports", "GPS check-in"],
    locked: ["Financials", "CRM & Leads", "Analytics", "Dispatch board"],
  },
];

interface MockUser {
  id: string;
  fullName: string;
  primaryEmailAddress: { emailAddress: string };
  imageUrl: string;
  company: string;
  publicMetadata: {
    role: Role;
    tier: Tier;
    companyId: number;
  };
}

interface AuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: MockUser | null;
  role: Role;
  tier: Tier;
  companyId: number | null;
  activeProfileId: string | null;
  isDemoSession: boolean;
  signIn: () => void;
  signInAs: (profile: DemoProfile) => void;
  signOut: () => void;
  setRole: (role: Role) => void;
  setTier: (tier: Tier) => void;
  setDemoSession: (value: boolean) => void;
  endDemoSession: () => void;
  canAccessFeature: (feature: Feature) => boolean;
  hasPermission: (permission: Permission) => boolean;
  isAtLeastRole: (requiredRole: Role) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(() => {
    try { return sessionStorage.getItem("mock_signed_in") === "true"; } catch { return false; }
  });
  const [role, setRole] = useState<Role>(() => {
    try { return (sessionStorage.getItem("mock_role") as Role) || "owner"; } catch { return "owner"; }
  });
  const [tier, setTier] = useState<Tier>(() => {
    try { return (sessionStorage.getItem("mock_tier") as Tier) || "pro"; } catch { return "pro"; }
  });
  const [activeProfile, setActiveProfile] = useState<DemoProfile | null>(() => {
    try { const s = sessionStorage.getItem("mock_profile"); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [isDemoSession, setIsDemoSession] = useState(() => {
    try { return sessionStorage.getItem("is_demo_session") === "true"; } catch { return false; }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem("mock_signed_in", String(isSignedIn));
      sessionStorage.setItem("mock_role", role);
      sessionStorage.setItem("mock_tier", tier);
      sessionStorage.setItem("is_demo_session", String(isDemoSession));
      if (activeProfile) sessionStorage.setItem("mock_profile", JSON.stringify(activeProfile));
      else sessionStorage.removeItem("mock_profile");
    } catch {}
  }, [isSignedIn, role, tier, activeProfile, isDemoSession]);

  const signIn = useCallback(() => {
    setRole("owner");
    setTier("pro");
    setActiveProfile(null);
    setIsSignedIn(true);
  }, []);

  const signInAs = useCallback((profile: DemoProfile) => {
    setRole(profile.role);
    setTier(profile.tier);
    setActiveProfile(profile);
    setIsSignedIn(true);
  }, []);

  const signOut = useCallback(() => {
    setIsSignedIn(false);
    setActiveProfile(null);
    setIsDemoSession(false);
    try { sessionStorage.clear(); } catch {}
  }, []);

  const endDemoSession = useCallback(() => {
    setIsSignedIn(false);
    setActiveProfile(null);
    setIsDemoSession(false);
    try { sessionStorage.clear(); } catch {}
    window.location.href = import.meta.env.BASE_URL || "/";
  }, []);

  const currentUser: MockUser | null = isSignedIn ? {
    id: activeProfile ? `user_${activeProfile.id}` : "user_mock_123",
    fullName: activeProfile?.name ?? "Demo User",
    primaryEmailAddress: { emailAddress: activeProfile?.email ?? "demo@serviceos.com" },
    imageUrl: activeProfile?.avatar ?? "https://i.pravatar.cc/150?u=demo",
    company: activeProfile?.company ?? "Demo Company",
    publicMetadata: { role, tier, companyId: 1 },
  } : null;

  return (
    <AuthContext.Provider
      value={{
        isSignedIn,
        isLoaded: true,
        user: currentUser,
        role,
        tier,
        companyId: isSignedIn ? 1 : null,
        activeProfileId: activeProfile?.id ?? null,
        isDemoSession,
        signIn,
        signInAs,
        signOut,
        setRole,
        setTier,
        setDemoSession: setIsDemoSession,
        endDemoSession,
        canAccessFeature: (feature: Feature) => canAccess(feature, tier),
        hasPermission: (permission: Permission) => hasPermission(role, permission),
        isAtLeastRole: (requiredRole: Role) => isAtLeastRole(role, requiredRole),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useMockAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useMockAuth must be used within MockAuthProvider");
  return ctx;
}

export function MockSignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useMockAuth();
  return isSignedIn ? <>{children}</> : null;
}

export function MockSignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useMockAuth();
  return !isSignedIn ? <>{children}</> : null;
}

export function MockSignInButton() {
  const { signIn } = useMockAuth();
  return (
    <button onClick={signIn} className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow active:scale-95">
      Sign In
    </button>
  );
}

export function MockUserButton() {
  const { user, signOut } = useMockAuth();
  if (!user) return null;
  return (
    <button onClick={signOut} className="flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
      <img src={user.imageUrl} alt={user.fullName} className="w-8 h-8 rounded-full border border-border" />
      <div className="text-left hidden md:block">
        <p className="text-sm font-semibold leading-none">{user.fullName}</p>
        <p className="text-xs text-muted-foreground mt-0.5 capitalize">{user.publicMetadata.role} · {user.company}</p>
      </div>
    </button>
  );
}

export function RoleTierSwitcher() {
  const { role, tier, setRole, setTier } = useMockAuth();
  const roles: Role[] = ["owner", "admin", "manager", "operator"];
  const tiers: Tier[] = ["free", "independent", "pro", "franchise", "enterprise"];

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-xl shadow-lg p-3 space-y-2 text-xs">
      <p className="font-semibold text-muted-foreground uppercase tracking-wider">Dev Controls</p>
      <div className="flex items-center gap-2">
        <label className="text-muted-foreground">Role:</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="bg-secondary text-foreground rounded px-2 py-1 text-xs border-0"
        >
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-muted-foreground">Tier:</label>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as Tier)}
          className="bg-secondary text-foreground rounded px-2 py-1 text-xs border-0"
        >
          {tiers.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
    </div>
  );
}
