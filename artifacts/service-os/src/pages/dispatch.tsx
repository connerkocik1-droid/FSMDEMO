import { useState } from "react";
import { useListJobs, useUpdateJob } from "@workspace/api-client-react";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";
import { Clock, CheckCircle2, AlertCircle, MapPin, Calendar, List, Grid3X3, ChevronLeft, ChevronRight, User, Play } from "lucide-react";

type ViewMode = "board" | "day" | "week" | "list";

export default function DispatchBoard() {
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { data, isLoading, refetch } = useListJobs();
  const { mutate: updateJob } = useUpdateJob();

  const columns = [
    { id: "scheduled", title: "Scheduled", icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
    { id: "in_progress", title: "In Progress", icon: Play, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "completed", title: "Completed", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  const moveJob = (jobId: number, newStatus: string) => {
    updateJob({ jobId, data: { status: newStatus as any } }, { onSuccess: () => refetch() });
  };

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getJobsForDate = (date: Date) =>
    data?.jobs.filter(j => j.scheduledStart && isSameDay(new Date(j.scheduledStart), date)) || [];

  const renderJobCard = (job: any, compact = false) => (
    <div key={job.id} className={`bg-card ${compact ? "p-3" : "p-4"} rounded-xl border shadow-sm hover:shadow-md hover:border-primary/50 cursor-pointer transition-all active:scale-95 group`}>
      <div className="flex items-start justify-between mb-1">
        <span className={`text-[10px] font-bold uppercase tracking-wider ${job.priority === 'urgent' ? 'text-destructive' : job.priority === 'high' ? 'text-amber-600' : 'text-primary'}`}>{job.priority}</span>
        <span className="text-[10px] text-muted-foreground font-mono">#{1000 + job.id}</span>
      </div>
      <h4 className={`font-bold text-foreground ${compact ? "text-xs" : "text-sm"} leading-tight`}>{job.title}</h4>
      <p className="text-xs text-muted-foreground mt-1">{job.customer?.firstName} {job.customer?.lastName}</p>
      {!compact && (
        <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {job.scheduledStart ? format(new Date(job.scheduledStart), "h:mm a") : "TBD"}
          </div>
          {job.status !== "completed" && (
            <button
              onClick={(e) => { e.stopPropagation(); moveJob(job.id, job.status === "scheduled" ? "in_progress" : "completed"); }}
              className="opacity-0 group-hover:opacity-100 font-semibold text-primary transition-opacity"
            >
              {job.status === "scheduled" ? "Start →" : "Complete →"}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Dispatch Board</h2>
          <p className="text-muted-foreground mt-1">Track job progress in real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          {([
            { id: "board", label: "Board", icon: Grid3X3 },
            { id: "day", label: "Day", icon: Calendar },
            { id: "week", label: "Week", icon: Calendar },
            { id: "list", label: "List", icon: List },
          ] as const).map(v => (
            <button key={v.id} onClick={() => setViewMode(v.id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${viewMode === v.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
              <v.icon className="w-4 h-4" /> {v.label}
            </button>
          ))}
        </div>
      </div>

      {(viewMode === "day" || viewMode === "week") && (
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedDate(d => addDays(d, viewMode === "week" ? -7 : -1))} className="p-2 hover:bg-secondary rounded-lg"><ChevronLeft className="w-4 h-4" /></button>
          <span className="font-semibold text-foreground">
            {viewMode === "day" ? format(selectedDate, "EEEE, MMMM d, yyyy") : `Week of ${format(weekStart, "MMM d")} - ${format(addDays(weekStart, 6), "MMM d, yyyy")}`}
          </span>
          <button onClick={() => setSelectedDate(d => addDays(d, viewMode === "week" ? 7 : 1))} className="p-2 hover:bg-secondary rounded-lg"><ChevronRight className="w-4 h-4" /></button>
          <button onClick={() => setSelectedDate(new Date())} className="px-3 py-1.5 text-xs font-semibold bg-secondary rounded-lg hover:bg-secondary/80">Today</button>
        </div>
      )}

      {viewMode === "board" && (
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
                  <span className="px-2.5 py-0.5 rounded-full bg-secondary text-xs font-bold text-muted-foreground">{colJobs.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {isLoading ? (
                    <div className="text-center text-sm text-muted-foreground mt-8">Loading...</div>
                  ) : colJobs.length === 0 ? (
                    <div className="text-center p-8 border-2 border-dashed border-border rounded-xl">
                      <p className="text-sm text-muted-foreground font-medium">No jobs</p>
                    </div>
                  ) : colJobs.map(job => renderJobCard(job))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === "day" && (
        <div className="flex-1 bg-card border rounded-2xl overflow-y-auto p-6">
          <div className="space-y-4">
            {getJobsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">No jobs scheduled for this day</p>
              </div>
            ) : getJobsForDate(selectedDate).map(job => (
              <div key={job.id} className="flex items-center gap-4 p-4 rounded-xl border hover:bg-secondary/30 transition-colors">
                <div className="text-center w-16 shrink-0">
                  <p className="text-lg font-bold text-foreground">{job.scheduledStart ? format(new Date(job.scheduledStart), "h:mm") : "—"}</p>
                  <p className="text-xs text-muted-foreground">{job.scheduledStart ? format(new Date(job.scheduledStart), "a") : ""}</p>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground">{job.title}</p>
                  <p className="text-sm text-muted-foreground">{job.customer?.firstName} {job.customer?.lastName}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                  job.status === 'completed' ? 'bg-green-100 text-green-700' :
                  job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-purple-100 text-purple-700'
                }`}>{job.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === "week" && (
        <div className="flex-1 grid grid-cols-7 gap-2 overflow-hidden">
          {weekDays.map(day => {
            const dayJobs = getJobsForDate(day);
            const isToday = isSameDay(day, new Date());
            return (
              <div key={day.toISOString()} className={`bg-card border rounded-xl flex flex-col overflow-hidden ${isToday ? "ring-2 ring-primary" : ""}`}>
                <div className={`p-2 text-center border-b ${isToday ? "bg-primary text-primary-foreground" : "bg-secondary/50"}`}>
                  <p className="text-xs font-medium">{format(day, "EEE")}</p>
                  <p className="text-lg font-bold">{format(day, "d")}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                  {dayJobs.map(job => renderJobCard(job, true))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewMode === "list" && (
        <div className="flex-1 bg-card border rounded-2xl overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/50 text-muted-foreground font-medium border-b sticky top-0">
              <tr>
                <th className="px-6 py-4">Job</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Priority</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.jobs.map(job => (
                <tr key={job.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">{job.title}</td>
                  <td className="px-6 py-4">{job.customer?.firstName} {job.customer?.lastName}</td>
                  <td className="px-6 py-4">{job.scheduledStart ? format(new Date(job.scheduledStart), "MMM d, h:mm a") : "Unscheduled"}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${job.priority === 'urgent' ? 'bg-destructive/10 text-destructive' : job.priority === 'high' ? 'bg-amber-500/10 text-amber-600' : 'bg-secondary text-muted-foreground'}`}>{job.priority}</span></td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${
                    job.status === 'completed' ? 'bg-green-100 text-green-700' :
                    job.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>{job.status.replace('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
