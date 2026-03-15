import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { QuoteResponse, BillingPeriod } from "./types";
import {
  Check, TrendingDown, ArrowRight, ChevronDown, ChevronUp,
  RefreshCw, Mail,
} from "lucide-react";

interface QuoteCardProps {
  quote: QuoteResponse;
  sessionId: string;
  onStartOver: () => void;
}

function calcTotal(quote: QuoteResponse, addonStates: Record<string, boolean>, billingPeriod: BillingPeriod): number {
  const base = billingPeriod === "annual" ? quote.monthly_base * 0.83 : quote.monthly_base;
  const addons = quote.suggested_addons
    .filter(a => addonStates[a.addon_key])
    .reduce((sum, a) => sum + a.price, 0);
  return Math.round((base + addons + (quote.user_addon_cost || 0)) * 100) / 100;
}

function trackEvent(name: string, props?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", name, props);
    }
  } catch {}
}

async function logCtaClick(sessionId: string, cta: string, selectedAddons: string[], estimatedMonthly: number) {
  try {
    await fetch(`${import.meta.env.BASE_URL}api/wizard/cta-click`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, cta, selected_addons: selectedAddons, estimated_monthly: estimatedMonthly }),
    });
  } catch {}
}

const TIER_COLORS = {
  free: "bg-slate-100 text-slate-700 border-slate-200",
  pro: "bg-blue-100 text-blue-700 border-blue-200",
  enterprise: "bg-violet-100 text-violet-700 border-violet-200",
};
const TIER_LABELS = { free: "Free", pro: "Pro", enterprise: "Enterprise" };

