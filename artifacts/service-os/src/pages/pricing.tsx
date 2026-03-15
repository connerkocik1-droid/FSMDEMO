import { useState, Fragment } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";
import {
  Check, Minus, Star, ArrowRight, ChevronDown, ChevronUp,
  Zap, Building2, Gift, MapPin, FileBarChart2, Paintbrush,
  MessageSquare, Radio, ShieldCheck, Calendar,
} from "lucide-react";

type Billing = "monthly" | "annual";

const PRICES = {
  free:       { monthly: 0,   annual: 0 },
  pro:        { monthly: 59,  annual: 49 },
  enterprise: { monthly: 129, annual: 108 },
};

const ADDON_CARDS = [
  { key: "gps",       icon: MapPin,       name: "GPS Tracking",       price: 14, unit: "/mo",         desc: "Live location tracking for every field tech" },
  { key: "landing",   icon: Radio,        name: "Landing Pages",      price: 14, unit: "/mo per page", desc: "Convert search traffic with branded local pages" },
  { key: "sms",       icon: MessageSquare,name: "SMS Campaigns",      price: 14, unit: "/mo",         desc: "Bulk outreach to your customer list" },
  { key: "chat",      icon: MessageSquare,name: "Live Chat",          price: 19, unit: "/mo",         desc: "Real-time chat on your booking site" },
  { key: "bgcheck",   icon: ShieldCheck,  name: "Background Checks",  price: 9,  unit: "/check",      desc: "Instant verified background checks for new hires" },
];

const ENTERPRISE_UNLOCKS = [
  { key: "multi",    icon: Building2,     name: "Multi-Location",   price: 49,  unit: "/mo per location", desc: "Manage unlimited locations from one dashboard" },
  { key: "reports",  icon: FileBarChart2, name: "Custom Reports",   price: 19,  unit: "/mo",              desc: "Build, save, and export any business report" },
  { key: "wl",       icon: Paintbrush,    name: "White Label",      price: 49,  unit: "/mo",              desc: "Remove ServiceOS branding from client portals" },
  { key: "onboard",  icon: Calendar,      name: "Onboarding Call",  price: 59,  unit: " one-time",        desc: "1-on-1 setup session with a ServiceOS specialist" },
];

