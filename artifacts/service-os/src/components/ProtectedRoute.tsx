import { Redirect } from "wouter";
import { useMockAuth } from "@/lib/mock-auth";
import type { Role, Tier, Feature } from "@/lib/permissions";
import { isAtLeastRole, canAccess, getUpgradeTier } from "@/lib/permissions";
import { Lock, ArrowUpRight } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  minRole?: Role;
  requiredFeature?: Feature;
}

export function ProtectedRoute({ children, minRole, requiredFeature }: ProtectedRouteProps) {
  const { isSignedIn, role, tier } = useMockAuth();

  if (!isSignedIn) {
    return <Redirect to="/" />;
  }

  if (minRole && !isAtLeastRole(role, minRole)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-100 rounded-2xl mb-4 flex items-center justify-center">
          <Lock className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold font-display text-foreground">Access Restricted</h2>
        <p className="text-muted-foreground mt-2">
          This page requires <span className="font-semibold capitalize">{minRole}</span> access or higher.
          Your current role is <span className="font-semibold capitalize">{role}</span>.
        </p>
        <p className="text-sm text-muted-foreground mt-4">Contact your account owner for access.</p>
      </div>
    );
  }

  if (requiredFeature && !canAccess(requiredFeature, tier)) {
    const upgradeTo = getUpgradeTier(requiredFeature);
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl mb-4 flex items-center justify-center">
          <Lock className="w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold font-display text-foreground">Upgrade Required</h2>
        <p className="text-muted-foreground mt-2">
          This feature requires the <span className="font-semibold capitalize">{upgradeTo}</span> plan or higher.
        </p>
        <button className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all">
          Upgrade to {upgradeTo} <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

export function UpgradeCard({ feature, title, description }: { feature: Feature; title: string; description: string }) {
  const upgradeTo = getUpgradeTier(feature);
  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 flex flex-col items-start">
      <div className="flex items-center gap-2 mb-2">
        <Lock className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">{upgradeTo}+ Plan</span>
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      <button className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-semibold hover:bg-primary/90 transition-all">
        Upgrade to {upgradeTo} <ArrowUpRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
