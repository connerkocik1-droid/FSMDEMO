import { Redirect, Link } from "wouter";
import { useMockAuth } from "@/lib/mock-auth";
import type { Role, Feature, AddonType } from "@/lib/permissions";
import { isAtLeastRole, canAccess, getUpgradeRequirement, ADDON_PRICES } from "@/lib/permissions";
import { Lock, ArrowUpRight, Zap, Plus } from "lucide-react";

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
    const req = getUpgradeRequirement(requiredFeature);
    if (req.addon && tier === "pro") {
      const addonInfo = ADDON_PRICES[req.addon];
      return <AddonPromptFull addon={req.addon} addonInfo={addonInfo} />;
    }
    return <UpgradePromptFull fromTier={tier} toTier={req.tier ?? "pro"} />;
  }

  return <>{children}</>;
}

function UpgradePromptFull({ fromTier, toTier }: { fromTier: string; toTier: string }) {
  const price = toTier === "pro" ? "$59/month" : "$129/month";
  const firstMonth = toTier === "pro" ? "$29.50 today" : "$64.50 today";
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto px-4">
      <div className="w-16 h-16 bg-blue-100 rounded-2xl mb-4 flex items-center justify-center">
        <Zap className="w-8 h-8 text-blue-500" />
      </div>
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold mb-3 capitalize">
        ServiceOS {toTier}
      </div>
      <h2 className="text-2xl font-bold font-display text-foreground">
        This feature requires ServiceOS {toTier === "pro" ? "Pro" : "Enterprise"}
      </h2>
      <p className="text-muted-foreground mt-2">
        {toTier === "pro"
          ? `Unlock AI-powered automation, full analytics, and more for ${price} — 50% off your first 30 days.`
          : `Get multi-location management, all add-ons included, custom API, and dedicated support for ${price}.`}
      </p>
      <p className="text-sm text-green-600 font-semibold mt-2">🎉 50% off first 30 days — {firstMonth}</p>
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link href={`/checkout?tier=${toTier}&billing=monthly`}>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all">
            Upgrade to {toTier === "pro" ? "Pro" : "Enterprise"} <ArrowUpRight className="w-4 h-4" />
          </button>
        </Link>
        <Link href="/pricing">
          <button className="inline-flex items-center gap-2 px-6 py-3 border rounded-xl font-semibold text-foreground hover:bg-secondary transition-all">
            View all plans
          </button>
        </Link>
      </div>
    </div>
  );
}

function AddonPromptFull({ addon, addonInfo }: { addon: AddonType; addonInfo: { name: string; price: number; unit: string; description: string } }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-lg mx-auto px-4">
      <div className="w-16 h-16 bg-violet-100 rounded-2xl mb-4 flex items-center justify-center">
        <Plus className="w-8 h-8 text-violet-500" />
      </div>
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-semibold mb-3">
        Add-on required
      </div>
      <h2 className="text-2xl font-bold font-display text-foreground">
        {addonInfo.name} — ${addonInfo.price}{addonInfo.unit}
      </h2>
      <p className="text-muted-foreground mt-2">{addonInfo.description}</p>
      <p className="text-sm text-muted-foreground mt-1">Available on your Pro plan. Cancel anytime.</p>
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link href={`/settings/add-ons#${addon.replace("_", "-")}`}>
          <button className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-all">
            Add {addonInfo.name} <ArrowUpRight className="w-4 h-4" />
          </button>
        </Link>
        <Link href="/pricing">
          <button className="inline-flex items-center gap-2 px-6 py-3 border rounded-xl font-semibold text-foreground hover:bg-secondary transition-all">
            See all add-ons
          </button>
        </Link>
      </div>
    </div>
  );
}

export function UpgradeCard({ feature, title, description }: { feature: Feature; title: string; description: string }) {
  const req = getUpgradeRequirement(feature);
  const isAddon = req.addon !== null;

  if (isAddon && req.addon) {
    const addonInfo = ADDON_PRICES[req.addon];
    return (
      <div className="bg-gradient-to-br from-violet-50 to-violet-100/50 border border-violet-200 rounded-2xl p-6 flex flex-col items-start">
        <div className="flex items-center gap-2 mb-2">
          <Plus className="w-4 h-4 text-violet-600" />
          <span className="text-xs font-semibold text-violet-700 uppercase tracking-wider">Add-on · ${addonInfo.price}{addonInfo.unit}</span>
        </div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        <Link href={`/settings/add-ons#${req.addon.replace("_", "-")}`}>
          <button className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm rounded-lg font-semibold hover:bg-violet-700 transition-all">
            Add {addonInfo.name} <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>
    );
  }

  const toTier = req.tier ?? "pro";
  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 flex flex-col items-start">
      <div className="flex items-center gap-2 mb-2">
        <Lock className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">{toTier === "pro" ? "Pro" : "Enterprise"} Plan</span>
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
      <Link href={`/checkout?tier=${toTier}&billing=monthly`}>
        <button className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-lg font-semibold hover:bg-primary/90 transition-all">
          Upgrade to {toTier === "pro" ? "Pro" : "Enterprise"} <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </Link>
    </div>
  );
}
