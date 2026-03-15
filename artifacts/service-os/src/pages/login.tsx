import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { CheckCircle2, Lock, ArrowLeft, Mail, KeyRound, Ticket, Sparkles, Copy, Check, ArrowRight, ShieldCheck, Wrench } from "lucide-react";
import { useMockAuth, DEMO_PROFILES, type DemoProfile } from "@/lib/mock-auth";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Tier } from "@/lib/permissions";

const TIER_COLORS: Record<string, { bg: string; text: string; border: string; dot: string; accent: string }> = {
  free:        { bg: "bg-slate-100",    text: "text-slate-700",  border: "border-slate-200", dot: "bg-slate-400",    accent: "from-slate-500 to-slate-600" },
  independent: { bg: "bg-sky-50",      text: "text-sky-700",   border: "border-sky-200",   dot: "bg-sky-500",      accent: "from-sky-500 to-blue-600" },
  pro:         { bg: "bg-violet-50",   text: "text-violet-700", border: "border-violet-200",dot: "bg-violet-500",   accent: "from-violet-500 to-purple-600" },
  franchise:   { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200", dot: "bg-amber-500",    accent: "from-amber-500 to-orange-600" },
  enterprise:  { bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200",dot: "bg-emerald-600", accent: "from-emerald-500 to-teal-600" },
};

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  independent: "Independent",
  pro: "Pro",
  franchise: "Franchise",
  enterprise: "Enterprise",
};

const TIER_PRICING: Record<string, string> = {
  free: "Free forever",
  independent: "$39/mo",
  pro: "$99/mo",
  franchise: "$349/mo",
  enterprise: "Custom",
};

const TIER_MAX_USERS: Record<string, string> = {
  free: "3 users",
  independent: "6 users",
  pro: "25 users",
  franchise: "75 users",
  enterprise: "200+ users",
};

const DEMO_TOKENS: Record<string, Tier> = {
  "SERVICEOS-FREE": "free",
  "SERVICEOS-INDIE": "independent",
  "SERVICEOS-PRO": "pro",
  "SERVICEOS-FRANCHISE": "franchise",
  "SERVICEOS-ENTERPRISE": "enterprise",
};

function generateToken(tier: Tier): string {
  const tierMap: Record<Tier, string> = {
    free: "FREE",
    independent: "INDIE",
    pro: "PRO",
    franchise: "FRANCHISE",
    enterprise: "ENTERPRISE",
  };
  return `SERVICEOS-${tierMap[tier]}`;
}

function getProfilesForTier(tier: Tier): { admin: DemoProfile; operator: DemoProfile } {
  const ownerProfile = DEMO_PROFILES.find(p => p.tier === tier && p.role !== "operator");
  const operatorBase = DEMO_PROFILES.find(p => p.role === "operator");

  const admin = ownerProfile || {
    id: `${tier}_owner`,
    name: "Demo Admin",
    email: `admin@demo-${tier}.com`,
    company: "Demo Company",
    avatar: `https://i.pravatar.cc/150?u=admin-${tier}`,
    role: "owner" as const,
    tier,
    tagline: `${TIER_LABELS[tier]} plan owner`,
    unlocked: [],
    locked: [],
  };

  const operator: DemoProfile = {
    id: `${tier}_operator`,
    name: operatorBase?.name || "Demo Technician",
    email: operatorBase?.email || `tech@demo-${tier}.com`,
    company: admin.company,
    avatar: operatorBase?.avatar || `https://i.pravatar.cc/150?u=tech-${tier}`,
    role: "operator",
    tier,
    tagline: "Field technician view",
    unlocked: ["My job queue", "SMS check-in", "Job completion reports", "GPS check-in"],
    locked: ["Financials", "CRM & Leads", "Analytics", "Dispatch board"],
  };

  return { admin, operator };
}

function ProfileCard({ profile, onSelect, roleLabel }: { profile: DemoProfile; onSelect: () => void; roleLabel: string }) {
  const colors = TIER_COLORS[profile.tier];
  const isOperator = profile.role === "operator";

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative w-full text-left bg-card rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/40 active:scale-[0.99]",
        isOperator && "border-dashed"
      )}
    >
      <div className="flex items-center gap-3 mb-1">
        {isOperator ? (
          <Wrench className="w-5 h-5 text-orange-500" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-primary" />
        )}
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{roleLabel}</span>
      </div>

      <div className="flex items-start gap-4">
        <img
          src={profile.avatar}
          alt={profile.name}
          className="w-14 h-14 rounded-full border-2 border-border object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground text-base leading-tight">{profile.name}</p>
          <p className="text-sm text-muted-foreground truncate mt-0.5">{profile.company}</p>
          <p className="text-xs text-muted-foreground/70 truncate">{profile.email}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border", colors.bg, colors.text, colors.border)}>
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", colors.dot)} />
          {TIER_LABELS[profile.tier]}
        </span>
        <span className={cn(
          "inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border",
          isOperator
            ? "bg-orange-50 text-orange-700 border-orange-200"
            : "bg-blue-50 text-blue-700 border-blue-200"
        )}>
          {isOperator ? "Field Technician" : "Business Owner"}
        </span>
      </div>

      <div className="space-y-1.5">
        {profile.unlocked.map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-foreground/80">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            {f}
          </div>
        ))}
        {profile.locked.slice(0, 2).map((f, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground/50">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            {f}
          </div>
        ))}
        {profile.locked.length > 2 && (
          <div className="text-xs text-muted-foreground/40 pl-5">+{profile.locked.length - 2} locked</div>
        )}
      </div>

      <div className="mt-1 w-full py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-primary text-sm font-semibold text-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
        Enter as {profile.name.split(" ")[0]} <ArrowRight className="w-4 h-4 inline ml-1" />
      </div>
    </button>
  );
}