type FeatureRow = { label: string; free: boolean | "addon"; pro: boolean | "addon"; ent: boolean | "addon" };
const FEATURE_TABLE: { group: string; rows: FeatureRow[] }[] = [
  {
    group: "Core Operations",
    rows: [
      { label: "CRM & customer management",       free: true,    pro: true,    ent: true },
      { label: "Job scheduling & dispatch",        free: true,    pro: true,    ent: true },
      { label: "Invoicing & quotes",              free: true,    pro: true,    ent: true },
      { label: "Digital signatures",              free: true,    pro: true,    ent: true },
      { label: "Price book",                      free: true,    pro: true,    ent: true },
      { label: "Job photos & notes",              free: true,    pro: true,    ent: true },
      { label: "Ratings & reviews collection",    free: true,    pro: true,    ent: true },
      { label: "Manual SMS",                      free: true,    pro: true,    ent: true },
      { label: "Basic financials",                free: true,    pro: true,    ent: true },
    ],
  },
  {
    group: "Automation & AI",
    rows: [
      { label: "AI SMS dispatch & auto-response", free: false,   pro: true,    ent: true },
      { label: "AI quote generation",             free: false,   pro: true,    ent: true },
      { label: "Recurring jobs",                  free: false,   pro: true,    ent: true },
      { label: "Automated follow-up sequences",   free: false,   pro: true,    ent: true },
      { label: "Online booking widget",           free: false,   pro: true,    ent: true },
      { label: "Unified inbox & team chat",       free: false,   pro: true,    ent: true },
    ],
  },
  {
    group: "Analytics & Finance",
    rows: [
      { label: "Basic analytics dashboard",       free: true,    pro: true,    ent: true },
      { label: "Full analytics & reports",        free: false,   pro: true,    ent: true },
      { label: "Job profitability tracking",      free: false,   pro: true,    ent: true },
      { label: "Payroll export",                  free: false,   pro: true,    ent: true },
      { label: "QuickBooks sync",                 free: false,   pro: true,    ent: true },
      { label: "Progress invoicing",              free: false,   pro: true,    ent: true },
      { label: "Custom reports",                  free: false,   pro: "addon", ent: true },
    ],
  },
  {
    group: "Team & Field",
    rows: [
      { label: "Time tracking",                   free: false,   pro: true,    ent: true },
      { label: "Subcontractor management",        free: false,   pro: true,    ent: true },
      { label: "Equipment tracking",              free: false,   pro: true,    ent: true },
      { label: "GPS live tracking",               free: false,   pro: "addon", ent: true },
      { label: "Background checks",               free: false,   pro: "addon", ent: true },
    ],
  },
  {
    group: "Growth & Marketing",
    rows: [
      { label: "Customer portal",                 free: false,   pro: true,    ent: true },
      { label: "Referral network",                free: false,   pro: true,    ent: true },
      { label: "Landing pages",                   free: false,   pro: "addon", ent: true },
      { label: "SMS marketing campaigns",         free: false,   pro: "addon", ent: true },
      { label: "Live chat widget",                free: false,   pro: "addon", ent: true },
    ],
  },
  {
    group: "Enterprise",
    rows: [
      { label: "Multi-location management",       free: false,   pro: "addon", ent: true },
      { label: "Franchise & master dashboard",    free: false,   pro: false,   ent: true },
      { label: "Custom API & integrations",       free: false,   pro: false,   ent: true },
      { label: "White-label branding",            free: false,   pro: "addon", ent: true },
      { label: "SLA guarantees",                  free: false,   pro: false,   ent: true },
      { label: "Dedicated account manager",       free: false,   pro: false,   ent: true },
    ],
  },
  {
    group: "Support",
    rows: [
      { label: "Email support",                   free: false,   pro: true,    ent: true },
      { label: "Priority support",                free: false,   pro: true,    ent: true },
      { label: "Unlimited / dedicated support",   free: false,   pro: false,   ent: true },
      { label: "Onboarding session",              free: false,   pro: "addon", ent: true },
    ],
  },
  {
    group: "Users & Locations",
    rows: [
      { label: "Included users",                  free: true,    pro: true,    ent: true },
      { label: "User cap",                        free: true,    pro: false,   ent: false },
      { label: "Additional active users",         free: false,   pro: true,    ent: true },
      { label: "Seasonal pause (no billing)",     free: false,   pro: true,    ent: true },
      { label: "Multiple locations",              free: false,   pro: "addon", ent: true },
    ],
  },
];

const FAQ = [
  {
    q: "Is there really no per-user fee?",
    a: "Each plan includes a user allowance (10 for Free, 25 for Pro, 50 per location for Enterprise). Beyond that, only active users incur a small overage — Pro is $1.99/mo per extra active user, Enterprise is $1.29/mo. Inactive, seasonal-paused, and invited users never count toward billing.",
  },
  {
    q: "What happens to seasonal workers?",
    a: "Use the Seasonal Pause status to stop billing for workers who are off-season. Set a reactivation date and we automatically bring them back — no manual action needed. Only active users are ever billed.",
  },
  {
    q: "Can I add features without upgrading my plan?",
    a: "Yes — Pro subscribers can add GPS tracking, landing pages, SMS campaigns, live chat, custom reports, multi-location, and white-label branding as individual add-ons. You only pay for what you use.",
  },
  {
    q: "What is included in Enterprise?",
    a: "Enterprise starts at $129/month and includes 3 locations, 50 users per location, all add-ons at no extra charge, custom API access, custom integrations, a dedicated account manager, SLA guarantees, and unlimited support.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Monthly subscriptions cancel at the end of the current billing period. Annual subscriptions can be cancelled but are non-refundable after the first 30 days. Add-ons can be removed anytime.",
  },
  {
    q: "What is the 30-day discount?",
    a: "New Pro and Enterprise monthly subscribers get 50% off their first invoice — that's $29.50 for Pro or $64.50 for Enterprise. This discount applies to monthly billing only and is not available on annual plans. It is applied automatically at checkout with no code needed.",
  },
  {
    q: "How does the location add-on work?",
    a: "Pro subscribers can add locations at $49/month each. Enterprise plans include 3 locations, with additional locations at $49/month. Each location gets its own dashboard, user pool, and data isolation.",
  },
  {
    q: "What is the difference between Pro and Enterprise?",
    a: "Pro is built for single-location businesses with teams up to 25. Enterprise adds multi-location management, a franchise dashboard, custom API and integrations, all add-ons included, dedicated account management, and SLA guarantees.",
  },
];

