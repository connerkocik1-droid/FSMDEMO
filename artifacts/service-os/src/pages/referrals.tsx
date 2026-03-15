import { useState } from "react";
import { useListReferralGroups } from "@workspace/api-client-react";
import { Users, Plus, ArrowRightLeft, TrendingUp, Search, Globe, Shield, Star, ChevronRight } from "lucide-react";

export default function Referrals() {
  const { data, isLoading } = useListReferralGroups();
  const [tab, setTab] = useState<"network" | "marketplace" | "tracking">("network");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground">Referral Network</h2>
          <p className="text-muted-foreground mt-1">Build and manage your business referral partnerships.</p>
        </div>
        <button className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{data?.groups?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Active Groups</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
            <ArrowRightLeft className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">0</p>
            <p className="text-sm text-muted-foreground">Referrals Sent</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl border p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">$0</p>
            <p className="text-sm text-muted-foreground">Revenue from Referrals</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {([
          { id: "network", label: "My Network", icon: Users },
          { id: "marketplace", label: "Marketplace", icon: Globe },
          { id: "tracking", label: "Tracking", icon: TrendingUp },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${tab === t.id ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "network" && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-card border rounded-2xl p-8 text-center text-muted-foreground">Loading groups...</div>
          ) : !data?.groups?.length ? (
            <div className="bg-card border rounded-2xl p-12 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <p className="font-semibold text-foreground">No referral groups yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create a group to start exchanging referrals with other businesses.</p>
            </div>
          ) : data.groups.map((group: any) => (
            <div key={group.id} className="bg-card border rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                    {group.name?.[0] || "G"}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{group.name}</p>
                    <p className="text-sm text-muted-foreground">{group.memberCount || 0} members</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "marketplace" && (
        <div className="bg-card border rounded-2xl p-12 text-center">
          <Globe className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-semibold text-foreground">Referral Marketplace</p>
          <p className="text-sm text-muted-foreground mt-1">Browse businesses in your area looking for referral partnerships.</p>
          <p className="text-xs text-muted-foreground mt-4">Coming soon — we're building the marketplace network.</p>
        </div>
      )}

      {tab === "tracking" && (
        <div className="bg-card border rounded-2xl p-12 text-center">
          <TrendingUp className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-semibold text-foreground">Referral Tracking</p>
          <p className="text-sm text-muted-foreground mt-1">Track sent and received referrals, conversion rates, and revenue.</p>
          <p className="text-xs text-muted-foreground mt-4">Data will populate once you start exchanging referrals.</p>
        </div>
      )}
    </div>
  );
}
