import { useState, useEffect, Fragment } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";
import { trackPricingView } from "@/lib/analytics";
import {
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Shield,
  Minus,
  Check,
} from "lucide-react";

const TIERS = [
  {
    key: "free",
    name: "Free",
    monthly: 0,
    annualMonthly: 0,
    annualTotal: 0,
    users: "Up to 3 users",
    tagline: "Get started at zero cost",
    features: [
      "Core operations",
      "Basic scheduling",
      "Manual invoicing",
    ],
  },
  {
    key: "independent",
    name: "Independent",
    monthly: 39,
    annualMonthly: 29,
    annualTotal: 348,
    promoMonthly: 19,
    users: "Up to 6 users",
    tagline: "For solo operators & small crews",
    features: [
      "Live GPS tracking",
      "Manual SMS",
      "Referral network access",
      "Basic financials",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    monthly: 119,
    annualMonthly: 89,
    annualTotal: 1068,
    promoMonthly: 59,
    users: "Up to 25 users",
    tagline: "Scale with AI-powered automation",
    popular: true,
    features: [
      "AI SMS workflows",
      "Full analytics",
      "Automated reviews",
      "Priority support",
    ],
  },
  {
    key: "franchise",
    name: "Franchise",
    monthly: 349,
    annualMonthly: 249,
    annualTotal: 2988,
    promoMonthly: 149,
    users: "Up to 75 users",
    tagline: "Multi-location management",
    features: [
      "Landing page builder",
      "Multi-location routing",
      "Custom API access",
      "Dedicated success manager",
    ],
  },
  {
    key: "enterprise",
    name: "Enterprise",
    monthly: null,
    annualMonthly: null,
    annualTotal: null,
    users: "75+ users",
    tagline: "Tailored for large operations",
    features: [
      "Everything in Franchise",
      "Custom integrations",
      "Dedicated success manager",
      "Custom SLA & pricing",
    ],
  },
];

const COMPARISON_CATEGORIES = [
  {
    category: "Operations",
    features: [
      { name: "Job management", free: true, independent: true, pro: true, franchise: true, enterprise: true },
      { name: "Basic scheduling", free: true, independent: true, pro: true, franchise: true, enterprise: true },
      { name: "Customer management", free: true, independent: true, pro: true, franchise: true, enterprise: true },
      { name: "Manual invoicing", free: true, independent: true, pro: true, franchise: true, enterprise: true },
      { name: "Automated invoicing", free: false, independent: false, pro: true, franchise: true, enterprise: true },
    ],
  },
  {
    category: "Communication",
    features: [
      { name: "Manual SMS", free: false, independent: true, pro: true, franchise: true, enterprise: true },
      { name: "AI SMS workflows", free: false, independent: false, pro: true, franchise: true, enterprise: true },
      { name: "Automated review requests", free: false, independent: false, pro: true, franchise: true, enterprise: true },
    ],
  },
  {
    category: "Tracking & Analytics",
    features: [
      { name: "Live GPS tracking", free: false, independent: true, pro: true, franchise: true, enterprise: true },
      { name: "Basic analytics", free: false, independent: true, pro: true, franchise: true, enterprise: true },
      { name: "Full analytics suite", free: false, independent: false, pro: true, franchise: true, enterprise: true },
    ],
  },
  {
    category: "Growth",
    features: [
      { name: "Referral network", free: false, independent: true, pro: true, franchise: true, enterprise: true },
      { name: "Landing page builder", free: false, independent: false, pro: false, franchise: true, enterprise: true },
      { name: "Multi-location routing", free: false, independent: false, pro: false, franchise: true, enterprise: true },
      { name: "Custom API access", free: false, independent: false, pro: false, franchise: true, enterprise: true },
    ],
  },
  {
    category: "Support",
    features: [
      { name: "Community support", free: true, independent: true, pro: true, franchise: true, enterprise: true },
      { name: "Email support", free: false, independent: true, pro: true, franchise: true, enterprise: true },
      { name: "Priority support", free: false, independent: false, pro: true, franchise: true, enterprise: true },
      { name: "Dedicated success manager", free: false, independent: false, pro: false, franchise: true, enterprise: true },
      { name: "Custom SLA", free: false, independent: false, pro: false, franchise: false, enterprise: true },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes. You can upgrade or downgrade your plan at any time. When upgrading, you'll be prorated for the remainder of your billing cycle. When downgrading, the change takes effect at the end of your current period.",
  },
  {
    q: "Are there per-user fees?",
    a: "No. Every plan includes a set number of users with no additional per-seat charges. You only pay the flat monthly or annual price.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe-powered checkout.",
  },
  {
    q: "Is there a long-term contract?",
    a: "No long-term contracts. Monthly plans are billed month-to-month and can be cancelled anytime. Annual plans are billed once per year with the option to cancel before renewal.",
  },
  {
    q: "What happens when I exceed my user limit?",
    a: "You'll receive a notification when you're approaching your limit. To add more users, simply upgrade to the next tier. No service interruption occurs.",
  },
  {
    q: "Do you offer a free trial of paid plans?",
    a: "We offer 50% off your first 3 months on all paid plans so you can try out the full feature set at a reduced cost.",
  },
  {
    q: "Can I get a demo before subscribing?",
    a: "Absolutely. Every paid tier includes a 'Book a demo' option so you can see the features in action before committing.",
  },
  {
    q: "What's included in the Enterprise plan?",
    a: "Enterprise includes everything in Franchise plus custom integrations, a dedicated success manager, custom SLA & pricing, and white-glove onboarding tailored to your organization.",
  },
];

const SWITCHING_MATH = [
  {
    from: "Typical CRM",
    cost: "$50–150/mo",
    replaced: "Customer & lead management",
  },
  {
    from: "Dispatch software",
    cost: "$80–200/mo",
    replaced: "Scheduling & GPS tracking",
  },
  {
    from: "SMS platform",
    cost: "$30–100/mo",
    replaced: "AI-powered communications",
  },
  {
    from: "Review tool",
    cost: "$40–80/mo",
    replaced: "Automated review generation",
  },
  {
    from: "Analytics dashboard",
    cost: "$30–60/mo",
    replaced: "Full analytics suite",
  },
];

const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "ServiceOS",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
    },
    {
      "@type": "Offer",
      name: "Independent",
      price: "39",
      priceCurrency: "USD",
      priceValidUntil: "2027-12-31",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "119",
      priceCurrency: "USD",
      priceValidUntil: "2027-12-31",
    },
    {
      "@type": "Offer",
      name: "Franchise",
      price: "349",
      priceCurrency: "USD",
      priceValidUntil: "2027-12-31",
    },
  ],
};

