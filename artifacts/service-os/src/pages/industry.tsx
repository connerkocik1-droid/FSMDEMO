import { useEffect } from "react";
import { Link, useRoute } from "wouter";
import { ArrowRight, CheckCircle2, Calendar, Map, Crosshair, FileText, Star, Clock, Shield, Users, BarChart3, Zap, Bell, ClipboardCheck, CreditCard, MessageSquare, Package, Wrench, TrendingUp, Repeat, Truck } from "lucide-react";
import { SEO } from "@/components/SEO";
import { faqSchema } from "@/lib/schema";
import { trackComparisonView } from "@/lib/analytics";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { industries, type IndustryData } from "@/data/industries";

const iconMap: Record<string, React.ElementType> = {
  calendar: Calendar,
  map: Map,
  gps: Crosshair,
  invoice: FileText,
  star: Star,
  contract: Clock,
  dispatch: Zap,
  reminder: Bell,
  pricing: BarChart3,
  maintenance: Wrench,
  estimate: FileText,
  weather: Shield,
  materials: Package,
  camera: Shield,
  document: FileText,
  recurring: Repeat,
  chemical: Shield,
  notification: Bell,
  report: ClipboardCheck,
  retention: TrendingUp,
  team: Users,
  checklist: ClipboardCheck,
  payment: CreditCard,
  survey: MessageSquare,
  supplies: Package,
  history: Clock,
  inventory: Package,
  performance: BarChart3,
  time: Clock,
};

function getIcon(iconName: string): React.ElementType {
  return iconMap[iconName] || Zap;
}

export default function IndustryPageRouter() {
  const [, params] = useRoute("/industries/:slug");
  const slug = params?.slug;
  const industry = industries.find((i) => i.slug === slug);

  if (!industry) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold font-display">Industry Not Found</h1>
          <p className="mt-4 text-muted-foreground">The industry page you're looking for doesn't exist.</p>
          <Link href="/" className="mt-6 inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return <IndustryPage data={industry} />;
}

function IndustryPage({ data }: { data: IndustryData }) {
  useEffect(() => {
    trackComparisonView(data.slug);
    window.scrollTo(0, 0);
  }, [data.slug]);

  return (
    <MarketingLayout>
      <SEO
        title={`${data.name} Business Software — ${data.keyword} | ServiceOS`}
        description={data.metaDescription}
        canonical={`https://serviceos.com/industries/${data.slug}`}
        jsonLd={faqSchema(data.faqs)}
      />

      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8">
            Built for {data.name} Companies
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight leading-tight">
            {data.h1}
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {data.subheadline}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login?tab=demo"
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

      <section className="py-20 bg-secondary/30">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Pain Points {data.name} Companies Know Too Well
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {data.painPoints.map((point, i) => (
              <div key={i} className="bg-card p-8 rounded-2xl border shadow-sm">
                <div className="w-10 h-10 bg-destructive/10 rounded-xl flex items-center justify-center mb-5">
                  <span className="text-destructive text-lg font-bold">{i + 1}</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{point.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Features Built for {data.name}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Not generic software — tools designed for how {data.name.toLowerCase()} businesses actually work.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {data.features.map((feature, i) => {
              const Icon = getIcon(feature.icon);
              return (
                <div key={i} className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              A Day in the Life with ServiceOS
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Here's how a typical day runs for a {data.name.toLowerCase()} company on ServiceOS.
            </p>
          </div>
          <div className="space-y-6">
            {data.workflowSteps.map((ws) => (
              <div key={ws.step} className="flex gap-6 items-start">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                  {ws.step}
                </div>
                <div className="bg-card p-6 rounded-2xl border shadow-sm flex-1">
                  <h3 className="text-lg font-bold text-foreground mb-2">{ws.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{ws.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="bg-card p-10 rounded-3xl border shadow-sm text-center">
            <h2 className="text-3xl font-display font-bold text-foreground mb-2">
              Switch from {data.competitor.name} and Save
            </h2>
            <p className="text-muted-foreground mb-8">
              See how ServiceOS stacks up against {data.competitor.name} for {data.name.toLowerCase()} companies.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-destructive/5 p-6 rounded-2xl border border-destructive/20">
                <p className="text-sm font-semibold text-destructive mb-1">{data.competitor.name}</p>
                <p className="text-4xl font-display font-bold text-foreground">${data.competitor.monthlyCost}<span className="text-lg text-muted-foreground">/mo</span></p>
              </div>
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                <p className="text-sm font-semibold text-primary mb-1">ServiceOS</p>
                <p className="text-4xl font-display font-bold text-foreground">${data.competitor.serviceOsCost}<span className="text-lg text-muted-foreground">/mo</span></p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
              <TrendingUp className="w-5 h-5" />
              Save ${data.competitor.annualSavings}/year by switching
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary/30">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              {data.name} Software FAQs
            </h2>
          </div>
          <div className="space-y-4">
            {data.faqs.map((faq, i) => (
              <details key={i} className="group bg-card rounded-2xl border shadow-sm">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                  <span className="font-semibold text-foreground pr-4">{faq.question}</span>
                  <span className="text-muted-foreground shrink-0 transition-transform group-open:rotate-45 text-xl">+</span>
                </summary>
                <div className="px-6 pb-6 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Ready to run your {data.name.toLowerCase()} business on autopilot?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join hundreds of {data.name.toLowerCase()} companies already using ServiceOS to grow faster with less overhead.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login?tab=demo"
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

    </MarketingLayout>
  );
}
