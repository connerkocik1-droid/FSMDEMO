import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Role, Tier, AddonType } from "./permissions";
import { canAccess, hasPermission, isAtLeastRole, ADDON_PRICES } from "./permissions";
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
  addons: AddonType[];
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
    tagline: "Getting started — 10 user cap",
    unlocked: ["10 users included", "Core scheduling & dispatch", "Basic invoicing & quotes", "CRM & customer management"],
    locked: ["AI SMS workflows", "Full analytics", "GPS tracking", "Add-ons"],
    addons: [],
  },
  {
    id: "pro_owner",
    name: "Jordan Lee",
    email: "jordan@leehvac.com",
    company: "Lee HVAC Services",
    avatar: "https://i.pravatar.cc/150?u=jordan-lee",
    role: "owner",
    tier: "pro",
    tagline: "Growing team, full automation",
    unlocked: ["25 users included", "AI SMS & auto-responses", "Full analytics", "Recurring jobs", "Priority support", "GPS Tracking (add-on)", "SMS Campaigns (add-on)"],
    locked: ["Multi-location (add-on)", "White label (add-on)", "Custom API"],
    addons: ["gps_tracking", "sms_marketing"],
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
    unlocked: ["50 users per location", "3 locations included", "All add-ons included free", "Custom API & integrations", "Dedicated account manager"],
    locked: [],
    addons: ["gps_tracking", "landing_page", "sms_marketing", "live_chat", "background_check", "custom_reports", "multi_location", "white_label", "onboarding_session"],
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
    unlocked: ["My job queue", "SMS check-in", "Job completion reports"],
    locked: ["Financials", "CRM & Leads", "Analytics", "Dispatch board"],
    addons: ["gps_tracking", "sms_marketing"],
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
  addons: AddonType[];
  companyId: number | null;
  activeProfileId: string | null;
  isDemoSession: boolean;
  signIn: () => void;
  signInAs: (profile: DemoProfile) => void;
  signOut: () => void;
  setRole: (role: Role) => void;
  setTier: (tier: Tier) => void;
  setAddons: (addons: AddonType[]) => void;
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
  const [addons, setAddons] = useState<AddonType[]>(() => {
    try { const s = sessionStorage.getItem("mock_addons"); return s ? JSON.parse(s) : []; } catch { return []; }
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
      sessionStorage.setItem("mock_addons", JSON.stringify(addons));
      sessionStorage.setItem("is_demo_session", String(isDemoSession));
      if (activeProfile) sessionStorage.setItem("mock_profile", JSON.stringify(activeProfile));
      else sessionStorage.removeItem("mock_profile");
    } catch {}
  }, [isSignedIn, role, tier, addons, activeProfile, isDemoSession]);

  const signIn = useCallback(() => {
    setRole("owner");
    setTier("pro");
    setAddons([]);
    setActiveProfile(null);
    setIsSignedIn(true);
  }, []);

  const signInAs = useCallback((profile: DemoProfile) => {
    setRole(profile.role);
    setTier(profile.tier);
    setAddons(profile.addons);
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
        addons,
        companyId: isSignedIn ? 1 : null,
        activeProfileId: activeProfile?.id ?? null,
        isDemoSession,
        signIn,
        signInAs,
        signOut,
        setRole,
        setTier,
        setAddons,
        setDemoSession: setIsDemoSession,
        endDemoSession,
        canAccessFeature: (feature: Feature) => canAccess(feature, tier, addons.map(a => ({ addonType: a, isActive: true }))),
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

const ALL_ADDON_TYPES: AddonType[] = [
  "gps_tracking", "landing_page", "sms_marketing", "live_chat",
  "background_check", "custom_reports", "multi_location", "white_label", "onboarding_session",
];

export function RoleTierSwitcher() {
  const { role, tier, addons, setRole, setTier, setAddons } = useMockAuth();
  const roles: Role[] = ["owner", "admin", "manager", "operator"];
  const tiers: Tier[] = ["free", "pro", "enterprise"];

  const toggleAddon = (addon: AddonType) => {
    setAddons(
      addons.includes(addon)
        ? addons.filter(a => a !== addon)
        : [...addons, addon]
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-card border border-border rounded-xl shadow-lg p-3 space-y-2 text-xs max-h-[80vh] overflow-y-auto">
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
      <div className="border-t border-border pt-2 mt-2">
        <p className="font-semibold text-muted-foreground uppercase tracking-wider mb-1">Add-ons</p>
        <div className="space-y-1">
          {ALL_ADDON_TYPES.map(addon => (
            <label key={addon} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={addons.includes(addon)}
                onChange={() => toggleAddon(addon)}
                className="rounded border-border"
              />
              <span className="text-foreground">{ADDON_PRICES[addon].name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
