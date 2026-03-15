import { useState } from "react";
import { useGetAnalyticsOverview, useGetRevenueAnalytics, useGetJobAnalytics } from "@workspace/api-client-react";
import { BarChart3, TrendingUp, DollarSign, Users, Calendar, ArrowUpRight, ArrowDownRight, Briefcase, Clock, Star, Target } from "lucide-react";

type Period = "7d" | "30d" | "90d" | "1y";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function Analytics() {
  const [period, setPeriod] = useState<Period>("30d");
  const { data: overview } = useGetAnalyticsOverview({ period });
  const { data: revenue } = useGetRevenueAnalytics({ period });
  const { data: jobAnalytics } = useGetJobAnalytics({ period });

  const metrics = [
    { label: "Total Revenue", value: revenue ? `$${revenue.total?.toLocaleString()}` : "$0", change: revenue?.growth ? `+${revenue.growth}%` : "—", up: true, icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Completed Jobs", value: overview?.completedJobs?.toString() || "0", change: "this period", up: true, icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "New Leads", value: overview?.newLeads?.toString() || "0", change: "acquired", up: true, icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Avg Job Rating", value: overview?.avgRating ? `${overview.avgRating.toFixed(1)}/5` : "—", change: "from reviews", up: true, icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Revenue Growth", value: revenue?.growth ? `${revenue.growth}%` : "—", change: "vs last period", up: (revenue?.growth || 0) > 0, icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Active Jobs", value: overview?.activeJobs?.toString() || "0", change: `${overview?.jobCompletionRate?.toFixed(0) || 0}% completed`, up: true, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  const revenueData = (revenue?.data && revenue.data.length > 0)
    ? revenue.data.map((d) => {
        const month = d.date ? MONTH_NAMES[new Date(d.date).getMonth()] : "—";
        return { month, value: d.revenue || 0 };
      })
    : [];
  const maxRevenue = revenueData.length > 0 ? Math.max(...revenueData.map((r) => r.value), 1) : 1;

  const topServices = jobAnalytics?.byServiceType || [];
  const maxServiceRevenue = topServices.length > 0 ? Math.max(...topServices.map((s) => s.revenue || s.count), 1) : 1;

  const leadFunnel = jobAnalytics?.leadFunnel || [];
  const maxLeadCount = leadFunnel.length > 0 ? Math.max(...leadFunnel.map((s) => s.count), 1) : 1;
  const funnelColors = ["bg-blue-500", "bg-amber-500", "bg-purple-500", "bg-green-500", "bg-emerald-500", "bg-red-400"];

  const completionRate = overview?.jobCompletionRate || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Analytics</h2>
          <p className="text-muted-foreground mt-1">Business intelligence and performance metrics.</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary rounded-xl p-1">
          {(["7d", "30d", "90d", "1y"] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}>
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : p === "90d" ? "90 Days" : "1 Year"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-card rounded-2xl border p-5 flex items-center gap-4 hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${m.bg}`}>
              <m.icon className={`w-6 h-6 ${m.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-bold text-foreground">{m.value}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${m.up ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{m.change}</span>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl border p-6">
          <h3 className="font-bold text-foreground mb-6">Revenue Trend</h3>
          <div className="flex items-end gap-3 h-48">
            {revenueData.length > 0 ? revenueData.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">${(item.value / 1000).toFixed(1)}k</span>
                <div className="w-full rounded-t-lg bg-primary/80 hover:bg-primary transition-colors" style={{ height: `${(item.value / maxRevenue) * 100}%`, minHeight: item.value > 0 ? "4px" : "0" }}></div>
                <span className="text-xs text-muted-foreground">{item.month}</span>
              </div>
            )) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No revenue data yet</div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-6">
          <h3 className="font-bold text-foreground mb-6">Job Completion Rate</h3>
          <div className="flex items-center justify-center h-48">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className="text-secondary" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" className="text-primary" strokeWidth="3" strokeDasharray={`${completionRate}, 100`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-foreground">{completionRate.toFixed(0)}%</span>
                <span className="text-xs text-muted-foreground">Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-6">
          <h3 className="font-bold text-foreground mb-6">Top Services</h3>
          <div className="space-y-4">
            {topServices.length > 0 ? topServices.slice(0, 4).map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-foreground">{s.serviceType}</span>
                    <span className="text-sm font-bold text-foreground">{s.revenue ? `$${s.revenue.toLocaleString()}` : `${s.count} jobs`}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary rounded-full h-2 transition-all" style={{ width: `${((s.revenue || s.count) / maxServiceRevenue) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-muted-foreground text-sm text-center py-4">No service data yet</div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-6">
          <h3 className="font-bold text-foreground mb-6">Lead Conversion Funnel</h3>
          <div className="space-y-4">
            {leadFunnel.length > 0 ? leadFunnel.map((s, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground capitalize">{s.stage}</span>
                  <span className="text-sm font-bold text-foreground">{s.count}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div className={`${funnelColors[i % funnelColors.length]} rounded-full h-3 transition-all`} style={{ width: `${(s.count / maxLeadCount) * 100}%` }}></div>
                </div>
              </div>
            )) : (
              <div className="text-muted-foreground text-sm text-center py-4">No lead data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
