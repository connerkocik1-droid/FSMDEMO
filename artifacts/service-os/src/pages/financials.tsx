import { useState } from "react";
import { useListInvoices, useGetRevenueAnalytics, useListJobs } from "@workspace/api-client-react";
import { DollarSign, ArrowUpRight, Plus, FileText, Download, Search, CheckCircle2, Clock, MoreHorizontal, CreditCard, Send, Edit, Briefcase, TrendingUp, Wallet } from "lucide-react";
import { format } from "date-fns";
import { useMockAuth } from "@/lib/mock-auth";

function OperatorEarningsView() {
  const { user } = useMockAuth();
  const { data: jobsData, isLoading } = useListJobs();

  const userIdHash = (user?.id || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const myCompletedJobs = (jobsData?.jobs.filter(j => j.status === "completed") || [])
    .filter(j => j.id % 3 === userIdHash % 3);

  const completedJobs = myCompletedJobs;
  const totalEarnings = completedJobs.reduce((sum, j) => sum + Number(j.estimatedRevenue || 0), 0);
  const jobsThisMonth = completedJobs.length;

  const mockPayouts = [
    { period: "Mar 1 - Mar 15, 2026", amount: Math.round(totalEarnings * 0.6), status: "paid" },
    { period: "Feb 16 - Feb 28, 2026", amount: Math.round(totalEarnings * 0.4), status: "paid" },
    { period: "Feb 1 - Feb 15, 2026", amount: Math.round(totalEarnings * 0.3), status: "paid" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold text-foreground">My Earnings</h2>
        <p className="text-muted-foreground mt-1">Your personal earnings from completed jobs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-600 to-green-500 p-6 rounded-3xl text-white shadow-xl shadow-green-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-white/80 font-medium">Total Earnings</h3>
            <p className="text-4xl font-display font-bold mt-2">${totalEarnings.toLocaleString()}</p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
              <Briefcase className="w-4 h-4" /> {jobsThisMonth} completed jobs
            </div>
          </div>
          <DollarSign className="absolute -bottom-8 -right-8 w-48 h-48 text-white/10" />
        </div>
        <div className="bg-card p-6 rounded-3xl border shadow-sm flex flex-col justify-center">
          <h3 className="text-muted-foreground font-medium">Jobs Completed</h3>
          <p className="text-3xl font-display font-bold text-foreground mt-2">{jobsThisMonth}</p>
          <p className="text-sm font-semibold text-green-500 mt-2">All time</p>
        </div>
        <div className="bg-card p-6 rounded-3xl border shadow-sm flex flex-col justify-center">
          <h3 className="text-muted-foreground font-medium">Avg per Job</h3>
          <p className="text-3xl font-display font-bold text-foreground mt-2">${jobsThisMonth > 0 ? Math.round(totalEarnings / jobsThisMonth).toLocaleString() : "0"}</p>
          <p className="text-sm font-semibold text-blue-500 mt-2">Average earnings</p>
        </div>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold font-display text-foreground">Payout History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4">Period</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockPayouts.map((payout, idx) => (
                <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{payout.period}</td>
                  <td className="px-6 py-4 font-bold">${payout.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700 capitalize">{payout.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold font-display text-foreground">Completed Jobs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4">Job</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Earnings</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : completedJobs.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center">
                  <Briefcase className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-semibold text-foreground">No completed jobs yet</p>
                  <p className="text-sm text-muted-foreground">Earnings will appear here once you complete jobs.</p>
                </td></tr>
              ) : completedJobs.map((job) => (
                <tr key={job.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">{job.title}</td>
                  <td className="px-6 py-4 text-foreground">{job.customer?.firstName} {job.customer?.lastName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{job.scheduledStart ? format(new Date(job.scheduledStart), "MMM d, yyyy") : "—"}</td>
                  <td className="px-6 py-4 font-bold">{job.estimatedRevenue ? `$${Number(job.estimatedRevenue).toLocaleString()}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AdminFinancialsView() {
  const { data: invoicesData, isLoading: invLoading } = useListInvoices();
  const { data: analytics } = useGetRevenueAnalytics({ period: "30d" });
  const [filter, setFilter] = useState<"all" | "draft" | "sent" | "paid" | "overdue">("all");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  const invoices = invoicesData?.invoices || [];
  const filtered = filter === "all" ? invoices : invoices.filter(i => i.status === filter);

  const totalOutstanding = invoices.filter(i => i.status === "sent" || i.status === "overdue").reduce((sum, i) => sum + Number(i.total || 0), 0);
  const totalPaid = invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + Number(i.total || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Financials</h2>
          <p className="text-muted-foreground mt-1">Invoices, payments, and revenue tracking.</p>
        </div>
        <button className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2">
          <Plus className="w-5 h-5" /> New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary to-primary/80 p-6 rounded-3xl text-primary-foreground shadow-xl shadow-primary/20 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-primary-foreground/80 font-medium">Total Revenue (30d)</h3>
            <p className="text-4xl font-display font-bold mt-2">${analytics?.total?.toLocaleString() || "0"}</p>
            <div className="mt-6 flex items-center gap-2 text-sm font-semibold bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
              <ArrowUpRight className="w-4 h-4" /> {analytics?.growth || "0"}% vs last month
            </div>
          </div>
          <DollarSign className="absolute -bottom-8 -right-8 w-48 h-48 text-white/10" />
        </div>
        <div className="bg-card p-6 rounded-3xl border shadow-sm flex flex-col justify-center">
          <h3 className="text-muted-foreground font-medium">Outstanding</h3>
          <p className="text-3xl font-display font-bold text-foreground mt-2">${totalOutstanding.toLocaleString()}</p>
          <p className="text-sm font-semibold text-amber-500 mt-2">{invoices.filter(i => i.status === "overdue").length} overdue</p>
        </div>
        <div className="bg-card p-6 rounded-3xl border shadow-sm flex flex-col justify-center">
          <h3 className="text-muted-foreground font-medium">Collected</h3>
          <p className="text-3xl font-display font-bold text-foreground mt-2">${totalPaid.toLocaleString()}</p>
          <p className="text-sm font-semibold text-green-500 mt-2">{invoices.filter(i => i.status === "paid").length} paid</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {(["all", "draft", "sent", "paid", "overdue"] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium">
              <tr>
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading invoices...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="font-semibold text-foreground">No invoices found</p>
                  <p className="text-sm text-muted-foreground">Create an invoice to get paid.</p>
                </td></tr>
              ) : filtered.map((inv) => (
                <tr key={inv.id} onClick={() => setSelectedInvoice(inv)} className="hover:bg-secondary/30 transition-colors group cursor-pointer">
                  <td className="px-6 py-4 font-mono font-medium text-foreground">{inv.invoiceNumber}</td>
                  <td className="px-6 py-4 font-semibold text-foreground">{inv.customer?.firstName} {inv.customer?.lastName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{format(new Date(inv.createdAt), "MMM d, yyyy")}</td>
                  <td className="px-6 py-4 font-bold">${inv.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                      inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                      inv.status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                      inv.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                      'bg-secondary text-muted-foreground'
                    }`}>{inv.status}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-muted-foreground hover:bg-secondary rounded-lg" title="Edit"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 text-muted-foreground hover:bg-secondary rounded-lg" title="Send"><Send className="w-4 h-4" /></button>
                      <button className="p-2 text-muted-foreground hover:bg-secondary rounded-lg" title="Download"><Download className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-card h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-card z-10">
              <div>
                <h3 className="text-xl font-display font-bold text-foreground">Invoice {selectedInvoice.invoiceNumber}</h3>
                <span className={`inline-block mt-1 px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                  selectedInvoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                  selectedInvoice.status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                  selectedInvoice.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                  'bg-secondary text-muted-foreground'
                }`}>{selectedInvoice.status}</span>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 hover:bg-secondary rounded-full text-muted-foreground">
                <span className="sr-only">Close</span>✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground font-medium">Customer</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{selectedInvoice.customer?.firstName} {selectedInvoice.customer?.lastName}</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground font-medium">Amount</p>
                  <p className="text-sm font-semibold text-foreground mt-1">${selectedInvoice.total}</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground font-medium">Created</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{format(new Date(selectedInvoice.createdAt), "MMM d, yyyy")}</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground font-medium">Due Date</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{selectedInvoice.dueDate ? format(new Date(selectedInvoice.dueDate), "MMM d, yyyy") : "Not set"}</p>
                </div>
              </div>

              {selectedInvoice.status !== "paid" && (
                <div className="space-y-3">
                  {selectedInvoice.status === "draft" && (
                    <button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" /> Mark as Sent
                    </button>
                  )}
                  <button className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Mark as Paid
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Financials() {
  const { isAtLeastRole } = useMockAuth();
  const isAdmin = isAtLeastRole("admin");

  if (!isAdmin) {
    return <OperatorEarningsView />;
  }

  return <AdminFinancialsView />;
}