function FeatureCell({ val, col }: { val: boolean | "addon"; col: "free" | "pro" | "ent" }) {
  if (val === true) return <Check className="w-5 h-5 text-green-500 mx-auto" />;
  if (val === false) return <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />;
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide mx-auto",
      col === "ent" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
    )}>
      {col === "ent" ? "✓" : "Add-on"}
    </span>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 hover:text-primary transition-colors"
      >
        <span className="font-semibold text-foreground">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 shrink-0 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 shrink-0 text-muted-foreground" />}
      </button>
      {open && <p className="text-sm text-muted-foreground pb-5 leading-relaxed">{a}</p>}
    </div>
  );
}

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>("monthly");

  return (
    <>
      <SEO
        title="Pricing — ServiceOS"
        description="Simple 3-tier pricing for field service businesses. Free forever, Pro from $59/mo, Enterprise from $129/mo. 50% off your first 30 days."
      />
      <div className="min-h-screen bg-background">
        {/* Nav */}
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2">
                <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="ServiceOS" className="w-8 h-8 rounded-lg" />
                <span className="font-bold text-lg">ServiceOS</span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/demo"><button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Book demo</button></Link>
              <Link href="/dashboard"><button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-all">Sign in</button></Link>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-24">
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-semibold border border-green-200">
              <Gift className="w-4 h-4" />
              50% off your first 30 days on monthly plans — no code needed
            </div>
            <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground tracking-tight">
              Pricing built for field service
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One flat monthly fee. No per-seat surprises. Inactive workers never count toward billing.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center bg-secondary rounded-xl p-1 gap-1 mt-2">
              <button
                onClick={() => setBilling("monthly")}
                className={cn("px-5 py-2 rounded-lg text-sm font-semibold transition-all", billing === "monthly" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground")}
              >
                Monthly
              </button>
              <button
                onClick={() => setBilling("annual")}
                className={cn("px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2", billing === "annual" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground")}
              >
                Annual
                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">Save 17%</span>
              </button>
            </div>
          </div>

          {/* Tier Cards */}
          <div className="grid md:grid-cols-3 gap-6 -mt-4">
            {/* Free */}
            <div className="bg-card border rounded-3xl p-8 flex flex-col">
              <div className="flex-1">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Free</p>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-5xl font-display font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground mb-1 pb-1">forever</span>
                </div>
                <p className="text-muted-foreground text-sm mt-2">Get your business onto a professional platform at no cost.</p>
                <div className="my-6 h-px bg-border" />
                <ul className="space-y-3">
                  {[
                    "10 users hard cap",
                    "Core scheduling & dispatch",
                    "CRM & customer management",
                    "Invoicing, quotes & signatures",
                    "Price book & job photos",
                    "Basic financials & analytics",
                    "Ratings & reviews collection",
                  ].map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link href="/checkout?tier=free" className="mt-8">
                <button className="w-full py-3 rounded-xl border font-semibold text-foreground hover:bg-secondary transition-all">
                  Start free — no card needed
                </button>
              </Link>
            </div>

            {/* Pro (featured) */}
            <div className="bg-card border-2 border-primary rounded-3xl p-8 flex flex-col relative shadow-xl shadow-primary/10">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-xs font-bold shadow-md">
                  <Star className="w-3 h-3 fill-current" /> Most Popular
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-primary uppercase tracking-widest">Pro</p>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-5xl font-display font-bold text-foreground">${PRICES.pro[billing]}</span>
                  <span className="text-muted-foreground mb-1 pb-1">/mo{billing === "annual" ? " billed annually" : ""}</span>
                </div>
                {billing === "annual" && (
                  <p className="text-sm font-semibold text-foreground mt-2">${PRICES.pro.annual * 12}/year</p>
                )}
                {billing === "monthly" && (
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-semibold border border-green-200">
                    <Gift className="w-3 h-3" />
                    50% off first 30 days — ${(PRICES.pro.monthly * 0.5).toFixed(2)} today
                  </div>
                )}
                <p className="text-muted-foreground text-sm mt-3">Everything your growing business needs, fully automated.</p>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">25 users included · +$1.99/mo per extra active user · Inactive users never billed</p>
                <div className="my-5 h-px bg-border" />
                <ul className="space-y-3">
                  {[
                    "Everything in Free",
                    "AI SMS dispatch & auto-response",
                    "Recurring jobs & automation sequences",
                    "Full analytics & job profitability",
                    "Team chat & unified inbox",
                    "QuickBooks sync & payroll export",
                    "Customer portal & referral network",
                    "Seasonal pause — inactive users free",
                    "Priority & email support",
                  ].map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-foreground">{f}</span>
                    </li>
                  ))}
                  <li className="flex items-start gap-2.5 text-sm">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">GPS, landing pages, SMS, live chat, reports available as add-ons</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8 space-y-3">
                <Link href={`/checkout?tier=pro&billing=${billing}`}>
                  <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/20">
                    Subscribe — ${PRICES.pro[billing]}/mo
                  </button>
                </Link>
                <Link href="/demo?tier=pro">
                  <button className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    or Book a demo first →
                  </button>
                </Link>
              </div>
            </div>

            {/* Enterprise */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-3xl p-8 flex flex-col text-white">
              <div className="flex-1">
                <p className="text-sm font-semibold text-violet-400 uppercase tracking-widest">Enterprise</p>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-5xl font-display font-bold text-white">${PRICES.enterprise[billing]}</span>
                  <span className="text-slate-400 mb-1 pb-1">/mo starting{billing === "annual" ? " billed annually" : ""}</span>
                </div>
                {billing === "annual" && (
                  <p className="text-sm font-semibold text-white mt-2">${PRICES.enterprise.annual * 12}/year</p>
                )}
                {billing === "monthly" && (
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-violet-500/20 text-violet-300 rounded-full text-xs font-semibold border border-violet-500/30">
                    <Gift className="w-3 h-3" />
                    50% off first 30 days — ${(PRICES.enterprise.monthly * 0.5).toFixed(2)} today
                  </div>
                )}
                <p className="text-slate-300 text-sm mt-3">Multi-location operations with all features included.</p>
                <p className="text-xs text-slate-400 mt-1.5 font-medium">50 users per location · 3 locations included · +$1.29/mo per extra active user</p>
                <div className="my-5 h-px bg-slate-700" />
                <ul className="space-y-3">
                  {[
                    "Everything in Pro",
                    "3 locations included (+$49/mo each after)",
                    "All add-ons included free",
                    "Franchise & master dashboard",
                    "Custom API & integrations",
                    "Dedicated account manager",
                    "SLA guarantees",
                    "Unlimited / dedicated support",
                  ].map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                      <span className="text-slate-200">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 space-y-3">
                <Link href={`/checkout?tier=enterprise&billing=${billing}`}>
                  <button className="w-full py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-all">
                    Subscribe — ${PRICES.enterprise[billing]}/mo
                  </button>
                </Link>
                <Link href="/demo?tier=enterprise">
                  <button className="w-full py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors">
                    or Book a demo first →
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Add-ons Section */}
          <section className="space-y-10">
            <div className="text-center">
              <h2 className="text-3xl font-display font-bold text-foreground">Enhance your plan with add-ons</h2>
              <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Available on Pro and Enterprise. Enterprise includes all add-ons free — no extra charge.</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">Standard Add-ons</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ADDON_CARDS.map(a => (
                  <div key={a.key} className="bg-card border rounded-2xl p-5 hover:border-primary/40 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                        <a.icon className="w-5 h-5 text-foreground" />
                      </div>
                      <span className="text-lg font-bold text-foreground">${a.price}<span className="text-sm font-normal text-muted-foreground">{a.unit}</span></span>
                    </div>
                    <h4 className="font-semibold text-foreground">{a.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-1">Enterprise Features — unlock without upgrading</h3>
              <p className="text-xs text-muted-foreground mb-4">Pro subscribers can unlock these individually. Enterprise includes them all.</p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ENTERPRISE_UNLOCKS.map(a => (
                  <div key={a.key} className="bg-gradient-to-br from-violet-50 to-violet-100/30 border border-violet-200 rounded-2xl p-5 hover:border-violet-400/50 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                        <a.icon className="w-5 h-5 text-violet-600" />
                      </div>
                      <span className="text-base font-bold text-violet-800">${a.price}<span className="text-xs font-normal text-violet-500">{a.unit}</span></span>
                    </div>
                    <h4 className="font-semibold text-violet-900">{a.name}</h4>
                    <p className="text-xs text-violet-600 mt-1">{a.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Feature Comparison Table */}
          <section>
            <h2 className="text-2xl font-display font-bold text-center text-foreground mb-8">Full feature comparison</h2>
            <div className="overflow-x-auto rounded-2xl border bg-card">
              <table className="w-full text-sm min-w-[540px]">
                <thead>
                  <tr className="border-b bg-secondary/50">
                    <th className="text-left p-4 font-semibold text-foreground w-[55%]">Feature</th>
                    <th className="text-center p-4 font-semibold text-foreground">Free</th>
                    <th className="text-center p-4 font-semibold text-primary">Pro</th>
                    <th className="text-center p-4 font-semibold text-violet-700">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_TABLE.map(({ group, rows }) => (
                    <Fragment key={group}>
                      <tr className="bg-secondary/30">
                        <td colSpan={4} className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">{group}</td>
                      </tr>
                      {rows.map(row => (
                        <tr key={row.label} className="border-t hover:bg-secondary/20 transition-colors">
                          <td className="p-4 text-foreground">{row.label}</td>
                          <td className="p-4 text-center"><FeatureCell val={row.free} col="free" /></td>
                          <td className="p-4 text-center"><FeatureCell val={row.pro} col="pro" /></td>
                          <td className="p-4 text-center"><FeatureCell val={row.ent} col="ent" /></td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t bg-secondary/30">
                    <td className="p-4 text-xs text-muted-foreground">Add-on = available on Pro or Enterprise as a paid add-on</td>
                    <td className="p-4 text-center">
                      <Link href="/checkout?tier=free"><button className="text-xs font-semibold underline">Start free</button></Link>
                    </td>
                    <td className="p-4 text-center">
                      <Link href={`/checkout?tier=pro&billing=${billing}`}><button className="text-xs font-semibold text-primary underline">Get Pro</button></Link>
                    </td>
                    <td className="p-4 text-center">
                      <Link href={`/checkout?tier=enterprise&billing=${billing}`}><button className="text-xs font-semibold text-violet-700 underline">Get Enterprise</button></Link>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* FAQ */}
          <section className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-display font-bold text-center text-foreground mb-8">Frequently asked questions</h2>
            <div className="bg-card border rounded-2xl px-6">
              {FAQ.map(item => <FaqItem key={item.q} {...item} />)}
            </div>
          </section>

          {/* Bottom CTA */}
          <section className="bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-10 text-center text-white">
            <h2 className="text-3xl font-display font-bold">Ready to run a better field service business?</h2>
            <p className="text-white/80 mt-3 max-w-lg mx-auto">Start free with no credit card. Upgrade when your team grows. 50% off your first 30 days on Pro or Enterprise.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Link href="/checkout?tier=free">
                <button className="px-8 py-3.5 bg-white text-primary font-bold rounded-xl hover:bg-white/90 transition-all shadow-lg">
                  Start free today
                </button>
              </Link>
              <Link href="/demo">
                <button className="px-8 py-3.5 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-all border border-white/30 flex items-center gap-2 justify-center">
                  Book a demo <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t mt-16 py-8 text-center text-sm text-muted-foreground">
          <p>© 2026 ServiceOS · <Link href="/privacy"><span className="hover:underline">Privacy</span></Link> · <Link href="/pricing"><span className="hover:underline">Pricing</span></Link></p>
        </footer>
      </div>
    </>
  );
}
