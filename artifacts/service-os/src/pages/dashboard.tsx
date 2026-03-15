import { useGetAnalyticsOverview, useListJobs } from "@workspace/api-client-react";
import { Activity, DollarSign, Users, Briefcase, TrendingUp, Clock, Star, CheckCircle2, ArrowUpRight, MapPin, Zap, AlertCircle, Lock, Plus, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useMockAuth } from "@/lib/mock-auth";
import { canAccess, hasPermission, isAtLeastRole, type Feature } from "@/lib/permissions";
import { Link } from "wouter";

function UpgradePrompt({ feature, title, description }: { feature: Feature; title: string; description: string }) {
  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-6 flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
        <Lock className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        <button className="mt-3 text-sm font-semibold text-primary hover:underline">Upgrade to unlock →</button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { role, tier } = useMockAuth();
  const { data: analytics, isLoading: analyticsLoading } = useGetAnalyticsOverview({ period: "30d" });
  const { data: jobsResponse, isLoading: jobsLoading } = useListJobs({ limit: 5 });

  const isOperator = role === "operator";
  const isOwnerOrAdmin = isAtLeastRole(role, "admin");

  const ownerStats = [
    { title: "Revenue (30d)", value: analytics ? `$${analytics.totalRevenue.toLocaleString()}` : "$0", trend: analytics ? `+${analytics.revenueGrowth}%` : "—", icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Completed Jobs", value: analytics?.completedJobs.toString() || "0", trend: "This month", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "New Leads", value: analytics?.newLeads.toString() || "0", trend: "Pending follow up", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Avg Rating", value: analytics ? `${analytics.avgRating.toFixed(1)}/5` : "—", trend: "From reviews", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const operatorStats = [
    { title: "My Jobs Today", value: jobsResponse?.jobs.filter(j => j.status === "scheduled" || j.status === "in_progress").length.toString() || "0", trend: "Active", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Completed Today", value: jobsResponse?.jobs.filter(j => j.status === "completed").length.toString() || "0", trend: "Nice work!", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  const stats = isOperator ? operatorStats : ownerStats;

  const quickActions = [
    { label: "New Job", icon: Plus, href: "/jobs", minRole: "admin" as const },
    { label: "Add Lead", icon: Users, href: "/leads", minRole: "admin" as const },
    { label: "Dispatch Board", icon: MapPin, href: "/dispatch", minRole: "manager" as const },
    { label: "View Calendar", icon: Calendar, href: "/jobs", minRole: "operator" as const },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">
            {isOperator ? "My Dashboard" : "Welcome back, Team"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isOperator ? "Here are your assignments for today." : "Here's what's happening with your business today."}
          </p>
        </div>
        {isOwnerOrAdmin && (
          <Link href="/jobs" className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Job
          </Link>
        )}
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-2 ${isOperator ? "" : "lg:grid-cols-4"} gap-6`}>
        {stats.map((stat, i) => (
          <div key={i} className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col group hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full">{stat.trend}</span>
            </div>
            <h3 className="text-muted-foreground font-medium text-sm">{stat.title}</h3>
            <p className="text-3xl font-display font-bold text-foreground mt-1 group-hover:text-primary transition-colors">
              {analyticsLoading ? "..." : stat.value}
            </p>
          </div>
        ))}
      </div>

      {isOwnerOrAdmin && (
        <div className="flex flex-wrap gap-3">
          {quickActions.filter(a => isAtLeastRole(role, a.minRole)).map((action, i) => (
            <Link key={i} href={action.href} className="inline-flex items-center gap-2 px-4 py-2.5 bg-card border rounded-xl text-sm font-semibold text-foreground hover:bg-secondary transition-colors shadow-sm">
              <action.icon className="w-4 h-4 text-primary" /> {action.label}
            </Link>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-lg font-bold font-display text-foreground">
              {isOperator ? "My Jobs Today" : "Recent Jobs"}
            </h3>
            <Link href="/jobs" className="text-sm font-semibold text-primary hover:text-primary/80">View All</Link>
          </div>
          <div className="flex-1 overflow-auto">
            {jobsLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading jobs...</div>
            ) : jobsResponse?.jobs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No jobs found</p>
                <p className="text-sm mt-1">Jobs will appear here once scheduled.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground font-medium">
                  <tr>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Service</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {jobsResponse?.jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {job.customer ? `${job.customer.firstName} ${job.customer.lastName}` : 'Walk-in'}
                      </td>
                      <td className="px-6 py-4">{job.title}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          job.status === 'completed' ? 'bg-green-100 text-green-700' :
                          job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          job.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {job.scheduledStart ? format(new Date(job.scheduledStart), "MMM d, h:mm a") : 'Unscheduled'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-2xl shadow-sm p-6">
            <h3 className="text-lg font-bold font-display text-foreground mb-6">Activity Feed</h3>
            <div className="space-y-5">
              {[
                { title: "Review Request", desc: "Send review link to John Doe", time: "10m ago", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
                { title: "Job Completed", desc: "HVAC Repair at 123 Main St", time: "1h ago", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
                { title: "New Lead", desc: "Sarah Smith requested a quote", time: "2h ago", icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10" },
                { title: "Crew Delayed", desc: "Team A running 15m behind", time: "3h ago", icon: Clock, color: "text-destructive", bg: "bg-destructive/10" },
              ].map((activity, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.bg}`}>
                    <activity.icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{activity.desc}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {!canAccess("gps_tracking", tier) && (
            <UpgradePrompt feature="gps_tracking" title="GPS Crew Tracking" description="See where your crews are in real-time on a live map." />
          )}
          {!canAccess("ai_sms_workflow", tier) && (
            <UpgradePrompt feature="ai_sms_workflow" title="AI SMS Workflows" description="Automate customer communication with intelligent SMS." />
          )}
        </div>
      </div>
    </div>
  );
}
