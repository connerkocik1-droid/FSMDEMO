import { useState } from "react";
import { ClipboardList, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

interface AuditEntry {
  id: number;
  action: string;
  userName: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  user_invited: { label: "User Invited", color: "bg-blue-100 text-blue-700" },
  user_role_changed: { label: "Role Changed", color: "bg-violet-100 text-violet-700" },
  user_deactivated: { label: "User Deactivated", color: "bg-red-100 text-red-700" },
  user_reactivated: { label: "User Reactivated", color: "bg-green-100 text-green-700" },
  invite_accepted: { label: "Invite Accepted", color: "bg-emerald-100 text-emerald-700" },
  company_profile_updated: { label: "Company Updated", color: "bg-amber-100 text-amber-700" },
  company_settings_updated: { label: "Settings Updated", color: "bg-amber-100 text-amber-700" },
  job_created: { label: "Job Created", color: "bg-sky-100 text-sky-700" },
  job_deleted: { label: "Job Deleted", color: "bg-red-100 text-red-700" },
  tier_changed: { label: "Plan Changed", color: "bg-violet-100 text-violet-700" },
  api_key_generated: { label: "API Key Generated", color: "bg-orange-100 text-orange-700" },
};

const MOCK_ENTRIES: AuditEntry[] = [
  { id: 1, action: "user_invited", userName: "Jordan Lee", entityType: "user_invite", entityId: "5", metadata: { email: "newtech@leehvac.com", role: "operator" }, createdAt: "2026-03-15T14:30:00Z" },
  { id: 2, action: "company_settings_updated", userName: "Jordan Lee", entityType: "company_settings", entityId: "1", metadata: { timezone: "America/Chicago" }, createdAt: "2026-03-14T11:15:00Z" },
  { id: 3, action: "user_role_changed", userName: "Jordan Lee", entityType: "user", entityId: "4", metadata: { newRole: "manager" }, createdAt: "2026-03-12T09:45:00Z" },
  { id: 4, action: "job_created", userName: "Sarah Chen", entityType: "job", entityId: "47", metadata: { title: "AC unit install" }, createdAt: "2026-03-11T16:20:00Z" },
  { id: 5, action: "company_profile_updated", userName: "Jordan Lee", entityType: "company", entityId: "1", metadata: { name: "Lee HVAC Services" }, createdAt: "2026-03-10T10:00:00Z" },
  { id: 6, action: "api_key_generated", userName: "Jordan Lee", entityType: "api_key", entityId: "3", metadata: { name: "Zapier Integration" }, createdAt: "2026-03-09T13:30:00Z" },
  { id: 7, action: "user_invited", userName: "Jordan Lee", entityType: "user_invite", entityId: "4", metadata: { email: "emily@leehvac.com", role: "manager" }, createdAt: "2026-03-08T08:00:00Z" },
  { id: 8, action: "invite_accepted", userName: "Emily Torres", entityType: "user", entityId: "4", metadata: { email: "emily@leehvac.com" }, createdAt: "2026-03-08T14:20:00Z" },
];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export default function AuditLogPage() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = MOCK_ENTRIES.filter(e => {
    if (search && !e.userName.toLowerCase().includes(search.toLowerCase()) && !e.action.toLowerCase().includes(search.toLowerCase())) return false;
    if (actionFilter !== "all" && e.action !== actionFilter) return false;
    return true;
  });

  const uniqueActions = [...new Set(MOCK_ENTRIES.map(e => e.action))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground">Audit Log</h2>
        <p className="text-muted-foreground mt-1">Track all account-level actions from the last 90 days.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user or action..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30 text-sm"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 text-sm"
        >
          <option value="all">All Actions</option>
          {uniqueActions.map(a => (
            <option key={a} value={a}>{ACTION_LABELS[a]?.label || a}</option>
          ))}
        </select>
      </div>

      <div className="bg-card rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Date</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">User</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Action</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3 hidden md:table-cell">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(entry => {
              const actionInfo = ACTION_LABELS[entry.action] || { label: entry.action, color: "bg-secondary text-foreground" };
              const details = Object.entries(entry.metadata || {})
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ");

              return (
                <tr key={entry.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm text-foreground">{formatDate(entry.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(entry.createdAt)}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">{entry.userName}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${actionInfo.color}`}>
                      {actionInfo.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell max-w-[300px] truncate">
                    {details || "—"}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                  <ClipboardList className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
                  <p>No audit log entries found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{filtered.length} entries</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={filtered.length <= 25}
            className="p-2 rounded-lg hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