export default function Pricing() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    trackPricingView();
  }, []);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <SEO
        title="ServiceOS Pricing — Plans Starting at $0 | No Per-User Fees"
        description="Simple, transparent pricing for field service businesses. Choose from Free, Independent, Pro, Franchise, or Enterprise plans. No per-user fees."
        jsonLd={[softwareAppSchema, faqSchema]}
      />

      <nav className="fixed top-0 inset-x-0 bg-background/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 rounded-lg" />
              <span className="font-display font-bold text-xl tracking-tight text-foreground">ServiceOS</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow active:scale-95 text-sm">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-16 md:pt-44 md:pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight max-w-3xl mx-auto leading-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            No per-user fees. No hidden charges. Pick the plan that fits your team.
          </p>

          <div className="inline-flex items-center mt-10 rounded-full border bg-card p-1 gap-1">
            <button
              onClick={() => setBilling("monthly")}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-semibold transition-all",
                billing === "monthly"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("annual")}
              className={cn(
                "px-6 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2",
                billing === "annual"
                  ? "bg-primary text-primary-foreground shadow"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-bold",
                billing === "annual"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-green-100 text-green-700"
              )}>
                Save up to 27%
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-5">
            {TIERS.map((tier) => {
              const isCustom = tier.monthly === null;
              const isFree = tier.monthly === 0;
              const price = billing === "annual" ? tier.annualMonthly : tier.monthly;
              const promoPrice = (tier as any).promoMonthly as number | undefined;

              return (
                <div
                  key={tier.key}
                  className={cn(
                    "relative bg-card p-8 rounded-3xl border flex flex-col",
                    tier.popular
                      ? "border-primary shadow-xl shadow-primary/10 md:-translate-y-4"
                      : "shadow-sm"
                  )}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full whitespace-nowrap">
                      Most Popular
                    </div>
                  )}

                  {!isFree && !isCustom && promoPrice && billing === "monthly" && (
                    <div className="mb-3">
                      <span className="inline-block text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                        ${promoPrice}/mo for first 3 months
                      </span>
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tier.tagline}</p>

                  <div className="mt-4 mb-1">
                    {isCustom ? (
                      <span className="text-4xl font-display font-bold">Custom</span>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-display font-bold">${price}</span>
                        <span className="text-muted-foreground">/mo</span>
                      </div>
                    )}
                  </div>

                  {billing === "annual" && !isCustom && !isFree && (
                    <p className="text-sm text-muted-foreground mb-1">
                      Billed as ${tier.annualTotal}/year
                    </p>
                  )}

                  <p className="text-sm font-medium text-primary mt-2 mb-8">{tier.users}</p>

                  <ul className="space-y-4 mb-8 flex-1">
                    {tier.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  {isFree ? (
                    <Link
                      href="/signup?tier=free"
                      className="w-full py-3 rounded-xl font-semibold text-center transition-all bg-green-600 text-white hover:bg-green-700"
                    >
                      Start free — no card needed
                    </Link>
                  ) : isCustom ? (
                    <div className="space-y-2">
                      <Link
                        href="/demo?tier=enterprise"
                        className="w-full py-3 rounded-xl font-semibold text-center transition-all border-2 border-primary text-primary hover:bg-primary/5 block"
                      >
                        Contact Sales
                      </Link>
                      <Link
                        href="/demo?tier=enterprise"
                        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors block"
                      >
                        or Book a demo first
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href={`/checkout?tier=${tier.key}&billing=${billing}`}
                        className={cn(
                          "w-full py-3 rounded-xl font-semibold text-center transition-all block",
                          tier.popular
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        )}
                      >
                        Subscribe
                      </Link>
                      <Link
                        href={`/demo?tier=${tier.key}`}
                        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors block"
                      >
                        or Book a demo first
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground text-center mb-12">
            Feature comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-semibold text-foreground sticky left-0 bg-secondary/30 z-10 min-w-[200px]">Feature</th>
                  {TIERS.map((tier) => (
                    <th key={tier.key} className={cn("py-4 px-4 text-center font-semibold text-sm", tier.popular ? "text-primary" : "text-foreground")}>
                      {tier.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_CATEGORIES.map((cat) => (
                  <Fragment key={cat.category}>
                    <tr>
                      <td colSpan={6} className="pt-6 pb-2 px-4 font-bold text-foreground text-sm uppercase tracking-wider sticky left-0 bg-background z-10">
                        {cat.category}
                      </td>
                    </tr>
                    {cat.features.map((feat) => (
                      <tr key={feat.name} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                        <td className="py-3 px-4 text-sm text-muted-foreground sticky left-0 bg-background z-10">{feat.name}</td>
                        {(["free", "independent", "pro", "franchise", "enterprise"] as const).map((tierKey) => (
                          <td key={tierKey} className="py-3 px-4 text-center">
                            {feat[tierKey] ? (
                              <Check className="w-5 h-5 text-green-600 mx-auto" />
                            ) : (
                              <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground text-center mb-4">
            Replace 5 tools with one
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Most service businesses spend $230–590/month on separate tools. ServiceOS replaces them all starting at $0.
          </p>
          <div className="space-y-4">
            {SWITCHING_MATH.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-5 bg-card rounded-2xl border">
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{item.from}</p>
                  <p className="text-sm text-muted-foreground">{item.replaced}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-destructive line-through">{item.cost}</p>
                  <p className="text-sm font-bold text-green-600">Included</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 p-5 bg-primary/5 rounded-2xl border border-primary/20">
              <div className="flex-1">
                <p className="font-bold text-primary text-lg">ServiceOS Pro</p>
                <p className="text-sm text-muted-foreground">All of the above and more</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary text-2xl">$119/mo</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground text-center mb-12">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-card rounded-2xl border overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-foreground pr-4">{item.q}</span>
                  <ChevronLeft
                    className={cn(
                      "w-5 h-5 text-muted-foreground shrink-0 transition-transform",
                      openFaq === i ? "rotate-90" : "-rotate-90"
                    )}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-muted-foreground leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-3xl p-12 border border-primary/20">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Founding Accounts
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Be one of the first 100 businesses to join ServiceOS. Founding accounts lock in current pricing forever, 
              get priority feature requests, and direct access to the founding team.
            </p>
            <Link
              href="/signup?tier=free"
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
            >
              Claim your founding account <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 border-t">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
              <Shield className="w-8 h-8 text-green-700" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-2">30-Day Money-Back Guarantee</h3>
              <p className="text-muted-foreground">
                Try any paid plan risk-free. If ServiceOS isn't the right fit within the first 30 days, we'll refund your payment — no questions asked.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-sidebar py-12 border-t border-sidebar-border">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-sidebar-foreground/60 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-6 h-6 rounded grayscale" />
            <span className="font-display font-semibold">ServiceOS © 2025</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-sidebar-foreground">Privacy</a>
            <a href="#" className="hover:text-sidebar-foreground">Terms</a>
            <a href="#" className="hover:text-sidebar-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
