import { useState } from "react";
import { useListJobs, useCreateJob, useUpdateJob, useListCustomers, useCreateCustomer } from "@workspace/api-client-react";
import { Search, Plus, Calendar, MapPin, MoreHorizontal, Clock, CheckCircle2, AlertCircle, User, Briefcase, X, ArrowRight, Play, Flag, FileText, UserPlus, ChevronLeft } from "lucide-react";
import { format, isToday, isFuture, isPast } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "wouter";
import { useMockAuth } from "@/lib/mock-auth";

const createJobSchema = z.object({
  customerId: z.coerce.number().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
  estimatedRevenue: z.coerce.number().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

type CreateJobData = z.infer<typeof createJobSchema>;

const STATUS_FLOW: Record<string, { next: string; label: string; icon: any; color: string }> = {
  scheduled: { next: "in_progress", label: "Start Job", icon: Play, color: "bg-blue-600 hover:bg-blue-700" },
  in_progress: { next: "completed", label: "Complete Job", icon: CheckCircle2, color: "bg-green-600 hover:bg-green-700" },
};

export default function Jobs() {
  const { isAtLeastRole, user } = useMockAuth();
  const isAdmin = isAtLeastRole("admin");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [showIssue, setShowIssue] = useState(false);
  const [issueText, setIssueText] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>(isAdmin ? "all" : "available");
  const [operatorTab, setOperatorTab] = useState<"available" | "upcoming" | "past">("available");
  const { data: jobsData, isLoading: jobsLoading, refetch } = useListJobs();
  const { data: customersData, refetch: refetchCustomers } = useListCustomers();
  const { mutate: createJob, isPending: isCreating } = useCreateJob();
  const { mutate: createCustomer, isPending: isCreatingCustomer } = useCreateCustomer();
  const { mutate: updateJob } = useUpdateJob();

  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [newCustomer, setNewCustomer] = useState({ firstName: "", lastName: "", email: "", phone: "", address: "", city: "" });
  const [newCustomerErrors, setNewCustomerErrors] = useState<Record<string, string>>({});

  const form = useForm<CreateJobData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: { priority: "normal" }
  });

  function validateNewCustomer() {
    const errs: Record<string, string> = {};
    if (!newCustomer.firstName.trim()) errs.firstName = "First name is required";
    if (!newCustomer.lastName.trim()) errs.lastName = "Last name is required";
    setNewCustomerErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleCloseModal() {
    setIsAdding(false);
    form.reset();
    setCustomerMode("existing");
    setNewCustomer({ firstName: "", lastName: "", email: "", phone: "", address: "", city: "" });
    setNewCustomerErrors({});
  }

  const onSubmit = (formData: CreateJobData) => {
    const scheduleJob = (customerId: number) => {
      createJob({
        data: {
          ...formData,
          customerId,
          scheduledStart: formData.scheduledStart ? new Date(formData.scheduledStart).toISOString() : undefined,
          scheduledEnd: formData.scheduledEnd ? new Date(formData.scheduledEnd).toISOString() : undefined,
        }
      }, {
        onSuccess: () => { handleCloseModal(); refetch(); refetchCustomers(); }
      });
    };

    if (customerMode === "new") {
      if (!validateNewCustomer()) return;
      createCustomer({ data: { ...newCustomer } }, {
        onSuccess: (customer: any) => scheduleJob(customer.id),
      });
    } else {
      if (!formData.customerId || formData.customerId < 1) {
        form.setError("customerId", { message: "Please select a customer" });
        return;
      }
      scheduleJob(formData.customerId);
    }
  };

  const handleStatusChange = (jobId: number, newStatus: string) => {
    updateJob({ jobId, data: { status: newStatus as any } }, {
      onSuccess: () => {
        refetch();
        if (selectedJob?.id === jobId) {
          setSelectedJob((prev: any) => prev ? { ...prev, status: newStatus } : null);
        }
      }
    });
  };

  const allJobs = jobsData?.jobs || [];

  const userIdHash = (user?.id || "").split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const myJobs = isAdmin ? allJobs : allJobs.filter(j => j.id % 3 === userIdHash % 3);

  const getOperatorFilteredJobs = () => {
    switch (operatorTab) {
      case "available":
        return myJobs.filter(j => j.status === "scheduled" || j.status === "in_progress");
      case "upcoming":
        return myJobs.filter(j => j.status === "scheduled" && j.scheduledStart && isFuture(new Date(j.scheduledStart)));
      case "past":
        return myJobs.filter(j => j.status === "completed" || j.status === "cancelled");
      default:
        return myJobs;
    }
  };

  const filteredJobs = isAdmin
    ? allJobs.filter(j => filterStatus === "all" || j.status === filterStatus)
    : getOperatorFilteredJobs();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">{isAdmin ? "Jobs & Scheduling" : "My Jobs"}</h2>
          <p className="text-muted-foreground mt-1">{isAdmin ? "Schedule and manage all your active service jobs." : "View and manage your assigned jobs."}</p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <Link href="/dispatch" className="px-5 py-2.5 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-all border shadow-sm">
              Board View
            </Link>
            <button onClick={() => setIsAdding(true)} className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2">
              <Plus className="w-5 h-5" /> Schedule Job
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {isAdmin ? (
          ["all", "scheduled", "in_progress", "completed", "cancelled"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
              {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
            </button>
          ))
        ) : (
          (["available", "upcoming", "past"] as const).map(tab => (
            <button key={tab} onClick={() => setOperatorTab(tab)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${operatorTab === tab ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card p-5 rounded-2xl border shadow-sm space-y-4">
            <h3 className="font-bold text-foreground">Summary</h3>
            {(isAdmin ? [
              { label: "Scheduled", count: jobsData?.jobs.filter(j => j.status === "scheduled").length || 0, color: "bg-purple-500" },
              { label: "In Progress", count: jobsData?.jobs.filter(j => j.status === "in_progress").length || 0, color: "bg-blue-500" },
              { label: "Completed", count: jobsData?.jobs.filter(j => j.status === "completed").length || 0, color: "bg-green-500" },
            ] : [
              { label: "Available", count: myJobs.filter(j => j.status === "scheduled" || j.status === "in_progress").length, color: "bg-blue-500" },
              { label: "Upcoming", count: myJobs.filter(j => j.status === "scheduled" && j.scheduledStart && isFuture(new Date(j.scheduledStart))).length, color: "bg-purple-500" },
              { label: "Completed", count: myJobs.filter(j => j.status === "completed").length, color: "bg-green-500" },
            ]).map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color}`}></div>
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
                <span className="text-sm font-bold text-foreground">{item.count}</span>
              </div>
            ))}
          </div>
          {isAdmin && (
            <div className="bg-primary/10 border border-primary/20 p-5 rounded-2xl">
              <h3 className="font-bold text-primary mb-2">Live Tracking</h3>
              <p className="text-sm text-primary/80 mb-4">Enable GPS to see where your crews are in real-time.</p>
              <Link href="/gps" className="text-sm font-semibold text-primary underline underline-offset-4">Open Map View</Link>
            </div>
          )}
        </div>

        <div className="md:col-span-3 bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b flex items-center gap-4 bg-secondary/30">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search jobs..." className="w-full pl-10 pr-4 py-2 bg-background border rounded-lg focus:outline-none focus:border-primary text-sm" />
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
                ) : filteredJobs.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">
                    <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No jobs found</p>
                  </td></tr>
                ) : filteredJobs.map((job) => (
                  <tr key={job.id} onClick={() => setSelectedJob(job)} className="hover:bg-secondary/30 transition-colors group cursor-pointer">
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
                        job.status === 'completed' ? 'bg-green-100 text-green-700' :
                        job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        job.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{job.status.replace('_', ' ')}</span>
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

      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-card h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-card z-10">
              <div>
                <h3 className="text-xl font-display font-bold text-foreground">{selectedJob.title}</h3>
                <p className="text-sm text-muted-foreground">Job #{1000 + selectedJob.id}</p>
              </div>
              <button onClick={() => { setSelectedJob(null); setShowIssue(false); }} className="p-2 hover:bg-secondary rounded-full text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                  selectedJob.status === 'completed' ? 'bg-green-100 text-green-700' :
                  selectedJob.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  selectedJob.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>{selectedJob.status.replace('_', ' ')}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                  selectedJob.priority === 'urgent' ? 'bg-destructive/10 text-destructive' :
                  selectedJob.priority === 'high' ? 'bg-amber-500/10 text-amber-600' :
                  'bg-secondary text-muted-foreground'
                }`}>{selectedJob.priority}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground font-medium">Customer</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{selectedJob.customer?.firstName} {selectedJob.customer?.lastName}</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground font-medium">Scheduled</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{selectedJob.scheduledStart ? format(new Date(selectedJob.scheduledStart), "MMM d, h:mm a") : "Not scheduled"}</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground font-medium">Location</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{selectedJob.address || selectedJob.city || "No address"}</p>
                </div>
                <div className="bg-secondary rounded-xl p-4">
                  <p className="text-xs text-muted-foreground font-medium">Revenue</p>
                  <p className="text-sm font-semibold text-foreground mt-1">{selectedJob.estimatedRevenue ? `$${selectedJob.estimatedRevenue}` : "—"}</p>
                </div>
              </div>

              {STATUS_FLOW[selectedJob.status] && (
                <button
                  onClick={() => handleStatusChange(selectedJob.id, STATUS_FLOW[selectedJob.status].next)}
                  className={`w-full py-3 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 ${STATUS_FLOW[selectedJob.status].color}`}
                >
                  {(() => { const Icon = STATUS_FLOW[selectedJob.status].icon; return <Icon className="w-4 h-4" />; })()}
                  {STATUS_FLOW[selectedJob.status].label}
                </button>
              )}

              {selectedJob.status === "completed" && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-800">Job Completed</p>
                  <p className="text-sm text-green-600 mt-1">Invoice stub generated.</p>
                </div>
              )}

              {selectedJob.status !== "completed" && selectedJob.status !== "cancelled" && (
                <div className="border-t pt-4">
                  {!showIssue ? (
                    <button onClick={() => setShowIssue(true)} className="w-full py-3 border-2 border-dashed border-destructive/30 text-destructive font-semibold rounded-xl hover:bg-destructive/5 transition-colors flex items-center justify-center gap-2">
                      <Flag className="w-4 h-4" /> Report Issue
                    </button>
                  ) : (
                    <div className="space-y-3 animate-in slide-in-from-bottom-4">
                      <textarea value={issueText} onChange={e => setIssueText(e.target.value)} placeholder="Describe the issue..." className="w-full px-4 py-3 rounded-xl bg-background border text-sm focus:ring-2 focus:ring-destructive/20 focus:border-destructive resize-none" rows={3} />
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setShowIssue(false); setIssueText(""); }} className="flex-1 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary rounded-xl">Cancel</button>
                        <button onClick={() => { setShowIssue(false); setIssueText(""); }} className="flex-1 py-2 text-sm font-semibold bg-destructive text-white rounded-xl hover:bg-destructive/90">Submit Issue</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-8 py-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-display font-bold text-foreground">Schedule New Job</h3>
              <button type="button" onClick={handleCloseModal} className="p-2 hover:bg-secondary rounded-full text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
              {/* Customer — existing or new */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold">Customer</label>
                  {customerMode === "existing" ? (
                    <button
                      type="button"
                      onClick={() => { setCustomerMode("new"); form.setValue("customerId", 0); }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Add new customer
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { setCustomerMode("existing"); setNewCustomerErrors({}); }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Back to existing
                    </button>
                  )}
                </div>

                {customerMode === "existing" ? (
                  <>
                    <select {...form.register("customerId")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value="">Select customer...</option>
                      {customersData?.customers.map(c => (
                        <option key={c.id} value={c.id}>{c.firstName} {c.lastName}{c.phone ? ` — ${c.phone}` : ""}</option>
                      ))}
                    </select>
                    {form.formState.errors.customerId && <p className="text-xs text-destructive">{form.formState.errors.customerId.message}</p>}
                  </>
                ) : (
                  <div className="rounded-xl border bg-secondary/30 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-xs text-muted-foreground font-medium">New customer details</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          value={newCustomer.firstName}
                          onChange={e => setNewCustomer(p => ({ ...p, firstName: e.target.value }))}
                          placeholder="First name *"
                          className={`w-full px-3 py-2 rounded-lg bg-background border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${newCustomerErrors.firstName ? "border-destructive" : ""}`}
                        />
                        {newCustomerErrors.firstName && <p className="text-xs text-destructive mt-1">{newCustomerErrors.firstName}</p>}
                      </div>
                      <div>
                        <input
                          value={newCustomer.lastName}
                          onChange={e => setNewCustomer(p => ({ ...p, lastName: e.target.value }))}
                          placeholder="Last name *"
                          className={`w-full px-3 py-2 rounded-lg bg-background border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary ${newCustomerErrors.lastName ? "border-destructive" : ""}`}
                        />
                        {newCustomerErrors.lastName && <p className="text-xs text-destructive mt-1">{newCustomerErrors.lastName}</p>}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="email"
                        value={newCustomer.email}
                        onChange={e => setNewCustomer(p => ({ ...p, email: e.target.value }))}
                        placeholder="Email"
                        className="w-full px-3 py-2 rounded-lg bg-background border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <input
                        value={newCustomer.phone}
                        onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))}
                        placeholder="Phone"
                        className="w-full px-3 py-2 rounded-lg bg-background border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={newCustomer.address}
                        onChange={e => setNewCustomer(p => ({ ...p, address: e.target.value }))}
                        placeholder="Address"
                        className="w-full px-3 py-2 rounded-lg bg-background border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <input
                        value={newCustomer.city}
                        onChange={e => setNewCustomer(p => ({ ...p, city: e.target.value }))}
                        placeholder="City"
                        className="w-full px-3 py-2 rounded-lg bg-background border text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Job Title / Service</label>
                <input {...form.register("title")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g. AC Repair" />
                {form.formState.errors.title && <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Description</label>
                <textarea {...form.register("description")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" rows={2} placeholder="Job details..." />
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
                  <label className="text-sm font-semibold">Est. Revenue ($)</label>
                  <input type="number" {...form.register("estimatedRevenue")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Start Time</label>
                  <input type="datetime-local" {...form.register("scheduledStart")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">End Time</label>
                  <input type="datetime-local" {...form.register("scheduledEnd")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Address</label>
                  <input {...form.register("address")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="123 Main St" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">City</label>
                  <input {...form.register("city")} className="w-full px-4 py-2.5 rounded-xl bg-background border focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                </div>
              </div>
              <div className="pt-6 flex items-center justify-end gap-3 border-t">
                <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary rounded-xl">Cancel</button>
                <button type="submit" disabled={isCreating || isCreatingCustomer} className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 shadow-sm disabled:opacity-50">
                  {isCreatingCustomer ? "Creating customer..." : isCreating ? "Scheduling..." : "Schedule Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
