import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import { useSubmitDemoRequest } from "@workspace/api-client-react";
import {
  Calendar, Clock, Video, Users, ExternalLink, ChevronLeft, CheckCircle2,
  Play, X, ArrowRight, Mic, Globe, Sparkles, Building2, Zap
} from "lucide-react";
import { format } from "date-fns";
import { SEO } from "@/components/SEO";
import { trackDemoRequest } from "@/lib/analytics";
import { MarketingNav } from "@/components/marketing/MarketingNav";

const TIER_ORDER = ["free", "independent", "pro", "franchise", "enterprise"];

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any; price: string; highlight: string }> = {
  free:        { label: "Free",         color: "text-slate-600",  bg: "bg-slate-50 border-slate-200",       icon: Zap,       price: "$0/mo",    highlight: "Up to 3 users" },
  independent: { label: "Independent",  color: "text-blue-600",   bg: "bg-blue-50 border-blue-200",         icon: Building2, price: "$79/mo",   highlight: "Up to 6 users" },
  pro:         { label: "Pro",          color: "text-violet-600", bg: "bg-violet-50 border-violet-200",     icon: Sparkles,  price: "$199/mo",  highlight: "Up to 25 users" },
  franchise:   { label: "Franchise",    color: "text-orange-600", bg: "bg-orange-50 border-orange-200",     icon: Globe,     price: "$449/mo",  highlight: "Up to 75 users" },
  enterprise:  { label: "Enterprise",   color: "text-green-600",  bg: "bg-green-50 border-green-200",       icon: Building2, price: "Custom",   highlight: "Unlimited users" },
};

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
});
type RegisterData = z.infer<typeof registerSchema>;

const demoSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  companyName: z.string().min(2, "Company name is required"),
  businessType: z.string().min(1, "Business type is required"),
  teamSize: z.string().optional(),
  message: z.string().optional(),
});
type DemoFormData = z.infer<typeof demoSchema>;

interface LiveSession {
  id: number;
  title: string;
  description: string;
  scheduledAt: string;
  durationMin: number;
  meetingLink: string | null;
  hostName: string | null;
  maxRegistrants: number | null;
}

interface TierVideo {
  id: number;
  tier: string;
  videoUrl: string | null;
  title: string | null;
  description: string | null;
}

