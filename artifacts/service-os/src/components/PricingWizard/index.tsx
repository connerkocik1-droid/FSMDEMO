import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { QuoteResponse, WizardStep, BillingPeriod } from "./types";
import { QuoteCard } from "./QuoteCard";
import { Sparkles, Loader2 } from "lucide-react";

const INDUSTRIES = [
  "Landscaping / Lawn care",
  "HVAC",
  "Roofing",
  "Pest control",
  "Cleaning services",
  "Moving & hauling",
  "Plumbing",
  "Other home service",
];

const TEAM_SIZES = [
  { label: "Just me (1)", value: "1" },
  { label: "2–5 people", value: "2-5" },
  { label: "6–10 people", value: "6-10" },
  { label: "11–25 people", value: "11-25" },
  { label: "26–50 people", value: "26-50" },
  { label: "50+ people", value: "50+" },
];

const PAIN_POINTS = [
  { key: "scheduling_dispatch", label: "Scheduling & dispatching crews" },
  { key: "chasing_invoices", label: "Chasing unpaid invoices" },
  { key: "tech_updates", label: "Techs not updating job status" },
  { key: "no_gps", label: "No GPS visibility on crews" },
  { key: "referrals", label: "Getting more referrals" },
  { key: "multiple_locations", label: "Managing multiple locations" },
  { key: "collecting_reviews", label: "Collecting reviews" },
  { key: "slow_quoting", label: "Quoting takes too long" },
  { key: "tracking_hours", label: "Tracking hours for payroll" },
  { key: "sms_marketing", label: "Running SMS/marketing campaigns" },
];

interface Message {
  id: string;
  role: "ai" | "user";
  text: string;
}

function trackEvent(name: string, props?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", name, props);
    }
  } catch {}
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3 bg-blue-50 rounded-2xl rounded-tl-sm w-fit max-w-[80%]">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
        />
      ))}
    </div>
  );
}

function ChatMessage({ msg }: { msg: Message }) {
  return (
    <div
      className={cn(
        "flex animate-in fade-in slide-in-from-bottom-1 duration-200",
        msg.role === "ai" ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "px-4 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[85%]",
          msg.role === "ai"
            ? "bg-blue-50 text-foreground rounded-tl-sm"
            : "bg-foreground text-background rounded-tr-sm"
        )}
      >
        {msg.text}
      </div>
    </div>
  );
}

function ProgressDots({ step }: { step: WizardStep }) {
  const stepNum = step === "processing" || step === "quote" ? 3 : (step as number);
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={cn(
            "w-2 h-2 rounded-full transition-all duration-300",
            i < stepNum ? "bg-primary" : stepNum === i ? "bg-primary/40" : "bg-secondary"
          )}
        />
      ))}
    </div>
  );
}

