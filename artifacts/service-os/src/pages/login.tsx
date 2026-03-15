import { useLocation } from "wouter";
import { CheckCircle2, Lock, ArrowLeft } from "lucide-react";
import { useMockAuth, DEMO_PROFILES, type DemoProfile } from "@/lib/mock-auth";
import { cn } from "@/lib/utils";

const TIER_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  free:        { bg: "bg-slate-100",    text: "text-slate-700",  border: "border-slate-200", dot: "bg-slate-400" },
  independent: { bg: "bg-sky-50",      text: "text-sky-700",   border: "border-sky-200",   dot: "bg-sky-500" },
  pro:         { bg: "bg-violet-50",   text: "text-violet-700", border: "border-violet-200",dot: "bg-violet-500" },
  franchise:   { bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200", dot: "bg-amber-500" },
  enterprise:  { bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200",dot: "bg-emerald-600" },
};

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  independent: "Independent",
  pro: "Pro",
  franchise: "Franchise",
  enterprise: "Enterprise",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Business Owner",
  admin: "Admin",
  manager: "Manager",
  operator: "Field Technician",
};

function ProfileCard({ profile, onSelect }: { profile: DemoProfile; onSelect: () => void }) {
  const colors = TIER_COLORS[profile.tier];
  const isEmployee = profile.role === "operator";

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative w-full text-left bg-card rounded-2xl border p-6 flex flex-col gap-4 transition-all duration-200",
        "hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/40 active:scale-[0.99]",
        isEmployee && "border-dashed"
      )}
    >
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
          isEmployee
            ? "bg-orange-50 text-orange-700 border-orange-200"
            : "bg-secondary text-secondary-foreground border-border"
        )}>
          {ROLE_LABELS[profile.role]}
        </span>
      </div>

      <p className="text-xs text-muted-foreground italic">"{profile.tagline}"</p>

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
          <div className="text-xs text-muted-foreground/40 pl-5">+{profile.locked.length - 2} locked features</div>
        )}
      </div>

      <div className="mt-1 w-full py-2.5 rounded-xl bg-primary/5 border border-primary/20 text-primary text-sm font-semibold text-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
        Enter as {profile.name.split(" ")[0]}
      </div>
    </button>
  );
}

export default function DemoLogin() {
  const { signInAs } = useMockAuth();
  const [, navigate] = useLocation();

  const handleSelect = (profile: DemoProfile) => {
    signInAs(profile);
    navigate("/dashboard");
  };

  const ownerProfiles = DEMO_PROFILES.filter(p => p.role !== "operator");
  const employeeProfile = DEMO_PROFILES.find(p => p.role === "operator")!;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-3">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </a>
        </div>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-6">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-9 h-9 rounded-xl" />
            <span className="font-display font-bold text-2xl tracking-tight text-foreground">ServiceOS</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Choose a demo profile</h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Each profile is pre-configured with a different subscription tier so you can explore exactly what your customers will see.
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Business Owner Accounts</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {ownerProfiles.map(profile => (
              <ProfileCard key={profile.id} profile={profile} onSelect={() => handleSelect(profile)} />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employee Account</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="max-w-sm mx-auto">
            <ProfileCard profile={employeeProfile} onSelect={() => handleSelect(employeeProfile)} />
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-12">
          These are demo accounts with simulated data. No real information is stored or transmitted.
        </p>
      </div>
    </div>
  );
}
