import { useState, useEffect } from "react";
import { Users, Copy, Check, Eye, EyeOff, Shield, Wrench, RefreshCw, Plus, XCircle, Clock } from "lucide-react";
import { devAdminFetch } from "@/lib/dev-admin-auth";

interface DemoProfile {
  id: string;
  name: string;
  email: string;
  tier: string;
  role: string;
  token: string | null;
  lastUsed: string | null;
  isActive: boolean;
}

interface AccessToken {
  id: number;
  bookingId: number;
  token: string;
  demoCompanyId: number;
  createdAt: string;
  expiresAt: string;
  usedAt: string | null;
  isRevoked: boolean;
}

const TIER_COLORS: Record<string, { bg: string; text: string }> = {
  free: { bg: "bg-slate-100", text: "text-slate-700" },
  independent: { bg: "bg-sky-50", text: "text-sky-700" },
  pro: { bg: "bg-violet-50", text: "text-violet-700" },
  franchise: { bg: "bg-amber-50", text: "text-amber-700" },
  enterprise: { bg: "bg-emerald-50", text: "text-emerald-700" },
};

export default function DevAdminAccounts() {
  const [profiles, setProfiles] = useState<DemoProfile[]>([]);
  const [accessTokens, setAccessTokens] = useState<AccessToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [newTokenCompanyId, setNewTokenCompanyId] = useState(1);
  const [newTokenBookingId, setNewTokenBookingId] = useState(1);
  const [newTokenExpiry, setNewTokenExpiry] = useState(30);

  const fetchData = () => {
    setLoading(true);
    devAdminFetch("/demo/accounts")
      .then(r => r.json())
      .then(data => {
        if (data.profiles) setProfiles(data.profiles);
        if (data.accessTokens) setAccessTokens(data.accessTokens);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCopy = (id: string, token: string) => {
    navigator.clipboard.writeText(token).catch(() => {});
    setCopiedToken(id);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const toggleTokenVisibility = (id: string) => {
    setVisibleTokens(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateToken = async () => {
    setCreating(true);
    try {
      await devAdminFetch("/demo/tokens", {
        method: "POST",
        body: JSON.stringify({
          bookingId: newTokenBookingId,
          demoCompanyId: newTokenCompanyId,
          expiresInDays: newTokenExpiry,
        }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
    setCreating(false);
  };

  const handleRevokeToken = async (tokenId: number) => {
    try {
      await devAdminFetch(`/demo/tokens/${tokenId}/revoke`, { method: "PATCH" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const ownerProfiles = profiles.filter(p => p.role !== "operator");
  const operatorProfiles = profiles.filter(p => p.role === "operator");
  const activeTokens = accessTokens.filter(t => !t.isRevoked);
  const revokedTokens = accessTokens.filter(t => t.isRevoked);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">Demo Accounts</h1>
        <p className="text-muted-foreground mt-1">Manage demo profiles and access tokens for each pricing tier.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
        <strong>Demo tokens</strong> allow prospects to access the product demo at a specific pricing tier. Each token maps to a tier and grants access to the corresponding feature set.
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Owner / Admin Accounts
        </h2>

        <div className="grid gap-4">
          {ownerProfiles.map(profile => {
            const colors = TIER_COLORS[profile.tier] || TIER_COLORS.free;
            return (
              <div key={profile.id} className="bg-card border rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                      {profile.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{profile.name}</p>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                      {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${profile.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {profile.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {profile.token && (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-xl px-4 py-2.5 font-mono text-sm text-muted-foreground">
                      {visibleTokens.has(profile.id) ? profile.token : "SERVICEOS-\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                    </div>
                    <button
                      onClick={() => toggleTokenVisibility(profile.id)}
                      className="p-2 hover:bg-secondary rounded-lg text-muted-foreground"
                    >
                      {visibleTokens.has(profile.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleCopy(profile.id, profile.token!)}
                      className="p-2 hover:bg-secondary rounded-lg text-muted-foreground"
                    >
                      {copiedToken === profile.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Wrench className="w-5 h-5 text-orange-500" />
          Operator Accounts
        </h2>

        <div className="grid gap-4">
          {operatorProfiles.map(profile => {
            const colors = TIER_COLORS[profile.tier] || TIER_COLORS.free;
            return (
              <div key={profile.id} className="bg-card border border-dashed rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-sm font-bold text-orange-600">
                      {profile.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{profile.name}</p>
                      <p className="text-sm text-muted-foreground">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
                      {profile.tier.charAt(0).toUpperCase() + profile.tier.slice(1)}
                    </span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-50 text-orange-700">
                      Field Technician
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  Operator accounts are accessed through the demo login page after selecting a tier. They show the limited field technician experience.
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Demo Access Tokens
          </h2>
          <span className="text-sm text-muted-foreground">
            {activeTokens.length} active, {revokedTokens.length} revoked
          </span>
        </div>

        <div className="bg-card border rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Create New Token</h3>
          <div className="flex items-end gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Booking ID</label>
              <input
                type="number"
                value={newTokenBookingId}
                onChange={e => setNewTokenBookingId(parseInt(e.target.value) || 1)}
                className="w-32 px-3 py-2 rounded-lg bg-background border text-sm"
                min={1}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Company ID</label>
              <input
                type="number"
                value={newTokenCompanyId}
                onChange={e => setNewTokenCompanyId(parseInt(e.target.value) || 1)}
                className="w-32 px-3 py-2 rounded-lg bg-background border text-sm"
                min={1}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Expires In (days)</label>
              <input
                type="number"
                value={newTokenExpiry}
                onChange={e => setNewTokenExpiry(parseInt(e.target.value) || 30)}
                className="w-32 px-3 py-2 rounded-lg bg-background border text-sm"
                min={1}
              />
            </div>
            <button
              onClick={handleCreateToken}
              disabled={creating}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 text-sm"
            >
              <Plus className="w-4 h-4" />
              {creating ? "Creating..." : "Create Token"}
            </button>
          </div>
        </div>

        {accessTokens.length === 0 ? (
          <div className="bg-card border rounded-2xl p-8 text-center">
            <p className="text-sm text-muted-foreground">No access tokens created yet. Create one to grant demo access.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {accessTokens.map(token => {
              const isExpired = new Date(token.expiresAt) < new Date();
              const tokenKey = `access-${token.id}`;
              return (
                <div key={token.id} className={`bg-card border rounded-2xl p-5 ${token.isRevoked ? "opacity-60" : ""}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {token.isRevoked ? (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">Revoked</span>
                        ) : isExpired ? (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">Expired</span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">Active</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          Company #{token.demoCompanyId} &middot; Booking #{token.bookingId}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {token.usedAt && (
                        <span className="text-xs text-muted-foreground">
                          Used: {new Date(token.usedAt).toLocaleDateString()}
                        </span>
                      )}
                      {!token.isRevoked && !isExpired && (
                        <button
                          onClick={() => handleRevokeToken(token.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <XCircle className="w-3 h-3" /> Revoke
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-xl px-4 py-2.5 font-mono text-sm text-muted-foreground">
                      {visibleTokens.has(tokenKey) ? token.token : "DEMO-\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                    </div>
                    <button
                      onClick={() => toggleTokenVisibility(tokenKey)}
                      className="p-2 hover:bg-secondary rounded-lg text-muted-foreground"
                    >
                      {visibleTokens.has(tokenKey) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleCopy(tokenKey, token.token)}
                      className="p-2 hover:bg-secondary rounded-lg text-muted-foreground"
                    >
                      {copiedToken === tokenKey ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created: {new Date(token.createdAt).toLocaleDateString()}</span>
                    <span>Expires: {new Date(token.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
