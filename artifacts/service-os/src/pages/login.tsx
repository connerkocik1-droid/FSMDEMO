import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Eye, EyeOff, Key, Copy, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { useMockAuth, DEMO_PROFILES } from "@/lib/mock-auth";
import { useDevAdminAuth } from "@/lib/dev-admin-auth";

type Tab = "signin" | "demo";

const TIER_CONFIG: Record<string, { label: string; price: string; users: string; color: string; token: string }> = {
  free: { label: "Free", price: "Free forever", users: "Up to 3 users", color: "bg-gray-100 text-gray-700 border-gray-200", token: "SERVICEOS-FREE" },
  independent: { label: "Independent", price: "$39/mo", users: "Up to 6 users", color: "bg-blue-50 text-blue-700 border-blue-200", token: "SERVICEOS-INDIE" },
  pro: { label: "Pro", price: "$99/mo", users: "Up to 25 users", color: "bg-violet-50 text-violet-700 border-violet-200", token: "SERVICEOS-PRO" },
  franchise: { label: "Franchise", price: "$349/mo", users: "Up to 75 users", color: "bg-amber-50 text-amber-700 border-amber-200", token: "SERVICEOS-FRANCHISE" },
  enterprise: { label: "Enterprise", price: "Custom", users: "200+ users", color: "bg-emerald-50 text-emerald-700 border-emerald-200", token: "SERVICEOS-ENTERPRISE" },
};

const DEMO_TOKENS: Record<string, string> = {
  "SERVICEOS-FREE": "free",
  "SERVICEOS-INDIE": "independent",
  "SERVICEOS-PRO": "pro",
  "SERVICEOS-FRANCHISE": "franchise",
  "SERVICEOS-ENTERPRISE": "enterprise",
};

