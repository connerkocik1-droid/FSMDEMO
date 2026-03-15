import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "wouter";
import {
  useSubmitDemoRequest,
  useGetLiveDemoSessions,
  useRegisterForLiveDemo,
  useGetTierVideos,
} from "@workspace/api-client-react";
import type { LiveDemoSession, TierVideo } from "@workspace/api-client-react";
import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  Video,
  Clock,
  Play,
  Users,
  ExternalLink,
  Mail,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { SEO } from "@/components/SEO";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import { trackDemoRequest } from "@/lib/analytics";

const TIERS = ["Free", "Independent", "Pro", "Franchise", "Enterprise"];

const TIER_DESCRIPTIONS: Record<string, string> = {
  Free: "Core operations, basic scheduling, and manual invoicing for small teams.",
  Independent: "GPS tracking, manual SMS, and referral network access for growing businesses.",
  Pro: "AI SMS workflows, full analytics, automated reviews, and priority support.",
  Franchise: "Landing page builder, multi-location routing, and custom API access.",
  Enterprise: "Custom integrations, dedicated success manager, and custom SLA.",
};

const TIER_COLORS: Record<string, string> = {
  Free: "from-gray-500 to-gray-600",
  Independent: "from-blue-500 to-blue-600",
  Pro: "from-violet-500 to-violet-600",
  Franchise: "from-amber-500 to-amber-600",
  Enterprise: "from-emerald-500 to-emerald-600",
};

const registrationSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Valid email is required"),
});

type RegistrationData = z.infer<typeof registrationSchema>;

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

