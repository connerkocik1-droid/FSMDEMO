import { useState } from "react";
import { useLocation } from "wouter";
import { Mail, KeyRound, AlertCircle, Loader2 } from "lucide-react";
import { useDevAdminAuth } from "@/lib/dev-admin-auth";

export default function DevAdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useDevAdminAuth();
  const [, navigate] = useLocation();

  if (isAuthenticated) {
    navigate("/dev-admin/scheduling");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate("/dev-admin/scheduling");
    } else {
      setError(result.error || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-10 h-10 rounded-xl" />
            <span className="font-bold text-2xl tracking-tight text-white">ServiceOS</span>
          </div>
          <h1 className="text-xl font-bold text-white/90">Developer Portal</h1>
          <p className="text-sm text-white/50 mt-1">Internal admin access only</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 p-8 shadow-2xl">
          {error && (
            <div className="flex items-center gap-2 p-3 mb-6 rounded-xl bg-red-500/20 border border-red-500/30 text-red-200 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="dev-email" className="text-sm font-medium text-white/80">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  id="dev-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@serviceos.dev"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/20 bg-white/5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="dev-password" className="text-sm font-medium text-white/80">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  id="dev-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/20 bg-white/5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-500 transition-all shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-xs text-white/30 mt-6">
            Access restricted to authorized developers only.
          </p>
        </div>
      </div>
    </div>
  );
}
