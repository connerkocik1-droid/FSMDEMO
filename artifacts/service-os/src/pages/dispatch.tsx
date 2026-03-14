import { useListJobs, useUpdateJob } from "@workspace/api-client-react";
import { format } from "date-fns";
import { Clock, CheckCircle2, CheckCircle, AlertCircle, MapPin, Phone, User, Users, Briefcase, ArrowRight, MoreHorizontal, Plus } from "lucide-react";

export default function DispatchBoard() {
  const { data, isLoading, refetch } = useListJobs();
  const { mutate: updateJob } = useUpdateJob();

  // Simple Kanban board visualization
  // Real implementation would use dnd-kit for drag and drop

  const columns = [
    { id: "scheduled", title: "Scheduled", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "in_progress", title: "In Progress", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "completed", title: "Completed", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" }
  ];

  const moveJob = (jobId: number, currentStatus: string) => {
    // Cycle status for demo purposes
    const nextStatus = currentStatus === 'scheduled' ? 'in_progress' : currentStatus === 'in_progress' ? 'completed' : 'scheduled';
    updateJob({ jobId, data: { status: nextStatus as any } }, { onSuccess: () => refetch() });
  };

  return (
    <div className="space-y-6 h-[calc(100vh-12rem)] flex flex-col">
      <div>
        <h2 className="text-3xl font-display font-bold text-foreground">Dispatch Board</h2>
        <p className="text-muted-foreground mt-1">Track job progress in real-time. Click a card to advance its status.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {columns.map(col => {
          const colJobs = data?.jobs.filter(j => j.status === col.id) || [];
          
          return (
            <div key={col.id} className="bg-secondary/30 border rounded-2xl flex flex-col overflow-hidden">
              <div className="p-4 border-b bg-card flex items-center justify-between sticky top-0">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${col.bg}`}>
                    <col.icon className={`w-4 h-4 ${col.color}`} />
                  </div>
                  <h3 className="font-bold text-foreground">{col.title}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary text-xs font-bold text-muted-foreground">
                  {colJobs.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                  <div className="text-center text-sm text-muted-foreground mt-8">Loading...</div>
                ) : colJobs.length === 0 ? (
                  <div className="text-center p-8 border-2 border-dashed border-border rounded-xl">
                    <p className="text-sm text-muted-foreground font-medium">No jobs in this column</p>
                  </div>
                ) : colJobs.map(job => (
                  <div 
                    key={job.id} 
                    onClick={() => moveJob(job.id, job.status)}
                    className="bg-card p-4 rounded-xl border shadow-sm hover:shadow-md hover:border-primary/50 cursor-pointer transition-all active:scale-95 group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        job.priority === 'urgent' ? 'text-destructive' : 'text-primary'
                      }`}>{job.priority}</span>
                      <span className="text-xs text-muted-foreground font-mono">#{1000 + job.id}</span>
                    </div>
                    <h4 className="font-bold text-foreground leading-tight">{job.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{job.customer?.firstName} {job.customer?.lastName}</p>
                    
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {job.scheduledStart ? format(new Date(job.scheduledStart), "h:mm a") : "TBD"}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 font-semibold text-primary transition-opacity">
                        Move →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