export default function Demo() {
  const [activeTab, setActiveTab] = useState<"live" | "videos">("live");
  const [showPrivateForm, setShowPrivateForm] = useState(false);

  return (
    <MarketingLayout>
      <SEO
        title="Demos | See ServiceOS in Action"
        description="Watch video walkthroughs by tier or register for an upcoming live demo. See AI dispatch, GPS tracking, invoicing, and more in action."
      />

      <section className="pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground tracking-tight">
            See ServiceOS in Action
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
            Join a live group demo or watch a video walkthrough for your tier.
            No commitment required.
          </p>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-secondary rounded-xl p-1">
              <button
                onClick={() => setActiveTab("live")}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "live"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                Upcoming Live Demos
              </button>
              <button
                onClick={() => setActiveTab("videos")}
                className={`px-6 py-3 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "videos"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Video className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                Video Demos by Tier
              </button>
            </div>
          </div>

          {activeTab === "live" && <LiveDemosSection />}
          {activeTab === "videos" && <VideoTiersSection />}

          <div className="mt-16 text-center border-t pt-12">
            {!showPrivateForm ? (
              <div>
                <p className="text-muted-foreground mb-3">
                  Prefer a private, personalized walkthrough?
                </p>
                <button
                  onClick={() => setShowPrivateForm(true)}
                  className="text-primary font-semibold hover:underline"
                >
                  Request a Private Demo
                </button>
              </div>
            ) : (
              <PrivateDemoForm onClose={() => setShowPrivateForm(false)} />
            )}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

function LiveDemosSection() {
  const { data: sessions, isLoading } = useGetLiveDemoSessions();

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-16 bg-card rounded-2xl border">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">
          No upcoming demos scheduled
        </h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Check back soon or watch a video demo below to see ServiceOS in
          action at your own pace.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.map((session) => (
        <LiveDemoCard key={session.id} session={session} />
      ))}
    </div>
  );
}

function LiveDemoCard({ session }: { session: LiveDemoSession }) {
  const [showRegister, setShowRegister] = useState(false);
  const [registered, setRegistered] = useState(false);
  const { mutate: register, isPending } = useRegisterForLiveDemo();

  const form = useForm<RegistrationData>({
    resolver: zodResolver(registrationSchema),
  });

  const onRegister = (data: RegistrationData) => {
    register(
      { id: session.id, data },
      {
        onSuccess: () => setRegistered(true),
      }
    );
  };

  const sessionDate = new Date(session.datetime);
  const spotsLeft =
    session.maxRegistrations != null
      ? session.maxRegistrations - (session.registrationCount ?? 0)
      : null;

  return (
    <div className="bg-card rounded-2xl border shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Calendar className="w-6 h-6 text-primary" />
        </div>
        {spotsLeft !== null && spotsLeft <= 10 && spotsLeft > 0 && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
            {spotsLeft} spots left
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-foreground mb-2">{session.title}</h3>
      {session.description && (
        <p className="text-sm text-muted-foreground mb-4 flex-1">
          {session.description}
        </p>
      )}

      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{format(sessionDate, "EEEE, MMMM do, yyyy")}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            {format(sessionDate, "h:mm a")} ({session.durationMin} min)
          </span>
        </div>
        {session.registrationCount != null && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{session.registrationCount} registered</span>
          </div>
        )}
      </div>

      {registered ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 text-green-700 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5" />
          You're registered! Check your email for details.
        </div>
      ) : !showRegister ? (
        <button
          onClick={() => setShowRegister(true)}
          className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all"
        >
          Register
        </button>
      ) : (
        <form onSubmit={form.handleSubmit(onRegister)} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                {...form.register("firstName")}
                placeholder="First name"
                className="w-full px-3 py-2 rounded-lg bg-background border text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {form.formState.errors.firstName && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <input
                {...form.register("lastName")}
                placeholder="Last name"
                className="w-full px-3 py-2 rounded-lg bg-background border text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>
          <div>
            <input
              type="email"
              {...form.register("email")}
              placeholder="Email address"
              className="w-full px-3 py-2 rounded-lg bg-background border text-sm text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg text-sm hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              {isPending ? "Registering..." : "Confirm"}
            </button>
            <button
              type="button"
              onClick={() => setShowRegister(false)}
              className="px-4 py-2.5 bg-secondary text-muted-foreground font-semibold rounded-lg text-sm hover:bg-secondary/80 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function VideoTiersSection() {
  const { data: tierVideos, isLoading } = useGetTierVideos();

  const videoMap = new Map<string, TierVideo>();
  if (tierVideos) {
    for (const v of tierVideos) {
      videoMap.set(v.tierName, v);
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {TIERS.map((tier) => {
        const video = videoMap.get(tier);
        return (
          <VideoTierCard
            key={tier}
            tier={tier}
            videoUrl={video?.videoUrl}
            description={video?.description || TIER_DESCRIPTIONS[tier]}
          />
        );
      })}
    </div>
  );
}

function VideoTierCard({
  tier,
  videoUrl,
  description,
}: {
  tier: string;
  videoUrl?: string | null;
  description?: string;
}) {
  const hasVideo = !!videoUrl;

  const isEmbedUrl =
    videoUrl &&
    (videoUrl.includes("youtube.com") ||
      videoUrl.includes("youtu.be") ||
      videoUrl.includes("vimeo.com"));

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1]?.split("?")[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  return (
    <div className="bg-card rounded-2xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      <div className="relative aspect-video bg-secondary">
        {hasVideo && isEmbedUrl ? (
          <iframe
            src={getEmbedUrl(videoUrl!)}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`${tier} tier demo video`}
          />
        ) : hasVideo ? (
          <video
            src={videoUrl!}
            controls
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${TIER_COLORS[tier] || "from-gray-500 to-gray-600"} flex items-center justify-center mb-3 opacity-30`}
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              Coming Soon
            </span>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${TIER_COLORS[tier] || "from-gray-500 to-gray-600"}`}
          >
            {tier}
          </span>
        </div>
        <p className="text-sm text-muted-foreground flex-1">
          {description}
        </p>
        {hasVideo && !isEmbedUrl && (
          <a
            href={videoUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <ExternalLink className="w-4 h-4" />
            Watch Full Video
          </a>
        )}
      </div>
    </div>
  );
}

function PrivateDemoForm({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const { mutate: submitDemo, isPending } = useSubmitDemoRequest();

  const form = useForm<DemoFormData>({
    resolver: zodResolver(demoSchema),
  });

  const onSubmit = (data: DemoFormData) => {
    submitDemo(
      {
        data: {
          ...data,
          wantsRecorded: false,
          wantsPrivate: true,
        },
      },
      {
        onSuccess: () => {
          trackDemoRequest({
            businessType: data.businessType,
            teamSize: data.teamSize,
          });
          setSubmitted(true);
        },
      }
    );
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto bg-card rounded-2xl border p-8 text-center">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Request Received!</h3>
        <p className="text-muted-foreground mb-4">
          We'll reach out shortly to schedule your private demo.
        </p>
        <button
          onClick={onClose}
          className="text-primary font-semibold hover:underline"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-card rounded-2xl border p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">
          Request a Private Demo
        </h3>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground text-sm"
        >
          Cancel
        </button>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              First Name
            </label>
            <input
              {...form.register("firstName")}
              className="w-full px-4 py-2.5 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {form.formState.errors.firstName && (
              <p className="text-xs text-destructive">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Last Name
            </label>
            <input
              {...form.register("lastName")}
              className="w-full px-4 py-2.5 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Email
            </label>
            <input
              type="email"
              {...form.register("email")}
              className="w-full px-4 py-2.5 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Phone
            </label>
            <input
              type="tel"
              {...form.register("phone")}
              placeholder="(555) 123-4567"
              className="w-full px-4 py-2.5 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">
            Company Name
          </label>
          <input
            {...form.register("companyName")}
            className="w-full px-4 py-2.5 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {form.formState.errors.companyName && (
            <p className="text-xs text-destructive">
              {form.formState.errors.companyName.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Business Type
            </label>
            <select
              {...form.register("businessType")}
              className="w-full px-4 py-2.5 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
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
            {form.formState.errors.businessType && (
              <p className="text-xs text-destructive">
                {form.formState.errors.businessType.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Team Size
            </label>
            <select
              {...form.register("teamSize")}
              className="w-full px-4 py-2.5 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="1-5">1-5</option>
              <option value="6-15">6-15</option>
              <option value="16-25">16-25</option>
              <option value="26-40">26-40</option>
              <option value="40+">40+</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-foreground">
            Message (optional)
          </label>
          <textarea
            {...form.register("message")}
            rows={3}
            placeholder="Anything specific you'd like to see?"
            className="w-full px-4 py-2.5 rounded-xl bg-background border text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Submitting..." : "Request Private Demo"}
        </button>
      </form>
    </div>
  );
}
