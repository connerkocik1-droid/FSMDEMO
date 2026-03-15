import { useState } from "react";
import { CreditCard, ArrowUpCircle, ArrowDownCircle, CheckCircle2, Download, AlertTriangle } from "lucide-react";
import { useMockAuth } from "@/lib/mock-auth";

const TIERS = [
  { id: "free", name: "Free", monthly: 0, annual: 0, maxUsers: 3 },
  { id: "independent", name: "Independent", monthly: 39, annual: 299, maxUsers: 6 },
  { id: "pro", name: "Pro", monthly: 99, annual: 899, maxUsers: 25 },
  { id: "franchise", name: "Franchise", monthly: 349, annual: 3199, maxUsers: 75 },
  { id: "enterprise", name: "Enterprise", monthly: 0, annual: 0, maxUsers: 200 },
];

const TIER_COLORS: Record<string, string> = {
  free: "bg-slate-100 text-slate-700 border-slate-200",
  independent: "bg-sky-100 text-sky-700 border-sky-200",
  pro: "bg-violet-100 text-violet-700 border-violet-200",
  franchise: "bg-amber-100 text-amber-700 border-amber-200",
  enterprise: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const MOCK_INVOICES = [
  { id: "INV-2026-003", date: "Mar 1, 2026", amount: "$99.00", status: "paid" },
  { id: "INV-2026-002", date: "Feb 1, 2026", amount: "$99.00", status: "paid" },
  { id: "INV-2026-001", date: "Jan 1, 2026", amount: "$49.00", status: "paid" },
  { id: "INV-2025-012", date: "Dec 1, 2025", amount: "$49.00", status: "paid" },
];

export default function Billing() {
  const { tier } = useMockAuth();
  const currentPlan = TIERS.find(t => t.id === tier) || TIERS[0];
  const [showCancel, setShowCancel] = useState(false);

  return (
    <div className="space-y-8 max-w-4xl">
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
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          {tier !== "enterprise" && (
            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all">
              <ArrowUpCircle className="w-4 h-4" />
              Upgrade Plan
            </button>
          )}
          {tier !== "free" && tier !== "enterprise" && (
            <>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-foreground font-medium rounded-xl hover:bg-secondary/80 transition-all text-sm">
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
                <p className="text-sm text-red-600 mt-1">Your account will be downgraded to Free at the end of the current billing period. You will lose access to premium features.</p>
                <div className="flex gap-3 mt-3">
                  <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600">
                    Confirm Cancellation
                  </button>
                  <button onClick={() => setShowCancel(false)} className="px-4 py-2 bg-white text-red-700 rounded-lg text-sm font-medium hover:bg-red-100 border border-red-200">
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
            <button className="text-sm text-primary font-medium hover:underline">Update</button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No payment method on file. Add one when you upgrade.</p>
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
                      <button className="text-muted-foreground hover:text-foreground">
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
    </div>
  );
}
