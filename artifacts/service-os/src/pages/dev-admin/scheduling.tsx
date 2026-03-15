import { useState, useEffect } from "react";
import { Calendar, Clock, Users, Plus, X, Save, BarChart3, CheckCircle, AlertCircle, Video, ExternalLink, Edit2, Trash2 } from "lucide-react";
import { devAdminFetch } from "@/lib/dev-admin-auth";
import { format } from "date-fns";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface TimeBlock {
  start: string;
  end: string;
}

interface BlockedDate {
  date: string;
  reason?: string;
}

interface Host {
  id?: number;
  name: string;
  email: string;
  isActive: boolean;
}

interface DemoConfig {
  availableDays: string[];
  timeBlocks: TimeBlock[];
  maxPerDay: number;
  bufferMin: number;
  durationMin: number;
  blockedDates: BlockedDate[];
  emailToggles: Record<string, boolean>;
  assignmentMethod: string;
}

export default function DevAdminScheduling() {
  const [config, setConfig] = useState<DemoConfig>({
    availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    timeBlocks: [{ start: "09:00", end: "10:00" }, { start: "14:00", end: "15:00" }],
    maxPerDay: 3,
    bufferMin: 30,
    durationMin: 30,
    blockedDates: [],
    emailToggles: { confirmation: true, reminder24h: true, reminder1h: true, cancellation: true, internal: true },
    assignmentMethod: "round-robin",
  });
  const [hosts, setHosts] = useState<Host[]>([]);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalRequests: 0, confirmedRequests: 0, confirmationRate: 0 });
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [newTimeStart, setNewTimeStart] = useState("09:00");
  const [newTimeEnd, setNewTimeEnd] = useState("10:00");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [sessionForm, setSessionForm] = useState({ title: "", description: "", scheduledAt: "", durationMin: 60, meetingLink: "", hostName: "" });
  const [editingSession, setEditingSession] = useState<number | null>(null);
  const [sessionSaving, setSessionSaving] = useState(false);
  const [showSessionForm, setShowSessionForm] = useState(false);

  const TIERS = ["free", "independent", "pro", "franchise", "enterprise"];
  const TIER_LABELS: Record<string, string> = { free: "Free", independent: "Independent", pro: "Pro", franchise: "Franchise", enterprise: "Enterprise" };
  const [tierVideos, setTierVideos] = useState<Record<string, { videoUrl: string; title: string; description: string }>>({});
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [tierVideoForm, setTierVideoForm] = useState({ videoUrl: "", title: "", description: "" });

  useEffect(() => {
    devAdminFetch("/demo/settings")
      .then(r => r.json())
      .then(data => {
        if (data.config) {
          setConfig({
            availableDays: data.config.availableDays || [],
            timeBlocks: data.config.timeBlocks || [],
            maxPerDay: data.config.maxPerDay || 3,
            bufferMin: data.config.bufferMin || 30,
            durationMin: data.config.durationMin || 30,
            blockedDates: data.config.blockedDates || [],
            emailToggles: data.config.emailToggles || {},
            assignmentMethod: data.config.assignmentMethod || "round-robin",
          });
        }
        if (data.hosts) setHosts(data.hosts);
        if (data.upcomingBookings) setUpcomingBookings(data.upcomingBookings);
        if (data.stats) setStats(data.stats);
      })
      .catch(console.error);

    devAdminFetch("/demo/live-sessions")
      .then(r => r.json())
      .then(data => setLiveSessions(data.sessions || []))
      .catch(console.error);

    devAdminFetch("/demo/tier-videos")
      .then(r => r.json())
      .then(data => {
        const map: Record<string, any> = {};
        (data.videos || []).forEach((v: any) => { map[v.tier] = { videoUrl: v.videoUrl || "", title: v.title || "", description: v.description || "" }; });
        setTierVideos(map);
      })
      .catch(console.error);
  }, []);

  const handleSaveSession = async () => {
    setSessionSaving(true);
    try {
      if (editingSession !== null) {
        const res = await devAdminFetch(`/demo/live-sessions/${editingSession}`, { method: "PATCH", body: JSON.stringify(sessionForm) });
        const updated = await res.json();
        setLiveSessions(prev => prev.map(s => s.id === editingSession ? updated : s));
      } else {
        const res = await devAdminFetch("/demo/live-sessions", { method: "POST", body: JSON.stringify(sessionForm) });
        const created = await res.json();
        setLiveSessions(prev => [...prev, created]);
      }
      setShowSessionForm(false);
      setEditingSession(null);
      setSessionForm({ title: "", description: "", scheduledAt: "", durationMin: 60, meetingLink: "", hostName: "" });
    } catch (err) { console.error(err); }
    setSessionSaving(false);
  };

  const handleDeleteSession = async (id: number) => {
    if (!confirm("Delete this live demo session?")) return;
    await devAdminFetch(`/demo/live-sessions/${id}`, { method: "DELETE" });
    setLiveSessions(prev => prev.filter(s => s.id !== id));
  };

  const handleEditSession = (session: any) => {
    setEditingSession(session.id);
    setSessionForm({
      title: session.title,
      description: session.description || "",
      scheduledAt: session.scheduledAt ? new Date(session.scheduledAt).toISOString().slice(0, 16) : "",
      durationMin: session.durationMin,
      meetingLink: session.meetingLink || "",
      hostName: session.hostName || "",
    });
    setShowSessionForm(true);
  };

  const handleSaveTierVideo = async (tier: string) => {
    const form = tierVideoForm;
    await devAdminFetch(`/demo/tier-videos/${tier}`, { method: "PUT", body: JSON.stringify(form) });
    setTierVideos(prev => ({ ...prev, [tier]: { ...form } }));
    setEditingTier(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await devAdminFetch("/demo/settings", {
        method: "PATCH",
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const toggleDay = (day: string) => {
    setConfig(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day],
    }));
  };

  const addTimeBlock = () => {
    setConfig(prev => ({
      ...prev,
      timeBlocks: [...prev.timeBlocks, { start: newTimeStart, end: newTimeEnd }],
    }));
    setNewTimeStart("09:00");
    setNewTimeEnd("10:00");
  };

  const removeTimeBlock = (index: number) => {
    setConfig(prev => ({
      ...prev,
      timeBlocks: prev.timeBlocks.filter((_, i) => i !== index),
    }));
  };

  const addBlockedDate = () => {
    if (!newBlockDate) return;
    setConfig(prev => ({
      ...prev,
      blockedDates: [...prev.blockedDates, { date: newBlockDate, reason: newBlockReason }],
    }));
    setNewBlockDate("");
    setNewBlockReason("");
  };

  const removeBlockedDate = (index: number) => {
    setConfig(prev => ({
      ...prev,
      blockedDates: prev.blockedDates.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground">Demo Scheduling</h1>
          <p className="text-muted-foreground mt-1">Manage demo availability, hosts, and scheduling settings.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50"
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.totalRequests}</p>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.confirmedRequests}</p>
            <p className="text-sm text-muted-foreground">Confirmed</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.confirmationRate}%</p>
            <p className="text-sm text-muted-foreground">Confirmation Rate</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Available Days
            </h3>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    config.availableDays.includes(day)
                      ? "bg-blue-600 text-white"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Time Blocks
            </h3>
            <div className="space-y-2">
              {config.timeBlocks.map((block, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <span className="text-sm font-medium">{block.start} - {block.end}</span>
                  <button onClick={() => removeTimeBlock(i)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="time" value={newTimeStart} onChange={e => setNewTimeStart(e.target.value)} className="px-3 py-2 rounded-lg bg-background border text-sm" />
              <span className="text-muted-foreground">to</span>
              <input type="time" value={newTimeEnd} onChange={e => setNewTimeEnd(e.target.value)} className="px-3 py-2 rounded-lg bg-background border text-sm" />
              <button onClick={addTimeBlock} className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Scheduling Limits</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Max Demos/Day</label>
                <input type="number" value={config.maxPerDay} onChange={e => setConfig(prev => ({ ...prev, maxPerDay: parseInt(e.target.value) || 1 }))} className="w-full px-3 py-2 rounded-lg bg-background border text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Buffer (min)</label>
                <select value={config.bufferMin} onChange={e => setConfig(prev => ({ ...prev, bufferMin: parseInt(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-background border text-sm">
                  <option value={15}>15 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Duration</label>
                <select value={config.durationMin} onChange={e => setConfig(prev => ({ ...prev, durationMin: parseInt(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-background border text-sm">
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Blocked Dates</h3>
            <div className="space-y-2">
              {config.blockedDates.map((blocked, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div>
                    <span className="text-sm font-medium">{blocked.date}</span>
                    {blocked.reason && <span className="text-xs text-muted-foreground ml-2">({blocked.reason})</span>}
                  </div>
                  <button onClick={() => removeBlockedDate(i)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input type="date" value={newBlockDate} onChange={e => setNewBlockDate(e.target.value)} className="px-3 py-2 rounded-lg bg-background border text-sm" />
              <input type="text" value={newBlockReason} onChange={e => setNewBlockReason(e.target.value)} placeholder="Reason (optional)" className="flex-1 px-3 py-2 rounded-lg bg-background border text-sm" />
              <button onClick={addBlockedDate} className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" /> Demo Hosts
            </h3>
            <div className="space-y-3">
              {hosts.length === 0 && (
                <p className="text-sm text-muted-foreground">No hosts configured. Add up to 3 demo hosts.</p>
              )}
              {hosts.map((host, i) => (
                <div key={host.id || i} className="p-4 bg-secondary rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                      {host.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{host.name}</p>
                      <p className="text-xs text-muted-foreground">{host.email}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={host.isActive} onChange={() => {
                        const updated = [...hosts];
                        updated[i] = { ...updated[i], isActive: !updated[i].isActive };
                        setHosts(updated);
                      }} className="sr-only peer" />
                      <div className="w-9 h-5 bg-muted-foreground/30 rounded-full peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Assignment Method</label>
              <select value={config.assignmentMethod} onChange={e => setConfig(prev => ({ ...prev, assignmentMethod: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-background border text-sm">
                <option value="round-robin">Round Robin</option>
                <option value="manual">Manual</option>
                <option value="owner-assigned">Owner Assigned</option>
              </select>
            </div>
          </div>

          <div className="bg-card rounded-2xl border p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Automated Emails</h3>
            <div className="space-y-3">
              {[
                { key: "confirmation", label: "Confirmation (instant)" },
                { key: "reminder24h", label: "24hr Reminder" },
                { key: "reminder1h", label: "1hr Reminder" },
                { key: "cancellation", label: "Cancellation/Reschedule" },
                { key: "internal", label: "Internal Notification" },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <span className="text-sm">{label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={config.emailToggles[key] ?? true} onChange={() => setConfig(prev => ({
                      ...prev,
                      emailToggles: { ...prev.emailToggles, [key]: !prev.emailToggles[key] },
                    }))} className="sr-only peer" />
                    <div className="w-9 h-5 bg-muted-foreground/30 rounded-full peer-checked:bg-blue-600 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border p-6">
        <h3 className="font-semibold text-foreground mb-4">Upcoming Private Demo Bookings</h3>
        {upcomingBookings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No upcoming demos scheduled.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date/Time</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Requester</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Business Type</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingBookings.map((booking: any) => (
                  <tr key={booking.id} className="border-b last:border-0">
                    <td className="py-3 px-4">{booking.slotDate} {booking.slotTime}</td>
                    <td className="py-3 px-4">{booking.request?.firstName} {booking.request?.lastName}</td>
                    <td className="py-3 px-4">{booking.request?.businessType}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        booking.status === "confirmed" ? "bg-green-100 text-green-700" :
                        booking.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>{booking.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" /> Live Demo Sessions
          </h3>
          <button
            onClick={() => { setEditingSession(null); setSessionForm({ title: "", description: "", scheduledAt: "", durationMin: 60, meetingLink: "", hostName: "" }); setShowSessionForm(true); }}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 text-sm"
          >
            <Plus className="w-4 h-4" /> Add Session
          </button>
        </div>

        {showSessionForm && (
          <div className="bg-secondary/50 rounded-xl p-5 space-y-4 border">
            <h4 className="font-semibold text-sm text-foreground">{editingSession ? "Edit Session" : "New Live Demo Session"}</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Title</label>
                <input value={sessionForm.title} onChange={e => setSessionForm(p => ({ ...p, title: e.target.value }))} placeholder="ServiceOS Platform Overview" className="w-full px-3 py-2 rounded-lg bg-background border text-sm" />
              </div>
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Description</label>
                <textarea value={sessionForm.description} onChange={e => setSessionForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg bg-background border text-sm resize-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Date & Time (UTC)</label>
                <input type="datetime-local" value={sessionForm.scheduledAt} onChange={e => setSessionForm(p => ({ ...p, scheduledAt: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-background border text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Duration (min)</label>
                <select value={sessionForm.durationMin} onChange={e => setSessionForm(p => ({ ...p, durationMin: parseInt(e.target.value) }))} className="w-full px-3 py-2 rounded-lg bg-background border text-sm">
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                  <option value={90}>90 min</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Meeting Link (Zoom/Meet)</label>
                <input value={sessionForm.meetingLink} onChange={e => setSessionForm(p => ({ ...p, meetingLink: e.target.value }))} placeholder="https://zoom.us/j/..." className="w-full px-3 py-2 rounded-lg bg-background border text-sm" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Host Name</label>
                <input value={sessionForm.hostName} onChange={e => setSessionForm(p => ({ ...p, hostName: e.target.value }))} placeholder="Jordan Lee" className="w-full px-3 py-2 rounded-lg bg-background border text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSaveSession} disabled={sessionSaving} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2">
                <Save className="w-4 h-4" /> {sessionSaving ? "Saving..." : "Save Session"}
              </button>
              <button onClick={() => { setShowSessionForm(false); setEditingSession(null); }} className="px-4 py-2 bg-secondary text-muted-foreground font-semibold rounded-lg text-sm hover:bg-secondary/80">
                Cancel
              </button>
            </div>
          </div>
        )}

        {liveSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No live sessions scheduled. Add your first one above.</p>
        ) : (
          <div className="space-y-3">
            {liveSessions.map(session => (
              <div key={session.id} className="flex items-start gap-4 p-4 bg-secondary/30 rounded-xl border">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-foreground">{session.title}</p>
                    {new Date(session.scheduledAt) < new Date() && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Past</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(session.scheduledAt), "PPP 'at' p")} · {session.durationMin} min
                    {session.hostName && ` · Hosted by ${session.hostName}`}
                  </p>
                  {session.meetingLink && (
                    <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                      <ExternalLink className="w-3 h-3" /> Meeting link
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => handleEditSession(session)} className="p-2 text-muted-foreground hover:text-blue-600 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteSession(session.id)} className="p-2 text-muted-foreground hover:text-destructive rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card rounded-2xl border p-6 space-y-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Video className="w-4 h-4 text-blue-600" /> Video Demos by Tier
        </h3>
        <p className="text-sm text-muted-foreground">Set YouTube/Vimeo embed URLs for each plan tier. Leave blank to show "Coming Soon".</p>
        <div className="space-y-3">
          {TIERS.map(tier => {
            const video = tierVideos[tier];
            const isEditing = editingTier === tier;
            return (
              <div key={tier} className="p-4 bg-secondary/30 rounded-xl border">
                {isEditing ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">{TIER_LABELS[tier]}</p>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Video Embed URL (YouTube/Vimeo embed URL)</label>
                      <input value={tierVideoForm.videoUrl} onChange={e => setTierVideoForm(p => ({ ...p, videoUrl: e.target.value }))} placeholder="https://www.youtube.com/embed/..." className="w-full px-3 py-2 rounded-lg bg-background border text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Card Title</label>
                      <input value={tierVideoForm.title} onChange={e => setTierVideoForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 rounded-lg bg-background border text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Card Description</label>
                      <textarea value={tierVideoForm.description} onChange={e => setTierVideoForm(p => ({ ...p, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg bg-background border text-sm resize-none" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveTierVideo(tier)} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-500">Save</button>
                      <button onClick={() => setEditingTier(null)} className="px-4 py-2 bg-secondary text-muted-foreground font-semibold rounded-lg text-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{TIER_LABELS[tier]}</p>
                      {video?.videoUrl ? (
                        <p className="text-xs text-green-600 mt-0.5 flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3" /> Video URL set
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-0.5">No video set — shows "Coming Soon"</p>
                      )}
                    </div>
                    <button
                      onClick={() => { setEditingTier(tier); setTierVideoForm({ videoUrl: video?.videoUrl || "", title: video?.title || "", description: video?.description || "" }); }}
                      className="p-2 text-muted-foreground hover:text-blue-600 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
