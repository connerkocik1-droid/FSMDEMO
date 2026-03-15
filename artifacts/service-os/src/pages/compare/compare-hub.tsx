import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { comparisons } from "./comparison-data";
import { ArrowRight, Shield } from "lucide-react";

export default function CompareHub() {
  return (
    <MarketingLayout>
      <SEO
        title="Compare Field Service Software — ServiceOS vs Competitors"
        description="See how ServiceOS stacks up against Jobber, Housecall Pro, ServiceTitan, FieldPulse, and more. Honest, side-by-side comparisons with real pricing and features."
        canonical="https://serviceos.com/compare"
      />

      <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <Shield className="w-4 h-4" />
            Honest Comparisons
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight leading-tight">
            Compare Field Service Software
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            See how ServiceOS stacks up against the competition with honest,
            side-by-side comparisons.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">
            {comparisons.map((c) => (
              <Link
                key={c.slug}
                href={`/compare/${c.slug}`}
                className="group bg-card border rounded-2xl p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300"
              >
                <h2 className="text-xl font-bold font-display text-foreground mb-3 group-hover:text-primary transition-colors">
                  {c.slug === "field-service-software"
                    ? "Best Field Service Software Guide"
                    : c.slug === "servicetitan-pricing"
                      ? "ServiceTitan Pricing Breakdown"
                      : `ServiceOS vs ${c.competitor}`}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {c.metaDescription}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                  Read comparison <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