function RegisterModal({ session, onClose }: { session: LiveSession; onClose: () => void }) {
  const [done, setDone] = useState(false);
  const form = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = (_data: RegisterData) => {
    setDone(true);
  };

  const sessionDate = new Date(session.scheduledAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card rounded-3xl shadow-2xl border w-full max-w-md p-8 relative animate-in zoom-in-95">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>

        {!done ? (
          <>
            <div className="mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold font-display text-foreground">{session.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {format(sessionDate, "EEEE, MMMM do")} at {format(sessionDate, "h:mm a")} UTC · {session.durationMin} min
              </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Your Name</label>
                <input {...form.register("name")} placeholder="Jane Smith" className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
                {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">Work Email</label>
                <input type="email" {...form.register("email")} placeholder="jane@company.com" className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
                {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
              </div>
              <button type="submit" className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Reserve My Spot
              </button>
              <p className="text-xs text-center text-muted-foreground">Free to attend · No credit card required</p>
            </form>
          </>
        ) : (
          <div className="text-center py-4 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground">You're registered!</h3>
            <p className="text-muted-foreground mt-2 text-sm">We'll send the meeting link to your email before the session starts.</p>
            {session.meetingLink && (
              <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all">
                Add to Calendar <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button onClick={onClose} className="mt-4 block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PrivateDemoForm({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const { mutate: submitDemo, isPending } = useSubmitDemoRequest();

  const form = useForm<DemoFormData>({ resolver: zodResolver(demoSchema) });

  const onSubmit = (data: DemoFormData) => {
    submitDemo(
      { data: { ...data, wantsRecorded: false, wantsPrivate: true } as any },
      {
        onSuccess: () => {
          trackDemoRequest({ businessType: data.businessType, teamSize: data.teamSize });
          setSubmitted(true);
        },
      }
    );
  };

  if (submitted) {
    return (
      <div className="text-center py-12 animate-in fade-in zoom-in-95">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-2xl font-bold font-display text-foreground">Request received!</h3>
        <p className="text-muted-foreground mt-3 max-w-sm mx-auto">Our team will reach out within one business day to schedule your private walkthrough.</p>
        <button onClick={onClose} className="mt-8 px-6 py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/80 transition-all">
          Back to Demo Page
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">First Name</label>
          <input {...form.register("firstName")} className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
          {form.formState.errors.firstName && <p className="text-xs text-destructive">{form.formState.errors.firstName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Last Name</label>
          <input {...form.register("lastName")} className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Work Email</label>
        <input type="email" {...form.register("email")} className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
        {form.formState.errors.email && <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Company Name</label>
        <input {...form.register("companyName")} className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
        {form.formState.errors.companyName && <p className="text-xs text-destructive">{form.formState.errors.companyName.message}</p>}
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">Phone Number</label>
        <input type="tel" {...form.register("phone")} placeholder="(555) 123-4567" className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Business Type</label>
          <select {...form.register("businessType")} className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
            <option value="">Select...</option>
            <option value="Landscaping">Landscaping</option>
            <option value="Roofing">Roofing</option>
            <option value="HVAC">HVAC</option>
            <option value="Pest Control">Pest Control</option>
            <option value="Cleaning Services">Cleaning Services</option>
            <option value="Moving & Hauling">Moving & Hauling</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Other">Other</option>
          </select>
          {form.formState.errors.businessType && <p className="text-xs text-destructive">{form.formState.errors.businessType.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">Team Size</label>
          <select {...form.register("teamSize")} className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm">
            <option value="1-5">1-5</option>
            <option value="6-15">6-15</option>
            <option value="16-25">16-25</option>
            <option value="26-40">26-40</option>
            <option value="40+">40+</option>
          </select>
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-foreground">What would you like to see? (optional)</label>
        <textarea {...form.register("message")} rows={3} placeholder="Dispatch automation, GPS tracking, invoicing..." className="w-full px-4 py-3 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none" />
      </div>
      <button
        type="button"
        onClick={form.handleSubmit(onSubmit)}
        disabled={isPending}
        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Submitting..." : "Request Private Demo"}
      </button>
    </div>
  );
}

export default function Demo() {
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [tierVideos, setTierVideos] = useState<TierVideo[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [registerSession, setRegisterSession] = useState<LiveSession | null>(null);
  const [showPrivateForm, setShowPrivateForm] = useState(false);
  const [playingTier, setPlayingTier] = useState<string | null>(null);

  const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

  useEffect(() => {
    fetch(`${BASE}/api/demo/live-sessions`)
      .then(r => r.json())
      .then(d => { setLiveSessions(d.sessions || []); setSessionsLoading(false); })
      .catch(() => setSessionsLoading(false));

    fetch(`${BASE}/api/demo/tier-videos`)
      .then(r => r.json())
      .then(d => setTierVideos(d.videos || []));
  }, [BASE]);

  const orderedVideos = TIER_ORDER.map(tier => {
    const video = tierVideos.find(v => v.tier === tier);
    return { tier, ...TIER_CONFIG[tier], videoUrl: video?.videoUrl || null, videoTitle: video?.title || null, videoDesc: video?.description || null };
  });

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Demo | See ServiceOS in Action"
        description="Watch live demos, attend group webinars, or book a private walkthrough of ServiceOS — the all-in-one platform for field service businesses."
      />

      <MarketingNav />

      <main className="pt-24 pb-32">
        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
              <Video className="w-4 h-4" />
              Live & On-Demand Demos
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground tracking-tight">
              See ServiceOS <span className="text-primary">in action</span>
            </h1>
            <p className="mt-5 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join a live group session, watch a tier-specific video walkthrough, or request a private demo tailored to your business.
            </p>
          </div>

          <section className="mb-24">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-display font-bold text-foreground">Upcoming Live Demos</h2>
                <p className="text-muted-foreground mt-1">Free group sessions hosted by our team — ask questions live.</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Free to attend
              </div>
            </div>

            {sessionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-28 bg-secondary/50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : liveSessions.length === 0 ? (
              <div className="text-center py-16 bg-secondary/30 rounded-3xl border border-dashed">
                <Calendar className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground">No upcoming demos scheduled</h3>
                <p className="text-muted-foreground mt-2 text-sm">Check back soon — or watch a video demo below while you wait.</p>
                <button
                  onClick={() => setShowPrivateForm(true)}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all"
                >
                  Request a private demo <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {liveSessions.map((session, idx) => {
                  const date = new Date(session.scheduledAt);
                  return (
                    <div
                      key={session.id}
                      className="group flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-card rounded-2xl border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className="flex-shrink-0 text-center bg-primary/5 border border-primary/10 rounded-xl p-4 w-20">
                        <p className="text-xs font-bold text-primary uppercase tracking-wide">{format(date, "MMM")}</p>
                        <p className="text-3xl font-display font-bold text-foreground leading-none mt-0.5">{format(date, "d")}</p>
                        <p className="text-xs text-muted-foreground mt-1">{format(date, "EEE")}</p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{session.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{session.description}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {format(date, "h:mm a")} UTC · {session.durationMin} min
                          </span>
                          {session.hostName && (
                            <span className="flex items-center gap-1.5">
                              <Mic className="w-3.5 h-3.5" />
                              Hosted by {session.hostName}
                            </span>
                          )}
                          {session.maxRegistrants && (
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" />
                              Up to {session.maxRegistrants} attendees
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex-shrink-0">
                        <button
                          onClick={() => setRegisterSession(session)}
                          className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                        >
                          Register Free <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mb-24">
            <div className="mb-8">
              <h2 className="text-2xl font-display font-bold text-foreground">Video Demos by Plan</h2>
              <p className="text-muted-foreground mt-1">Watch a recorded walkthrough for the plan that fits your business.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {orderedVideos.map(({ tier, label, color, bg, icon: Icon, price, highlight, videoUrl, videoTitle, videoDesc }) => (
                <div key={tier} className={`group relative rounded-3xl border p-6 flex flex-col gap-4 transition-all duration-200 hover:shadow-lg ${bg}`}>
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-white/80 shadow-sm`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold uppercase tracking-wide ${color}`}>{label}</p>
                      <p className="text-sm font-bold text-foreground">{price}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-foreground">{videoTitle || `${label} Plan Demo`}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-3">{videoDesc || `See what's included in the ${label} plan.`}</p>
                  </div>

                  <div className="mt-auto">
                    {videoUrl ? (
                      playingTier === tier ? (
                        <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                          <iframe
                            src={videoUrl}
                            title={`${label} plan demo`}
                            allow="autoplay; fullscreen"
                            className="w-full h-full"
                          />
                          <button
                            onClick={() => setPlayingTier(null)}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg hover:bg-black/80 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setPlayingTier(tier)}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 ${color} bg-white/80 hover:bg-white border border-current/20 shadow-sm`}
                        >
                          <Play className="w-4 h-4 fill-current" />
                          Watch Demo
                        </button>
                      )
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-muted-foreground bg-white/50 border border-muted/20">
                        <Video className="w-4 h-4" />
                        Coming Soon
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-center text-muted-foreground">
                    {highlight}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="relative rounded-3xl bg-gradient-to-br from-primary/5 via-background to-primary/5 border p-8 md:p-12 text-center overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 max-w-xl mx-auto">
              {!showPrivateForm ? (
                <>
                  <h2 className="text-3xl font-display font-bold text-foreground">Prefer a private demo?</h2>
                  <p className="text-muted-foreground mt-3 leading-relaxed">
                    Get a personalized 1-on-1 walkthrough with one of our team members — tailored to your industry, team size, and goals.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                    <button
                      onClick={() => setShowPrivateForm(true)}
                      className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-2xl shadow-lg shadow-primary/25 hover:bg-primary/90 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2"
                    >
                      Request a Private Demo <ArrowRight className="w-5 h-5" />
                    </button>
                    <Link href="/signup" className="px-8 py-4 bg-secondary text-secondary-foreground font-bold rounded-2xl hover:bg-secondary/80 transition-all border">
                      Start Free Instead
                    </Link>
                  </div>
                  <p className="text-xs text-muted-foreground mt-6">Our team typically responds within 1 business day.</p>
                </>
              ) : (
                <div className="text-left">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-display font-bold text-foreground">Request a private demo</h2>
                    <button onClick={() => setShowPrivateForm(false)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <PrivateDemoForm onClose={() => setShowPrivateForm(false)} />
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {registerSession && (
        <RegisterModal session={registerSession} onClose={() => setRegisterSession(null)} />
      )}
    </div>
  );
}
