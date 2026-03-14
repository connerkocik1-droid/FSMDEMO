import { Link } from "wouter";
import { MockSignInButton } from "@/lib/mock-auth";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Star, Zap, BarChart3, Users, MessageSquare, MapPin, Shield, TrendingUp } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 bg-background/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Logo" className="w-8 h-8 rounded-lg" />
            <span className="font-display font-bold text-xl tracking-tight text-foreground">ServiceOS</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <Link href="/demo" className="hover:text-foreground transition-colors">Request Demo</Link>
          </div>
          <div className="flex items-center gap-4">
            <MockSignInButton />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-bg.png`} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-10 dark:opacity-20 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4">
            <SparklesIcon className="w-4 h-4" />
            The Operating System for Modern Service Teams
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground tracking-tight max-w-4xl mx-auto leading-tight animate-in fade-in slide-in-from-bottom-6 delay-100">
            Run your entire service business on autopilot.
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 delay-200">
            From automated dispatch to AI-powered SMS communication, ServiceOS gives your team the tools to scale without the chaos.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 delay-300">
            <Link 
              href="/demo" 
              className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              Get a Demo <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/dashboard" 
              className="px-8 py-4 rounded-xl bg-secondary text-secondary-foreground font-semibold text-lg hover:bg-secondary/80 hover:shadow-md transition-all duration-200 w-full sm:w-auto justify-center flex"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Everything you need to grow</h2>
            <p className="mt-4 text-lg text-muted-foreground">Replace five different tools with one seamless platform.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Smart Dispatch", desc: "Drag-and-drop scheduling that automatically optimizes routes and alerts your crew via SMS.", icon: Zap },
              { title: "AI Communications", desc: "Let our AI handle basic customer inquiries, appointment reminders, and follow-ups automatically.", icon: MessageSquare },
              { title: "Review Generation", desc: "Automatically send review requests via text when a job is marked complete, boosting your online presence.", icon: Star },
              { title: "Live GPS Tracking", desc: "See exactly where your crews are in real-time and provide accurate ETAs to waiting customers.", icon: MapPin },
              { title: "Advanced Analytics", desc: "Deep insights into revenue, crew performance, and job completion rates to make better decisions.", icon: BarChart3 },
              { title: "Referral Network", desc: "Connect with other local businesses to pass leads back and forth, earning commission automatically.", icon: Users },
            ].map((feature, i) => (
              <div key={i} className="bg-card p-8 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-muted-foreground">Choose the plan that fits your team size.</p>
          </div>

          <div className="grid md:grid-cols-5 gap-5">
            {[
              { name: "Free", price: "$0", users: "Up to 3 users", features: ["Core operations", "Basic scheduling", "Manual invoicing"] },
              { name: "Independent", price: "$49", users: "Up to 6 users", features: ["Live GPS tracking", "Manual SMS", "Referral network access"] },
              { name: "Pro", price: "$199", users: "Up to 25 users", features: ["AI SMS workflows", "Full analytics", "Automated reviews", "Priority support"], popular: true },
              { name: "Franchise", price: "$499", users: "Up to 75 users", features: ["Landing page builder", "Multi-location routing", "Custom API access", "Dedicated success manager"] },
              { name: "Enterprise", price: "Custom", users: "75+ users", features: ["Everything in Franchise", "Custom integrations", "Dedicated success manager", "Custom SLA & pricing"] }
            ].map((plan, i) => (
              <div key={i} className={cn(
                "relative bg-card p-8 rounded-3xl border flex flex-col",
                plan.popular ? "border-primary shadow-xl shadow-primary/10 md:-translate-y-4" : "shadow-sm"
              )}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-display font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-muted-foreground">/mo</span>}
                </div>
                <p className="text-sm font-medium text-primary mb-8">{plan.users}</p>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feat, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/demo" 
                  className={cn(
                    "w-full py-3 rounded-xl font-semibold text-center transition-all",
                    plan.popular 
                      ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
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
