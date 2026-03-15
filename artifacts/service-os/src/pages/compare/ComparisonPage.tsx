import { useEffect } from "react";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { faqSchema } from "@/lib/schema";
import { trackComparisonView } from "@/lib/analytics";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { FeatureComparisonTable } from "./FeatureComparisonTable";
import { PricingComparisonTable } from "./PricingComparisonTable";
import type { ComparisonData } from "./comparison-data";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Shield,
  TrendingUp,
  Users,
  Zap,
  AlertTriangle,
} from "lucide-react";

export default function ComparisonPage({ data }: { data: ComparisonData }) {
  useEffect(() => {
    trackComparisonView(data.competitor);
  }, [data.competitor]);

  return (
    <MarketingLayout>
      <SEO
        title={data.metaTitle}
        description={data.metaDescription}
        canonical={data.canonical}
        jsonLd={faqSchema(data.faqs)}
      />

      <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <Shield className="w-4 h-4" />
            Honest Comparison
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight leading-tight">
            {data.h1}
          </h1>
        </div>
      </section>

      <section className="py-12 border-b">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold font-display text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              TL;DR — The Quick Verdict
            </h2>
            <div className="space-y-3">
              {data.tldr.map((line, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-10">
            Feature Comparison
          </h2>
          <FeatureComparisonTable
            rows={data.featureRows}
            competitorName={data.competitor}
          />
        </div>
      </section>

      <section className="py-16 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-10">
            Pricing Comparison
          </h2>
          <PricingComparisonTable
            rows={data.pricingRows}
            competitorName={data.competitor}
          />
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-amber-500" />
              Where {data.competitor} Win{data.competitor.includes("&") ? "" : "s"}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              We believe in honest comparisons. Here's where{" "}
              {data.competitor.includes("&")
                ? "these platforms genuinely"
                : `${data.competitor} genuinely`}{" "}
              excel:
            </p>
            <div className="space-y-4">
              {data.competitorStrengths.map((point, i) => (
                <div
                  key={i}
                  className="flex gap-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              Where ServiceOS Wins
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Here's where ServiceOS pulls ahead for growing service teams:
            </p>
            <div className="space-y-3">
              {data.serviceOSAdvantages.map((point, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">
                    {point}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-10">
            Who Should Switch?
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Consider switching to ServiceOS if any of these sound familiar:
          </p>
          <div className="space-y-4">
            {data.switchingPainPoints.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-card border rounded-xl p-5"
              >
                <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-foreground">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-display font-bold text-foreground text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {data.faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-card border rounded-xl overflow-hidden"
              >
                <summary className="cursor-pointer px-6 py-5 font-semibold text-foreground flex items-center justify-between list-none">
                  {faq.question}
                  <ChevronDown className="w-5 h-5 text-muted-foreground group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary/5">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Ready to make the switch?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            See why service teams are choosing ServiceOS. Try it free or book a
            personalized demo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2"
            >
              Get a Demo <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-xl bg-secondary text-secondary-foreground font-semibold text-lg hover:bg-secondary/80 hover:shadow-md transition-all duration-200"
            >
              Start Free
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
