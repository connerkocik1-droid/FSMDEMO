import { useState } from "react";
import { Key, Plus, Copy, Eye, EyeOff, Trash2, CheckCircle } from "lucide-react";

const MOCK_KEYS = [
  { id: 1, name: "Production API", key: "sk_live_abc123...xyz789", created: "Jan 15, 2026", lastUsed: "2 hours ago", status: "active" },
  { id: 2, name: "Development", key: "sk_test_def456...uvw012", created: "Feb 1, 2026", lastUsed: "3 days ago", status: "active" },
];

export default function ApiKeys() {
  const [keys] = useState(MOCK_KEYS);
  const [showKey, setShowKey] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  const handleCopy = (id: number, key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-display text-foreground">API Keys</h2>
          <p className="text-muted-foreground mt-1">Manage API access for custom integrations.</p>
        </div>
        <button className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Generate Key
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <strong>Important:</strong> Keep your API keys secret. Do not share them in public repositories or client-side code.
      </div>

      <div className="space-y-4">
        {keys.map(apiKey => (
          <div key={apiKey.id} className="bg-card border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Key className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{apiKey.name}</p>
                  <p className="text-xs text-muted-foreground">Created {apiKey.created} · Last used {apiKey.lastUsed}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowKey(showKey === apiKey.id ? null : apiKey.id)} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground">
                  {showKey === apiKey.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => handleCopy(apiKey.id, apiKey.key)} className="p-2 hover:bg-secondary rounded-lg text-muted-foreground">
                  {copied === apiKey.id ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button className="p-2 hover:bg-secondary rounded-lg text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="bg-secondary rounded-xl p-3 font-mono text-sm text-muted-foreground">
              {showKey === apiKey.id ? apiKey.key : "sk_••••••••••••••••••••"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
