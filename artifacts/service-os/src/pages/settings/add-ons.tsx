import { useState } from "react";
import { useMockAuth } from "@/lib/mock-auth";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import {
  MapPin, Radio, MessageSquare, ShieldCheck, FileBarChart2,
  Building2, Paintbrush, Calendar, Check, X, Loader2,
  ChevronRight, Sparkles, AlertCircle, ExternalLink,
} from "lucide-react";

type AddonKey = "gps" | "landing" | "sms_mkt" | "live_chat" | "bg_check" | "reports" | "multi_loc" | "white_label" | "onboarding";

interface AddonConfig {
  key: AddonKey;
  name: string;
  description: string;
  price: number;
  unit: string;
  icon: React.ComponentType<any>;
  category: "standard" | "enterprise";
  isPayPerUse?: boolean;
}

const ADDONS: AddonConfig[] = [
  { key: "gps",        name: "GPS Tracking",       description: "Live location tracking for every field technician on the map.", price: 14, unit: "/mo",             icon: MapPin,        category: "standard" },
  { key: "landing",    name: "Landing Pages",       description: "Create custom SEO-optimized landing pages per service area.",  price: 14, unit: "/mo per page",    icon: Radio,         category: "standard" },
  { key: "sms_mkt",   name: "SMS Campaigns",       description: "Send bulk SMS to your customer list for promotions & reminders.", price: 14, unit: "/mo",           icon: MessageSquare, category: "standard" },
  { key: "live_chat",  name: "Live Chat",           description: "Add a real-time chat widget to your customer-facing pages.",  price: 19, unit: "/mo",             icon: MessageSquare, category: "standard" },
  { key: "bg_check",   name: "Background Checks",   description: "Run instant background checks on new hires — $9 per check.", price: 9,  unit: "/check",           icon: ShieldCheck,   category: "standard", isPayPerUse: true },
  { key: "reports",    name: "Custom Reports",      description: "Build, save, and export any report with drag-and-drop.",      price: 19, unit: "/mo",             icon: FileBarChart2, category: "enterprise" },
  { key: "multi_loc",  name: "Multi-Location",      description: "Manage multiple business locations from one dashboard.",      price: 49, unit: "/mo per location", icon: Building2,     category: "enterprise" },
  { key: "white_label",name: "White Label",         description: "Remove all ServiceOS branding from client-facing portals.",   price: 49, unit: "/mo",             icon: Paintbrush,    category: "enterprise" },
  { key: "onboarding", name: "Onboarding Session",  description: "1-on-1 setup call with a ServiceOS specialist.",             price: 59, unit: " one-time",        icon: Calendar,      category: "enterprise", isPayPerUse: true },
];

