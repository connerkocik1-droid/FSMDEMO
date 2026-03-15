import { useState, useEffect } from "react";
import {
  BarChart3, Users, Briefcase, FileText, BookOpen,
  Plus, Trash2, RefreshCw, Sparkles, AlertTriangle,
  DollarSign, Check, Loader2, ChevronRight,
} from "lucide-react";
import { devAdminFetch } from "@/lib/dev-admin-auth";
import { cn } from "@/lib/utils";

type Tab = "overview" | "jobs" | "invoices" | "customers" | "leads";

interface Overview {
  jobs: number; customers: number; leads: number; invoices: number;
  totalRevenue: number; demoCompanyId: number;
}

const SERVICE_TYPES = ["HVAC Repair", "AC Installation", "Furnace Service", "Duct Cleaning", "Heat Pump Install", "Maintenance Visit", "Emergency Repair", "New Construction"];
const JOB_STATUSES = ["completed", "scheduled", "in_progress", "cancelled"];
const LEAD_STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost"];
const LEAD_SOURCES = ["website", "referral", "google", "facebook", "yelp", "door_hanger", "direct_mail"];
const INV_STATUSES = ["paid", "sent", "draft", "overdue"];

function fmtMoney(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d: string | null | undefined) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ComponentType<any>; color: string }) {
  return (
    <div className="bg-white rounded-2xl border p-5 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}

export default function DevAdminDemoBuilder() {
  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [jobs, setJobs] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  // Add-forms
  const [jobForm, setJobForm] = useState({ title: "", serviceType: "", status: "completed", actualRevenue: "", scheduledStart: "" });
  const [custForm, setCustForm] = useState({ firstName: "", lastName: "", email: "", phone: "", city: "", state: "" });
  const [invForm, setInvForm] = useState({ total: "", status: "paid" });
  const [leadForm, setLeadForm] = useState({ firstName: "", lastName: "", email: "", phone: "", serviceInterest: "", status: "new", source: "", estimatedValue: "" });

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }

  async function loadOverview() {
    const r = await devAdminFetch("/demo-data/overview");
    if (r.ok) setOverview(await r.json());
  }

  async function loadTab(t: Tab) {
    setLoading(true);
    try {
      if (t === "overview" || t === "jobs") {
        const r = await devAdminFetch("/demo-data/jobs");
        if (r.ok) setJobs((await r.json()).jobs || []);
      }
      if (t === "overview" || t === "customers") {
        const r = await devAdminFetch("/demo-data/customers");
        if (r.ok) setCustomers((await r.json()).customers || []);
      }
      if (t === "overview" || t === "invoices") {
        const r = await devAdminFetch("/demo-data/invoices");
        if (r.ok) setInvoices((await r.json()).invoices || []);
      }
      if (t === "overview" || t === "leads") {
        const r = await devAdminFetch("/demo-data/leads");
        if (r.ok) setLeads((await r.json()).leads || []);
      }
      await loadOverview();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTab("overview"); }, []);

  function switchTab(t: Tab) {
    setTab(t);
    loadTab(t);
  }

  async function handleSeed() {
    setSeeding(true);
    try {
      const r = await devAdminFetch("/demo-data/seed", { method: "POST" });
      if (r.ok) {
        const d = await r.json();
        showToast(`Seeded ${d.customers} customers, ${d.jobs} jobs, ${d.invoices} invoices, ${d.leads} leads!`);
        await loadTab("overview");
      }
    } finally { setSeeding(false); }
  }

  async function handleReset() {
    setResetting(true);
    setShowResetConfirm(false);
    try {
      await devAdminFetch("/demo-data/reset", { method: "DELETE" });
      setJobs([]); setCustomers([]); setInvoices([]); setLeads([]);
      await loadOverview();
      showToast("All demo data cleared.");
    } finally { setResetting(false); }
  }

  async function addJob() {
    if (!jobForm.title) return;
    const r = await devAdminFetch("/demo-data/jobs", {
      method: "POST",
      body: JSON.stringify(jobForm),
    });
    if (r.ok) {
      const d = await r.json();
      setJobs(prev => [d.job, ...prev]);
      setJobForm({ title: "", serviceType: "", status: "completed", actualRevenue: "", scheduledStart: "" });
      await loadOverview();
      showToast("Job added.");
    }
  }

  async function deleteJob(id: number) {
    await devAdminFetch(`/demo-data/jobs/${id}`, { method: "DELETE" });
    setJobs(prev => prev.filter(j => j.id !== id));
    await loadOverview();
  }

  async function addCustomer() {
    if (!custForm.firstName || !custForm.lastName) return;
    const r = await devAdminFetch("/demo-data/customers", {
      method: "POST",
      body: JSON.stringify(custForm),
    });
    if (r.ok) {
      const d = await r.json();
      setCustomers(prev => [d.customer, ...prev]);
      setCustForm({ firstName: "", lastName: "", email: "", phone: "", city: "", state: "" });
      await loadOverview();
      showToast("Customer added.");
    }
  }

  async function deleteCustomer(id: number) {
    await devAdminFetch(`/demo-data/customers/${id}`, { method: "DELETE" });
    setCustomers(prev => prev.filter(c => c.id !== id));
    await loadOverview();
  }

  async function addInvoice() {
    if (!invForm.total) return;
    const r = await devAdminFetch("/demo-data/invoices", {
      method: "POST",
      body: JSON.stringify(invForm),
    });
    if (r.ok) {
      const d = await r.json();
      setInvoices(prev => [d.invoice, ...prev]);
      setInvForm({ total: "", status: "paid" });
      await loadOverview();
      showToast("Invoice added.");
    }
  }

  async function deleteInvoice(id: number) {
    await devAdminFetch(`/demo-data/invoices/${id}`, { method: "DELETE" });
    setInvoices(prev => prev.filter(i => i.id !== id));
    await loadOverview();
  }

  async function addLead() {
    if (!leadForm.firstName || !leadForm.lastName) return;
    const r = await devAdminFetch("/demo-data/leads", {
      method: "POST",
      body: JSON.stringify(leadForm),
    });
    if (r.ok) {
      const d = await r.json();
      setLeads(prev => [d.lead, ...prev]);
      setLeadForm({ firstName: "", lastName: "", email: "", phone: "", serviceInterest: "", status: "new", source: "", estimatedValue: "" });
      await loadOverview();
      showToast("Lead added.");
    }
  }

  async function deleteLead(id: number) {
    await devAdminFetch(`/demo-data/leads/${id}`, { method: "DELETE" });
    setLeads(prev => prev.filter(l => l.id !== id));
    await loadOverview();
  }

  const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 bg-white";
  const sel = cn(inp, "appearance-none");

  const TABS: { id: Tab; label: string; icon: React.ComponentType<any>; count?: number }[] = [
    { id: "overview",   label: "Overview",   icon: BarChart3 },
    { id: "customers",  label: "Customers",  icon: Users,     count: customers.length },
    { id: "jobs",       label: "Jobs",       icon: Briefcase, count: jobs.length },
    { id: "invoices",   label: "Invoices",   icon: FileText,  count: invoices.length },
    { id: "leads",      label: "Leads",      icon: BookOpen,  count: leads.length },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Demo Builder</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage demo data for company #{overview?.demoCompanyId || "—"} — changes reflect live in the app
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => loadTab(tab)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-all disabled:opacity-50"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            Refresh
          </button>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Seed Realistic Data
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            disabled={resetting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
          >
            {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Reset All
          </button>
        </div>
      </div>

      {/* Reset Confirm */}
      {showResetConfirm && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800">Reset all demo data?</p>
            <p className="text-xs text-red-600 mt-0.5">This permanently deletes all jobs, invoices, customers, and leads for the demo company.</p>
            <div className="flex gap-2 mt-3">
              <button onClick={handleReset} className="px-4 py-1.5 text-xs font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600">Yes, Reset Everything</button>
              <button onClick={() => setShowResetConfirm(false)} className="px-4 py-1.5 text-xs font-medium border border-red-200 text-red-700 rounded-lg hover:bg-red-100">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm font-medium animate-in slide-in-from-bottom-4">
          <Check className="w-4 h-4 text-green-400" />
          {toast}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
            {t.count !== undefined && (
              <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-semibold", tab === t.id ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600")}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard label="Total Revenue" value={overview ? fmtMoney(overview.totalRevenue) : "—"} icon={DollarSign} color="bg-green-500" />
            <StatCard label="Jobs" value={overview?.jobs ?? "—"} icon={Briefcase} color="bg-blue-500" />
            <StatCard label="Invoices" value={overview?.invoices ?? "—"} icon={FileText} color="bg-violet-500" />
            <StatCard label="Customers" value={overview?.customers ?? "—"} icon={Users} color="bg-amber-500" />
            <StatCard label="Leads" value={overview?.leads ?? "—"} icon={BookOpen} color="bg-pink-500" />
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Recent Jobs */}
            <div className="bg-white rounded-2xl border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Recent Jobs</h3>
                <button onClick={() => switchTab("jobs")} className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {jobs.slice(0, 5).map(j => (
                  <div key={j.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 truncate mr-2">{j.title}</span>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full shrink-0",
                      j.status === "completed" ? "bg-green-100 text-green-700" :
                      j.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                      j.status === "in_progress" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-600"
                    )}>{j.status}</span>
                  </div>
                ))}
                {jobs.length === 0 && <p className="text-xs text-slate-400">No jobs yet. Add some or click "Seed Realistic Data".</p>}
              </div>
            </div>

            {/* Recent Invoices */}
            <div className="bg-white rounded-2xl border p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900">Recent Invoices</h3>
                <button onClick={() => switchTab("invoices")} className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                  View all <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                {invoices.slice(0, 5).map(inv => (
                  <div key={inv.id} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700 font-mono text-xs">{inv.invoiceNumber}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{fmtMoney(Number(inv.total))}</span>
                      <span className={cn("text-xs font-medium px-1.5 py-0.5 rounded-full",
                        inv.status === "paid" ? "bg-green-100 text-green-700" :
                        inv.status === "sent" ? "bg-blue-100 text-blue-700" :
                        inv.status === "overdue" ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-slate-600"
                      )}>{inv.status}</span>
                    </div>
                  </div>
                ))}
                {invoices.length === 0 && <p className="text-xs text-slate-400">No invoices yet.</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOMERS ── */}
      {tab === "customers" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border p-5 space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Plus className="w-4 h-4 text-blue-500" />Add Customer</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <input className={inp} placeholder="First name *" value={custForm.firstName} onChange={e => setCustForm(f => ({ ...f, firstName: e.target.value }))} />
              <input className={inp} placeholder="Last name *" value={custForm.lastName} onChange={e => setCustForm(f => ({ ...f, lastName: e.target.value }))} />
              <input className={inp} placeholder="Email" value={custForm.email} onChange={e => setCustForm(f => ({ ...f, email: e.target.value }))} />
              <input className={inp} placeholder="Phone" value={custForm.phone} onChange={e => setCustForm(f => ({ ...f, phone: e.target.value }))} />
              <input className={inp} placeholder="City" value={custForm.city} onChange={e => setCustForm(f => ({ ...f, city: e.target.value }))} />
              <input className={inp} placeholder="State (e.g. TX)" value={custForm.state} onChange={e => setCustForm(f => ({ ...f, state: e.target.value }))} />
            </div>
            <button onClick={addCustomer} disabled={!custForm.firstName || !custForm.lastName} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-all">
              <Plus className="w-4 h-4" /> Add Customer
            </button>
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="px-5 py-3 border-b bg-slate-50 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Customers ({customers.length})</p>
            </div>
            <div className="divide-y max-h-[480px] overflow-y-auto">
              {customers.map(c => (
                <div key={c.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 group">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{c.firstName} {c.lastName}</p>
                    <p className="text-xs text-slate-400">{[c.email, c.phone, [c.city, c.state].filter(Boolean).join(", ")].filter(Boolean).join(" · ") || "No contact info"}</p>
                  </div>
                  <button onClick={() => deleteCustomer(c.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {customers.length === 0 && <p className="text-sm text-slate-400 p-5 text-center">No customers yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── JOBS ── */}
      {tab === "jobs" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border p-5 space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Plus className="w-4 h-4 text-blue-500" />Add Job</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <input className={inp} placeholder="Job title *" value={jobForm.title} onChange={e => setJobForm(f => ({ ...f, title: e.target.value }))} />
              <select className={sel} value={jobForm.serviceType} onChange={e => setJobForm(f => ({ ...f, serviceType: e.target.value }))}>
                <option value="">— Service type —</option>
                {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className={sel} value={jobForm.status} onChange={e => setJobForm(f => ({ ...f, status: e.target.value }))}>
                {JOB_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input className={cn(inp, "pl-6")} placeholder="Revenue (e.g. 450)" type="number" min="0" value={jobForm.actualRevenue} onChange={e => setJobForm(f => ({ ...f, actualRevenue: e.target.value }))} />
              </div>
              <input className={inp} type="date" value={jobForm.scheduledStart} onChange={e => setJobForm(f => ({ ...f, scheduledStart: e.target.value }))} />
            </div>
            <button onClick={addJob} disabled={!jobForm.title} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-all">
              <Plus className="w-4 h-4" /> Add Job
            </button>
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="px-5 py-3 border-b bg-slate-50">
              <p className="text-sm font-semibold text-slate-700">Jobs ({jobs.length})</p>
            </div>
            <div className="divide-y max-h-[480px] overflow-y-auto">
              {jobs.map(j => (
                <div key={j.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 group">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium text-slate-900 truncate">{j.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                        j.status === "completed" ? "bg-green-100 text-green-700" :
                        j.status === "scheduled" ? "bg-blue-100 text-blue-700" :
                        j.status === "in_progress" ? "bg-amber-100 text-amber-700" :
                        "bg-slate-100 text-slate-600"
                      )}>{j.status}</span>
                      {j.serviceType && <span className="text-xs text-slate-400">{j.serviceType}</span>}
                      <span className="text-xs text-slate-400">{fmtDate(j.scheduledStart || j.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {j.actualRevenue && <span className="text-sm font-bold text-green-600">{fmtMoney(Number(j.actualRevenue))}</span>}
                    <button onClick={() => deleteJob(j.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && <p className="text-sm text-slate-400 p-5 text-center">No jobs yet. Add one above or seed data.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── INVOICES ── */}
      {tab === "invoices" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border p-5 space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Plus className="w-4 h-4 text-blue-500" />Add Invoice</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input className={cn(inp, "pl-6")} placeholder="Total amount *" type="number" min="0" value={invForm.total} onChange={e => setInvForm(f => ({ ...f, total: e.target.value }))} />
              </div>
              <select className={sel} value={invForm.status} onChange={e => setInvForm(f => ({ ...f, status: e.target.value }))}>
                {INV_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={addInvoice} disabled={!invForm.total} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-all">
              <Plus className="w-4 h-4" /> Add Invoice
            </button>
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="px-5 py-3 border-b bg-slate-50">
              <p className="text-sm font-semibold text-slate-700">Invoices ({invoices.length})</p>
            </div>
            <div className="divide-y max-h-[480px] overflow-y-auto">
              {invoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 group">
                  <div>
                    <p className="text-sm font-mono font-medium text-slate-900">{inv.invoiceNumber}</p>
                    <p className="text-xs text-slate-400">{fmtDate(inv.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">{fmtMoney(Number(inv.total))}</span>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                      inv.status === "paid" ? "bg-green-100 text-green-700" :
                      inv.status === "sent" ? "bg-blue-100 text-blue-700" :
                      inv.status === "overdue" ? "bg-red-100 text-red-700" :
                      "bg-slate-100 text-slate-600"
                    )}>{inv.status}</span>
                    <button onClick={() => deleteInvoice(inv.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {invoices.length === 0 && <p className="text-sm text-slate-400 p-5 text-center">No invoices yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── LEADS ── */}
      {tab === "leads" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border p-5 space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><Plus className="w-4 h-4 text-blue-500" />Add Lead</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <input className={inp} placeholder="First name *" value={leadForm.firstName} onChange={e => setLeadForm(f => ({ ...f, firstName: e.target.value }))} />
              <input className={inp} placeholder="Last name *" value={leadForm.lastName} onChange={e => setLeadForm(f => ({ ...f, lastName: e.target.value }))} />
              <input className={inp} placeholder="Email" value={leadForm.email} onChange={e => setLeadForm(f => ({ ...f, email: e.target.value }))} />
              <input className={inp} placeholder="Phone" value={leadForm.phone} onChange={e => setLeadForm(f => ({ ...f, phone: e.target.value }))} />
              <select className={sel} value={leadForm.serviceInterest} onChange={e => setLeadForm(f => ({ ...f, serviceInterest: e.target.value }))}>
                <option value="">— Service interest —</option>
                {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className={sel} value={leadForm.status} onChange={e => setLeadForm(f => ({ ...f, status: e.target.value }))}>
                {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className={sel} value={leadForm.source} onChange={e => setLeadForm(f => ({ ...f, source: e.target.value }))}>
                <option value="">— Lead source —</option>
                {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                <input className={cn(inp, "pl-6")} placeholder="Est. value" type="number" min="0" value={leadForm.estimatedValue} onChange={e => setLeadForm(f => ({ ...f, estimatedValue: e.target.value }))} />
              </div>
            </div>
            <button onClick={addLead} disabled={!leadForm.firstName || !leadForm.lastName} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-all">
              <Plus className="w-4 h-4" /> Add Lead
            </button>
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="px-5 py-3 border-b bg-slate-50">
              <p className="text-sm font-semibold text-slate-700">Leads ({leads.length})</p>
            </div>
            <div className="divide-y max-h-[480px] overflow-y-auto">
              {leads.map(l => (
                <div key={l.id} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 group">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="text-sm font-medium text-slate-900">{l.firstName} {l.lastName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                        l.status === "won" ? "bg-green-100 text-green-700" :
                        l.status === "qualified" ? "bg-blue-100 text-blue-700" :
                        l.status === "lost" ? "bg-red-100 text-red-600" :
                        l.status === "proposal" ? "bg-violet-100 text-violet-700" :
                        "bg-slate-100 text-slate-600"
                      )}>{l.status}</span>
                      {l.serviceInterest && <span className="text-xs text-slate-400">{l.serviceInterest}</span>}
                      {l.source && <span className="text-xs text-slate-400">via {l.source}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {l.estimatedValue && <span className="text-sm font-bold text-green-600">{fmtMoney(Number(l.estimatedValue))}</span>}
                    <button onClick={() => deleteLead(l.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {leads.length === 0 && <p className="text-sm text-slate-400 p-5 text-center">No leads yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
