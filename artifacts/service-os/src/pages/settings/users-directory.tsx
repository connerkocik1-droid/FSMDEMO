import { useState } from "react";
import { Users, Plus, Search, Shield, X, Send, MoreVertical, UserCheck, UserX } from "lucide-react";

type Role = "owner" | "admin" | "manager" | "operator";
type UserStatus = "active" | "inactive" | "onboarding";

interface TeamUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  avatarUrl?: string;
  lastLogin?: string;
  createdAt: string;
}

interface Invite {
  id: number;
  email: string;
  role: Role;
  status: "pending";
  createdAt: string;
  expiresAt: string;
}

const ROLE_COLORS: Record<Role, string> = {
  owner: "bg-blue-100 text-blue-700",
  admin: "bg-emerald-100 text-emerald-700",
  manager: "bg-violet-100 text-violet-700",
  operator: "bg-slate-100 text-slate-700",
};

const MOCK_USERS: TeamUser[] = [
  { id: 1, name: "Jordan Lee", email: "jordan@leehvac.com", role: "owner", status: "active", lastLogin: "2 hours ago", createdAt: "2024-01-15" },
  { id: 2, name: "Sarah Chen", email: "sarah@leehvac.com", role: "admin", status: "active", lastLogin: "1 day ago", createdAt: "2024-03-20" },
  { id: 3, name: "Marcus Williams", email: "marcus@leehvac.com", role: "operator", status: "active", lastLogin: "3 hours ago", createdAt: "2024-06-01" },
  { id: 4, name: "Emily Torres", email: "emily@leehvac.com", role: "manager", status: "active", lastLogin: "5 hours ago", createdAt: "2024-07-12" },
  { id: 5, name: "David Kim", email: "david@leehvac.com", role: "operator", status: "active", lastLogin: "Today", createdAt: "2024-08-05" },
  { id: 6, name: "Chris Johnson", email: "chris@leehvac.com", role: "operator", status: "inactive", lastLogin: "30 days ago", createdAt: "2024-05-10" },
];

const MOCK_INVITES: Invite[] = [
  { id: 1, email: "newtech@leehvac.com", role: "operator", status: "pending", createdAt: "2026-03-13", expiresAt: "2026-03-16" },
];

export default function UsersDirectory() {
  const [users] = useState<TeamUser[]>(MOCK_USERS);
  const [invites, setInvites] = useState<Invite[]>(MOCK_INVITES);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("operator");
  const [actionMenu, setActionMenu] = useState<number | null>(null);

  const filteredUsers = users.filter(u => {
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;
    return true;
  });

  const handleInvite = () => {
    if (!inviteEmail) return;
    setInvites(prev => [...prev, {
      id: Date.now(),
      email: inviteEmail,
      role: inviteRole,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
      expiresAt: new Date(Date.now() + 72 * 3600000).toISOString().split("T")[0],
    }]);
    setInviteEmail("");
    setShowInvite(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Team</h2>
          <p className="text-muted-foreground mt-1">{users.filter(u => u.status === "active").length} active members</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Invite User
        </button>
      </div>

      {showInvite && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border shadow-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-foreground">Invite Team Member</h3>
              <button onClick={() => setShowInvite(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="newmember@company.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="w-full px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="operator">Operator</option>
                </select>
              </div>
              <p className="text-xs text-muted-foreground">An email invite will be sent. It expires after 72 hours.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowInvite(false)} className="px-4 py-2.5 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80">
                  Cancel
                </button>
                <button onClick={handleInvite} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90">
                  <Send className="w-4 h-4" />
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 focus:ring-2 focus:ring-primary/30 text-sm"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | "all")}
          className="px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 text-sm"
        >
          <option value="all">All Roles</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="operator">Operator</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
          className="px-4 py-2.5 rounded-xl bg-secondary text-foreground border-0 text-sm"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-card rounded-2xl border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">User</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3 hidden md:table-cell">Status</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3 hidden lg:table-cell">Last Login</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${ROLE_COLORS[user.role]}`}>
                    <Shield className="w-3 h-3" />
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 hidden md:table-cell">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                    user.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === "active" ? "bg-green-500" : "bg-red-500"}`} />
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground hidden lg:table-cell">{user.lastLogin || "Never"}</td>
                <td className="px-6 py-4 text-right relative">
                  {user.role !== "owner" && (
                    <div className="relative inline-block">
                      <button
                        onClick={() => setActionMenu(actionMenu === user.id ? null : user.id)}
                        className="p-2 rounded-lg hover:bg-secondary transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {actionMenu === user.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-xl border shadow-lg z-20 py-1">
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-secondary flex items-center gap-2">
                            <Shield className="w-4 h-4" /> Change Role
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-secondary flex items-center gap-2">
                            {user.status === "active" ? (
                              <><UserX className="w-4 h-4" /> Deactivate</>
                            ) : (
                              <><UserCheck className="w-4 h-4" /> Reactivate</>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invites.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Pending Invites</h3>
          <div className="bg-card rounded-2xl border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Email</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Expires</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invites.map(inv => (
                  <tr key={inv.id} className="hover:bg-secondary/30">
                    <td className="px-6 py-4 text-sm text-foreground">{inv.email}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${ROLE_COLORS[inv.role]}`}>
                        {inv.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{inv.expiresAt}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs text-primary font-medium hover:underline mr-3">Resend</button>
                      <button
                        onClick={() => setInvites(prev => prev.filter(i => i.id !== inv.id))}
                        className="text-xs text-red-500 font-medium hover:underline"
                      >Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