type DemoState = "entry" | "activated" | "requested";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { signInAs, setDemoSession } = useMockAuth();
  const { login: devAdminLogin } = useDevAdminAuth();
  const [tab, setTab] = useState<Tab>("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const [demoState, setDemoState] = useState<DemoState>("entry");
  const [tokenInput, setTokenInput] = useState("");
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [activatedTier, setActivatedTier] = useState<string | null>(null);
  const [requestedToken, setRequestedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    setIsLoading(true);

    try {
      const result = await devAdminLogin(email, password);
      if (result.success) {
        const ownerProfile = DEMO_PROFILES.find(p => p.role === "owner" && p.tier === "pro") || DEMO_PROFILES[0];
        signInAs(ownerProfile);
        navigate("/dashboard");
        return;
      }
      setSignInError("Invalid email or password.");
    } catch {
      setSignInError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateToken = () => {
    const normalized = tokenInput.trim().toUpperCase();
    const tier = DEMO_TOKENS[normalized];
    if (!tier) {
      setTokenError("Invalid demo token. Check the token and try again.");
      return;
    }
    setTokenError(null);
    setActivatedTier(tier);
    setDemoState("activated");
  };

  const handleRequestToken = (tier: string) => {
    const config = TIER_CONFIG[tier];
    if (!config) return;
    setRequestedToken(config.token);
    setDemoState("requested");
  };

  const handleCopyToken = () => {
    if (requestedToken) {
      navigator.clipboard.writeText(requestedToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUseRequestedToken = () => {
    if (!requestedToken) return;
    const tier = DEMO_TOKENS[requestedToken];
    if (tier) {
      setActivatedTier(tier);
      setDemoState("activated");
    }
  };

  const handleDemoSignIn = (role: "owner" | "operator") => {
    if (!activatedTier) return;
    const profile = DEMO_PROFILES.find(p => p.tier === activatedTier && p.role === role)
      || DEMO_PROFILES.find(p => p.tier === activatedTier)
      || DEMO_PROFILES[0];
    signInAs(profile);
    setDemoSession(true);
    navigate("/dashboard");
  };

  const handleBackToEntry = () => {
    setDemoState("entry");
    setTokenInput("");
    setTokenError(null);
    setActivatedTier(null);
    setRequestedToken(null);
  };

  const tierConfig = activatedTier ? TIER_CONFIG[activatedTier] : null;
  const adminProfile = activatedTier ? DEMO_PROFILES.find(p => p.tier === activatedTier && p.role === "owner") : null;
  const operatorProfile = DEMO_PROFILES.find(p => p.role === "operator");

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-10 h-10 rounded-xl" />
              <span className="font-display font-bold text-2xl tracking-tight text-foreground">ServiceOS</span>
            </Link>
          </div>

          <div className="flex bg-muted rounded-xl p-1 gap-1">
            <button
              onClick={() => setTab("signin")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === "signin"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setTab("demo")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === "demo"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Demo Access
            </button>
          </div>

          {tab === "signin" && (
            <div className="space-y-5">
              <form onSubmit={handleSignIn} className="space-y-5">
                {signInError && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {signInError}
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">Email address</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="you@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <a href="#" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                    Forgot password?
                  </a>
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl shadow-sm hover:bg-primary/90 hover:shadow-md active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                  Start free
                </Link>
              </p>
            </div>
          )}

          {tab === "demo" && demoState === "entry" && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-lg font-display font-bold text-foreground">Demo Access</h2>
                <p className="text-sm text-muted-foreground mt-1">Enter a demo token to explore ServiceOS, or request one below.</p>
              </div>

              <div className="p-5 rounded-xl border bg-card space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Key className="w-4 h-4 text-primary" />
                  Have a demo token?
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tokenInput}
                    onChange={e => { setTokenInput(e.target.value); setTokenError(null); }}
                    onKeyDown={e => e.key === "Enter" && handleActivateToken()}
                    placeholder="e.g. SERVICEOS-PRO"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-background border text-foreground text-sm font-mono focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  <button
                    onClick={handleActivateToken}
                    className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary/90 transition-all"
                  >
                    Activate
                  </button>
                </div>
                {tokenError && (
                  <p className="text-sm text-destructive flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {tokenError}
                  </p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                <div className="relative flex justify-center"><span className="bg-background px-3 text-xs text-muted-foreground uppercase">or request a demo token</span></div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {Object.entries(TIER_CONFIG).slice(0, 3).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => handleRequestToken(key)}
                    className="p-3 rounded-xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all text-left space-y-1.5"
                  >
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                    <p className="text-xs font-semibold text-foreground">{cfg.price}</p>
                    <p className="text-[10px] text-muted-foreground">{cfg.users}</p>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {Object.entries(TIER_CONFIG).slice(3).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => handleRequestToken(key)}
                    className="p-3 rounded-xl border bg-card hover:border-primary/40 hover:shadow-sm transition-all text-left space-y-1.5"
                  >
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>{cfg.label}</span>
                    <p className="text-xs font-semibold text-foreground">{cfg.price}</p>
                    <p className="text-[10px] text-muted-foreground">{cfg.users}</p>
                  </button>
                ))}
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Demo tokens provide full access to simulated data. No payment required.
              </p>
            </div>
          )}

          {tab === "demo" && demoState === "requested" && requestedToken && (
            <div className="space-y-5">
              <div className="p-5 rounded-xl bg-green-50 border border-green-200 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-800">Your demo token is ready</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-green-200">
                  <code className="flex-1 font-mono text-sm font-bold text-foreground">{requestedToken}</code>
                  <button
                    onClick={handleCopyToken}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-muted-foreground"
                    title="Copy token"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleUseRequestedToken}
                    className="flex-1 py-2.5 bg-primary text-primary-foreground font-semibold text-sm rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5"
                  >
                    Use This Token Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                onClick={handleBackToEntry}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to token entry
              </button>
            </div>
          )}

          {tab === "demo" && demoState === "activated" && tierConfig && (
            <div className="space-y-5">
              <div className="text-center p-5 rounded-xl bg-gradient-to-br from-primary/5 to-violet-500/5 border">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${tierConfig.color}`}>{tierConfig.label} Plan Demo</span>
                <p className="text-sm text-muted-foreground mt-2">{tierConfig.price} &middot; {tierConfig.users}</p>
              </div>

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Choose your view</p>

              {adminProfile && (
                <button
                  onClick={() => handleDemoSignIn("owner")}
                  className="w-full p-4 rounded-xl border bg-card hover:border-primary/40 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <img src={adminProfile.avatar} alt={adminProfile.name} className="w-10 h-10 rounded-full border" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{adminProfile.name}</p>
                      <p className="text-xs text-muted-foreground">{adminProfile.company}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Admin</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Full access — dispatch, billing, analytics, team management</p>
                </button>
              )}

              {operatorProfile && (
                <button
                  onClick={() => handleDemoSignIn("operator")}
                  className="w-full p-4 rounded-xl border bg-card hover:border-primary/40 hover:shadow-md transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <img src={operatorProfile.avatar} alt={operatorProfile.name} className="w-10 h-10 rounded-full border" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{operatorProfile.name}</p>
                      <p className="text-xs text-muted-foreground">{operatorProfile.company}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 border border-orange-200">Operator</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Field tech view — my jobs, SMS, earnings, GPS check-in</p>
                </button>
              )}

              <button
                onClick={handleBackToEntry}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to token entry
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
