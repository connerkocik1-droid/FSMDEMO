import { useState } from "react";
import { useLocation } from "wouter";
import {
  CreditCard, ArrowUpCircle, ArrowDownCircle, CheckCircle2,
  Download, AlertTriangle, X, Check, Zap, Building2, Globe,
  ChevronRight, ExternalLink,
} from "lucide-react";
import { useMockAuth } from "@/lib/mock-auth";
import InvoiceManager from "./invoice-manager";

const TIERS = [
  { id: "free",        name: "Free",        monthly: 0,   annual: 0,    annualPerMonth: 0,   maxUsers: 3,   description: "For solo operators getting started" },
  { id: "independent", name: "Independent", monthly: 39,  annual: 348,  annualPerMonth: 29,  maxUsers: 6,   description: "For independent field service pros" },
  { id: "pro",         name: "Pro",         monthly: 119, annual: 1068, annualPerMonth: 89,  maxUsers: 25,  description: "For growing teams and small businesses" },
  { id: "franchise",   name: "Franchise",   monthly: 349, annual: 2988, annualPerMonth: 249, maxUsers: 75,  description: "For multi-location franchise operations" },
  { id: "enterprise",  name: "Enterprise",  monthly: 0,   annual: 0,    annualPerMonth: 0,   maxUsers: 200, description: "Custom pricing for large organizations" },
];

const TIER_ORDER = ["free", "independent", "pro", "franchise", "enterprise"];

