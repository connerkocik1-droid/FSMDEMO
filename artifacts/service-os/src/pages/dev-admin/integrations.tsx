import { useState, useEffect } from "react";
import { Plug, CheckCircle, XCircle, BarChart3, Mail, MessageSquare, RefreshCw } from "lucide-react";
import { devAdminFetch } from "@/lib/dev-admin-auth";

interface Integration {
  id: string;
  name: string;
  category: string;
  status: string;
  description: string;
}

interface UsageMetric {
  total: number;
  thisMonth: number;
  limit: number;
}

export default function DevAdminIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [usage, setUsage] = useState<{ apiCalls: UsageMetric; emailsSent: UsageMetric; smsSent: UsageMetric } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    devAdminFetch("/integrations")
      .then(r => r.json())
      .then(data => {
        if (data.integrations) setIntegrations(data.integrations);
        if (data.usage) setUsage(data.usage);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const connectedCount = integrations.filter(i => i.status === "connected").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground">API Integrations</h1>
        <p className="text-muted-foreground mt-1">Platform-level integration status and API usage overview.</p>
      </div>

      {usage && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-2xl border p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-foreground">{usage.apiCalls.thisMonth.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">API Calls (this month)</p>
              <div className="mt-2 w-full bg-secondary rounded-full h-1.5">
                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, (usage.apiCalls.thisMonth / usage.apiCalls.limit) * 100)}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{usage.apiCalls.limit.toLocaleString()} limit</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl border p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-foreground">{usage.emailsSent.thisMonth.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Emails Sent (this month)</p>
              <div className="mt-2 w-full bg-secondary rounded-full h-1.5">
                <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, (usage.emailsSent.thisMonth / usage.emailsSent.limit) * 100)}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{usage.emailsSent.limit.toLocaleString()} limit</p>
            </div>
          </div>
          <div className="bg-card rounded-2xl border p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-foreground">{usage.smsSent.thisMonth.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">SMS Sent (this month)</p>
              <div className="mt-2 w-full bg-secondary rounded-full h-1.5">
                <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, (usage.smsSent.thisMonth / usage.smsSent.limit) * 100)}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{usage.smsSent.limit.toLocaleString()} limit</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Plug className="w-5 h-5 text-blue-600" />
            Connected Services
          </h2>
          <span className="text-sm text-muted-foreground">
            {connectedCount} of {integrations.length} connected
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map(integration => (
            <div key={integration.id} className="border rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{integration.name}</h3>
                {integration.status === "connected" ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3" /> Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    <XCircle className="w-3 h-3" /> Not Configured
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{integration.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded">{integration.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <strong>Note:</strong> Integration credentials are managed through environment variables. To connect a service, add the corresponding API key to your environment secrets.
      </div>
    </div>
  );
}