export default function AddOnsSettings() {
  const { tier } = useMockAuth();
  const isEnterprise = tier === "enterprise";

  const [activeAddons, setActiveAddons] = useState<Set<AddonKey>>(
    isEnterprise ? new Set(ADDONS.map(a => a.key)) : new Set()
  );
  const [toggling, setToggling] = useState<AddonKey | null>(null);
  const [bgCheckModal, setBgCheckModal] = useState(false);
  const [onboardingModal, setOnboardingModal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function toggleAddon(key: AddonKey) {
    if (isEnterprise) return;
    setToggling(key);
    await new Promise(r => setTimeout(r, 900));
    setActiveAddons(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        showToast("Add-on removed. Feature will lock at end of billing period.");
      } else {
        next.add(key);
        showToast("Add-on activated! Feature is now unlocked.");
      }
      return next;
    });
    setToggling(null);
  }

  async function runBgCheck() {
    setBgCheckModal(false);
    showToast("Background check initiated — $9 charged to your card.");
  }

  async function bookOnboarding() {
    setOnboardingModal(false);
    showToast("Onboarding session booked! $59 charged. Check your email.");
  }

  const totalMonthlyCost = Array.from(activeAddons).reduce((sum, key) => {
    const addon = ADDONS.find(a => a.key === key);
    if (!addon || addon.isPayPerUse || isEnterprise) return sum;
    return sum + addon.price;
  }, 0);

  const standardAddons = ADDONS.filter(a => a.category === "standard");
  const enterpriseAddons = ADDONS.filter(a => a.category === "enterprise");

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-display font-bold text-foreground">Add-ons & feature unlocks</h2>
        <p className="text-muted-foreground mt-1">Activate features your business needs. Cancel any add-on anytime.</p>
      </div>

      {/* Enterprise banner */}
      {isEnterprise && (
        <div className="p-4 bg-violet-50 border border-violet-200 rounded-2xl flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-violet-600 shrink-0" />
          <div>
            <p className="font-semibold text-violet-900">All add-ons are included in your Enterprise plan</p>
            <p className="text-sm text-violet-600">You have full access to every feature below at no additional charge.</p>
          </div>
        </div>
      )}

      {/* Free tier notice */}
      {tier === "free" && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Add-ons are available on Pro and Enterprise</p>
            <p className="text-sm text-amber-700 mt-0.5">Upgrade to Pro to unlock add-ons and advanced features. 50% off your first 30 days.</p>
            <Link href="/checkout?tier=pro&billing=monthly">
              <button className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition-all">
                Upgrade to Pro — $29.50 first month <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Standard Add-ons */}
      <section>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Standard Add-ons</h3>
        <div className="space-y-3">
          {standardAddons.map(addon => (
            <AddonCard
              key={addon.key}
              addon={addon}
              isActive={activeAddons.has(addon.key)}
              isEnterprise={isEnterprise}
              isFree={tier === "free"}
              toggling={toggling === addon.key}
              onToggle={() => addon.isPayPerUse ? setBgCheckModal(true) : toggleAddon(addon.key)}
              onBgCheck={() => setBgCheckModal(true)}
            />
          ))}
        </div>
      </section>

      {/* Enterprise Unlocks */}
      <section>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Enterprise Features — Unlock without upgrading</h3>
        </div>
        {tier === "pro" && (
          <p className="text-xs text-muted-foreground mb-4">
            Or{" "}
            <Link href="/checkout?tier=enterprise&billing=monthly">
              <span className="text-primary hover:underline font-medium">upgrade to Enterprise</span>
            </Link>
            {" "}to get all of these included free.
          </p>
        )}
        <div className="space-y-3">
          {enterpriseAddons.map(addon => (
            <AddonCard
              key={addon.key}
              addon={addon}
              isActive={activeAddons.has(addon.key)}
              isEnterprise={isEnterprise}
              isFree={tier === "free"}
              toggling={toggling === addon.key}
              onToggle={() => addon.key === "onboarding" ? setOnboardingModal(true) : toggleAddon(addon.key)}
              onOnboarding={() => setOnboardingModal(true)}
            />
          ))}
        </div>
      </section>

      {/* Usage Summary */}
      <section className="bg-card border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b bg-secondary/40">
          <p className="font-semibold text-foreground">Current add-on spend</p>
        </div>
        <div className="divide-y">
          {ADDONS.filter(a => activeAddons.has(a.key) && !a.isPayPerUse).map(addon => (
            <div key={addon.key} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-sm text-foreground">{addon.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">Active</span>
                <span className="text-sm font-semibold text-foreground">
                  {isEnterprise ? "Included" : `$${addon.price}${addon.unit}`}
                </span>
              </div>
            </div>
          ))}
          {Array.from(activeAddons).filter(k => {
            const a = ADDONS.find(ad => ad.key === k);
            return a && !a.isPayPerUse;
          }).length === 0 && (
            <p className="px-5 py-4 text-sm text-muted-foreground">No active recurring add-ons.</p>
          )}
        </div>
        <div className="px-5 py-4 border-t bg-secondary/40 flex items-center justify-between">
          <span className="font-semibold text-foreground">Total add-on spend</span>
          <span className="text-lg font-bold text-foreground">
            {isEnterprise ? "Included in Enterprise" : `$${totalMonthlyCost}/mo`}
          </span>
        </div>
      </section>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium animate-in slide-in-from-bottom-4">
          <Check className="w-4 h-4 text-green-400" />
          {toast}
        </div>
      )}

      {/* Background Check Modal */}
      {bgCheckModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setBgCheckModal(false)}>
          <div className="bg-card rounded-2xl shadow-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-bold text-foreground">Run a background check</p>
                <p className="text-sm text-muted-foreground">$9.00 per check — charged immediately</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5">A $9 charge will be added to your next invoice. Results are returned within 24–48 hours.</p>
            <div className="flex gap-3">
              <button onClick={runBgCheck} className="flex-1 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all">
                Confirm — $9.00
              </button>
              <button onClick={() => setBgCheckModal(false)} className="px-4 py-2.5 border rounded-xl text-foreground hover:bg-secondary transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Modal */}
      {onboardingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setOnboardingModal(false)}>
          <div className="bg-card rounded-2xl shadow-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-foreground">Book an onboarding session</p>
                <p className="text-sm text-muted-foreground">$59.00 one-time</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              A 1-on-1 60-minute setup call with a ServiceOS specialist. We'll configure your account, import your data, and get your team up and running. A $59 one-time charge applies.
            </p>
            <div className="flex gap-3">
              <button onClick={bookOnboarding} className="flex-1 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all flex items-center gap-2 justify-center">
                Book now — $59 <ExternalLink className="w-4 h-4" />
              </button>
              <button onClick={() => setOnboardingModal(false)} className="px-4 py-2.5 border rounded-xl text-foreground hover:bg-secondary transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AddonCard({
  addon, isActive, isEnterprise, isFree, toggling,
  onToggle, onBgCheck, onOnboarding,
}: {
  addon: AddonConfig;
  isActive: boolean;
  isEnterprise: boolean;
  isFree: boolean;
  toggling: boolean;
  onToggle: () => void;
  onBgCheck?: () => void;
  onOnboarding?: () => void;
}) {
  const disabled = isFree || isEnterprise;

  return (
    <div id={addon.key.replace("_", "-")} className={cn(
      "bg-card border rounded-2xl p-5 flex items-start gap-4 transition-all",
      isActive && !isEnterprise && "border-primary/30 bg-primary/5",
      isEnterprise && "border-violet-200 bg-violet-50/30",
    )}>
      <div className={cn(
        "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
        isActive || isEnterprise ? "bg-primary/10" : "bg-secondary"
      )}>
        <addon.icon className={cn("w-5 h-5", isActive || isEnterprise ? "text-primary" : "text-muted-foreground")} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-foreground">{addon.name}</h4>
              {(isActive || isEnterprise) && (
                <span className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
                  isEnterprise ? "bg-violet-100 text-violet-700" : "bg-green-100 text-green-700"
                )}>
                  <Check className="w-3 h-3" />
                  {isEnterprise ? "Included" : "Active"}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{addon.description}</p>
            <p className="text-sm font-bold text-foreground mt-1">
              {isEnterprise ? (
                <span className="text-violet-700">Included in Enterprise</span>
              ) : (
                <>${addon.price}<span className="font-normal text-muted-foreground text-xs">{addon.unit}</span></>
              )}
            </p>
          </div>

          <div className="shrink-0">
            {addon.isPayPerUse ? (
              <button
                onClick={onToggle}
                disabled={isFree}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
                  isFree
                    ? "bg-secondary text-muted-foreground cursor-not-allowed"
                    : addon.key === "onboarding"
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {addon.key === "onboarding" ? "Book now — $59" : "Use it — $9"}
              </button>
            ) : (
              <button
                onClick={onToggle}
                disabled={disabled || toggling}
                className={cn(
                  "relative w-12 h-6 rounded-full transition-all duration-200 shrink-0",
                  disabled && "opacity-50 cursor-not-allowed",
                  (isActive || isEnterprise) ? "bg-primary" : "bg-secondary border"
                )}
              >
                {toggling ? (
                  <Loader2 className="w-3 h-3 text-white animate-spin absolute inset-0 m-auto" />
                ) : (
                  <span className={cn(
                    "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200",
                    (isActive || isEnterprise) ? "left-7" : "left-1"
                  )} />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
