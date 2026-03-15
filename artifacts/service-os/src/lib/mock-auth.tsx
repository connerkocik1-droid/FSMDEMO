import React, { createContext, useContext, useState, useCallback } from "react";
import type { Role, Tier } from "./permissions";
import { canAccess, hasPermission, isAtLeastRole } from "./permissions";
import type { Feature, Permission } from "./permissions";

interface MockUser {
  id: string;
  fullName: string;
  primaryEmailAddress: { emailAddress: string };
  imageUrl: string;
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
  signIn: () => void;
  signOut: () => void;
  setRole: (role: Role) => void;
  setTier: (tier: Tier) => void;
  canAccessFeature: (feature: Feature) => boolean;
  hasPermission: (permission: Permission) => boolean;
  isAtLeastRole: (requiredRole: Role) => boolean;
}

const defaultUser: MockUser = {
  id: "user_mock_123",
  fullName: "Demo User",
  primaryEmailAddress: { emailAddress: "demo@serviceos.com" },
  imageUrl: "https://i.pravatar.cc/150?u=demo",
  publicMetadata: {
    role: "owner",
    tier: "pro",
    companyId: 1,
  }
};

const AuthContext = createContext<AuthContextType | null>(null);

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [role, setRole] = useState<Role>("owner");
  const [tier, setTier] = useState<Tier>("pro");

  const signIn = useCallback(() => setIsSignedIn(true), []);
  const signOut = useCallback(() => setIsSignedIn(false), []);

  const currentUser: MockUser | null = isSignedIn ? {
    ...defaultUser,
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
        signIn,
        signOut,
        setRole,
        setTier,
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
        <p className="text-xs text-muted-foreground mt-0.5 capitalize">{user.publicMetadata.role}</p>
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