function SignInForm({ onSignIn }: { onSignIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn();
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-card rounded-2xl border p-8 shadow-sm">
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Welcome back</h2>
        <p className="text-sm text-muted-foreground mb-8">Sign in to your ServiceOS account</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm hover:shadow active:scale-[0.99]"
          >
            Sign In
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          This is a demo app — any credentials will sign you in with a default Pro-tier owner account.
        </p>
      </div>
    </div>
  );
}

function DemoAccessPanel({ onSelect }: { onSelect: (profile: DemoProfile) => void }) {
  const [tokenInput, setTokenInput] = useState("");
  const [tokenError, setTokenError] = useState("");
  const [activeTier, setActiveTier] = useState<Tier | null>(null);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [requestTier, setRequestTier] = useState<Tier | null>(null);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = tokenInput.trim().toUpperCase();
    const tier = DEMO_TOKENS[normalized];
    if (tier) {
      setActiveTier(tier);
      setTokenError("");
    } else {
      setTokenError("Invalid demo token. Check the code and try again.");
      setActiveTier(null);
    }
  };

  const handleRequestToken = (tier: Tier) => {
    const token = generateToken(tier);
    setGeneratedToken(token);
    setRequestTier(tier);
  };

  const handleUseGeneratedToken = () => {
    if (requestTier) {
      setActiveTier(requestTier);
      setGeneratedToken(null);
      setTokenInput(generateToken(requestTier));
    }
  };

  const handleCopyToken = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBack = () => {
    setActiveTier(null);
    setTokenInput("");
    setTokenError("");
  };

  if (activeTier) {
    const { admin, operator } = getProfilesForTier(activeTier);
    const colors = TIER_COLORS[activeTier];
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to token entry
        </button>

        <div className={cn("text-center mb-8 p-6 rounded-2xl bg-gradient-to-r", colors.accent, "text-white")}>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-3">
            <Ticket className="w-3.5 h-3.5" />
            Demo Token Activated
          </div>
          <h2 className="text-2xl font-display font-bold">{TIER_LABELS[activeTier]} Plan Demo</h2>
          <p className="text-white/80 text-sm mt-1">{TIER_PRICING[activeTier]} &middot; Up to {TIER_MAX_USERS[activeTier]}</p>
        </div>

        <p className="text-center text-muted-foreground text-sm mb-8">
          Choose an account to explore. The <strong>Admin</strong> view shows full management features for this tier,
          while the <strong>Operator</strong> view shows the limited field technician experience.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <ProfileCard profile={admin} onSelect={() => onSelect(admin)} roleLabel="Admin Account" />
          <ProfileCard profile={operator} onSelect={() => onSelect(operator)} roleLabel="Operator Account" />
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          These are demo accounts with simulated data. No real information is stored.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-display font-bold text-foreground">Demo Access</h2>
        <p className="mt-2 text-muted-foreground text-sm max-w-lg mx-auto">
          Enter a demo token to explore ServiceOS with a specific plan, or request one below.
        </p>
      </div>

      <div className="bg-card rounded-2xl border p-8 shadow-sm mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Ticket className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Have a demo token?</h3>
            <p className="text-xs text-muted-foreground">Enter the token you received to access your demo</p>
          </div>
        </div>

        <form onSubmit={handleTokenSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={tokenInput}
              onChange={(e) => { setTokenInput(e.target.value); setTokenError(""); }}
              placeholder="e.g. SERVICEOS-PRO"
              className="w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-foreground text-sm font-mono placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all uppercase tracking-wider"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-sm whitespace-nowrap"
          >
            Activate
          </button>
        </form>
        {tokenError && (
          <p className="text-sm text-red-500 mt-2">{tokenError}</p>
        )}
      </div>

      {generatedToken && requestTier && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-10 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-emerald-800 mb-1">Your demo token is ready!</h4>
              <p className="text-sm text-emerald-700 mb-4">
                Use this token to access the <strong>{TIER_LABELS[requestTier]}</strong> plan demo.
                You can also share it with colleagues.
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 px-4 py-2.5 bg-white rounded-xl border border-emerald-200 text-sm font-mono font-bold text-emerald-800 tracking-wider">
                  {generatedToken}
                </code>
                <button
                  onClick={handleCopyToken}
                  className="p-2.5 rounded-xl border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-100 transition-colors"
                  title="Copy token"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={handleUseGeneratedToken}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all"
              >
                Use This Token Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Or request a demo token</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(["free", "independent", "pro", "franchise", "enterprise"] as Tier[]).map(tier => {
            const colors = TIER_COLORS[tier];
            return (
              <button
                key={tier}
                onClick={() => handleRequestToken(tier)}
                className={cn(
                  "group text-left p-5 rounded-2xl border bg-card transition-all duration-200",
                  "hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 active:scale-[0.99]",
                  generatedToken && requestTier === tier && "ring-2 ring-emerald-500 border-emerald-300"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={cn("inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border", colors.bg, colors.text, colors.border)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", colors.dot)} />
                    {TIER_LABELS[tier]}
                  </span>
                  <span className="text-sm font-bold text-foreground">{TIER_PRICING[tier]}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3">Up to {TIER_MAX_USERS[tier]}</p>
                <div className="w-full py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold text-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  Request Token
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-10">
        Demo tokens provide full access to simulated data for the selected plan. No real data or payment information required.
      </p>
    </div>
  );
}

export default function DemoLogin() {
  const { signIn, signInAs } = useMockAuth();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const tabParam = params.get("tab");
  const defaultTab = tabParam === "demo" ? "demo" : "signin";

  const handleSelectProfile = (profile: DemoProfile) => {
    signInAs(profile);
    navigate("/dashboard");
  };

  const handleSignIn = () => {
    signIn();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-3">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </a>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-6">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-9 h-9 rounded-xl" />
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">ServiceOS</span>
          </div>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList className="h-11">
              <TabsTrigger value="signin" className="px-6 py-2 text-sm font-semibold">Sign In</TabsTrigger>
              <TabsTrigger value="demo" className="px-6 py-2 text-sm font-semibold">Demo Access</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="signin">
            <SignInForm onSignIn={handleSignIn} />
          </TabsContent>

          <TabsContent value="demo">
            <DemoAccessPanel onSelect={handleSelectProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
