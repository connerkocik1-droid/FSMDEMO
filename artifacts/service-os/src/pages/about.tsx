import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { ArrowRight, Shield, Zap, Users, Heart } from "lucide-react";

const DIFFERENTIATORS = [
  { title: "Built by operators", description: "Founded by field service veterans who understand the daily chaos of running crews, not Silicon Valley engineers guessing at your problems.", icon: Shield },
  { title: "All-in-one platform", description: "Stop duct-taping five tools together. ServiceOS replaces your scheduling, dispatch, invoicing, CRM, and review management in one place.", icon: Zap },
  { title: "AI that works for you", description: "Our AI doesn't just sound fancy — it saves real hours every week with smart dispatch, automated communications, and predictive scheduling.", icon: Heart },
  { title: "Community-powered growth", description: "The referral network connects you with other local businesses so you grow together — no ad spend required.", icon: Users },
];

export default function About() {
  return (
    <MarketingLayout>
      <SEO
        title="About | Our Story & Mission"
        description="ServiceOS was founded by field service operators who wanted better tools. Learn about our mission to help every service business run on autopilot."
      />

      <section className="pt-32 pb-16 md:pt-44 md:pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight">
            Built by operators, for operators
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            We started ServiceOS because we lived the chaos of running a field service business — and knew there had to be a better way.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-card p-8 md:p-12 rounded-2xl border shadow-sm">
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">Our Story</h2>
            <div className="prose prose-lg text-muted-foreground space-y-4">
              <p>
                ServiceOS was born out of frustration. Our founders spent years running field service crews — dispatching techs with whiteboards and spreadsheets, chasing invoices via text message, and losing leads because nobody could call back fast enough.
              </p>
              <p>
                They tried every tool on the market: scheduling apps that couldn't invoice, CRMs that didn't understand field work, GPS trackers that lived in their own silo. The "stack" grew but the problems didn't shrink.
              </p>
              <p>
                So they built what they always wanted: a single operating system that handles dispatch, scheduling, invoicing, CRM, GPS tracking, reviews, referrals, and customer communications — all powered by AI that actually saves time, not just looks impressive.
              </p>
              <p>
                Today, ServiceOS powers over 2,500 service businesses across every trade. We're still operators at heart, and every feature we build starts with one question: "Would this have saved us time on a Tuesday morning?"
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
            Our Mission
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            To give every field service business the same operational superpowers that used to be reserved for companies with massive budgets and IT teams.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-12">
            What Makes Us Different
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {DIFFERENTIATORS.map((d) => (
              <div key={d.title} className="bg-card p-6 rounded-2xl border shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <d.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{d.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{d.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-12">
            Founding Accounts
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            {[
              { name: "FastFlow Plumbing", location: "Austin, TX", employees: "12 techs" },
              { name: "GreenScape Landscaping", location: "Denver, CO", employees: "8 crews" },
              { name: "CoolBreeze HVAC", location: "Phoenix, AZ", employees: "22 techs" },
            ].map((account) => (
              <div key={account.name} className="bg-card p-6 rounded-2xl border shadow-sm">
                <p className="font-bold text-foreground">{account.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{account.location}</p>
                <p className="text-xs text-primary font-medium mt-2">{account.employees}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6">
            These founding businesses helped shape ServiceOS from day one and continue to guide our roadmap.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-display font-bold text-foreground">
            Join the ServiceOS community
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start free and see why thousands of service businesses trust ServiceOS.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              Book a Demo <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/signup"
              className="px-8 py-4 rounded-xl bg-secondary text-secondary-foreground font-semibold text-lg hover:bg-secondary/80 transition-all"
            >
              Start Free
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
