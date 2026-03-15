import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { SEO } from "@/components/SEO";
import { softwareAppSchema } from "@/lib/seo";
import { trackPricingView, trackCTAClick } from "@/lib/analytics";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import {
  ArrowRight,
  CheckCircle2,
  Star,
  Zap,
  BarChart3,
  Users,
  MessageSquare,
  MapPin,
  Shield,
  TrendingUp,
  FileText,
  Calendar,
  DollarSign,
} from "lucide-react";

const SOCIAL_PROOF = [
  { metric: "2,500+", label: "Service Businesses" },
  { metric: "1.2M", label: "Jobs Dispatched" },
  { metric: "4.8/5", label: "Average Rating" },
  { metric: "30%", label: "Less Drive Time" },
];

const PROBLEMS = [
  "Juggling 5+ tools just to manage your day",
  "Losing leads because you can't respond fast enough",
  "Spending hours on scheduling, invoicing, and follow-ups",
  "No visibility into crew location or job status",
];

const FEATURE_HIGHLIGHTS = [
  { title: "AI Dispatch", desc: "Auto-assign the right tech to every job based on skills, location, and availability.", icon: Zap, href: "/features/ai-dispatch" },
  { title: "GPS Tracking", desc: "See your crews in real-time and give customers accurate ETAs.", icon: MapPin, href: "/features/gps-tracking" },
  { title: "Smart Invoicing", desc: "Generate and send invoices from the field. Get paid on the spot.", icon: DollarSign, href: "/features/invoicing" },
  { title: "Scheduling", desc: "Drag-and-drop calendar with conflict detection and customer self-booking.", icon: Calendar, href: "/features/scheduling" },
  { title: "Referral Network", desc: "Exchange leads with local businesses and earn commissions.", icon: Users, href: "/features/referrals" },
  { title: "CRM", desc: "Track every customer interaction from first contact to repeat business.", icon: MessageSquare, href: "/features/crm" },
  { title: "Quotes & Estimates", desc: "Build and send professional quotes with digital signatures.", icon: FileText, href: "/features/quotes" },
  { title: "Analytics", desc: "Deep insights into revenue, crew performance, and growth trends.", icon: BarChart3, href: "/features/ai-dispatch" },
];

const INDUSTRIES = [
  { name: "HVAC", href: "/industries/hvac" },
  { name: "Plumbing", href: "/industries/plumbing" },
  { name: "Electrical", href: "/industries/electrical" },
  { name: "Landscaping", href: "/industries/landscaping" },
  { name: "Pest Control", href: "/industries/pest-control" },
  { name: "Cleaning", href: "/industries/cleaning" },
  { name: "Roofing", href: "/industries/roofing" },
  { name: "Moving", href: "/industries/moving" },
];

const PLANS = [
  { name: "Free", monthly: 0, annual: 0, users: "Up to 3 users", features: ["Core operations", "Basic scheduling", "Manual invoicing"] },
  { name: "Independent", monthly: 39, introMonthly: 19, introNote: "1st month", annual: 299, users: "Up to 6 users", features: ["Live GPS tracking", "Manual SMS", "Referral network access"] },
  { name: "Pro", monthly: 99, introMonthly: 49, introNote: "1st month", annual: 899, users: "Up to 25 users", features: ["AI SMS workflows", "Full analytics", "Automated reviews", "Priority support"], popular: true },
  { name: "Franchise", monthly: 349, introMonthly: 249, introNote: "1st 3 months", annual: 3199, users: "Up to 75 users", features: ["Landing page builder", "Multi-location routing", "Custom API access", "Dedicated success manager"] },
  { name: "Enterprise", monthly: null, annual: null, users: "75+ users", features: ["Everything in Franchise", "Custom integrations", "Dedicated success manager", "Custom SLA & pricing"] },
];

const TESTIMONIALS = [
  { name: "Mike R.", role: "Owner, FastFlow Plumbing", quote: "ServiceOS cut our scheduling time in half. The AI dispatch alone pays for the subscription.", rating: 5 },
  { name: "Sarah T.", role: "Operations Manager, GreenScape", quote: "We went from 5 different tools to just ServiceOS. Our team actually enjoys using it.", rating: 5 },
  { name: "David K.", role: "Founder, CoolBreeze HVAC", quote: "The referral network brought us 15 new customers last month without spending a dime on ads.", rating: 5 },
];

export default function Landing() {
  return (
    <MarketingLayout>
      <SEO
        title="Field Service Management Software"
        description="All-in-one field service management software with AI dispatch, GPS tracking, invoicing, scheduling, CRM, and referral network. Start free today."
        jsonLd={softwareAppSchema()}
      />

      <HeroSection />
      <SocialProofBar />
      <ProblemStatement />
      <FeatureHighlights />
      <SwitchingMath />
      <IndustryFitRow />
      <TestimonialsSection />
      <FinalCTA />
    </MarketingLayout>
  );
}

