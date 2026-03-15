import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { FEATURES } from "@/lib/feature-data";
import { ArrowRight, Zap, MapPin, DollarSign, Calendar, Users, MessageSquare, FileText } from "lucide-react";

const ICON_MAP: Record<string, any> = {
  "ai-dispatch": Zap,
  "gps-tracking": MapPin,
  invoicing: DollarSign,
  scheduling: Calendar,
  referrals: Users,
  crm: MessageSquare,
  quotes: FileText,
};

export default function FeaturesOverview() {
  return (
    <MarketingLayout>
      <SEO
        title="Features | Field Service Management Software"
        description="Explore all ServiceOS features: AI dispatch, GPS tracking, invoicing, scheduling, CRM, referral network, and quoting — all in one platform."
      />

      <section className="pt-32 pb-16 md:pt-44 md:pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight">
            All the tools you need, one platform
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            ServiceOS brings everything together so you can focus on growing your business, not managing software.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature) => {
              const Icon = ICON_MAP[feature.slug] || Zap;
              return (
                <Link
                  key={feature.slug}
                  href={`/features/${feature.slug}`}
                  className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group flex flex-col"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed flex-1">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center gap-1 text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-display font-bold text-foreground">
            Ready to see it in action?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get a personalized demo and see how ServiceOS can transform your business.
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
