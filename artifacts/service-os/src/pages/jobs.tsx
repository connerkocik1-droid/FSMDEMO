import { useState } from "react";
import { useListJobs, useCreateJob, useListCustomers } from "@workspace/api-client-react";
import { Search, Plus, Calendar, MapPin, MoreHorizontal, Clock, CheckCircle2, CheckCircle, AlertCircle, User, Users, Briefcase, Filter, X, ArrowRight, ArrowUpRight, Zap } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";

const createJobSchema = z.object({
  customerId: z.coerce.number().min(1, "Customer is required"),
  title: z.string().min(1, "Title is required"),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  scheduledStart: z.string().optional(),
  estimatedRevenue: z.coerce.number().optional(),
});

type CreateJobData = z.infer<typeof createJobSchema>;

export default function Jobs() {
  const [isAdding, setIsAdding] = useState(false);
  const { data: jobsData, isLoading: jobsLoading, refetch } = useListJobs();
  const { data: customersData } = useListCustomers();
  const { mutate: createJob, isPending: isCreating } = useCreateJob();

  const form = useForm<CreateJobData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      priority: "normal"
    }
  });

  const onSubmit = (formData: CreateJobData) => {
    // format date properly if exists
    const payload = {
      ...formData,
      scheduledStart: formData.scheduledStart ? new Date(formData.scheduledStart).toISOString() : undefined
    };
    
    createJob({ data: payload }, {
      onSuccess: () => {
        setIsAdding(false);
        form.reset();
        refetch();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Jobs & Dispatch</h2>
          <p className="text-muted-foreground mt-1">Schedule and manage all your active service jobs.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dispatch" className="px-5 py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-all border shadow-sm">
            Board View
          </Link>
          <button 
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Schedule Job
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card p-5 rounded-2xl border shadow-sm">
            <h3 className="font-bold text-foreground mb-4">Quick Filters</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary cursor-pointer">
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary/20" />
                <span className="text-sm font-medium">Unassigned</span>
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary cursor-pointer">
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary/20" defaultChecked />
                <span className="text-sm font-medium">Scheduled</span>
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary cursor-pointer">
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary/20" defaultChecked />
                <span className="text-sm font-medium">In Progress</span>
              </label>
              <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary cursor-pointer">
                <input type="checkbox" className="rounded border-border text-primary focus:ring-primary/20" />
                <span className="text-sm font-medium">Completed Today</span>
              </label>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 p-5 rounded-2xl">
            <h3 className="font-bold text-primary mb-2">Live Tracking</h3>
            <p className="text-sm text-primary/80 mb-4">Enable GPS to see where your crews are in real-time.</p>
            <Link href="/gps" className="text-sm font-semibold text-primary underline underline-offset-4">Open Map View</Link>
          </div>
        </div>

        <div className="md:col-span-3 bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b flex items-center gap-4 bg-secondary/30">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search jobs..." 
                className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:border-primary text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/50 text-muted-foreground font-medium border-b">
                <tr>
                  <th className="px-6 py-4">Job Details</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Schedule</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {jobsLoading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : jobsData?.jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-secondary/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground mb-1">{job.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          job.priority === 'urgent' ? 'bg-destructive/10 text-destructive' :
                          job.priority === 'high' ? 'bg-amber-500/10 text-amber-600' :
                          'bg-secondary text-muted-foreground'
                        }`}>{job.priority}</span>
                        <span>#{1000 + job.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{job.customer?.firstName} {job.customer?.lastName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.city || "No address"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {job.scheduledStart ? (
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Calendar className="w-4 h-4 text-primary" />
                          {format(new Date(job.scheduledStart), "MMM d, h:mm a")}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">Unscheduled</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                        job.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' :
                        job.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                        job.status === 'scheduled' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-800'
                      }`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-secondary rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 transition-all">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-8 py-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-foreground">Schedule New Job</h3>
              <button onClick={() => setIsAdding(false)} className="p-2 hover:bg-secondary rounded-full text-muted-foreground">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Customer</label>
                <select {...form.register("customerId")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary">
                  <option value="">Select customer...</option>
                  {customersData?.customers.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                  ))}
                </select>
                {form.formState.errors.customerId && <p className="text-xs text-destructive">{form.formState.errors.customerId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Job Title / Service</label>
                <input {...form.register("title")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. AC Repair" />
                {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Priority</label>
                  <select {...form.register("priority")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Scheduled Start</label>
                  <input type="datetime-local" {...form.register("scheduledStart")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end gap-3 border-t">
                <button type="button" onClick={() => setIsAdding(false)} className="px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary rounded-xl">
                  Cancel
                </button>
                <button type="submit" disabled={isCreating} className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 shadow-sm disabled:opacity-50">
                  {isCreating ? "Scheduling..." : "Schedule Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