export function PricingWizard() {
  const [step, setStep] = useState<WizardStep>(0);
  const [sessionId] = useState(() => crypto.randomUUID());
  const [industry, setIndustry] = useState<string | null>(null);
  const [teamSize, setTeamSize] = useState<string | null>(null);
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [billingPeriod] = useState<BillingPeriod>("monthly");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  function addMessage(role: "ai" | "user", text: string) {
    setMessages(prev => [...prev, { id: crypto.randomUUID(), role, text }]);
  }

  function scrollToBottom() {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      addMessage("ai", "Hi! I'm the ServiceOS assistant. Let me build you a personalised quote in about 60 seconds. First — what type of service business are you running?");
      trackEvent("wizard_started", { industry: null });
      scrollToBottom();
    }, 800);
  }, []);

  async function handleIndustrySelect(ind: string) {
    setIndustry(ind);
    addMessage("user", ind);
    setIsTyping(true);
    trackEvent("wizard_step_completed", { step: 1, value: ind });
    scrollToBottom();
    await new Promise(r => setTimeout(r, 600));
    setIsTyping(false);
    addMessage("ai", `Great — ${ind}! How many people are on your team? Include anyone who goes out on jobs.`);
    setStep(1);
    scrollToBottom();
  }

  async function handleTeamSizeSelect(size: string) {
    setTeamSize(size);
    addMessage("user", size);
    setIsTyping(true);
    trackEvent("wizard_step_completed", { step: 2, value: size });
    scrollToBottom();
    await new Promise(r => setTimeout(r, 600));
    setIsTyping(false);
    addMessage("ai", "Almost there! What's giving you the most headaches right now? Pick everything that applies.");
    setStep(2);
    scrollToBottom();
  }

  function togglePainPoint(key: string) {
    setPainPoints(prev =>
      prev.includes(key) ? prev.filter(p => p !== key) : [...prev, key]
    );
  }

  async function handleDone() {
    const labels = PAIN_POINTS.filter(p => painPoints.includes(p.key)).map(p => p.label);
    addMessage("user", labels.join(", "));
    addMessage("ai", "Perfect — let me put your personalised quote together...");
    trackEvent("wizard_step_completed", { step: 3, value: painPoints.join(",") });
    setStep("processing");
    setIsTyping(true);
    scrollToBottom();

    const [response] = await Promise.all([
      fetch(`${import.meta.env.BASE_URL}api/wizard/quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          industry,
          team_size: teamSize,
          pain_points: painPoints,
        }),
      }).then(r => r.json()).catch(() => null),
      new Promise(r => setTimeout(r, 1500)),
    ]);

    setIsTyping(false);
    setQuote(response);
    setStep("quote");
    trackEvent("wizard_quote_viewed", {
      recommended_tier: response?.recommended_tier,
      monthly_total: response?.monthly_base,
      addon_count: response?.suggested_addons?.length ?? 0,
    });
    scrollToBottom();
  }

  function handleStartOver() {
    setStep(0);
    setIndustry(null);
    setTeamSize(null);
    setPainPoints([]);
    setQuote(null);
    setMessages([]);
    setIsTyping(true);
    hasMounted.current = false;
    setTimeout(() => {
      setIsTyping(false);
      addMessage("ai", "Hi! I'm the ServiceOS assistant. Let me build you a personalised quote in about 60 seconds. First — what type of service business are you running?");
      trackEvent("wizard_started", { industry: null });
      scrollToBottom();
    }, 800);
  }

  return (
    <div className="bg-white rounded-3xl border shadow-2xl shadow-black/10 overflow-hidden w-full max-w-[600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-none">AI Pricing Assistant</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">by ServiceOS</p>
          </div>
        </div>
        <ProgressDots step={step} />
      </div>

      {/* Chat area */}
      <div className="px-5 py-4 space-y-3 max-h-[320px] overflow-y-auto">
        {messages.map(msg => (
          <ChatMessage key={msg.id} msg={msg} />
        ))}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <TypingIndicator />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="px-5 pb-5 border-t pt-4">
        {step === 0 && !isTyping && (
          <div className="grid grid-cols-2 gap-2">
            {INDUSTRIES.map(ind => (
              <button
                key={ind}
                onClick={() => handleIndustrySelect(ind)}
                className="px-3 py-2.5 text-sm font-medium border rounded-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-left leading-tight"
              >
                {ind}
              </button>
            ))}
          </div>
        )}

        {step === 1 && !isTyping && (
          <div className="grid grid-cols-2 gap-2">
            {TEAM_SIZES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => handleTeamSizeSelect(label)}
                className="px-3 py-2.5 text-sm font-medium border rounded-xl hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all text-left"
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {step === 2 && !isTyping && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {PAIN_POINTS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => togglePainPoint(key)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-semibold rounded-full border transition-all",
                    painPoints.includes(key)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {painPoints.length > 0 && (
              <button
                onClick={handleDone}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all animate-in fade-in duration-200"
              >
                Done — build my quote ✨
              </button>
            )}
          </div>
        )}

        {step === "processing" && (
          <div className="flex items-center justify-center py-4 gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Building your personalised quote...
          </div>
        )}

        {step === "quote" && quote && (
          <QuoteCard
            quote={quote}
            sessionId={sessionId}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </div>
  );
}
