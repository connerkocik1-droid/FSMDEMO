import { useGetAnalyticsOverview, useListJobs } from "@workspace/api-client-react";
import { Activity, DollarSign, Users, Briefcase, TrendingUp, Clock, Star, CheckCircle2, CheckCircle, ArrowUpRight, MapPin, Zap, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  // Using 30d by default for the overview
  const { data: analytics, isLoading: analyticsLoading } = useGetAnalyticsOverview({ period: "30d" });
  
  // Fetch recent jobs
  const { data: jobsResponse, isLoading: jobsLoading } = useListJobs({ limit: 5 });

  const stats = [
    {
      title: "Total Revenue (30d)",
      value: analytics ? `$${analytics.totalRevenue.toLocaleString()}` : "$0",
      trend: analytics ? `+${analytics.revenueGrowth}%` : "0%",
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      title: "Completed Jobs",
      value: analytics?.completedJobs.toString() || "0",
      trend: "This month",
      icon: Briefcase,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "New Leads",
      value: analytics?.newLeads.toString() || "0",
      trend: "Pending follow up",
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Avg Job Rating",
      value: analytics ? `${analytics.avgRating.toFixed(1)}/5` : "0.0",
      trend: "From reviews",
      icon: Activity,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Welcome back, Team</h2>
          <p className="text-muted-foreground mt-1">Here's what's happening with your business today.</p>
        </div>
        <button className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm">
          + New Job
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-card p-6 rounded-2xl border shadow-sm flex flex-col group hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-secondary text-secondary-foreground rounded-full">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-muted-foreground font-medium text-sm">{stat.title}</h3>
            <p className="text-3xl font-display font-bold text-foreground mt-1 group-hover:text-primary transition-colors">
              {analyticsLoading ? "..." : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Jobs */}
        <div className="lg:col-span-2 bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-lg font-bold font-display text-foreground">Recent Jobs</h3>
            <button className="text-sm font-semibold text-primary hover:text-primary/80">View All</button>
          </div>
          <div className="flex-1 overflow-auto">
            {jobsLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading jobs...</div>
            ) : jobsResponse?.jobs.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No recent jobs found.</div>
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
                          job.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                          job.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800'
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

        {/* Action Center / Activity */}
        <div className="bg-card border rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold font-display text-foreground mb-6">Action Center</h3>
          
          <div className="space-y-6">
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

          <button className="w-full mt-8 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary hover:text-primary transition-colors text-sm font-semibold text-muted-foreground">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}