const TIER_COLORS: Record<string, string> = {
  free: "bg-slate-100 text-slate-700 border-slate-200",
  independent: "bg-sky-100 text-sky-700 border-sky-200",
  pro: "bg-violet-100 text-violet-700 border-violet-200",
  franchise: "bg-amber-100 text-amber-700 border-amber-200",
  enterprise: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const TIER_ICONS: Record<string, React.ReactNode> = {
  free: <Zap className="w-5 h-5 text-slate-500" />,
  independent: <Globe className="w-5 h-5 text-sky-500" />,
  pro: <ArrowUpCircle className="w-5 h-5 text-violet-500" />,
  franchise: <Building2 className="w-5 h-5 text-amber-500" />,
  enterprise: <Building2 className="w-5 h-5 text-emerald-500" />,
};

const TIER_FEATURES: Record<string, string[]> = {
  free: ["Up to 3 users", "Basic job management", "Customer records"],
  independent: ["Up to 6 users", "Invoicing & payments", "SMS hub", "Financials"],
  pro: ["Up to 25 users", "Full analytics", "Multi-location", "Landing pages", "GPS tracking"],
  franchise: ["Up to 75 users", "Franchise tools", "API access", "Priority support", "Custom branding"],
  enterprise: ["Unlimited users", "Dedicated success manager", "SLA guarantees", "Custom integrations"],
};

const MOCK_INVOICES = [
  { id: "INV-2026-003", date: "Mar 1, 2026",  amount: "$119.00", status: "paid" },
  { id: "INV-2026-002", date: "Feb 1, 2026",  amount: "$119.00", status: "paid" },
  { id: "INV-2026-001", date: "Jan 1, 2026",  amount: "$59.00",  status: "paid" },
  { id: "INV-2025-012", date: "Dec 1, 2025",  amount: "$59.00",  status: "paid" },
];

function PlanPickerModal({
  mode,
  currentTier,
  onClose,
  onSelect,
}: {
  mode: "upgrade" | "downgrade";
  currentTier: string;
  onClose: () => void;
  onSelect: (tier: string) => void;
}) {
  const currentIdx = TIER_ORDER.indexOf(currentTier);
  const candidates = mode === "upgrade"
    ? TIERS.filter((t, i) => i > currentIdx && t.id !== "enterprise")
    : TIERS.filter((t, i) => i < currentIdx);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-2xl border shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold font-display text-foreground">
            {mode === "upgrade" ? "Upgrade Your Plan" : "Downgrade Your Plan"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {candidates.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              {mode === "upgrade"
                ? "You're already on the highest self-serve plan. Contact us for Enterprise."
                : "You're already on the Free plan."}
            </p>
          )}
          {candidates.map((plan) => (
            <button
              key={plan.id}
              onClick={() => onSelect(plan.id)}
              className="w-full text-left flex items-start gap-4 p-4 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TIER_COLORS[plan.id]}`}>
                {TIER_ICONS[plan.id]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{plan.name}</span>
                  <span className="text-sm font-bold text-foreground">
                    {plan.monthly > 0 ? `$${plan.monthly}/mo` : plan.id === "free" ? "Free" : "Custom"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {TIER_FEATURES[plan.id].slice(0, 3).map((f) => (
                    <span key={f} className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-green-500 shrink-0" />{f}
                    </span>
                  ))}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 mt-3 transition-colors" />
            </button>
          ))}
        </div>

        <div className="px-6 py-4 border-t bg-secondary/30">
          <p className="text-xs text-muted-foreground text-center">
            Changes take effect immediately in this demo.{" "}
            <span className="text-primary font-medium">No real charges are made.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-foreground text-background px-5 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-4 duration-300">
      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function Billing() {
  const { tier, setTier } = useMockAuth();
  const [, navigate] = useLocation();
  const currentPlan = TIERS.find(t => t.id === tier) || TIERS[0];
  const [showCancel, setShowCancel] = useState(false);
  const [planModal, setPlanModal] = useState<"upgrade" | "downgrade" | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const currentIdx = TIER_ORDER.indexOf(tier);
  const canUpgrade = currentIdx < TIER_ORDER.length - 2;
  const canDowngrade = currentIdx > 0;

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  function handlePlanSelect(newTier: string) {
    const oldName = currentPlan.name;
    const newPlan = TIERS.find(t => t.id === newTier)!;
    setTier(newTier as any);
    setPlanModal(null);
    setShowCancel(false);
    showToast(`Successfully switched from ${oldName} to ${newPlan.name}!`);
  }

  function handleCancelConfirm() {
    setTier("free" as any);
    setShowCancel(false);
    showToast("Subscription cancelled. You've been moved to the Free plan.");
  }

  function handleDownloadInvoice(id: string) {
    showToast(`Invoice ${id} download started.`);
  }

  function handleUpdatePayment() {
    showToast("Payment method update — real Stripe integration coming soon.");
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {planModal && (
        <PlanPickerModal
          mode={planModal}
          currentTier={tier}
          onClose={() => setPlanModal(null)}
          onSelect={handlePlanSelect}
        />
      )}

      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}

      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Billing & Subscription</h2>
        <p className="text-muted-foreground mt-1">Manage your plan, payment method, and invoice history.</p>
      </div>

      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Plan</p>
            <div className="flex items-center gap-3">
              <h3 className="text-3xl font-display font-bold text-foreground">{currentPlan.name}</h3>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border capitalize ${TIER_COLORS[tier]}`}>
                Active
              </span>
            </div>
            <p className="text-muted-foreground mt-2">
              {currentPlan.monthly > 0 ? (
                <><span className="text-2xl font-bold text-foreground">${currentPlan.monthly}</span>/month</>
              ) : tier === "enterprise" ? (
                "Custom pricing"
              ) : (
                "Free forever"
              )}
            </p>
            {currentPlan.annualPerMonth > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Save with annual billing: <span className="font-medium text-green-600">${currentPlan.annualPerMonth}/mo</span> (${currentPlan.annual}/yr)
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              Up to {currentPlan.maxUsers} users
            </p>
          </div>

          <div className="text-right space-y-2">
            {tier !== "enterprise" && tier !== "free" && (
              <p className="text-sm text-muted-foreground">
                Next billing date: <span className="text-foreground font-medium">Apr 1, 2026</span>
              </p>
            )}
            <button
              onClick={() => navigate("/pricing")}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              View all plans <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          {canUpgrade && (
            <button
              onClick={() => setPlanModal("upgrade")}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all"
            >
              <ArrowUpCircle className="w-4 h-4" />
              Upgrade Plan
            </button>
          )}
          {tier === "enterprise" && (
            <button
              onClick={() => window.open("mailto:sales@serviceos.io", "_blank")}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all"
            >
              <ArrowUpCircle className="w-4 h-4" />
              Contact Sales
            </button>
          )}
          {canDowngrade && (
            <>
              <button
                onClick={() => setPlanModal("downgrade")}
                className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-foreground font-medium rounded-xl hover:bg-secondary/80 transition-all text-sm"
              >
                <ArrowDownCircle className="w-4 h-4" />
                Downgrade
              </button>
              <button
                onClick={() => setShowCancel(!showCancel)}
                className="px-5 py-2.5 text-red-500 font-medium rounded-xl hover:bg-red-50 transition-all text-sm"
              >
                Cancel Subscription
              </button>
            </>
          )}
        </div>

        {showCancel && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Are you sure you want to cancel?</p>
                <p className="text-sm text-red-600 mt-1">
                  Your account will be downgraded to Free at the end of the current billing period.
                  You will lose access to premium features.
                </p>
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={handleCancelConfirm}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                  >
                    Confirm Cancellation
                  </button>
                  <button
                    onClick={() => setShowCancel(false)}
                    className="px-4 py-2 bg-white text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 border border-red-200 transition-colors"
                  >
                    Keep My Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-center gap-3 mb-5">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Payment Method</h3>
        </div>

        {tier !== "free" ? (
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">VISA</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Visa ending in 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/2028</p>
              </div>
            </div>
            <button
              onClick={handleUpdatePayment}
              className="text-sm text-primary font-medium hover:underline transition-colors"
            >
              Update
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-xl">
            <p className="text-sm text-muted-foreground">No payment method on file. Add one when you upgrade.</p>
            {canUpgrade && (
              <button
                onClick={() => setPlanModal("upgrade")}
                className="text-sm text-primary font-medium hover:underline"
              >
                Upgrade now
              </button>
            )}
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border p-6">
        <h3 className="font-semibold text-foreground mb-4">Invoice History</h3>

        {MOCK_INVOICES.length > 0 ? (
          <div className="overflow-hidden rounded-xl border">
            <table className="w-full">
              <thead>
                <tr className="bg-secondary/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Invoice</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Date</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Amount</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_INVOICES.map(inv => (
                  <tr key={inv.id} className="hover:bg-secondary/30">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{inv.id}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{inv.date}</td>
                    <td className="px-4 py-3 text-sm text-foreground font-medium">{inv.amount}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(inv.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-secondary"
                        title="Download invoice"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No invoices yet.</p>
        )}
      </div>

      <InvoiceManager />
    </div>
  );
}
