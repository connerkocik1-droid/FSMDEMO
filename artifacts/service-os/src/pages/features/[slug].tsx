import { useState } from "react";
import { Link, useParams } from "wouter";
import { SEO } from "@/components/SEO";
import { faqSchema } from "@/lib/seo";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { getFeatureBySlug } from "@/lib/feature-data";
import { ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FeatureDetail() {
  const params = useParams<{ slug: string }>();
  const feature = getFeatureBySlug(params.slug || "");

  if (!feature) {
    return (
      <MarketingLayout>
        <div className="pt-40 pb-20 text-center">
          <h1 className="text-3xl font-bold">Feature not found</h1>
          <Link href="/features" className="text-primary mt-4 inline-block">
            View all features
          </Link>
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <SEO
        title={feature.seoTitle}
        description={feature.seoDescription}
        jsonLd={faqSchema(feature.faqs)}
      />

      <section className="pt-32 pb-16 md:pt-44 md:pb-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Link
            href="/features"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            &larr; All Features
          </Link>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight">
            {feature.headline}
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            {feature.description}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              Get a Demo <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 rounded-xl bg-secondary text-secondary-foreground font-semibold text-lg hover:bg-secondary/80 transition-all"
            >
              Start Free
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-12">
            Key Benefits
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {feature.benefits.map((benefit) => (
              <div key={benefit.title} className="bg-card p-6 rounded-2xl border shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-12">
            How It Works
          </h2>
          <div className="space-y-8">
            {feature.steps.map((step, i) => (
              <div key={step.title} className="flex items-start gap-6">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="pt-1">
                  <h3 className="text-lg font-bold text-foreground mb-1">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {feature.faqs.map((faq) => (
              <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-display font-bold text-foreground">
            Ready to try {feature.title}?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Start your free trial or book a demo to see it in action.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              Book a Demo <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
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

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-card border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="font-semibold text-foreground pr-4">{question}</span>
        <ChevronDown className={cn("w-5 h-5 text-muted-foreground shrink-0 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-muted-foreground leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}