export function QuoteCard({ quote, sessionId, onStartOver }: QuoteCardProps) {
  const [, navigate] = useLocation();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [addonStates, setAddonStates] = useState<Record<string, boolean>>(
    Object.fromEntries(quote.suggested_addons.map(a => [a.addon_key, a.default_on]))
  );
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const total = calcTotal(quote, addonStates, billingPeriod);
  const annualTotal = Math.round(total * 12 * 0.83);
  const annualSavings = Math.round(total * 12 - annualTotal);
  const activeAddons = quote.suggested_addons.filter(a => addonStates[a.addon_key]);
  const activeAddonKeys = activeAddons.map(a => a.addon_key);

  function toggleAddon(key: string) {
    const newState = !addonStates[key];
    const newStates = { ...addonStates, [key]: newState };
    setAddonStates(newStates);
    const newTotal = calcTotal(quote, newStates, billingPeriod);
    trackEvent("wizard_addon_toggled", { addon_key: key, state: newState ? "on" : "off", new_total: newTotal });
  }

  async function handleCta(cta: "subscribe" | "demo" | "free") {
    trackEvent("wizard_cta_clicked", { cta, tier: quote.recommended_tier, total });
    await logCtaClick(sessionId, cta, activeAddonKeys, total);
    if (cta === "subscribe") {
      const addons = activeAddonKeys.join(",");
      navigate(`/checkout?tier=${quote.recommended_tier}&billing=${billingPeriod}${addons ? `&addons=${addons}` : ""}`);
    } else if (cta === "demo") {
      navigate(`/demo?tier=${quote.recommended_tier}`);
    } else {
      navigate("/signup?tier=free");
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setEmailLoading(true);
    try {
      await fetch(`${import.meta.env.BASE_URL}api/wizard/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, email }),
      });
      trackEvent("wizard_email_submitted", { tier: quote.recommended_tier, total });
      setEmailSent(true);
    } catch {}
    setEmailLoading(false);
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Headline */}
      <p className="text-[15px] font-semibold text-primary leading-snug">{quote.headline}</p>

      {/* Tier badge */}
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Recommended plan</span>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border", TIER_COLORS[quote.recommended_tier])}>
            {TIER_LABELS[quote.recommended_tier]}
          </span>
          <span className="text-2xl font-display font-bold text-foreground">
            {quote.monthly_base === 0 ? "Free" : `$${quote.monthly_base}/mo`}
          </span>
        </div>
      </div>

      {/* Tier explanation */}
      <p className="text-[13px] text-muted-foreground leading-relaxed">{quote.tier_explanation}</p>

      {/* Add-ons */}
      {quote.suggested_addons.length > 0 && (
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Recommended add-ons for your business</p>
          <div className="space-y-2">
            {quote.suggested_addons.map(addon => (
              <div key={addon.addon_key} className="flex items-start gap-3 p-2.5 rounded-xl border bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <button
                  onClick={() => toggleAddon(addon.addon_key)}
                  className={cn(
                    "mt-0.5 relative w-9 h-5 rounded-full shrink-0 transition-all duration-200",
                    addonStates[addon.addon_key] ? "bg-primary" : "bg-secondary border"
                  )}
                >
                  <span className={cn(
                    "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200",
                    addonStates[addon.addon_key] ? "left-4" : "left-0.5"
                  )} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">{addon.name}</span>
                    <span className="text-sm font-bold text-foreground shrink-0 ml-2">${addon.price}<span className="text-xs font-normal text-muted-foreground">{addon.price_label}</span></span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{addon.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live price total */}
      <div className="bg-secondary/50 rounded-2xl p-4 border">
        {/* Billing toggle */}
        <div className="flex items-center gap-2 mb-3">
          <div className="inline-flex items-center bg-background rounded-lg p-0.5 gap-0.5 border text-xs">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={cn("px-3 py-1.5 rounded-md font-semibold transition-all", billingPeriod === "monthly" ? "bg-primary text-white" : "text-muted-foreground")}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("annual")}
              className={cn("px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1", billingPeriod === "annual" ? "bg-primary text-white" : "text-muted-foreground")}
            >
              Annual <span className={cn("px-1 py-0.5 rounded text-[9px] font-bold", billingPeriod === "annual" ? "bg-white/20 text-white" : "bg-green-100 text-green-700")}>17% off</span>
            </button>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Your estimated monthly cost</p>
            <p className="text-3xl font-display font-bold text-foreground">${total}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
            {billingPeriod === "annual" && (
              <p className="text-xs text-green-600 font-semibold mt-0.5">or ${annualTotal}/year — save ${annualSavings}</p>
            )}
          </div>
          <button
            onClick={() => setBreakdownOpen(o => !o)}
            className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground transition-colors"
          >
            Breakdown {breakdownOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {breakdownOpen && (
          <div className="mt-3 pt-3 border-t space-y-1.5 text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Base plan ({TIER_LABELS[quote.recommended_tier]})</span>
              <span>${billingPeriod === "annual" ? Math.round(quote.monthly_base * 0.83) : quote.monthly_base}/mo</span>
            </div>
            {activeAddons.map(a => (
              <div key={a.addon_key} className="flex justify-between text-muted-foreground">
                <span>{a.name}</span>
                <span>${a.price}{a.price_label}</span>
              </div>
            ))}
            {quote.user_addon_cost > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>User add-on</span>
                <span>${quote.user_addon_cost}/mo</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-foreground pt-1.5 border-t">
              <span>Total</span>
              <span>${total}/mo</span>
            </div>
          </div>
        )}
      </div>

      {/* Competitor savings */}
      {quote.monthly_savings > 0 && (
        <div className="flex items-start gap-2.5 p-3 bg-green-50 border border-green-200 rounded-xl">
          <TrendingDown className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-green-800">
              vs {quote.competitor_name}: save ${quote.monthly_savings}/month
            </p>
            <p className="text-xs text-green-700 mt-0.5">${quote.annual_savings}/year back in your pocket</p>
            <p className="text-xs text-green-600 mt-0.5">{quote.competitor_name} charges ${quote.competitor_monthly}/mo for a similar team</p>
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="space-y-2">
        <button
          onClick={() => handleCta("subscribe")}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
        >
          Subscribe now — ${total}/mo <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleCta("demo")}
          className="w-full py-2.5 rounded-xl border font-semibold text-sm text-foreground hover:bg-secondary transition-all"
        >
          Book a 30-minute demo
        </button>
        {quote.free_option.available && (
          <button
            onClick={() => handleCta("free")}
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
          >
            Or start free — {quote.free_option.message}
          </button>
        )}
      </div>

      {/* Email capture */}
      <div className="border-t pt-4">
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" />
          Want us to email you this quote?
        </p>
        {emailSent ? (
          <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
            <Check className="w-3.5 h-3.5" />
            Sent! Check your inbox.
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              disabled={emailLoading || !email.trim()}
              className="px-3 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all whitespace-nowrap"
            >
              {emailLoading ? "Sending..." : "Send quote"}
            </button>
          </form>
        )}
      </div>

      {/* Start over */}
      <div className="text-center">
        <button
          onClick={onStartOver}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mx-auto"
        >
          <RefreshCw className="w-3 h-3" />
          Start over
        </button>
      </div>
    </div>
  );
}