function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
      </div>

      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8">
          <SparklesIcon className="w-4 h-4" />
          The Operating System for Modern Service Teams
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground tracking-tight max-w-4xl mx-auto leading-tight">
          Run your entire service business on autopilot.
        </h1>
        <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
          From automated dispatch to AI-powered SMS communication, ServiceOS gives your team the tools to scale without the chaos.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/demo"
            onClick={() => trackCTAClick("hero_demo", "hero")}
            className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            Get a Demo <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-xl bg-secondary text-secondary-foreground font-semibold text-lg hover:bg-secondary/80 hover:shadow-md transition-all duration-200 w-full sm:w-auto justify-center flex"
          >
            Start Free
          </Link>
        </div>
      </div>
    </section>
  );
}

function SocialProofBar() {
  return (
    <section className="py-12 border-y bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {SOCIAL_PROOF.map((item) => (
            <div key={item.label}>
              <div className="text-3xl md:text-4xl font-display font-bold text-foreground">{item.metric}</div>
              <div className="text-sm text-muted-foreground mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemStatement() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Sound familiar?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Most field service businesses waste hours every day on tasks that should be automated.
          </p>
          <div className="mt-10 space-y-4 text-left max-w-xl mx-auto">
            {PROBLEMS.map((problem) => (
              <div key={problem} className="flex items-start gap-4 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-destructive text-sm font-bold">!</span>
                </div>
                <span className="text-foreground">{problem}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 text-lg font-semibold text-primary">
            ServiceOS replaces all of that with one platform.
          </p>
        </div>
      </div>
    </section>
  );
}

function FeatureHighlights() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Everything you need to grow
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Replace five different tools with one seamless platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURE_HIGHLIGHTS.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="bg-card p-6 rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/features" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
            View all features <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function SwitchingMath() {
  const ref = useRef<HTMLDivElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !tracked.current) {
          tracked.current = true;
          trackPricingView();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            The math is simple
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Stop paying for tools that don't talk to each other.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-destructive/5 border border-destructive/10 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Without ServiceOS</h3>
            <div className="space-y-3 text-sm">
              {[
                { tool: "Scheduling tool", price: "$49/mo" },
                { tool: "GPS tracking", price: "$30/mo" },
                { tool: "Invoicing software", price: "$45/mo" },
                { tool: "CRM", price: "$65/mo" },
                { tool: "Review management", price: "$40/mo" },
              ].map((item) => (
                <div key={item.tool} className="flex justify-between text-muted-foreground">
                  <span>{item.tool}</span>
                  <span>{item.price}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-bold text-foreground">
                <span>Total</span>
                <span className="text-destructive">$229/mo</span>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 ring-2 ring-primary/10">
            <h3 className="text-lg font-bold text-foreground mb-4">With ServiceOS Pro</h3>
            <div className="space-y-3 text-sm">
              {[
                "AI Dispatch & Scheduling",
                "Live GPS Tracking",
                "Invoicing & Payments",
                "Full CRM",
                "Automated Reviews",
                "Referral Network",
                "SMS Communications",
                "Analytics Dashboard",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-bold text-foreground">
                <span>Total</span>
                <span className="text-primary">$99/mo</span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <span className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1">
                Save $130/mo — that's $1,560/year
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function IndustryFitRow() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Built for every trade
        </h2>
        <p className="mt-4 text-lg text-muted-foreground mb-12">
          ServiceOS adapts to your industry with specialized workflows and templates.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {INDUSTRIES.map((industry) => (
            <Link
              key={industry.name}
              href={industry.href}
              className="px-5 py-2.5 rounded-full border bg-card text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all"
            >
              {industry.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Trusted by service pros
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See what business owners are saying about ServiceOS.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-card p-8 rounded-2xl border shadow-sm">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed mb-6">"{t.quote}"</p>
              <div>
                <p className="font-bold text-foreground">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-24 bg-primary/5">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
          Ready to run your business on autopilot?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Join 2,500+ service businesses already using ServiceOS. Start free — no credit card required.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            onClick={() => trackCTAClick("final_start_free", "final_cta")}
            className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 transition-all flex items-center gap-2"
          >
            Start Free Today <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/demo"
            onClick={() => trackCTAClick("final_demo", "final_cta")}
            className="px-8 py-4 rounded-xl bg-secondary text-secondary-foreground font-semibold text-lg hover:bg-secondary/80 transition-all"
          >
            Book a Demo
          </Link>
        </div>
      </div>
    </section>
  );
}

function SparklesIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}
