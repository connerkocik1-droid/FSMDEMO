import { useState } from "react";
import { useLocation, Link } from "wouter";
import { ArrowLeft, Eye, EyeOff, Shield, Wrench, Check, Lock, ChevronRight } from "lucide-react";
import { useMockAuth, DEMO_PROFILES, type DemoProfile } from "@/lib/mock-auth";

type Tab = "signin" | "demo";

const TIER_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-700 border-gray-200",
  independent: "bg-blue-50 text-blue-700 border-blue-200",
  pro: "bg-violet-50 text-violet-700 border-violet-200",
  franchise: "bg-amber-50 text-amber-700 border-amber-200",
  enterprise: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  independent: "Independent",
  pro: "Pro",
  franchise: "Franchise",
  enterprise: "Enterprise",
};

function ProfileCard({ profile, onSelect }: { profile: DemoProfile; onSelect: () => void }) {
  const isOperator = profile.role === "operator";
  return (
    <button
      onClick={onSelect}
      className="w-full text-left p-4 rounded-xl border bg-card hover:border-primary/40 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-3">
        <img src={profile.avatar} alt={profile.name} className="w-10 h-10 rounded-full border" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-foreground text-sm truncate">{profile.name}</span>
            {isOperator ? (
              <Wrench className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-primary shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{profile.company}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${TIER_COLORS[profile.tier]}`}>
              {TIER_LABELS[profile.tier]}
            </span>
            <span className="text-[10px] text-muted-foreground capitalize">{profile.role}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 italic">{profile.tagline}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 mt-1 transition-colors" />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-1">
        {profile.unlocked.slice(0, 3).map((f) => (
          <span key={f} className="text-[10px] text-green-600 flex items-center gap-1 truncate">
            <Check className="w-3 h-3 shrink-0" />{f}
          </span>
        ))}
        {profile.locked.slice(0, 1).map((f) => (
          <span key={f} className="text-[10px] text-muted-foreground flex items-center gap-1 truncate">
            <Lock className="w-3 h-3 shrink-0" />{f}
          </span>
        ))}
      </div>
    </button>
  );
}

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { signInAs, setDemoSession } = useMockAuth();
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      setError("Invalid email or password. Please try again.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSelect = (profile: DemoProfile) => {
    signInAs(profile);
    setDemoSession(true);
    navigate("/dashboard");
  };

  const owners = DEMO_PROFILES.filter(p => p.role === "owner");
  const operators = DEMO_PROFILES.filter(p => p.role === "operator");

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
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
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

          {tab === "demo" && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 className="text-lg font-display font-bold text-foreground">Explore ServiceOS</h2>
                <p className="text-sm text-muted-foreground mt-1">Pick a demo account to explore a specific tier and role.</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Business Owner Accounts</p>
                <div className="space-y-2.5">
                  {owners.map(profile => (
                    <ProfileCard key={profile.id} profile={profile} onSelect={() => handleDemoSelect(profile)} />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Field Operator</p>
                <div className="space-y-2.5">
                  {operators.map(profile => (
                    <ProfileCard key={profile.id} profile={profile} onSelect={() => handleDemoSelect(profile)} />
                  ))}
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Demo accounts use simulated data. No payment required.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
